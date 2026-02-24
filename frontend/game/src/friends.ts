import { show, hide ,requestGameModal} from "./ui.js";
import { translate } from "./language-button.js";

declare global {
    interface Window {
        translate?: (key: string) => string;
    }
}
import { userSocket } from "./websocket.js";
import { showNotification } from "./main.js";

export interface FriendData {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    online: boolean;
}

export interface FriendRequest {
    request_id: number;
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    type: string;
}

export function setInviteContext(type: "match" | "tournament", id: string): void {
    inviteContext = { type, id };
}

export function clearInviteContext(): void {
    inviteContext = null;
}

const friendsListUL =
    document.getElementById("friends_list_ul") as HTMLUListElement;

const addFriendButton =
    document.getElementById("add_friend_button") as HTMLButtonElement;

const requestsFriendButton =
    document.getElementById("requests_friend_button") as HTMLButtonElement;


let addFriendModal: HTMLDivElement | null =
    document.getElementById("add_friend_modal") as HTMLDivElement | null;

let renderDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let inviteContext: { type: "match" | "tournament"; id: string } | null = null;


function renderFriendItem(friend: FriendData, onRemove: (id: number) => void): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "pong-button active-border full-width flex items-start justify-between";
    li.dataset.friendId = String(friend.id);

    const statusColor = friend.online ? "#4ade80" : "var(--pong-gray)";
    const statusText = friend.online ? "ONLINE" : "OFFLINE";

    li.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="avatar-placeholder text-[8px] w-6 h-6 flex items-center justify-center">
                <span class="pong-icon -top-[6px]">${friend.avatar}</span>
            </div>
            <div class="flex flex-col text-left">
                <span class="text-[9px]">${escapeHtml(friend.display_name)}</span>
                <span class="text-[7px]" style="color:var(--pong-gray)">@${escapeHtml(friend.username)}</span>
            </div>
        </div>
        <div class="flex flex-col items-end gap-1">
            <span class="text-[7px] self-start p-1" style="color:${statusColor}">${statusText}</span>
            <button class="remove-friend-btn pong-button text-[6px] px-1 py-0" style="color:var(--pong-gray)" data-id="${friend.id}">remove</button>
        </div>
    `;

    const removeBtn = li.querySelector(".remove-friend-btn") as HTMLButtonElement;
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        onRemove(friend.id);
    };

    return li;
}

function renderFriendRequestItem(
    req: FriendRequest,
    onAccept: (requestId: number) => void,
    onDecline: (requestId: number) => void
): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "pong-box";

    li.innerHTML = `
        <div class="pong-list-box-name-msg">
            <span class="text-[9px]">${escapeHtml(req.display_name)}</span>
            <span class="text-[7px]" style="color:var(--pong-gray)">@${escapeHtml(req.username)} · friend request</span>
        </div>
        <div class="pong-list-box-button">
            <button class="pong-list-box-reply decline-btn">X</button>
            <button class="pong-list-box-reply active-border accept-btn">ACCEPT</button>
        </div>
    `;

    const acceptBtn = li.querySelector(".accept-btn") as HTMLButtonElement;
    const declineBtn = li.querySelector(".decline-btn") as HTMLButtonElement;

    acceptBtn.onclick = () => onAccept(req.request_id);
    declineBtn.onclick = () => onDecline(req.request_id);

    return li;
}

export async function fetchFriends(): Promise<FriendData[]> {
    try {
        const res = await fetch("/api/friends/", { credentials: "include" });
        const data = await res.json();
        if (data.status === 200) return data.target as FriendData[];
        return [];
    } catch {
        return [];
    }
}

export async function fetchFriendRequests(): Promise<FriendRequest[]> {
    try {
        const res = await fetch("/api/friends/invites", { credentials: "include" });
        const data = await res.json();
        if (data.status === 200) return data.target as FriendRequest[];
        return [];
    } catch {
        return [];
    }
}

export async function sendFriendRequest(username: string): Promise<{ status: number; msg: string }> {
    try {
        const res = await fetch("/api/friends/invites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
            credentials: "include"
        });
        return await res.json();
    } catch {
        return { status: 500, msg: "Connection error." };
    }
}

export async function respondFriendRequest(
    requestId: number,
    accept: boolean
): Promise<{ status: number; msg: string }> {
    try {
        const res = await fetch(`/api/friends/invites/${requestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accept }),
            credentials: "include"
        });
        return await res.json();
    } catch {
        return { status: 500, msg: "Connection error." };
    }
}

export async function removeFriend(friendId: number): Promise<{ status: number; msg: string }> {
    try {
        const res = await fetch(`/api/friends/${friendId}`, {
            method: "DELETE",
            credentials: "include"
        });
        return await res.json();
    } catch {
        return { status: 500, msg: "Connection error." };
    }
}

// ─────────────────────────────────────────────
// MAIN RENDER
// ─────────────────────────────────────────────

export async function renderFriendsList(): Promise<void> {
    if (!friendsListUL) return;
    if (!userSocket) {
        friendsListUL.innerHTML = "";
        return;
    }

    const existingDynamic = friendsListUL.querySelectorAll("li[data-friend-id]");
    existingDynamic.forEach(el => el.remove());

    const existingState = friendsListUL.querySelector(".friends-state");
    if (existingState) existingState.remove();

    const loading = document.createElement("li");
    loading.className = "friends-state pong-font text-[7px] text-center";
    loading.style.color = "var(--pong-gray)";
    loading.textContent = "Loading...";
    friendsListUL.appendChild(loading);

    const friends = await fetchFriends();
    loading.remove();

    if (friends.length === 0) {
        const empty = document.createElement("li");
        empty.className = "friends-state pong-font text-[7px] text-center";
        empty.style.color = "var(--pong-gray)";
        empty.textContent = translate('friends.no_friends');
        friendsListUL.appendChild(empty);
        return;
    }

    friends.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

    for (const friend of friends) {
        const li = renderFriendItem(friend, async (id) => {
            const result = await removeFriend(id);
            showNotification(result.msg);
            if (result.status === 200) renderFriendsList();
        });
        friendsListUL.appendChild(li);
    }
}

export async function renderFriendRequestsList(container: HTMLElement): Promise<void> {
    container.innerHTML = "";
    show(requestGameModal);
    const loading = document.createElement("p");
    loading.className = "pong-font text-[7px] text-center";
    loading.style.color = "var(--pong-gray)";
    loading.textContent = "Loading...";
    container.appendChild(loading);

    const requests = await fetchFriendRequests();
    loading.remove();

    if (requests.length === 0) {
        const empty = document.createElement("p");
        empty.className = "pong-font text-[7px] text-center";
        empty.style.color = "var(--pong-gray)";
        empty.textContent = translate('requests.no_friend_requests');
        container.appendChild(empty);
        return;
    }

    for (const req of requests) {
        const li = renderFriendRequestItem(
            req,
            async (requestId) => {
                const result = await respondFriendRequest(requestId, true);
                showNotification(result.msg);
                if (result.status === 200)
                    renderFriendRequestsList(container);
            },
            async (requestId) => {
                const result = await respondFriendRequest(requestId, false);
                showNotification(result.msg);
                if (result.status === 200) renderFriendRequestsList(container);
            }
        );
        container.appendChild(li);
    }
}



// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

export function initFriends(): void {
    // El modal ya existe en el HTML, no lo creamos dinámicamente
    addFriendModal = document.getElementById("add_friend_modal") as HTMLDivElement;

    const addFriendInput = document.getElementById("add_friend_input") as HTMLInputElement;
    const addFriendSubmit = document.getElementById("add_friend_submit") as HTMLButtonElement;
    const addFriendCancel = document.getElementById("add_friend_cancel") as HTMLButtonElement;

    if (addFriendButton) {
        addFriendButton.onclick = () => {
            if (!userSocket) {
                showNotification("You must be logged in to add friends.");
                return;
            }
            if (addFriendModal) show(addFriendModal);
            if (addFriendInput) addFriendInput.value = "";
        };
    }

    if (addFriendCancel) {
        addFriendCancel.onclick = () => {
            if (addFriendModal) hide(addFriendModal);
        };
    }

    if (addFriendSubmit) {
        addFriendSubmit.onclick = async () => {
            if (!addFriendInput) return;
            const username = addFriendInput.value.trim();
            if (!username) {
                showNotification("Please enter a username.");
                return;
            }
            const result = await sendFriendRequest(username);
            showNotification(result.msg);
            if (result.status === 200) {
                addFriendInput.value = "";
                if (addFriendModal) hide(addFriendModal);
            }
        };
    }

    handleFriendWebSocketEvents();
}

export async function renderInviteFriendsList(container: HTMLUListElement): Promise<void> {
    container.innerHTML = "";

    const loading = document.createElement("li");
    loading.className = "pong-font text-[7px] text-center";
    loading.style.color = "var(--pong-gray)";
    loading.textContent = "Loading...";
    container.appendChild(loading);

    const friends = await fetchFriends();
    loading.remove();

    if (friends.length === 0) {
        const empty = document.createElement("li");
        empty.className = "pong-font text-[7px] text-center";
        empty.style.color = "var(--pong-gray)";
        empty.textContent = translate('friends.no_friends');
        container.appendChild(empty);
        return;
    }

    friends.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

    for (const friend of friends) {
        const li = document.createElement("li");
        li.className = "pong-box flex items-center justify-between";

        const statusColor = friend.online ? "#4ade80" : "var(--pong-gray)";
        const statusText = friend.online ? "● ONLINE" : "● OFFLINE";

        li.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="avatar-placeholder text-[12px] w-5 h-5 flex items-center justify-center">${friend.avatar}</div>
                <div class="flex flex-col text-left">
                    <span class="text-[9px]">${escapeHtml(friend.display_name)}</span>
                    <span class="text-[7px]" style="color:${statusColor}">${statusText}</span>
                </div>
            </div>
            <button class="invite-friend-btn pong-button active-border text-[7px] px-2 py-0.5">
                ${friend.online ? 'INVITE' : 'OFFLINE'}
            </button>
        `;

        const btn = li.querySelector(".invite-friend-btn") as HTMLButtonElement;
        if (!friend.online) {
            btn.disabled = true;
            btn.style.opacity = "0.4";
            btn.style.cursor = "not-allowed";
        } else {
            btn.onclick = async () => {
                await sendInviteToFriend(friend.username, btn);
            };
        }

        container.appendChild(li);
    }
}
import {invitePlayersModal, currentGameModal} from "./ui.js";
export async function sendInviteToFriend(userName: string, btn?: HTMLButtonElement): Promise<void> {
    if (!inviteContext) {
        showNotification("No active game to invite to.");
        return;
    }

    if (btn) {
        btn.textContent = "...";
        btn.disabled = true;
    }

    try {
        const endpoint = inviteContext.type === "match"
            ? `/api/matches/${inviteContext.id}/invites`
            : `/api/tournaments/${inviteContext.id}/invites`;

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username:  userName}),
            credentials: "include"
        });
        const data = await res.json();

        showNotification(data.msg);
        if (data.status !== 200)
            return ;

        if (btn) {
            btn.textContent = data.status === 200 ? "SENT ✓" : "INVITE";
            btn.disabled = data.status === 200;
        }
        if (inviteContext.type === "match") {
            hide(invitePlayersModal);
	        show(currentGameModal);
        }
    } catch {
        showNotification("Connection error.");
        if (btn) {
            btn.textContent = "INVITE";
            btn.disabled = false;
        }
    }
}

export async function sendInviteManual(username: string): Promise<void> {
    await sendInviteToFriend(username);
}

// ─────────────────────────────────────────────
// WEBSOCKET EVENTS
// ─────────────────────────────────────────────

function handleFriendWebSocketEvents(): void {
    // This is called after WebSocket is established.
    // WebSocket messages of type "FRIEND_UPDATE" will trigger a re-render.
    // The actual message dispatch is handled in events.ts, 
    // but we export a handler to be called from there.
}

export function onFriendWebSocketMessage(data: any): void {
    if (data.type === "FRIEND_UPDATE") {
        const friendsListEl = document.getElementById("friends_list");
        if (friendsListEl && !friendsListEl.classList.contains("hidden")) {
            if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
            renderDebounceTimer = setTimeout(() => {
                renderFriendsList();
                renderDebounceTimer = null;
            }, 200);
        }
    }
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

export function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

export { renderFriendsList as loadFriends };

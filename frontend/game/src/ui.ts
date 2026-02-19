import { drawGame } from "./draw.js";
import { boardThemes } from "./themes.js"; // Importado de themes.js
import { TournamentInfo, ProfileInfo, UserStats } from "./vars.js";
import { changeAvatar } from "./change.js";
import {GameStatus, setGameStatus, getGameStatus, GameType, setGameType, getGameType, setCurrentTournamentId, setCurrentMatchId} from "./vars.js";
import { showNotification } from "./main.js";

//------------------------------------------------------------------------TOP-PROFILE-OPPONENT

export const topBarOpponentButton = 
	document.getElementById("opponent_profile_button") as HTMLDivElement;

export const topBarOpponentPicture = 
	document.getElementById("opponent_profile_image") as HTMLDivElement;

export const topBarOpponentDisplayName = 
	document.getElementById("opponent_displayname") as HTMLSpanElement;

export const topBarOpponentId = 
	document.getElementById("opponent_id") as HTMLSpanElement;
	
//------------------------------------------------------------------------TOP-PROFILE-OPPONENT
//------------------------------------------------------------------------NOTIFICATIONS

export const notificationBox = 
	document.getElementById("notify-box") as HTMLDivElement;

export let notificationBoxText = 
	document.getElementById("notify-text") as HTMLDivElement;

export const notificationAcceptButton = 
	document.getElementById("notify-accept") as HTMLButtonElement;

export let notificationId = 
	document.getElementById("notify-match-id") as HTMLSpanElement;

//------------------------------------------------------------------------NOTIFICATIONS
//------------------------------------------------------------------------TOP-PROFILE-SELF


export const openMenuButton = 
	document.getElementById("menu_button") as HTMLButtonElement;

export const topBarProfilePicture =
	document.getElementById("self_profile_image") as HTMLDivElement;

export const topBarDisplayName = 
	document.getElementById("self_displayname") as HTMLSpanElement;

//------------------------------------------------------------------------TOP-PROFILE-SELF
//------------------------------------------------------------------------GAME-SCREEEN

export const canvas = // Canvas where game is drawn
	document.getElementById("game_screen") as HTMLCanvasElement;

export const texture = // Texture to paint
	canvas.getContext("2d") as CanvasRenderingContext2D;

export const startMatchButton = // Start match button element
	document.getElementById("start_match") as HTMLButtonElement;

export const exitMatchButton = // EXIT match button element
	document.getElementById("exit_match") as HTMLButtonElement;

//------------------------------------------------------------------------GAME-SCREEEN
//------------------------------------------------------------------------MENU

export const menuModal =
	document.getElementById("menu_modal") as HTMLDivElement;

export const menuDisplayName = 
	document.getElementById("profile_displayname") as HTMLDivElement;

export const menuUsername = 
	document.getElementById("profile_username") as HTMLDivElement;

export const menuButtons = 
	document.querySelectorAll<HTMLButtonElement>('.pong-menu-buttons .pong-button');


export function updateSessionButtons(render: boolean) {
	if (render) {
		show(logoutButton);
		show(changeUsernameButton);
		show(changeDisplayNameButton);
		show(changePasswordButton);
		show(changeProfilePicButton);
		show(changeEmailButton);
	}
	else {
		hide(logoutButton);
		hide(changeUsernameButton);
		hide(changeDisplayNameButton);
		hide(changePasswordButton);
		hide(changeProfilePicButton);
		hide(changeEmailButton);
	}
}



export 	function showCanvas() {

	hide(createGameModal);
	hide(findGameModal);
	hide(menuModal);
	show(canvas);
	drawGame();
	if (getGameStatus() === GameStatus.READY_TO_START || getGameStatus() === GameStatus.IN_GAME) {

		hide(currentGameCancel);
		show(currentGameModal);
		makeVisible(topBarOpponentButton);
		show(topBarDisplayName);
		makeVisible(topBarDisplayName);
		makeVisible(exitMatchButton);
		show(exitMatchButton);
		if (getGameStatus() === GameStatus.READY_TO_START) {
			makeVisible(startMatchButton);
			show(startMatchButton);
		}
	}

}

export 	function showMenu() {
	
	hide(canvas);
	show(menuModal);
	hide(exitMatchButton);
	hide(currentGameModal);
	if (getGameStatus() !== GameStatus.READY_TO_START && getGameStatus() !== GameStatus.IN_GAME) {

		makeInvisible(topBarOpponentButton);
		makeInvisible(topBarDisplayName);
	}
}

let menu_open: boolean = true;

export function toggleMenu(): void
{
	if (menu_open) {
		showMenu();
	}
	else {
		showCanvas();
	}
	menu_open = !menu_open;
}

openMenuButton.onclick = toggleMenu;

export let savedDisplayName: string | null;

let selfId: string;

export function getSelfId(): string {
	return selfId;
}



export function updateProfileUI(self_id: string, displayName: string | null, userName?: string): void {
	selfId = self_id;
	if (topBarDisplayName) topBarDisplayName.textContent = truncateText(displayName, 12);
	if (menuDisplayName) menuDisplayName.textContent = truncateText(displayName, 64);
	if (menuUsername && userName !== undefined) menuUsername.textContent = "@" + truncateText(userName, 64);
}

export function updateOpponentUI(opponentDisplayName: string, id: string, avatar: string) {

	if (topBarOpponentDisplayName) topBarOpponentDisplayName.textContent =  truncateText(opponentDisplayName, 16);
	if (topBarOpponentId) topBarOpponentId.textContent = id;
	if (topBarOpponentPicture) topBarOpponentPicture.innerHTML = avatar;
}

//------------------------------------------------------------------------MANU
//------------------------------------------------------------------------LOGIN

export const loginModal = // Login Box element
	document.getElementById("login_modal") as HTMLDivElement;

export const closeLoginButton = // Close login box element
	document.getElementById("close_login") as HTMLButtonElement;

export const usernameInput = // Username entered in login box
	document.getElementById("user_input") as HTMLInputElement;

export const passwordInput = // Password entered in login box
	document.getElementById("pass_input") as HTMLInputElement;

export const dontHaveAnAccountButton = // Submit info in register box
	document.getElementById("donthaveanaccount_button") as HTMLButtonElement;

export const submitLoginButton = // Submit info in login box
	document.getElementById("login_submit_button") as HTMLButtonElement;

//------------------------------------------------------------------------LOGIN
//------------------------------------------------------------------------REGISTER

export const registerModal = // Register Box element
	document.getElementById("register_modal") as HTMLDivElement;

export const closeRegisterButton = // Close register box element
	document.getElementById("close_register") as HTMLButtonElement;

export const regUsernameInput = // Username entered in register box
	document.getElementById("reg_username") as HTMLInputElement;

export const regDisplaynameInput = // Display name in register box
	document.getElementById("reg_displayname") as HTMLInputElement;

export const regEmailInput = // Email in register box
	document.getElementById("reg_email") as HTMLInputElement;

export const regPasswordInput = // Password in register box
	document.getElementById("reg_password") as HTMLInputElement;

export const submitRegisterButton = // Submit info in register box
	document.getElementById("register_submit_button") as HTMLButtonElement;

export const alreadyHaveAnAccountButton = // Submit info in register box
	document.getElementById("alreadyhaveanaccount_button") as HTMLButtonElement;

//------------------------------------------------------------------------REGISTER
//------------------------------------------------------------------------2FA

export const twoFAModal = // 2FA Optional Modal
	document.getElementById("twofa_modal") as HTMLDivElement;

export const twoFAOptionModal = // 2FA Modal
	document.getElementById("twofa_option_modal") as HTMLDivElement;

export const twoFAOptionCancelButton = // 2FA cancel Skip Button
	document.getElementById("twofa_option_cancel_button") as HTMLButtonElement;

export const twoFAEmailButton = // 2FA Email Button
	document.getElementById("twofa_email_button")  as HTMLInputElement;

export const twoFAInput = // 2FA Email input
	document.getElementById("twofa_input") as HTMLInputElement;

export const twoFASubmitButton = // 2FA Submit Button
	document.getElementById("twofa_submit_button") as HTMLButtonElement;

export const twoFACancelButton = // 2FA Skip Button
	document.getElementById("twofa_cancel_button") as HTMLButtonElement;

export const twoFASkipButton = // 2FA Skip Button
	document.getElementById("twofa_skip_button") as HTMLButtonElement;

export const twoFAAuthButton =  // 2FA via AUTH Button
	document.getElementById("twofa_auth_button") as HTMLButtonElement;

export const googleLoginButton = // VIA AUTH
	document.getElementById("google_login") as HTMLButtonElement;

//------------------------------------------------------------------------2FA
//------------------------------------------------------------------------FIND-ONLINE-FRIENDS------------------


export const invitePlayersModal =
	document.getElementById("invite-game-modal") as HTMLDivElement;

export const invitePlayersCancelButton =
	document.getElementById("invite-game-cancel") as HTMLButtonElement;

export const friendsListInviteUL = 
	document.getElementById("friends_list_invite_ul") as HTMLUListElement;

export const invitePlayersCurrentGameButton =
	document.getElementById("invite_players_current") as HTMLButtonElement;


export function renderFriendsList( ul_list: HTMLUListElement, friends: any[], onSelect: (id: string) => void) {
	ul_list.innerHTML = "";

	for (const friend of friends) {
		const li = document.createElement("li");

		const rowBtn = document.createElement("button");
		rowBtn.className = "pong-tournament-list-button pong-font-hover";
		rowBtn.dataset.id = String(friend.id);

		rowBtn.innerHTML = `
			<span class="truncate">${truncateText(friend.username || friend.display_name, 20)}</span>
			<span class="text-left">${friend.status || ""}</span>
			<span class="join-label text-right">INVITE</span>
		`;

		// Friends are always selectable
		rowBtn.onclick = () => onSelect(String(friend.id));

		li.appendChild(rowBtn);
		ul_list.appendChild(li);
	}
}
//------------------------------------------------------------------------FIND-ONLINE-FRIENDS------------------
//------------------------------------------------------------------------REQUESTS-MODAL

export const requestsCancelButton =
	document.getElementById("requests-game-cancel") as HTMLButtonElement;

export const requestGameModal =
	document.getElementById("requests-game-modal") as HTMLDivElement;

export const requestPlayButton =
	document.getElementById("requests_game_button") as HTMLButtonElement;

export const requestFriendsButton =
	document.getElementById("requests_friend_button") as HTMLButtonElement;

export const requestListTournamentsUL = // UL element where usernames will be inserted
	document.getElementById("requests_tournaments_ul") as HTMLUListElement;

export const requestListMatchesUL = // UL element where usernames will be inserted
	document.getElementById("requests_matches_ul") as HTMLUListElement;

export const requestsListFriendsUL = 
	document.getElementById("requests_friends_ul") as HTMLUListElement;

export const requestsTypeButtons =
	document.querySelectorAll<HTMLButtonElement>(".request-type");

export const requestsTypeOptions =
	document.querySelectorAll<HTMLDivElement>(".pong-suboptions2");

	

export function renderPendingRequests(UL: HTMLElement, requests: any): HTMLButtonElement[] {

	UL.innerHTML = "";

	const buttons: HTMLButtonElement[] = [];

    const empty = document.createElement("p");
    empty.className = "pong-font text-[7px] text-center";
    empty.style.color = "var(--pong-gray)";
    empty.textContent = "No pending games requests.";
	UL.appendChild(empty);
	for (const profile of requests) {

		const li = document.createElement("li");
		li.className = "pong-box";


		const nameMsg = document.createElement("div");
		nameMsg.className = "pong-list-box-name-msg";

		const nameSpan = document.createElement("span");
		nameSpan.textContent = `@${profile.username}`;

		const msgSpan = document.createElement("span");
		msgSpan.textContent = profile.type + " request";

		nameMsg.appendChild(nameSpan);
		nameMsg.appendChild(msgSpan);

		const btnWrap = document.createElement("div");
		btnWrap.className = "pong-list-box-button";

		const declineBtn = document.createElement("button");
		declineBtn.className = "pong-list-box-reply";
		declineBtn.textContent = "X";
		declineBtn.dataset.username = profile.username;

		const acceptBtn = document.createElement("button");
		acceptBtn.className = "pong-list-box-reply active-border";
		acceptBtn.textContent = "ACCEPT";
		acceptBtn.dataset.username = profile.username;

		btnWrap.appendChild(declineBtn);
		btnWrap.appendChild(acceptBtn);

		li.appendChild(nameMsg);
		li.appendChild(btnWrap);
		UL.appendChild(li);

		buttons.push(acceptBtn);
		buttons.push(declineBtn);
	}

	return (buttons);
}

//------------------------------------------------------------------------REQUESTS-MODAL
//------------------------------------------------------------------------CURRENT-GAME-MODAL

export const currentGameButton = 
	document.getElementById('current_game') as HTMLButtonElement;

export const currentGameModal =
	document.getElementById('current-game-modal') as HTMLDivElement;

export const currentGameCancel =
	document.getElementById('current-game-cancel') as HTMLButtonElement;

export const currentGameExit =
	document.getElementById('exit-match-button') as HTMLButtonElement;

export const currentGameStatus = 
	document.getElementById('current_game_status') as HTMLSpanElement;

export const currentGameType = 
	document.getElementById('current_game_type') as HTMLSpanElement;

export const currentGameSubType = 
	document.getElementById('current_game_subtype') as HTMLSpanElement;

export const currentGameVisibility = 
	document.getElementById('current_game_visibility') as HTMLSpanElement;

export const currentGameSize = 
	document.getElementById('current_game_size') as HTMLSpanElement;

export const currentGameCreator = 
	document.getElementById('current_game_creator') as HTMLSpanElement;

export const currentGamePlayers = 
	document.getElementById('current_game_players') as HTMLUListElement;

	

export interface MatchData {
	match_id: string;
	tournament_id: string;
	type: string;
	sub_type: string;
	visibility: string;
	size: string;
	creator: string;
	players: string[];
	status: "Waiting" | "Ready" | "In Game";
}

export let gameData: MatchData | null = null;

export function setGameData(data: MatchData) {
	gameData = data;
}

//------------------------------------------------------------------------CURRENT-GAME-MODAL
//------------------------------------------------------------------------CREATE-GAME-MODAL

export const createGameModal =
	document.getElementById("create-game-modal") as HTMLDivElement;

export const createGameButton =
	document.getElementById("create_game") as HTMLButtonElement;

export const createGameCancelButton =
	document.getElementById("create-game-cancel") as HTMLButtonElement;

export let playAiButton: HTMLButtonElement;

export let playLocallyButton: HTMLButtonElement;

export let playRequestSendButton: HTMLButtonElement;

export let submitTournamentCreationButton: HTMLButtonElement;

export const playRequestUsernameInput =
	document.getElementById("play_request_username") as HTMLInputElement;


export const InviteManualSubmitButton =
	document.getElementById("invite_manual_submit") as HTMLButtonElement;

export const gameCreateSubmitButton = 
	document.getElementById("create_submit_button") as HTMLButtonElement;

export const matchTypeButtons =
	document.querySelectorAll<HTMLButtonElement>(".match-type");

export const matchOptionPanels =
	document.querySelectorAll<HTMLDivElement>(".pong-suboptions");

export let selected_mode: string;

export function setSelectedMode(mode :string): void {
	selected_mode = mode;
}

export function getSelectedMode(): string {
	return (selected_mode);
}


//------------------------------------------------------------------------CREATE-GAME-MODAL-ONLINE-MATCH


export let onlineToggle =
	document.getElementById('online_toggle') as HTMLButtonElement;

export let onlineToggleText = 
	document.getElementById('online_toggle_text') as HTMLDivElement;

onlineToggleText.textContent = "Only by Invite....";

let isPublic: boolean = false; 

export function toggleVisibility(visibility: boolean): void {

	isPublic = visibility;
	if (isPublic === false) {
		onlineToggleText.textContent = "Only by Invite....";
	} else {
		onlineToggleText.textContent = "Anyone can Join...";
	}
}

onlineToggle.onclick = (): void => {

	isPublic = !isPublic;
	toggleVisibility(isPublic);
};

export function getGameVisibility(): boolean {

	return (isPublic);
}


//------------------------------------------------------------------------CREATE-GAME-MODAL-ONLINE-MATCH
//------------------------------------------------------------------------CREATE-GAME-MODAL-AI-MATCH

export const localOptions =
	document.querySelectorAll<HTMLButtonElement>('#local_options .pong-button');


//------------------------------------------------------------------------CREATE-GAME-MODAL-AI-MATCH
//------------------------------------------------------------------------CREATE-GAME-MODAL-ONLINE-TOURNAMENT

export const tournamentSizeInput = 
	document.getElementById("tournament_size") as HTMLInputElement;

const increment = 
	document.getElementById("increment") as HTMLButtonElement;

const decrement = 
	document.getElementById("decrement") as HTMLButtonElement;

increment.addEventListener("click", () => {

	const step = Number(tournamentSizeInput.step) || 1;
	const max = Number(tournamentSizeInput.max);
	const min = Number(tournamentSizeInput.min);

	if (!tournamentSizeInput.value) {
		tournamentSizeInput.value = String(min);
		return;
	}

	const current = Number(tournamentSizeInput.value);
	const next = Math.min(current + step, max);

	tournamentSizeInput.value = String(next);
});

decrement.addEventListener("click", () => {

	const step = Number(tournamentSizeInput.step) || 1;
	const min = Number(tournamentSizeInput.min);

	if (!tournamentSizeInput.value) {
		tournamentSizeInput.value = String(min);
		return;
	}

	const current = Number(tournamentSizeInput.value);
	const next = Math.max(current - step, min);

	tournamentSizeInput.value = String(next);
});



//------------------------------------------------------------------------CREATE-GAME-MODAL-ONLINE-TOURNAMENT
//------------------------------------------------------------------------CREATE-GAME-MODAL------------------
//------------------------------------------------------------------------SEARCH-GAME-MODAL------------------


export const findGameModal =
	document.getElementById("find-game-modal") as HTMLDivElement;

export const findGameButton =
	document.getElementById("find_game") as HTMLButtonElement;

export const findGameCancelButton =
	document.getElementById("find-game-cancel") as HTMLButtonElement;

export const findMatchesListUL =
	document.getElementById("find_matches_ul") as HTMLUListElement;

export const findTournamentsListUL =
	document.getElementById("find_tournaments_ul") as HTMLUListElement;

export const findGameTypeButtons =
	document.querySelectorAll<HTMLButtonElement>(".find-type");

export const findGameTypeOptions =
	document.querySelectorAll<HTMLDivElement>(".pong-suboptions3");


export function renderGamesList(ul_list: HTMLUListElement, games: any[], onJoin: (id: string) => void) {
	

	ul_list.innerHTML = "";

	for (const game of games) {
		const li = document.createElement("li");
		li.style.marginBottom = "6px";

		const rowBtn = document.createElement("button");
		rowBtn.className = "pong-tournament-list-button pong-font-hover";
		rowBtn.dataset.id = String(game.id);


		rowBtn.innerHTML = `
			<span class="truncate">${truncateText(game.creator, 20)}</span>
			<span class="text-left">${game.current_size}/${game.max_size}</span>
			<span class="join-label text-right">${game.full ? "FULL" : "JOIN"}</span>
		`;

		if (game.full) {
			rowBtn.disabled = true;
			rowBtn.classList.add("cursor-not-allowed", "opacity-50");
		} else {

			rowBtn.onclick = () => onJoin(String(game.id));
		}
		li.appendChild(rowBtn);
		ul_list.appendChild(li);
	}
	
}

//------------------------------------------------------------------------SEARCH-GAME-MODAL------------------

//------------------------------------------------------------------------UTILS


export function show(elem: HTMLElement): void { // show HTML element
	elem.classList.remove("hidden"); 
}

export function hide(elem: HTMLElement): void { // hide HTML
	elem.classList.add("hidden"); 
}

export function makeInvisible(elem: HTMLElement): void {
	elem.classList.add("invisible-slot");
	elem.classList.remove("visible-slot");
}

export function makeVisible(elem: HTMLElement): void {
	elem.classList.remove("invisible-slot");
	elem.classList.add("visible-slot");
}


//------------------------------------------------------------------------UTILS
//------------------------------------------------------------------------SETTINGS

export let FONT = "BlockFont";

export const pongFont = new FontFace("BlockFont", "url(game/assets/block-normal.ttf)");
pongFont.load().then((loadedFont) => {
	document.fonts.add(loadedFont);
	console.log("BlockFont loaded");
});

export const pongFontMirror = new FontFace("BlockFontMirror", "url(game/assets/block-mirror.ttf)");
pongFontMirror.load().then((loadedFont) => {
	document.fonts.add(loadedFont);
	console.log("BlockFontMirror loaded");
});

export function mirrorCanvas(): void {
	if (FONT === "BlockFont") FONT = "BlockFontMirror";
	else FONT = "BlockFont";
	canvas.classList.toggle("scale-x-[-1]");
}

export let whitish: string = 
	"#c7f6ff";

export let blackish: string = 
	"#000708";

export const redish: string = 
	"#3d0027";

export const greenish: string = 
	"#003527";


export const nightModeButton = //night mode button
	document.getElementById("day_mode") as HTMLButtonElement;

export let nightMode = false;

export function invertNightMode() {
	nightMode = !nightMode;
}

export function swapNightMode() {
	if (!nightMode) {
		const temp = whitish;
		whitish = blackish;
		blackish = temp;
	} else {
		whitish = "#000708";
		blackish = "#c7f6ff";
	}
}


const avatarSymbols: string[] = [
	"&#9865;", "&#10020;", "&#10026;", "&#10015;",
	"&#9760;", "&#9786;", "&#9787;", "&#10037;",
	"&#9883;", "&#9884;", "&#10049;", "&#10057;",
];

export const changeProfilePicButton =
	document.getElementById("change_profilepic_button") as HTMLButtonElement;

export const profilePicModal =
	document.getElementById("profilepic_modal") as HTMLDivElement;

const profilePicGrid =
	document.getElementById("profilepic_grid") as HTMLDivElement;

export const profilePicCancelButton =
	document.getElementById("profilepic_cancel_button") as HTMLButtonElement;

const selfProfileImage =
	document.getElementById("self_profile_image") as HTMLDivElement;

export function renderProfilePicGrid(): void {
    profilePicGrid.innerHTML = "";

    for (const symbol of avatarSymbols) {
        const btn = document.createElement("button");
        btn.className = "profilepic-item";
        btn.innerHTML = symbol;

        btn.onclick = async () => {
            const result = await changeAvatar(symbol);
            
            if (result.status === 200) {
                selfProfileImage.innerHTML = symbol;
                showNotification("Avatar guardado!");
                hide(profilePicModal);
                show(menuModal);
            } else {
                showNotification("Error al guardar avatar");
            }
        };

        profilePicGrid.appendChild(btn);
    }
}



export function truncateText(value: string | null, max: number): string {
	if (!value)
		return "";

	if (value.length <= max)
		return value;

	return value.slice(0, max - 1) + "…";
}

export const logoutButton = // Logout Button
	document.getElementById("logout_button") as HTMLButtonElement;
//------------------------------------------------------------------------SETTINGS
//------------------------------------------------------------------------THEME

const boardThemeButton = document.getElementById("board_theme_button") as HTMLButtonElement;
const boardThemeModal = document.getElementById("board_theme_modal") as HTMLDivElement;
const boardThemePrevButton = document.getElementById("board_theme_prev") as HTMLButtonElement;
const boardThemeNextButton = document.getElementById("board_theme_next") as HTMLButtonElement;
const boardThemeApplyButton = document.getElementById("board_theme_apply") as HTMLButtonElement;
const boardThemeCancelButton = document.getElementById("board_theme_cancel") as HTMLButtonElement;
const boardThemePreview = document.getElementById("board_theme_preview") as HTMLCanvasElement;
const boardThemeName = document.getElementById("board_theme_name") as HTMLDivElement;


let boardThemePreviewCtx: CanvasRenderingContext2D | null = null;
if (boardThemePreview) {
    boardThemePreviewCtx = boardThemePreview.getContext("2d");
}

const boardThemeClassNames = boardThemes.map((theme) => theme.className);

let boardThemeIndex = Math.max(
    0,
    boardThemes.findIndex(
        (theme) => theme.id === localStorage.getItem("pong_board_theme"),
    ),
);

function applyBoardThemeById(themeId: string, redraw: boolean = true): void {
    if (!canvas) return; // Seguridad
    const theme = boardThemes.find((t) => t.id === themeId) || boardThemes[0];
    boardThemeClassNames.forEach((className) =>
        canvas.classList.remove(className),
    );
    canvas.classList.add(theme.className);
    localStorage.setItem("pong_board_theme", theme.id);
    if (redraw) drawGame();
}

async function drawBoardThemePreview(): Promise<void> {
    if (!boardThemePreview || !boardThemePreviewCtx) return;

    await pongFont;

    const width = boardThemePreview.width;
    const height = boardThemePreview.height;
    const scaleX = width / 600;
    const scaleY = height / 400;

    boardThemePreviewCtx.clearRect(0, 0, width, height);

    const paddleWidth = Math.max(2, Math.round(10 * scaleX));
    const paddleHeight = Math.max(8, Math.round(60 * scaleY));
    const ballSize = Math.max(3, Math.round(10 * scaleX));
    const lineWidth = Math.max(2, Math.round(5 * scaleX));
    const dashHeight = Math.max(4, Math.round(10 * scaleY));
    const dashGap = Math.max(3, Math.round(5 * scaleY));

    const leftX = Math.round(10 * scaleX);
    const leftY = Math.round(170 * scaleY);
    const rightX = Math.round(580 * scaleX);
    const rightY = Math.round(170 * scaleY);
    const ballX = Math.round(300 * scaleX);
    const ballY = Math.round(200 * scaleY);

    boardThemePreviewCtx.fillStyle = blackish;
    boardThemePreviewCtx.fillRect(leftX, leftY, paddleWidth, paddleHeight);
    boardThemePreviewCtx.fillRect(rightX, rightY, paddleWidth, paddleHeight);
    boardThemePreviewCtx.fillRect(ballX, ballY, ballSize, ballSize);

    const centerX = Math.round(width / 2 - lineWidth / 2);
    for (let y = 0; y < height; y += dashHeight + dashGap) {
        boardThemePreviewCtx.fillRect(centerX, y, lineWidth, dashHeight);
    }

    boardThemePreviewCtx.textAlign = "center";
    boardThemePreviewCtx.textBaseline = "top";
    // Usamos BlockFont porque la cargamos arriba
    boardThemePreviewCtx.font = `${Math.max(12, Math.round(48 * scaleY))}px BlockFont`;
    boardThemePreviewCtx.fillText("2", width / 4, Math.round(12 * scaleY));
    boardThemePreviewCtx.fillText("1", (width / 4) * 3, Math.round(12 * scaleY));
}

function updateBoardThemePreview(): void {
    if (!boardThemePreview || !boardThemeName) return;
    const theme = boardThemes[boardThemeIndex] || boardThemes[0];
    boardThemeClassNames.forEach((className) =>
        boardThemePreview.classList.remove(className),
    );
    boardThemePreview.classList.add(theme.className);
    boardThemeName.textContent = theme.name;
    void drawBoardThemePreview();
}

if (boardThemeButton) {
    boardThemeButton.onclick = () => {
        updateBoardThemePreview();
        show(boardThemeModal);
    };
}

if (boardThemeCancelButton) {
    boardThemeCancelButton.onclick = () => hide(boardThemeModal);
}

if (boardThemePrevButton) {
    boardThemePrevButton.onclick = () => {
        boardThemeIndex =
            (boardThemeIndex - 1 + boardThemes.length) % boardThemes.length;
        updateBoardThemePreview();
    };
}

if (boardThemeNextButton) {
    boardThemeNextButton.onclick = () => {
        boardThemeIndex = (boardThemeIndex + 1) % boardThemes.length;
        updateBoardThemePreview();
    };
}

if (boardThemeApplyButton) {
    boardThemeApplyButton.onclick = () => {
        const theme = boardThemes[boardThemeIndex] || boardThemes[0];
        applyBoardThemeById(theme.id);
        hide(boardThemeModal);
    };
}

export const aiEasyButton = 
    document.getElementById("ai_easy") as HTMLButtonElement;

export const aiMediumButton = 
    document.getElementById("ai_medium") as HTMLButtonElement;

export const aiHardButton = 
    document.getElementById("ai_hard") as HTMLButtonElement;

export const local2PlayerButton = 
    document.getElementById("2player") as HTMLButtonElement;
	
// --- DISPLAY NAME, USERNAME, EMAIL, PASSWORD ELEMENTS ---

export const changeDisplayNameButton =
    document.getElementById("change_displayname_button") as HTMLButtonElement;

export const changeDisplayNameModal =
    document.getElementById("change_displayname_modal") as HTMLDivElement;

export const closeChangeDisplayNameButton =
    document.getElementById("close_change_displayname") as HTMLButtonElement;

export const newDisplayNameInput =
    document.getElementById("new_displayname_input") as HTMLInputElement;

export const submitNewDisplayNameButton =
    document.getElementById("submit_new_displayname") as HTMLButtonElement;

export const changeUsernameButton =
    document.getElementById("change_username_button") as HTMLButtonElement;

export const changeUsernameModal =
    document.getElementById("change_username_modal") as HTMLDivElement;

export const closeChangeUsernameButton =
    document.getElementById("close_change_username") as HTMLButtonElement;

export const newUsernameInput =
    document.getElementById("new_username_input") as HTMLInputElement;

export const submitNewUsernameButton =
    document.getElementById("submit_new_username") as HTMLButtonElement;

export const changeEmailButton =
    document.getElementById("change_email_button") as HTMLButtonElement;

export const changeEmailModal =
    document.getElementById("change_email_modal") as HTMLDivElement;

export const closeChangeEmailButton =
    document.getElementById("close_change_email") as HTMLButtonElement;

export const newEmailInput =
    document.getElementById("new_email_input") as HTMLInputElement;

export const submitNewEmailButton =
    document.getElementById("submit_new_email") as HTMLButtonElement;

export const changePasswordButton =
    document.getElementById("change_password_button") as HTMLButtonElement;

export const changePasswordModal =
    document.getElementById("change_password_modal") as HTMLDivElement;

export const closeChangePasswordButton =
    document.getElementById("close_change_password") as HTMLButtonElement;

export const oldPasswordInput =
    document.getElementById("old_password_input") as HTMLInputElement;

export const newPasswordInput =
    document.getElementById("new_password_input") as HTMLInputElement;

export const confirmPasswordInput =
    document.getElementById("confirm_password_input") as HTMLInputElement;

export const submitNewPasswordButton =
    document.getElementById("submit_new_password") as HTMLButtonElement;


if (changeDisplayNameButton) {
    changeDisplayNameButton.onclick = () => {
        hide(menuModal);
        show(changeDisplayNameModal);
    };
}
if (closeChangeDisplayNameButton) {
    closeChangeDisplayNameButton.onclick = () => {
        hide(changeDisplayNameModal);
        show(menuModal);
    };
}
if (changePasswordButton) {
    changePasswordButton.onclick = () => {
        hide(menuModal);
        show(changePasswordModal);
    };
}
if (closeChangePasswordButton) {
    closeChangePasswordButton.onclick = () => {
        hide(changePasswordModal);
        show(menuModal);
    };
}

//------------------------------------------------------------------------SETTINGS
// ! ----- STATS -----

export const statLocalPlayed = document.getElementById("stat_local_played") as HTMLSpanElement;
export const statLocalWon = document.getElementById("stat_local_won") as HTMLSpanElement;
export const statOnlinePlayed = document.getElementById("stat_online_played") as HTMLSpanElement;
export const statOnlineWon = document.getElementById("stat_online_won") as HTMLSpanElement;
export const statTournPlayed = document.getElementById("stat_tournaments_played") as HTMLSpanElement;
export const statTournWon = document.getElementById("stat_tournaments_won") as HTMLSpanElement;

export const totalGamesEl = document.getElementById("stats_total_games") as HTMLSpanElement;
export const winRateEl = document.getElementById("stats_win_rate") as HTMLSpanElement;
export const streakEl = document.getElementById("stats_streak") as HTMLSpanElement;
export const bestStreakEl = document.getElementById("stats_best_streak") as HTMLSpanElement;



applyBoardThemeById(boardThemes[boardThemeIndex]?.id || "default", false);
updateBoardThemePreview();
export { drawGame };

//------------------------------------------------------------------------THEME
import { drawGame } from "./draw.js";
import { boardThemes } from "./themes.js"; // Importado de themes.js
import { TournamentInfo, ProfileInfo, UserStats } from "./vars.js";
import { changeAvatar } from "./change.js";

//------------------------------------------------------------------------OPPONENT

export const topBarOpponentButton =
    document.getElementById("opponent_profile_button") as HTMLDivElement;

export const topBarOpponentPicture =
    document.getElementById("opponent_profile_image") as HTMLDivElement;

export const topBarOpponentDisplayName =
    document.getElementById("opponent_displayname") as HTMLSpanElement;

//------------------------------------------------------------------------OPPONENT
//------------------------------------------------------------------------MENU

export const openMenuButton =
    document.getElementById("menu_button") as HTMLButtonElement;

export const topBarProfilePicture =
    document.getElementById("self_profile_image") as HTMLDivElement;

export const topBarDisplayName =
    document.getElementById("self_displayname") as HTMLSpanElement;

export const menuModal =
    document.getElementById("menu_modal") as HTMLDivElement;

export const menuDisplayName =
    document.getElementById("profile_displayname") as HTMLDivElement;

export const menuUsername =
    document.getElementById("profile_username") as HTMLDivElement;

export const menuButtons =
    document.querySelectorAll<HTMLButtonElement>('.pong-menu-buttons .pong-button');

export function showCanvas() {
    hide(menuModal);
    show(canvas);
    drawGame();
    makeVisible(topBarOpponentButton);
    show(topBarOpponentDisplayName);
    makeVisible(topBarDisplayName);
    show(topBarDisplayName);
    makeVisible(startMatchButton);
    show(startMatchButton);
    makeVisible(exitMatchButton);
    show(exitMatchButton);
}

export function showMenu() {
    hide(canvas);
    show(menuModal);
    hide(topBarDisplayName);
    makeInvisible(topBarOpponentButton);
    hide(topBarOpponentDisplayName);
    hide(startMatchButton);
    hide(exitMatchButton);
}

let menu_open: boolean = false;

export function toggleMenu(): void {
    if (menu_open) {
        hide(menuModal);
        drawGame();
        show(canvas);
    } else {
        hide(canvas);
        makeInvisible(startMatchButton);
        makeInvisible(exitMatchButton);
        show(menuModal);
    }
    menu_open = !menu_open;
}

openMenuButton.onclick = toggleMenu;

export function updateProfileUI(displayName: string, userName: string): void {
    if (topBarDisplayName) {
        topBarDisplayName.textContent = displayName;
    }
    if (menuDisplayName) {
        menuDisplayName.textContent = displayName;
    }
    if (menuUsername) {
        menuUsername.textContent = "@" + userName;
    }
}

export function updateOpponentUI(displayName: string, profilePic?: string) {
    if (topBarOpponentDisplayName) {
        topBarOpponentDisplayName.textContent = displayName;
    }
}

//------------------------------------------------------------------------MENU
//------------------------------------------------------------------------LOGIN

export const loginModal =
    document.getElementById("login_modal") as HTMLDivElement;

export const closeLoginButton =
    document.getElementById("close_login") as HTMLButtonElement;

export const usernameInput =
    document.getElementById("user_input") as HTMLInputElement;

export const passwordInput =
    document.getElementById("pass_input") as HTMLInputElement;

export const dontHaveAnAccountButton =
    document.getElementById("donthaveanaccount_button") as HTMLButtonElement;

export const submitLoginButton =
    document.getElementById("login_submit_button") as HTMLButtonElement;

//------------------------------------------------------------------------LOGIN
//------------------------------------------------------------------------REGISTER

export const registerModal =
    document.getElementById("register_modal") as HTMLDivElement;

export const closeRegisterButton =
    document.getElementById("close_register") as HTMLButtonElement;

export const regUsernameInput =
    document.getElementById("reg_username") as HTMLInputElement;

export const regDisplaynameInput =
    document.getElementById("reg_displayname") as HTMLInputElement;

export const regEmailInput =
    document.getElementById("reg_email") as HTMLInputElement;

export const regPasswordInput =
    document.getElementById("reg_password") as HTMLInputElement;

export const submitRegisterButton =
    document.getElementById("register_submit_button") as HTMLButtonElement;

export const alreadyHaveAnAccountButton =
    document.getElementById("alreadyhaveanaccount_button") as HTMLButtonElement;

//------------------------------------------------------------------------REGISTER
//------------------------------------------------------------------------2FA

export const twoFAModal =
    document.getElementById("twofa_modal") as HTMLDivElement;

export const twoFAOptionModal =
    document.getElementById("twofa_option_modal") as HTMLDivElement;

export const twoFAEmailButton =
    document.getElementById("twofa_email_button") as HTMLInputElement;

export const twoFAInput =
    document.getElementById("twofa_input") as HTMLInputElement;

export const twoFASubmitButton =
    document.getElementById("twofa_submit_button") as HTMLButtonElement;

export const twoFACancelButton =
    document.getElementById("twofa_cancel_button") as HTMLButtonElement;

export const twoFASkipButton =
    document.getElementById("twofa_skip_button") as HTMLButtonElement;

export const twoFAAuthButton =
    document.getElementById("twofa_auth_button") as HTMLButtonElement;

//------------------------------------------------------------------------2FA
//------------------------------------------------------------------------PLAY AGAINST USER

export const startMatchButton =
    document.getElementById("start_match") as HTMLButtonElement;

export const exitMatchButton =
    document.getElementById("exit_match") as HTMLButtonElement;

export const playLocallyButton =
    document.getElementById("play_locally") as HTMLButtonElement;

export const playAgainstAIButton = // Agregado por si acaso se usa en main.js
    document.getElementById("play_ai") as HTMLButtonElement;

export const playAgainstUserButton =
    document.getElementById("play_against_user") as HTMLButtonElement;

export const playRequestModal =
    document.getElementById("play_request_modal") as HTMLDivElement;

export const playRequestUsernameInput =
    document.getElementById("play_request_username") as HTMLInputElement;

export const playRequestCloseButton =
    document.getElementById("close_play_request") as HTMLButtonElement;

export const playRequestSendButton =
    document.getElementById("send_play_request") as HTMLButtonElement;

//------------------------------------------------------------------------PLAY AGAINST USER
//------------------------------------------------------------------------INCOMING PLAY REQUEST

export const incomingPlayRequestModal =
    document.getElementById("incoming_play_request_modal") as HTMLDivElement;

export const incomingPlayRequestText =
    document.getElementById("incoming_play_request_text") as HTMLParagraphElement;

export const incomingPlayRequestCloseButton =
    document.getElementById("incoming_play_request_close") as HTMLButtonElement;

export const incomingPlayRequestAcceptButton =
    document.getElementById("incoming_play_request_accept") as HTMLButtonElement;

export const requestListUL =
    document.getElementById("request_list_ul") as HTMLUListElement;

export function renderPendingRequests(requests: ProfileInfo[]): HTMLButtonElement[] {
    requestListUL.innerHTML = "";
    const buttons: HTMLButtonElement[] = [];

    for (const profile of requests) {
        const li = document.createElement("li");
        li.className = "pong-box";

        const nameMsg = document.createElement("div");
        nameMsg.className = "pong-list-box-name-msg";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = `@${profile.username}`;

        const msgSpan = document.createElement("span");
        msgSpan.textContent = "Match request";

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
        requestListUL.appendChild(li);

        buttons.push(acceptBtn);
        buttons.push(declineBtn);
    }
    return buttons;
}

//------------------------------------------------------------------------INCOMING PLAY REQUEST
//------------------------------------------------------------------------CREATE TOURNAMENT

export const openCreateTournamentButton =
    document.getElementById("create_tournament") as HTMLButtonElement;

export const closeCreateTournamentButton =
    document.getElementById("tournament_create_cancel_button") as HTMLButtonElement;

export const submitTournamentCreationButton =
    document.getElementById("tournament_create_submit_button") as HTMLButtonElement;

export const createTournamentModal =
    document.getElementById("create_tournament_modal") as HTMLDivElement;

export const aliasTournamentInput =
    document.getElementById("tournament_alias") as HTMLInputElement;

export const tournamentSizeInput =
    document.getElementById("tournament_size") as HTMLInputElement;

const input =
    document.getElementById("tournament_size") as HTMLInputElement;

const increment =
    document.getElementById("increment") as HTMLButtonElement;

const decrement =
    document.getElementById("decrement") as HTMLButtonElement;

increment.addEventListener("click", () => {
    const step = Number(input.step) || 1;
    const max = Number(input.max);
    input.value = String(Math.min(Number(input.value) + step, max));
});

decrement.addEventListener("click", () => {
    const step = Number(input.step) || 1;
    const min = Number(input.min);
    input.value = String(Math.max(Number(input.value) - step, min));
});

//------------------------------------------------------------------------CREATE TOURNAMENT
//------------------------------------------------------------------------SEARCH TOURNAMENT

export const openSearchTournamentButton =
    document.getElementById("search_tournament") as HTMLButtonElement;

// VIA AUTH
export const googleLoginButton =
    document.getElementById("google_login") as HTMLButtonElement;

export const closeSearchTournamentButton =
    document.getElementById("tournament_search_cancel_button") as HTMLButtonElement;

export const searchTournamentsModal =
    document.getElementById("search_tournaments_modal") as HTMLDivElement;

export const tournamentsListUL =
    document.getElementById("tournament_list_ul") as HTMLUListElement;

export function renderTournamentList(tournaments: TournamentInfo[]): HTMLButtonElement[] {
    tournamentsListUL.innerHTML = "";
    const buttons: HTMLButtonElement[] = [];

    for (const tournament of tournaments) {
        const li = document.createElement("li");

        const rowBtn = document.createElement("button");
        rowBtn.className = "pong-button pong-tournament-list-button";

        rowBtn.dataset.id = String(tournament.id);
        rowBtn.dataset.creator = tournament.creator;

        const nameSpan = document.createElement("span");
        nameSpan.className = "truncate";
        nameSpan.textContent = tournament.creator;

        const sizeSpan = document.createElement("span");
        sizeSpan.className = "text-right";
        sizeSpan.textContent = `${tournament.current_size}/${tournament.max_size}`;

        const statusSpan = document.createElement("span");
        statusSpan.className = "text-right";
        statusSpan.textContent = "JOIN";

        if (tournament.full === true) {
            statusSpan.textContent = "FULL";
            rowBtn.disabled = true;
            rowBtn.classList.add("cursor-not-allowed");
        }

        rowBtn.appendChild(nameSpan);
        rowBtn.appendChild(sizeSpan);
        rowBtn.appendChild(statusSpan);

        li.appendChild(rowBtn);
        tournamentsListUL.appendChild(li);
        buttons.push(rowBtn);
    }
    return buttons;
}

//------------------------------------------------------------------------SEARCH TOURNAMENT
//------------------------------------------------------------------------CANVAS

export const canvas =
    document.getElementById("game_screen") as HTMLCanvasElement;

export const texture =
    canvas.getContext("2d") as CanvasRenderingContext2D;

//------------------------------------------------------------------------CANVAS
//------------------------------------------------------------------------NOTIFICATIONS

export const notificationBox =
    document.getElementById("notify-box") as HTMLDivElement;

export const notificationBoxText =
    document.getElementById("notify-text") as HTMLDivElement;

export const notificationAcceptButton =
    document.getElementById("notify-accept") as HTMLButtonElement;

export function showNotification(text: string, state?: boolean) {
    if (!notificationBox || !notificationBoxText) return;

    notificationBoxText.textContent = text;
    let time = 2500;
    if (state && state === true) {
        show(notificationAcceptButton);
        time = 5000;
    }
    show(notificationBox);
    notificationBox.classList.remove("opacity-0", "pointer-events-none");
    notificationBox.classList.add("opacity-100");

    setTimeout(() => {
        notificationBox.classList.remove("opacity-100");
        notificationBox.classList.add("opacity-0");

        setTimeout(() => {
            hide(notificationBox);
            hide(notificationAcceptButton);
        }, 200);
    }, time);
}

//------------------------------------------------------------------------NOTIFICATIONS
//------------------------------------------------------------------------UTILS

export const loadAnimation =
    document.getElementById("load_animation_modal") as HTMLDivElement;

export function showLoader() {
    show(loadAnimation);
}

export function hideLoader() {
    hide(loadAnimation);
}

export function show(elem: HTMLElement): void {
    elem.classList.remove("hidden");
}

export function hide(elem: HTMLElement): void {
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

export let SCORES: number[] = [0, 0];

export function setSCORES(scoreA: number, scoreB: number) {
    SCORES[0] = scoreA;
    SCORES[1] = scoreB;
}

export function getSCORES() {
    return SCORES;
}

export let INVITE_FROM: string;

export function setInviteFrom(target: string) {
    INVITE_FROM = target;
}

export function getInviteFrom(): string {
    return INVITE_FROM;
}

//------------------------------------------------------------------------UTILS
//------------------------------------------------------------------------SETTINGS

// 1. Font Loading (Necesario para el Theme Preview)
export const pongFont = new Promise<void>((resolve) => {
    const Font = new FontFace("BlockFont", "url(game/assets/block_merged.ttf)");
    Font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log("BlockFont loaded");
        resolve();
    });
});

// 2. Colores (Necesarios para el Theme Preview)
export let whitish: string = "#000708";
export let blackish: string = "#c7f6ff";
export const redish: string = "#3d0027";
export const greenish: string = "#003527";

export const dayModeButton =
    document.getElementById("day_mode") as HTMLButtonElement;

export let dayMode = false;

dayModeButton.onclick = () => {
    dayMode = !dayMode;
    document.documentElement.classList.toggle("pong-day-mode", dayMode);

    if (dayMode) {
        const temp = whitish;
        whitish = blackish;
        blackish = temp;
    } else {
        whitish = "#000708";
        blackish = "#c7f6ff";
    }
    drawGame();
};

export const logoutButton =
    document.getElementById("logout_button") as HTMLButtonElement;

// --- PROFILE PICTURE LOGIC ---

const avatarSymbols: string[] = [
    "&#9865;", "&#10020;", "&#10026;", "&#10015;",
    "&#9760;", "&#9786;", "&#9787;", "&#10037;",
    "&#9883;", "&#9884;", "&#10049;", "&#10057;",
];

const changeProfilePicButton =
    document.getElementById("change_profilepic_button") as HTMLButtonElement;

const profilePicModal =
    document.getElementById("profilepic_modal") as HTMLDivElement;

const profilePicGrid =
    document.getElementById("profilepic_grid") as HTMLDivElement;

const selfProfileImage =
    document.getElementById("self_profile_image") as HTMLDivElement;

function renderProfilePicGrid(): void {
    profilePicGrid.innerHTML = "";
    for (const symbol of avatarSymbols) {
        const btn = document.createElement("button");
        btn.className = "profilepic-item";
        btn.innerHTML = symbol;
        btn.onclick = async () => {
            const result = await changeAvatar(symbol);
            if (result.status === 0) {
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

changeProfilePicButton.onclick = () => {
    renderProfilePicGrid();
    show(profilePicModal);
};

const profilePicCancelButton = document.getElementById("profilepic_cancel_button") as HTMLButtonElement;
if (profilePicCancelButton) {
    profilePicCancelButton.onclick = () => {
        hide(profilePicModal);
        show(menuModal);
    };
}

let displaySide: string = "right";

export function getDisplaySide(): string {
    return displaySide;
}

export function setDisplaySide(side: string): void {
    displaySide = side;
}

export function mirrorCanvas(): void {
    canvas.classList.toggle("scale-x-[-1]");
}

// --- BOARD THEME LOGIC (AÑADIDO) ---

const boardThemeButton = document.getElementById("board_theme_button") as HTMLButtonElement;
const boardThemeModal = document.getElementById("board_theme_modal") as HTMLDivElement;
const boardThemePrevButton = document.getElementById("board_theme_prev") as HTMLButtonElement;
const boardThemeNextButton = document.getElementById("board_theme_next") as HTMLButtonElement;
const boardThemeApplyButton = document.getElementById("board_theme_apply") as HTMLButtonElement;
const boardThemeCancelButton = document.getElementById("board_theme_cancel") as HTMLButtonElement;
const boardThemePreview = document.getElementById("board_theme_preview") as HTMLCanvasElement;
const boardThemeName = document.getElementById("board_theme_name") as HTMLDivElement;

// Contexto del preview
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

export function updateStatsUI(stats: UserStats) {
    if (!stats) return;

    if (statLocalPlayed) statLocalPlayed.textContent = (stats.local_played || 0).toString();
    if (statLocalWon) statLocalWon.textContent = (stats.local_won || 0).toString();
    if (statOnlinePlayed) statOnlinePlayed.textContent = (stats.online_played || 0).toString();
    if (statOnlineWon) statOnlineWon.textContent = (stats.online_won || 0).toString();
    if (statTournPlayed) statTournPlayed.textContent = (stats.tournaments_played || 0).toString();
    if (statTournWon) statTournWon.textContent = (stats.tournaments_won || 0).toString();
}

applyBoardThemeById(boardThemes[boardThemeIndex]?.id || "default", false);
updateBoardThemePreview();
export { drawGame };
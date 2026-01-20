
import { drawGame } from "./draw.js";
import {TournamentInfo, ProfileInfo} from "./vars.js";


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

export 	function showCanvas() {

	hide(menuModal);
	show(canvas);
	drawGame();
	show(topBarOpponentDisplayName);
	makeVisible(topBarOpponentButton);
	show(topBarDisplayName);
	show(startMatchButton);
	show(exitMatchButton);

}

export 	function showMenu() {
	
	hide(canvas);
	show(menuModal);
	hide(topBarDisplayName);
	makeInvisible(topBarOpponentButton);
	hide(topBarOpponentDisplayName);
	hide(startMatchButton);
	hide(exitMatchButton);
}

let menu_open: boolean = false;

export function toggleMenu(): void
{
	if (menu_open) {
		hide(menuModal);
		drawGame();
		show(canvas);
	}
	else {
		hide(canvas);
		show(menuModal);
	}
	menu_open = !menu_open;
}

openMenuButton.onclick = toggleMenu;

export function updateProfileUI(displayName: string, username: string): void
{
	if (topBarDisplayName) {
		topBarDisplayName.textContent = "@" + username;
	}

	if (menuDisplayName)
		menuDisplayName.textContent = displayName;

	if (menuUsername)
		menuUsername.textContent = "@" + username;
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


//------------------------------------------------------------------------2FA
//------------------------------------------------------------------------PLAY AGAINST USER

export const startMatchButton = // Start match button element
	document.getElementById("start_match") as HTMLButtonElement;

export const exitMatchButton = // EXIT match button element
	document.getElementById("exit_match") as HTMLButtonElement;

export const playLocallyButton =
	document.getElementById("play_locally") as HTMLButtonElement;

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

export const requestListUL = // UL element where usernames will be inserted
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

	return (buttons);
}

//------------------------------------------------------------------------INCOMING PLAY REQUEST
//------------------------------------------------------------------------CREATE TOURNAMENT


export const openCreateTournamentButton = // Create a match button
	document.getElementById("create_tournament") as HTMLButtonElement;

export const closeCreateTournamentButton =
	document.getElementById("tournament_create_cancel_button") as HTMLButtonElement;

export const submitTournamentCreationButton = // Submit Tournament creation button
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


export const openSearchTournamentButton = // Search for matches button
	document.getElementById("search_tournament") as HTMLButtonElement;

export const closeSearchTournamentButton =
	document.getElementById("tournament_search_cancel_button") as HTMLButtonElement;

export const searchTournamentsModal = // Container showing waiting tournaments
	document.getElementById("search_tournaments_modal") as HTMLDivElement;

export const tournamentsListUL = // UL element where usernames will be inserted
	document.getElementById("tournament_list_ul") as HTMLUListElement;


export function renderTournamentList(tournaments: TournamentInfo[]): HTMLButtonElement[]
{
	tournamentsListUL.innerHTML = "";

	const buttons: HTMLButtonElement[] = [];

	for (const tournament of tournaments)
	{
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
		if (tournament.full === true)
		{
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

	return (buttons);
}


//------------------------------------------------------------------------SEARCH TOURNAMENT
//------------------------------------------------------------------------CANVAS


export const canvas = // Canvas where game is drawn
	document.getElementById("game_screen") as HTMLCanvasElement;

export const texture = // Texture to paint
	canvas.getContext("2d") as CanvasRenderingContext2D;


//------------------------------------------------------------------------CANVAS
//------------------------------------------------------------------------NOTIFICATIONS


export const notificationBox = 
	document.getElementById("notify-box") as HTMLDivElement;

export const notificationBoxText = 
	document.getElementById("notify-text") as HTMLDivElement;

export const notificationAcceptButton = 
	document.getElementById("notify-accept") as HTMLButtonElement;

export function showNotification(text: string, state?: boolean)
{

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
//------------------------------------------------------------------------CRT EFFECT CANVAS


export const crtCanvas = // CRT EFFECT
	document.getElementById("crt_overlay") as HTMLCanvasElement;

export const crtCtx = // CRT CTX
	crtCanvas.getContext("2d")!;

export function resizeCrtCanvas(): void
{
	const dpr = window.devicePixelRatio || 1;

	crtCanvas.width = window.innerWidth * dpr;
	crtCanvas.height = window.innerHeight * dpr;

	crtCanvas.style.width = window.innerWidth + "px";
	crtCanvas.style.height = window.innerHeight + "px";

	crtCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function drawCrtOverlay(): void {

	const w = crtCanvas.width;
	const h = crtCanvas.height;

	crtCtx.clearRect(0, 0, w, h);
	crtCtx.save();

	crtCtx.globalAlpha = 0.3;

	const lineHeight = 2;
	for (let y = 0; y < h; y += lineHeight) {
	    crtCtx.fillStyle = (y / lineHeight) % 2 === 0 ? greenish : redish;
	    crtCtx.fillRect(0, y, w, lineHeight);
	}

	crtCtx.restore();
}


//------------------------------------------------------------------------CRT EFFECT CANVAS
//------------------------------------------------------------------------UTILS


export const loadAnimation = // Initial loader Modal
	document.getElementById("load_animation_modal") as HTMLDivElement;


export function showLoader() { // show Loading animation
	show(loadAnimation);
}

export function hideLoader() { // hide Loading animation
	hide(loadAnimation);
}


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


export let SCORES: number[] = [0, 0];

export function setSCORES(scoreA: number, scoreB: number) {

	SCORES[0] = scoreA;
    SCORES[1] = scoreB;
}

export function getSCORES() {

	return (SCORES);
}

export let INVITE_FROM: string;

export function setInviteFrom(target: string) {
	INVITE_FROM = target;
}

export function getInviteFrom(): string {
	return (INVITE_FROM);
}

//------------------------------------------------------------------------UTILS
//------------------------------------------------------------------------SETTINGS


export let whitish: string = "#5a5244";
export let blackish: string = "#312521";
export const redish: string = "#3d0027";
export const greenish: string = "#003527";

export const pongFont = new Promise<void>((resolve) => { // BLOCK FONT

    const Font = new FontFace("BlockFont", "url(game/assets/block_merged.ttf)");
    Font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log("BlockFont loaded");
        resolve();
    });
});


export const nightModeButton = //night mode button
	document.getElementById("night_mode") as HTMLButtonElement;

export let nightMode = false;

nightModeButton.onclick = () => {

	nightMode = !nightMode;
	document.documentElement.classList.toggle("pong-night-mode", nightMode);

	if (nightMode) {
		whitish = "#312521";
		blackish = "#5a5244";
	} else {
		whitish = "#5a5244";
		blackish = "#312521";
	}
	drawGame();
};

export const logoutButton = // Logout Button
	document.getElementById("logout_button") as HTMLButtonElement;


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

const profilePicCancelButton =
	document.getElementById("profilepic_cancel_button") as HTMLButtonElement;

const selfProfileImage =
	document.getElementById("self_profile_image") as HTMLDivElement;

function renderProfilePicGrid(): void
{
	profilePicGrid.innerHTML = "";

	for (const symbol of avatarSymbols) {
		const btn = document.createElement("button");
		btn.className = "profilepic-item";
		btn.innerHTML = symbol;

		btn.onclick = () => {
			selfProfileImage.innerHTML = symbol;
			hide(profilePicModal); 
		};

		profilePicGrid.appendChild(btn);
	}
}

changeProfilePicButton.onclick = () => {
	renderProfilePicGrid();
	show(profilePicModal);
};

profilePicCancelButton.onclick = () => {
	hide(profilePicModal);
};


//------------------------------------------------------------------------SETTINGS
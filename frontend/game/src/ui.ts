export const loginModal = // Login Box element
	document.getElementById("login_modal") as HTMLDivElement;

export const openLogin = // Display login box element
	document.getElementById("open_login") as HTMLButtonElement;

export const closeLogin = // Close login box element
	document.getElementById("close_login") as HTMLButtonElement;

export const usernameInput = // Username entered in login box
	document.getElementById("user_input") as HTMLInputElement;

export const passwordInput = // Password entered in login box
	document.getElementById("pass_input") as HTMLInputElement;

export const submitLoginButton = // Submit info in login box
	document.getElementById("login_submit_button") as HTMLButtonElement;

export const registerModal = // Register Box element
	document.getElementById("register_modal") as HTMLDivElement;

export const openRegister = // Display register box element
	document.getElementById("open_register") as HTMLButtonElement;

export const closeRegister = // Close register box element
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


export const createMatchButton = // Create match button element
	document.getElementById("create_match") as HTMLButtonElement;

export const searchForMatchButton = // Look for match button element
	document.getElementById("search_match") as HTMLButtonElement;

export const startMatchButton = // Start match button element
	document.getElementById("start_match") as HTMLButtonElement;

export const waitingPlayers = // Waiting for players element
	document.getElementById("waiting_players") as HTMLButtonElement;

export const activeMatchesModal = // Container showing waiting players
	document.getElementById("active_matches_modal") as HTMLDivElement;

export const playersListUL = // UL element where usernames will be inserted
	document.getElementById("players_list_ul") as HTMLUListElement;

export function renderMatchList(matches: string[]): HTMLButtonElement[] {

	playersListUL.innerHTML = "";

	const joinButtons: HTMLButtonElement[] = [];

	for (const username of matches) {
		const li = document.createElement("li");
		li.className = "flex justify-between items-center";

		const nameSpan = document.createElement("span");
		nameSpan.textContent = username;

		const joinBtn = document.createElement("button");
		joinBtn.textContent = "Join";
		joinBtn.className = "px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs";
		joinBtn.dataset.username = username;

		li.appendChild(nameSpan);
		li.appendChild(joinBtn);
		playersListUL.appendChild(li);

		joinButtons.push(joinBtn);
	}

	return joinButtons;
}

// MENU 2FA
export const twoFAOptionModal = document.getElementById("twofa_option_modal") as HTMLDivElement;

// Via email
export const twoFAEmailButton = document.getElementById("twofa_email_button")  as HTMLInputElement;
export const twoFAModal = document.getElementById("twofa_modal") as HTMLDivElement;
export const twoFAInput = document.getElementById("twofa_input") as HTMLInputElement;
export const twoFASubmitButton = document.getElementById("twofa_submit_button") as HTMLButtonElement;

// Skip
export const twoFASkipButton = document.getElementById("twofa_skip_button") as HTMLButtonElement;

// VIA AUTH
export const GoogleButton = document.getElementById("google_register") as HTMLButtonElement;

// LOADER
export const initialLoader = document.getElementById("initial_loader") as HTMLDivElement;

export const logoutButton = document.getElementById("logout_button") as HTMLButtonElement;

export const canvas = // Canvas where game is drawn
	document.getElementById("game_screen") as HTMLCanvasElement;

export const paddle = // Paddle to paint
	canvas.getContext("2d") as CanvasRenderingContext2D;

// Utility functions
export function show(elem: HTMLElement): void { // show HTML element
	elem.classList.remove("hidden"); 
}

export function hide(elem: HTMLElement): void { // hide HTML
	elem.classList.add("hidden"); 
}


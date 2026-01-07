


export const loadAnimation = // Initial loader Modal
	document.getElementById("load_animation_modal") as HTMLDivElement;

export function showLoader() { // show Loading animation
	show(loadAnimation);
}

export function hideLoader() { // hide Loading animation
	hide(loadAnimation);
}


export const loginModal = // Login Box element
	document.getElementById("login_modal") as HTMLDivElement;

export const openLoginButton = // Display login box element
	document.getElementById("open_login") as HTMLButtonElement;

export const closeLoginButton = // Close login box element
	document.getElementById("close_login") as HTMLButtonElement;

export const usernameInput = // Username entered in login box
	document.getElementById("user_input") as HTMLInputElement;

export const passwordInput = // Password entered in login box
	document.getElementById("pass_input") as HTMLInputElement;

export const submitLoginButton = // Submit info in login box
	document.getElementById("login_submit_button") as HTMLButtonElement;




export const logoutButton = // Logout Button
	document.getElementById("logout_button") as HTMLButtonElement;



export const registerModal = // Register Box element
	document.getElementById("register_modal") as HTMLDivElement;

export const openRegisterButton = // Display register box element
	document.getElementById("open_register") as HTMLButtonElement;

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

export const twoFASkipButton = // 2FA Skip Button
	document.getElementById("twofa_skip_button") as HTMLButtonElement;

export const twoFAAuthButton =  // 2FA via AUTH Button
	document.getElementById("twofa_auth_button") as HTMLButtonElement;




export const startMatchButton = // Start match button element
	document.getElementById("start_match") as HTMLButtonElement;

export const waitingPlayers = // Waiting for players element
	document.getElementById("waiting_players") as HTMLButtonElement;



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

	


export const incomingPlayRequestModal =
	document.getElementById("incoming_play_request_modal") as HTMLDivElement;

export const incomingPlayRequestText =
	document.getElementById("incoming_play_request_text") as HTMLParagraphElement;

export const incomingPlayRequestCloseButton =
	document.getElementById("incoming_play_request_close") as HTMLButtonElement;

export const incomingPlayRequestAcceptButton =
	document.getElementById("incoming_play_request_accept") as HTMLButtonElement;






export const canvas = // Canvas where game is drawn
	document.getElementById("game_screen") as HTMLCanvasElement;

export const texture = // Texture to paint
	canvas.getContext("2d") as CanvasRenderingContext2D;


export function show(elem: HTMLElement): void { // show HTML element
	elem.classList.remove("hidden"); 
}

export function hide(elem: HTMLElement): void { // hide HTML
	elem.classList.add("hidden"); 
}


export const pongFont = new Promise<void>((resolve) => { // BLOCK FONT

    const Font = new FontFace("BlockFont", "url(game/assets/block_merged.ttf)");
    Font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log("BlockFont loaded");
        resolve();
    });
});

export const notificationBox = 
	document.getElementById("notify-box") as HTMLDivElement;

export const notificationBoxText = 
	document.getElementById("notify-text") as HTMLDivElement;


export function showNotification(text: string)
{

	if (!notificationBox || !notificationBoxText) return;

	notificationBoxText.textContent = text;

	show(notificationBox);
	notificationBox.classList.remove("opacity-0", "pointer-events-none");
	notificationBox.classList.add("opacity-100");

	setTimeout(() => {

		notificationBox.classList.remove("opacity-100");
		notificationBox.classList.add("opacity-0");

		setTimeout(() => {hide(notificationBox)}, 200);
	}, 2500);
}

import { 
	loadAnimation, showLoader, hideLoader, 
	loginModal, openLoginButton, closeLoginButton, logoutButton,
	usernameInput, passwordInput, submitLoginButton,
	registerModal, openRegisterButton, closeRegisterButton, submitRegisterButton, 
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput,
	startMatchButton, waitingPlayers, playLocallyButton,
	playRequestModal, playAgainstUserButton, playRequestUsernameInput, playRequestCloseButton, playRequestSendButton,
	incomingPlayRequestModal, incomingPlayRequestText, incomingPlayRequestCloseButton, incomingPlayRequestAcceptButton,
	canvas, texture, show, hide, showNotification} from "./ui.js";
import {getInviteFrom, TournamentInfo} from "./vars.js";
import { registerUser,  loginUser } from "./login-register.js"
import { initializeWebSocket } from "./websocket.js";
import { oneTimeEvent, sendKeyPress, send2KeyPress } from "./events.js";


if (!loadAnimation || !showLoader || !hideLoader ||
	!loginModal || !openLoginButton || !closeLoginButton || !logoutButton ||
	!usernameInput || !passwordInput || !submitLoginButton ||
	!registerModal || !openRegisterButton || !closeRegisterButton || !submitRegisterButton || !
	!regUsernameInput || !regDisplaynameInput || !regEmailInput || !regPasswordInput ||
	!twoFAModal || !twoFAOptionModal || !twoFAEmailButton || !twoFASubmitButton || !twoFASkipButton || !twoFAAuthButton || !twoFAInput ||
	!startMatchButton || !waitingPlayers || !playLocallyButton ||
	!playRequestModal || !playAgainstUserButton || !playRequestUsernameInput || !playRequestCloseButton || !playRequestSendButton ||
	!incomingPlayRequestModal || !incomingPlayRequestText || !incomingPlayRequestCloseButton || !incomingPlayRequestAcceptButton ||
	// !createTournamentButton || !searchTournamentButton || !searchTournamentsModal || !tournamentsListUL || !renderTournamentList ||
	!canvas || !texture || !show || !hide || !showNotification) {
		console.error("One or more UI elements are missing");
}


let tempToken2FA: string | null | undefined = null;
export let userSocket: WebSocket | null = null;

openLoginButton.onclick = () => show(loginModal);
closeLoginButton.onclick = () => hide(loginModal);
openRegisterButton.onclick = () => show(registerModal);
closeRegisterButton.onclick = () => hide(registerModal);
playAgainstUserButton.onclick = () => show(playRequestModal);
incomingPlayRequestCloseButton.onclick = () => hide(incomingPlayRequestModal);
playRequestCloseButton.onclick = () => hide(playRequestModal);

showLoader();

// Verificar si hay token al cargar la página
const token = localStorage.getItem("token");
if (!token || token === "null") {
	show(openLoginButton);
	show(openRegisterButton);
	setTimeout(hideLoader, 300);
}
else {
	initializeWebSocket(token).then((ws) => {
		userSocket = ws;
	}).catch(() => alert("Error connecting to server"));
}


submitLoginButton.onclick = async () => {

	showLoader();
	try {
		
		const result = await loginUser(usernameInput, passwordInput); // 1. PRIMERO: Intentar login (backend valida usuario + contraseña)

		if (result.status === "requires_2fa" && result.method === "email") { // 2. El backend decide si necesita 2FA DESPUÉS de validar credenciales
			
			hideLoader();// Usuario válido y necesita 2FA
			show(twoFAModal);
			tempToken2FA = result.tempToken; // Token temporal del backend
			twoFASubmitButton.onclick = async () => { // Configurar el botón de verificación 2FA
				const code = twoFAInput.value.trim();
				if (!code) {
					alert("Ingresa el código 2FA");
					return;
				}
				showLoader();
				try {

					const res = await fetch("/verify-2fa-mail", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ tempToken: tempToken2FA, code 
						})
					});
					
					const verifyResult = await res.json();

					if (verifyResult.status === "ok" && verifyResult.token) { // Login completo
						
						localStorage.setItem("token", verifyResult.token);
						hide(twoFAModal);
						hide(loginModal);
						initializeWebSocket(verifyResult.token).then((ws) => {
							userSocket = ws;
						}).catch(() => alert("Error connecting to server"));
						tempToken2FA = null;
						twoFAInput.value = "";
					} else {

						alert(verifyResult.error || "Código 2FA incorrecto");
						hideLoader();
					}
				} catch (err) {

					console.error(err);
					alert("Error al verificar 2FA");
					hideLoader();
				}
			};
			
		} else if (result.status === 0 && result.token) { // Login exitoso sin 2FA
			
			localStorage.setItem("token", result.token);
			hide(twoFAModal);
			hide(loginModal);
			initializeWebSocket(result.token).then((ws) => {
				userSocket = ws;
    			hideLoader();

			}).catch(() => alert("Error connecting to server"));
			
			
		} else { // Credenciales incorrectas
			
			alert(result.error || "Usuario o contraseña incorrectos");
			hideLoader();
		}

		} catch (err) {
			console.error(err);
			alert("Error al iniciar sesión");
			hideLoader();
		}
};

submitRegisterButton.onclick = async () => {

	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.userId && result.setupToken) {
		show(twoFAOptionModal);

		twoFAEmailButton.onclick = async () => {
			const res = await fetch("/set-2fa", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${result.setupToken}`
				},
				body: JSON.stringify({ method: "2FAmail" })
			});
			const data = await res.json();
			if (data.status === "ok") {
				hide(twoFAOptionModal);
				hide(registerModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
			}
			hide(twoFAOptionModal);
			hide(registerModal);
			show(loginModal);
		};

		twoFASkipButton.onclick = async () => {
			const res = await fetch("/set-2fa", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${result.setupToken}`
				},
				body: JSON.stringify({ method: "skip" })
			});

			const data = await res.json();
			if (data.status === "ok") {
				hide(twoFAOptionModal);
				hide(registerModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
			}
		};
	}
	else if (result.status === 1) {
		alert("User with that username already exists");
	}
};

logoutButton.onclick = async () => {
	if (userSocket) {
		userSocket.close();
		userSocket = null;
	}
	let token = localStorage.getItem("token");
	const res = await fetch("/logout", {
		method: "POST",
		headers: { "Content-Type": "application/json",},
		body: JSON.stringify({ token })
	});

	const data = await res.json();
	if (data.status === "ok") {
		localStorage.removeItem("token");
		hide(logoutButton);
		hide(startMatchButton);
		hide(playAgainstUserButton);
		hide(playLocallyButton);
		// hide(createTournamentButton);
		// hide(searchTournamentButton);
		show(openLoginButton);
		show(openRegisterButton);
	}
};

playRequestSendButton.onclick = () => {

	const target_username = playRequestUsernameInput.value.trim();
		if (target_username.length === 0) {
		alert("Username field empty");
		return ;
	}
	oneTimeEvent("SEND_INVITE_REQUEST", "SEND_INVITE_RESPONSE", target_username).then((result) => {

		if (!result || !result.target) {
			alert("No response from server");
			return ;
		}
		if (result.target !== target_username) {
			alert("Username response doesnt match invitation target");
			return ;
		}
		if (result.status !== 200) {
			showNotification(result.msg);
			return ;
		}
		hide(playRequestModal);
	});
};

startMatchButton.onclick = () => {


	hide(startMatchButton);
	show(waitingPlayers);
    oneTimeEvent("START_MATCH_REQUEST", "START_MATCH_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		if (result.status !== 200) {
			showNotification(result.msg);
			return ;
		}
		hide(waitingPlayers);
		sendKeyPress();
    });
};

playLocallyButton.onclick = () => {


	oneTimeEvent("PLAY_LOCALLY_REQUEST", "PLAY_LOCALLY_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return;
		}
		hide(playLocallyButton);
		hide(playAgainstUserButton);
		// hide(createTournamentButton);
		// hide(searchTournamentButton);
		send2KeyPress();
	});
};
 
incomingPlayRequestAcceptButton.onclick = () => {

	oneTimeEvent("REPLY_INVITE_REQUEST", "REPLY_INVITE_RESPONSE", getInviteFrom()).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status === 200)
			show(startMatchButton);
	});
	hide(incomingPlayRequestModal);
};





export const openCreateTournamentButton = // Create a match button
	document.getElementById("create_tournament") as HTMLButtonElement;

const closeCreateTournamentButton =
	document.getElementById("tournament_create_cancel_button") as HTMLButtonElement;

const submitTournamentCreationButton = // Submit Tournament creation button
		document.getElementById("tournament_create_submit_button") as HTMLButtonElement;
	
const createTournamentModal =
	document.getElementById("create_tournament_modal") as HTMLDivElement;

const aliasTournamentInput = 
	document.getElementById("tournament_alias") as HTMLInputElement;


openCreateTournamentButton.onclick = () => show(createTournamentModal);
closeCreateTournamentButton.onclick = () => hide(createTournamentModal);

submitTournamentCreationButton.onclick = () => {

	const alias = aliasTournamentInput.value.trim();
	if (alias.length === 0) {
		return ;
	}
	oneTimeEvent("CREATE_TOURNAMENT_REQUEST", "CREATE_TOURNAMENT_RESPONSE", alias).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return ;
		}
		hide(createTournamentModal);
		show(startMatchButton);
	});

};




export const openSearchTournamentButton = // Search for matches button
	document.getElementById("search_tournament") as HTMLButtonElement;

const closeSearchTournamentButton =
	document.getElementById("tournament_search_cancel_button") as HTMLButtonElement;

const searchTournamentsModal = // Container showing waiting players
	document.getElementById("search_tournaments_modal") as HTMLDivElement;

const tournamentsListUL = // UL element where usernames will be inserted
	document.getElementById("tournament_list_ul") as HTMLUListElement;


function renderTournamentList(tournaments: TournamentInfo[]): HTMLButtonElement[]
{
	tournamentsListUL.innerHTML = "";

	const joinButtons: HTMLButtonElement[] = [];

	for (const tournament of tournaments)
	{
		const li = document.createElement("li");
		li.className = "flex justify-between items-center gap-4";

		const infoDiv = document.createElement("div");
		infoDiv.className = "flex flex-col text-sm";

		const nameSpan = document.createElement("span");
		nameSpan.textContent = `Creator: ${tournament.creator}`;

		const sizeSpan = document.createElement("span");
		sizeSpan.textContent =
			`Players: ${tournament.current_size}/${tournament.max_size}`;


		infoDiv.appendChild(nameSpan);
		infoDiv.appendChild(sizeSpan);

		const joinBtn = document.createElement("button");
		joinBtn.textContent = "Join";
		joinBtn.className =
			"px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs";

		joinBtn.dataset.creator = tournament.creator;
		joinBtn.dataset.id = String(tournament.id);

		li.appendChild(infoDiv);
		li.appendChild(joinBtn);

		tournamentsListUL.appendChild(li);
		joinButtons.push(joinBtn);
	}

	return (joinButtons);
}

closeSearchTournamentButton.onclick = () => hide(searchTournamentsModal);

openSearchTournamentButton.onclick = () => {


	oneTimeEvent("SEARCH_TOURNAMENT_REQUEST", "SEARCH_TOURNAMENT_RESPONSE").then((result) => {
		if (!result) {
			alert("No response from server");
			return ;
		}
		if (result.status !== 200) {
			showNotification(result.msg);
			hide(searchTournamentsModal);
			return ;
		}
		const joinButtons = renderTournamentList(result.target as TournamentInfo[]);
		show(searchTournamentsModal);
		for (const btn of joinButtons) {

			const tournament_id = btn.dataset.id!;
			btn.onclick = () => {
				oneTimeEvent("JOIN_TOURNAMENT_REQUEST", "JOIN_TOURNAMENT_RESPONSE", tournament_id).then((result) => {

					if (!result) {
						alert("No response from server");
						return ;
					}
					showNotification(result.msg);
					if (result.status !== 200) {
						return ;
					}
					hide(searchTournamentsModal);
					show(startMatchButton);
				});	
			};
		}
	});	
	
};


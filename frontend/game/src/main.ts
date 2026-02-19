import { changeUsernameButton, changeUsernameModal, closeChangeUsernameButton, submitNewUsernameButton, newUsernameInput, changeEmailButton, changeEmailModal, menuModal, topBarProfilePicture} from "./ui.js";
import { closeChangeEmailButton, submitNewEmailButton, newEmailInput, changePasswordButton, changePasswordModal, closeChangePasswordButton, submitNewPasswordButton} from "./ui.js";
import { oldPasswordInput, newPasswordInput, confirmPasswordInput, changeDisplayNameButton, changeDisplayNameModal, closeChangeDisplayNameButton, submitNewDisplayNameButton, newDisplayNameInput, } from "./ui.js";
import {changeProfilePicButton, profilePicModal, profilePicCancelButton, nightModeButton, nightMode, invertNightMode, swapNightMode, renderProfilePicGrid} from "./ui.js";
import { friendsListInviteUL, getGameVisibility, findGameTypeButtons, localOptions, matchTypeButtons, matchOptionPanels, onlineToggleText, onlineToggle, toggleVisibility, setSelectedMode} from "./ui.js";
import { loginModal, closeLoginButton, logoutButton, updateSessionButtons, usernameInput, passwordInput, submitLoginButton, dontHaveAnAccountButton} from "./ui.js";
import { registerModal, closeRegisterButton, submitRegisterButton, regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput, alreadyHaveAnAccountButton} from "./ui.js";
import { twoFAOptionCancelButton, twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput, twoFACancelButton} from "./ui.js";
import { startMatchButton, exitMatchButton, currentGameButton, currentGameModal, currentGameCancel} from "./ui.js";
import {setGameData, currentGameStatus, currentGameSize, currentGameCreator, currentGamePlayers, currentGameVisibility, findGameTypeOptions} from "./ui.js";
import { playRequestSendButton, playRequestUsernameInput, requestListMatchesUL, requestsListFriendsUL, requestListTournamentsUL, currentGameType, showCanvas, getSelfId, currentGameSubType} from "./ui.js";
import { menuButtons, createGameModal, MatchData, requestsTypeButtons, requestsTypeOptions, requestGameModal,requestFriendsButton, currentGameExit} from "./ui.js";
import { submitTournamentCreationButton, tournamentSizeInput} from "./ui.js";
import { findGameButton, findGameCancelButton, findGameModal, findMatchesListUL, findTournamentsListUL, getSelectedMode} from "./ui.js";
import { invitePlayersModal, invitePlayersCancelButton, invitePlayersCurrentGameButton, invitePlayersMatchButton, invitePlayersTournamentButton } from "./ui.js";
import { renderGamesList, createGameButton, createGameCancelButton, gameCreateSubmitButton, requestsCancelButton} from "./ui.js";
import { show, hide, showMenu, notificationBox, notificationBoxText, renderPendingRequests, requestPlayButton} from "./ui.js";
import { openMenuButton, notificationAcceptButton, topBarDisplayName, makeVisible, updateOpponentUI, updateProfileUI,  googleLoginButton } from "./ui.js";
import { changeDisplayName, changeUserName, changeEmail, changePassword} from "./change.js";
import { initStatsDashboard, loadDashboard, updateStatsUI } from "./stats.js";
import { ProfileInfo, TournamentInfo } from "./vars.js";
import { GameStatus, setGameStatus, getGameStatus, GameType, setGameType, getGameType } from "./vars.js";
import { BASE_URL, MATCH_URL, TOURNAMENT_URL, USER_URL, POST, GET, INVITE_URL, RESPOND_URL, START_URL, EXIT_URL, JOIN_URL, REQUESTS_URL, INFO_URL } from "./vars.js";
import { setCurrentMatchId, getCurrentMatchId, setCurrentTournamentId, getDisplaySide, setDisplaySide, getCurrentTournamentId, setCurrentOpponentId } from "./vars.js";
import { getCurrentOpponentId, setInviteFrom, getInviteFrom, setMatchMode, NOTIFICATION_TIME  } from "./vars.js";
import { registerUser, loginUser, logoutUser, configure2FA, verify2FA } from "./auth.js";
import { userSocket, initializeWebSocket, restoreSession } from "./websocket.js";

import {httpEvent, initKeyHandling} from "./events.js";
import {drawGame} from "./draw.js";
import { 
		aiEasyButton, 
		aiMediumButton, 
		aiHardButton, 
		local2PlayerButton
} from "./ui.js";
import {
		initFriends,
		renderFriendsList,
		renderFriendRequestsList,
		onFriendWebSocketMessage,
		setInviteContext,         
		clearInviteContext,        
		sendInviteManual,
		fetchFriends,
		escapeHtml,
		sendInviteToFriend       
} from "./friends.js";

import { 
		startAiMode, 
		setAiDifficulty, 
		isAiModeActive, 
		stopAiMode 
} from "./ai.js";


//-------------------------------------------------------------------------------------------------RESTORE


initStatsDashboard();
initFriends();

export async function getProfileInfo(reset: boolean) {

	if (reset === true) {
		updateProfileUI("", "PONG", "ft_transcendence.pong.com");
		updateStatsUI({
		local_played: 0,
		local_won: 0,
		online_played: 0,
		online_won: 0,
		tournaments_played: 0,
		tournaments_won: 0,
		userId: "",
		username: "",
		displayName: "",
		totalGames: 0,
		winRate:"",
		totalWins: 0,
		totalLosses: 0,
		currentWinStreak: 0,
		bestWinStreak: 0,
		pointsFor: 0,
		pointsAgainst: 0,
		lastMatchAt: null,
		});
		return;
	}
	try {
		const response = await httpEvent(GET, `/api/users/me`);
		if (response.status !== 200)
			return ;
		updateSessionButtons(true);

		const info = response.target;
		updateProfileUI(info.user_id, info.display_name, info.username);
		if (info.avatar) {
			topBarProfilePicture.innerHTML = info.avatar;
		}
		if (info.stats) {
			updateStatsUI(info.stats);
		}

	} catch (err: any) {

				console.error(err?.msg ?? "Request failed");
		}
	
}

//-------------------------------------------------------------------------------------------------PRESTORE
//-------------------------------------------------------------------------------------------------REGISTER

alreadyHaveAnAccountButton.onclick = () => {
	hide(registerModal);
	show(loginModal);
	showNotification("You must sign in in order to continue!");
};

submitRegisterButton.onclick = async () => {

	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.setupToken) {
		hide(registerModal);
		show(twoFAOptionModal);
		twoFAEmailButton.onclick = () => {
			configure2FA(result.setupToken!, "2FAmail", twoFAOptionModal, loginModal, registerModal);
		}
		twoFASkipButton.onclick = twoFAOptionCancelButton.onclick = () => {

			configure2FA(result.setupToken!, "skip", twoFAOptionModal, loginModal, registerModal);
		};
	} else {
		showNotification("1 Account with that username/email already exists.");
	}
};

closeRegisterButton.onclick = () => hide(registerModal);

twoFACancelButton.onclick = () => hide(twoFAOptionModal);

//-------------------------------------------------------------------------------------------------REGISTER
//-------------------------------------------------------------------------------------------------LOGIN

dontHaveAnAccountButton.onclick = () => {
	hide(loginModal);
	show(registerModal);
	showNotification("Create a new account.");
};

submitLoginButton.onclick = async () => {
	const result = await loginUser(usernameInput, passwordInput);

	if (result.status === 0) {
		hide(loginModal);
		hide(twoFAModal);
		await restoreSession();
	} else if (result.status === "requires_2fa" && result.method === "email") {
		show(twoFAModal);

		twoFASubmitButton.onclick = async () => {
			const code = twoFAInput.value.trim();
			if (!code) return alert("Ingresa el código 2FA");

			const success = await verify2FA(code, twoFAModal, loginModal);
			if (success) {
				twoFAInput.value = "";
				hide(loginModal);
				hide(twoFAModal);

				await restoreSession();
			}
		};
	} else {
		showNotification(result.error || "User/Password Incorrect");
	}
};

closeLoginButton.onclick = () => hide(loginModal);

googleLoginButton.onclick = () => {
	window.location.href = "/auth/google";
};

(async () => {
	const urlParams = new URLSearchParams(window.location.search);

	const error = urlParams.get("error_google");

	if (error === "email_exists_different_provider") {
		showNotification("Email already registered with password (not Google).");
		window.history.replaceState({}, document.title, "/");
	}

	if (error === "user_login") {
		showNotification("Login Error: User already connected or internal error.");
		window.history.replaceState({}, document.title, "/");
	}

	const restored = await restoreSession();

	if (!restored) {
		console.log("No hay sesión activa");
	}
})();
//-------------------------------------------------------------------------------------------------LOGIN
//-------------------------------------------------------------------------------------------------MENU

menuButtons.forEach(button => {

	button.addEventListener('click', () => {

		const targetId = button.dataset.target;
		if (!targetId)
			return;
		menuButtons.forEach(btn => btn.classList.remove('active-border'));
		button.classList.add('active-border');
		const allLists = document.querySelectorAll<HTMLElement>('.pong-list');
		allLists.forEach(list => {

			if (list.id === targetId) {
				show(list);
			}
			else
				hide(list);
		});
		if (targetId === "stats_list") {
			getProfileInfo(false);
		}
		if (targetId === "friends_list") {
			if (userSocket) {
				renderFriendsList();
			}
			}

	});
});

//-------------------------------------------------------------------------------------------------MENU
//-------------------------------------------------------------------------------------------------REQUESTS-FRIENDS-GAMES


requestsTypeButtons.forEach((button): void => {

	button.onclick = (): void => {
		const targetId = button.dataset.target;
		if (!targetId)
			return ;

		requestsTypeButtons.forEach(btn => btn.classList.remove('invert-colors'));
		button.classList.add('invert-colors');

		requestsTypeOptions.forEach(div => {
			if (div.id === targetId)
				show(div);
			else
				hide(div);
		});

		if (targetId === "requests_friends") {
			renderFriendRequestsList(requestsListFriendsUL);
		} else if (targetId === "requests_games") {
			renderRequestLists(requestListMatchesUL, "matches");
		} else if (targetId === "requests_tournaments") {
			renderRequestLists(requestListTournamentsUL, "tournaments");
		}
	};
});

requestPlayButton.onclick = async () => {

	if (!userSocket) {
		show(loginModal);
		return ;
	}
	requestsTypeButtons.forEach(btn => btn.classList.remove("invert-colors"));
	requestsTypeButtons[2].classList.add("invert-colors");
	requestsTypeOptions.forEach(div => {
		if (div.id === "requests_tournaments") show(div);
		else hide(div);
	});
	renderRequestLists(requestListTournamentsUL, "tournaments");
};

requestFriendsButton.onclick = async () => {

	if (!userSocket) {
		show(loginModal);
		return ;
	}
	requestsTypeButtons.forEach(btn => btn.classList.remove("invert-colors"));
	requestsTypeButtons[0].classList.add("invert-colors");
	requestsTypeOptions.forEach(div => {
		if (div.id === "requests_friends") show(div);
		else hide(div);
	});

	renderFriendRequestsList(requestsListFriendsUL);
};

requestsCancelButton.onclick = () => {
	hide(requestGameModal);
}

async function respondToInviteRequest(TYPE_URL: string, targetId: string, accept: boolean) {

	try {

		const response = await httpEvent("PATCH", `/api/${TYPE_URL}/${targetId}/invites/${getSelfId()}`, { accept });

		showNotification(response.msg);
		if (response.status !== 200) {
			return ;
		}

	} catch (err: any) {
		console.error(err?.msg ?? "Request failed");
	}
}

async function renderRequestLists(UL: HTMLElement, REQUEST_TYPE: string) {

	try {
		show(requestGameModal);
		const response = await httpEvent("GET", `/api/${REQUEST_TYPE}/invites`)
		if (response.status !== 200) {

        	return;
    	}

	const joinButtons = renderPendingRequests(UL, response.target);
	for (let i = 0; i < joinButtons.length; i++) {
		const btn = joinButtons[i];
		const req = response.target[i];
	
		btn.onclick = async () => {
			try {
				const accept = btn.textContent!.trim() === "ACCEPT";
				await respondToInviteRequest(req.type, req.id, accept);
			} catch (err: any) {
				console.error(err?.msg ?? "Request failed");
			}
		}
	}
	} catch (err: any) {
			console.error(err?.msg ?? "Request failed");
	}
}

//-------------------------------------------------------------------------------------------------REQUESTS-FRIENDS-GAMES
//-------------------------------------------------------------------------------------------------CREATE-GAME

createGameButton.onclick = () => {
	if (!userSocket) {
		show(loginModal);
		return ;
	}
	show(createGameModal);
};

matchTypeButtons.forEach((button): void => {

	button.onclick = (): void => {

		const targetId = button.dataset.target;
		if (!targetId)
			return ;
		matchOptionPanels.forEach((modal): void =>
		{
			if (modal.id === targetId) {

				show(modal);

				if (targetId === "tournament") toggleVisibility(true);
				else if (targetId === "online") toggleVisibility(false);

				if (targetId !== "local") {
					show(onlineToggleText);
					show(onlineToggle);
				}
				else {
					hide(onlineToggleText);
					hide(onlineToggle);
				}
			}
			else {

				hide(modal);
			}
		});
		matchTypeButtons.forEach(btn =>
			btn.classList.remove('invert-colors'));
		button.classList.add('invert-colors');
		setSelectedMode(targetId);
	};
});

localOptions.forEach((button): void => {

	button.onclick = (): void => {
		const targetId = button.id;
		if (!targetId)
			return ;
		localOptions.forEach(btn => {
			btn.classList.remove('invert-colors');
		});
		button.classList.add('invert-colors');
		setSelectedMode(targetId);
	};
});

//! ------------ AI ------------//
if (aiEasyButton) {
		aiEasyButton.onclick = () => {
				setAiDifficulty(1);
				hide(createGameModal);
				startAiMode();
		};
}

// --- Lógica Botón Medium ---
if (aiMediumButton) {
		aiMediumButton.onclick = () => {
				setAiDifficulty(3);
				hide(createGameModal);
				startAiMode();
		};
}

// --- Lógica Botón Hard ---
if (aiHardButton) {
		aiHardButton.onclick = () => {
				setAiDifficulty(5);
				hide(createGameModal);
				startAiMode();
		};
}

gameCreateSubmitButton.onclick = async () => {

	if (getSelectedMode() === "tournament")
		createTournament();
	else
		createMatch(getSelectedMode());
};

createGameCancelButton.onclick = () => hide(createGameModal);

async function createMatch(match_type: string) {

	try {
	
		const response = await httpEvent("POST", `/api/matches/`, { type: match_type,  visibility: getGameVisibility() });
		if (response.status !== 200) {
			return showNotification(response.msg);
		}
		setCurrentMatchId(response.match_id);
		if (match_type !== "online") {
			return;
		}
		const targetUsername = playRequestUsernameInput.value.trim();
		if (targetUsername.length === 0 && getGameVisibility() === false) {
			return showNotification("Username field empty");
		}

		// Si escribió username manualmente, invitar directamente
		if (targetUsername.length > 0) {
			try {
					const response2 = await httpEvent("POST", `/api/matches/${getCurrentMatchId()}/invites`, { username: targetUsername});
					showNotification(response2.msg);
					if (response2.status !== 200) {
						return ;
					}
			} catch (err: any) {
					console.error(err?.msg ?? "Request failed");
			}
		} else {
			hide(createGameModal);
			const ul = document.getElementById("friends_list_invite_ul") as HTMLUListElement;
			const onlineFriendsContainer = document.getElementById("online_friends");
			
			setInviteContext("match", getCurrentMatchId());
			show(invitePlayersModal);
			
			// Asegurar que el contenedor de la lista es visible
			if (onlineFriendsContainer) show(onlineFriendsContainer);
			if (ul) renderInviteFriendsList(ul);
		}
	}
	catch (err: any) {
		console.error(err?.msg ?? "Request failed");
	}
}

async function createTournament() {
		const size = tournamentSizeInput.value;
		if (size.length === 0) return;

		const targetUsername = playRequestUsernameInput.value.trim();
		try {
				const response = await httpEvent("POST", `/api/tournaments/`, { size: size, visibility: getGameVisibility() });
				showNotification(response.msg);
				if (response.status !== 200) {
					return ;
				}
				setCurrentTournamentId(response.tournament_id);

				if (targetUsername.length > 0) {
						try {
				// ! CAMBIAR 
								const response2 = await httpEvent(
										POST,
										`/api/tournaments/${getCurrentTournamentId()}/invites`, // ← FIX: TOURNAMENT_URL
										{ username: targetUsername }
								);
								showNotification(response2.msg);
						} catch (err: any) {
								console.error(err?.msg ?? "Request failed");
						}
				} else {
						hide(createGameModal);
						const ul = document.getElementById("friends_list_invite_ul") as HTMLUListElement;
						const onlineFriendsContainer = document.getElementById("online_friends");

						setInviteContext("tournament", getCurrentTournamentId()); // ← FIX: "tournament"
						show(invitePlayersModal);
						if (onlineFriendsContainer) show(onlineFriendsContainer);
						if (ul) renderInviteFriendsList(ul);
				}

		} catch (err: any) {
				console.error(err?.msg ?? "Request failed");
		}
}

//-------------------------------------------------------------------------------------------------CREATE-GAME
//-------------------------------------------------------------------------------------------------INVITE-PLAYERS

invitePlayersMatchButton.onclick = async () => {
		const matchId = getCurrentMatchId();
		if (!matchId) {
				await createMatch(getSelectedMode());
				return;
		}
		hide(createGameModal);
		const ul = document.getElementById("friends_list_invite_ul") as HTMLUListElement;
		const onlineFriendsContainer = document.getElementById("online_friends");
		
		setInviteContext("match", matchId);
		show(invitePlayersModal);
		if (onlineFriendsContainer) show(onlineFriendsContainer);
		if (ul) renderInviteFriendsList(ul);
};

invitePlayersTournamentButton.onclick = async () => {
		const tournamentId = getCurrentTournamentId();
		if (!tournamentId) {
				showNotification("Create the tournament first (press SUBMIT).");
				return;
		}
		hide(createGameModal);
		const ul = document.getElementById("friends_list_invite_ul") as HTMLUListElement;
		const onlineFriendsContainer = document.getElementById("online_friends");

		setInviteContext("tournament", tournamentId);
		show(invitePlayersModal);
		if (onlineFriendsContainer) show(onlineFriendsContainer);
		if (ul) renderInviteFriendsList(ul);
};

const inviteManualSend = document.getElementById("invite_manual_send") as HTMLButtonElement;
if (inviteManualSend) {
		inviteManualSend.onclick = async () => {
				const input = document.getElementById("play_request_username2") as HTMLInputElement;
				const username = input?.value.trim();
				if (!username) return showNotification("Enter a username.");
				await sendInviteManual(username);
				if (input) input.value = "";
		};
}

invitePlayersCurrentGameButton.onclick = async () => {
		hide(currentGameModal);
		const ul = document.getElementById("friends_list_invite_ul") as HTMLUListElement;
		const onlineFriendsContainer = document.getElementById("online_friends");
		
		const tournamentId = getCurrentTournamentId();
		const matchId = getCurrentMatchId();

		if (tournamentId) {
				setInviteContext("tournament", tournamentId);
		} else if (matchId) {
				setInviteContext("match", matchId);
		} else {
				showNotification("No active game found.");
				return;
		}
		show(invitePlayersModal);
		if (onlineFriendsContainer) show(onlineFriendsContainer);
		if (ul) renderInviteFriendsList(ul);
};

invitePlayersCancelButton.onclick = () => {
		clearInviteContext();
		hide(invitePlayersModal);
};

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
				empty.textContent = "No friends yet. Add some!";
				container.appendChild(empty);
				return;
		}

		// Online friends first
		friends.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

		for (const friend of friends) {
				const li = document.createElement("li");
				li.className = "pong-box flex items-center justify-between";

				// FIX 1: Use correct status color and text per friend
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

				// FIX 2: Set disabled via JS after render, not inside the template string
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

//-------------------------------------------------------------------------------------------------INVITE-PLAYERS
//-------------------------------------------------------------------------------------------------CURRENT-GAME

currentGameButton.onclick = async () => updateCurrentGame();

currentGameCancel.onclick = () => hide(currentGameModal);

export async function updateCurrentGame() {

	const type = getGameType();
	let url_type = "tournaments";
	if (type === GameType.AI || type === GameType.MATCH || type === GameType.TWO_PLAYER)
		url_type = "matches";
	else if (type === GameType.TOURNAMENT)
		url_type = "tournaments";
	
	try {

		let res = await httpEvent("GET", `/api/${url_type}/current`);
		
		if (res.status === 302)
			res = await httpEvent("GET", `/api/${res.target}/current`);
		if (res.status !== 200)
			return showNotification(res.msg);
		show(currentGameModal);
		const data = res!.target;
		if (data.match_id)
			setCurrentMatchId(data.match_id);
		if (data.tournament_id)
			setCurrentTournamentId(data.tournament_id);
		currentGameType.textContent = data.type;
		currentGameSubType.textContent = data.sub_type;
		currentGameVisibility.textContent = data.visibility;
		currentGameSize.textContent = data.size.toString();
		currentGameStatus.textContent = data.status;
		currentGameCreator.textContent = data.creator;
		currentGamePlayers.innerHTML = data.players.join(', ');

	} catch (err: any) {

		showNotification(err?.msg ?? "Request failed");
	}
}

startMatchButton.onclick = async () => {

	showCanvas();
	hide(startMatchButton);
	if (getGameType() !== GameType.TWO_PLAYER && getGameType() !== GameType.AI)
			showNotification("Waiting for player...");

		try {

		let URL = `/api/matches/${getCurrentMatchId()}/start`;
		if (getGameType() === GameType.TOURNAMENT)
				URL = `/api/tournaments/${getCurrentTournamentId()}/matches/${getCurrentMatchId()}/start`;

				const response = await httpEvent(POST, URL);

				if (response.status !== 200 && response.status !== 202){
					show(startMatchButton);
					return showNotification(response.msg);
				}
				hide(currentGameModal);
				setGameStatus(GameStatus.IN_GAME);
				initKeyHandling();
		}
		catch (err: any) {
			show(startMatchButton);
			console.log(err?.msg ?? "Request failed");
		}
};

currentGameExit.onclick = async () => exitGame();

exitMatchButton.onclick = async () => exitGame();

async function exitGame() {
	hide(exitMatchButton);
	try {

		let URL = `/api/matches/${getCurrentMatchId()}/participants/me`;
		if (getGameType() === GameType.TOURNAMENT)
			URL = `/api/tournaments/${getCurrentTournamentId()}/participants/me`;

			const response = await httpEvent("DELETE", URL);

			showNotification(response.msg);
			if (response.status !== 200)
				return ;
			showMenu();
	}
	catch (err: any) {
		console.log(err?.msg ?? "Request failed");
	}
}

//-------------------------------------------------------------------------------------------------CURRENT-GAME
//-------------------------------------------------------------------------------------------------FIND-GAME

findGameButton.onclick = () => {
	if (!userSocket) {
		show(loginModal);
		return ;
	}
	show(findGameModal);
	searchAvailableGames("tournaments", findTournamentsListUL);
};
	
findGameCancelButton.onclick = () => hide(findGameModal);

findGameTypeButtons.forEach((button): void => {

	button.onclick = (): void => {
		
		const targetId = button.dataset.target;
		if (!targetId)
			return ;

		findGameTypeButtons.forEach(btn => btn.classList.remove('invert-colors'));
		button.classList.add('invert-colors');

		findGameTypeOptions.forEach(div => {
			if (div.id === targetId)
				show(div);
			else
				hide(div);
		});

		if (targetId === "matches")
			searchAvailableGames("matches", findMatchesListUL);
		else if (targetId === "tournaments")
			searchAvailableGames("tournaments", findTournamentsListUL);
	};
});



export async function searchAvailableGames(URL_TYPE: string, ul_list: HTMLUListElement) {

	const response = await httpEvent(GET, `/api/${URL_TYPE}/`);
	
	if (response.status !== 200) {
		return showNotification(response.msg);
	}
	renderGamesList(ul_list, response.target, async (id) => {
		try {

			const response2 = await httpEvent("POST", `/api/${URL_TYPE}/${id}/participants`);

			showNotification(response2.msg);
			if (response2.status === 200) {
				return showNotification(response.msg);
			}
			hide(findGameModal);
						
		} catch (err: any) {

			showNotification(err?.msg ?? "Request failed");
		}
	});
}

//-------------------------------------------------------------------------------------------------FIND-GAME
//-------------------------------------------------------------------------------------------------NOTIFICATIONS

function hideNotification(): void {
	notificationBox.classList.remove("opacity-100");
	notificationBox.classList.add("opacity-0");
	hide(notificationAcceptButton);
	hide(notificationBox);
}

export function showNotification(text: string | any, type?: string, id?: string): void {

	if (text === undefined || !notificationBox || !notificationBoxText) return ;

	
	let TIME = NOTIFICATION_TIME;

	notificationBoxText.textContent = text;
	show(notificationBox);
	notificationBox.classList.remove("opacity-0", "pointer-events-none");
	notificationBox.classList.add("opacity-100");
	if (type !== undefined && id !== undefined) {

		show(notificationAcceptButton);
		TIME = 5000;
		notificationAcceptButton.onclick = async () => {

			try {

				await respondToInviteRequest(type, id, true);
				hideNotification();

			}
			catch (err: any) {

				console.error(err?.msg ?? "Request failed");
			}
		};
	}
	setTimeout(() => {

		hideNotification();

	}, TIME);
}

//-------------------------------------------------------------------------------------------------NOTIFICATIONS
//-------------------------------------------------------------------------------------------------SETTINGS
// if (playAgainstAIButton) {
//   playAgainstAIButton.onclick = () => {
//     startAiMode();
//   };
// }
 

if (changeProfilePicButton) {
	changeProfilePicButton.onclick = () => {
		renderProfilePicGrid();
		show(profilePicModal);
	};
}


if (profilePicCancelButton) {
	profilePicCancelButton.onclick = () => {
		hide(profilePicModal);
	};
}

if (nightModeButton) {
	nightModeButton.onclick = () => {
		invertNightMode();
		document.documentElement.classList.toggle("pong-night-mode", nightMode);
		swapNightMode();
		drawGame();
	};
}

// --- DISPLAY NAME ---
if (changeDisplayNameButton) {
	changeDisplayNameButton.onclick = () => {
		if (!userSocket) {
			hide(changeDisplayNameModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		hide(menuModal);
		show(changeDisplayNameModal);
		newDisplayNameInput.value = "";
	};

	closeChangeDisplayNameButton.onclick = () => {
		hide(changeDisplayNameModal);
		show(menuModal);
	};

	submitNewDisplayNameButton.onclick = async () => {
		if (!userSocket) {
			show(loginModal);
			hide(changeDisplayNameModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		const newName = newDisplayNameInput.value.trim();

		const result = await changeDisplayName(newName);
		if (result && result.status === 0) {
			showNotification("Display name updated successfully!");
			const currentUserName =
				document
					.getElementById("profile_username")
					?.textContent?.replace("@", "") || "user";
			updateProfileUI(getSelfId(), newName, currentUserName);
			hide(changeDisplayNameModal);
			show(menuModal);
		} else {
			showNotification(result.msg || "Connection error");

			if (result.status === 401 || result.status === 403) {
				show(loginModal);
			}
		}
		hide(changeDisplayNameModal);
		show(menuModal);
	};
}

// --- USERNAME ---
if (changeUsernameButton) {
	changeUsernameButton.onclick = () => {
		if (!userSocket) {
			hide(changeUsernameModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		hide(menuModal);
		show(changeUsernameModal);
		
		newUsernameInput.value = "";
	};
	closeChangeUsernameButton.onclick = () => {
		hide(changeUsernameModal);
		show(menuModal);
	};
	submitNewUsernameButton.onclick = async () => {
		if (!userSocket) {
			hide(changeUsernameModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		const newUserName = newUsernameInput.value.trim();

		const result = await changeUserName(newUserName);
		if (result && result.status === 0) {
			showNotification("Username updated successfully!");
			const currentDisplayname =
				document.getElementById("profile_displayname")?.textContent || "user";
			updateProfileUI(getSelfId(), currentDisplayname, newUserName);
			hide(changeUsernameModal);
			show(menuModal);
		} else {
			showNotification(result.msg || "Connection error");

			if (result.status === 401 || result.status === 403) {
				show(loginModal);
			}
		}
	};
}

// --- EMAIL ---
if (changeEmailButton) {
	changeEmailButton.onclick = () => {
		if (!userSocket) {
			hide(changeEmailModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		hide(menuModal);
		show(changeEmailModal);
		newEmailInput.value = "";
	};
	closeChangeEmailButton.onclick = () => {
		hide(changeEmailModal);
		show(menuModal);
	};
	submitNewEmailButton.onclick = async () => {
		if (!userSocket) {
			hide(changeEmailModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		const newEmail = newEmailInput.value.trim();

		const result = await changeEmail(newEmail);
		if (result && result.status === 0) {
			showNotification("Email updated successfully!");
			hide(changeEmailModal);
			show(menuModal);
		} else {
			showNotification(result.msg || "Connection error");

			if (result.status === 401 || result.status === 403) {
				show(loginModal);
			}
		}
	};
}

// --- PASSWORD ---
if (changePasswordButton) {
	changePasswordButton.onclick = () => {
		if (!userSocket) {
			hide(changePasswordModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		hide(menuModal);
		show(changePasswordModal);
		oldPasswordInput.value = "";
		newPasswordInput.value = "";
		confirmPasswordInput.value = "";
	};
	closeChangePasswordButton.onclick = () => {
		hide(changePasswordModal);
		show(menuModal);
	};
	submitNewPasswordButton.onclick = async () => {
		if (!userSocket) {
			hide(changePasswordModal);
			show(loginModal);
			showNotification("You must sign in in order to continue!!!");
			return;
		}
		const oldPass = oldPasswordInput.value;
		const newPass = newPasswordInput.value;
		const confirmPass = confirmPasswordInput.value;

		if (!oldPass || !newPass) return showNotification("Please fill fields");
		if (newPass !== confirmPass)
			return showNotification("New passwords do not match");

		const cleanNewPass = newPasswordInput.value.trim();

		const result = await changePassword(cleanNewPass, oldPass);
		if (result && result.status === 0) {
			showNotification("Password updated successfully!");
			hide(changePasswordModal);
			show(menuModal);
		} else {
			showNotification(result.msg || "Connection error");

			if (result.status === 401 || result.status === 403) {
				show(loginModal);
			}
		}
	};
}

logoutButton.onclick = async () => {
		await logoutUser(logoutButton);
		const ul = document.getElementById("friends_list_ul") as HTMLElement;
		if (ul) ul.innerHTML = "";
		const friendsSection = document.getElementById("friends_list");
		if (friendsSection) hide(friendsSection);
};

//-------------------------------------------------------------------------------------------------SETTINGS
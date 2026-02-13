import {
  changeUsernameButton,
  changeUsernameModal,
  closeChangeUsernameButton,
  submitNewUsernameButton,
  newUsernameInput,
  changeEmailButton,
  changeEmailModal,
  closeChangeEmailButton,
  submitNewEmailButton,
  newEmailInput,
  changePasswordButton,
  changePasswordModal,
  closeChangePasswordButton,
  submitNewPasswordButton,
  oldPasswordInput,
  newPasswordInput,
  confirmPasswordInput,
  changeDisplayNameButton,
  changeDisplayNameModal,
  closeChangeDisplayNameButton,
  submitNewDisplayNameButton,
  newDisplayNameInput,
  menuModal,
  topBarProfilePicture,
  updateStatsUI,
  canvas,
  showCanvas
} from "./ui.js";

import {
  changeDisplayName,
  changeUserName,
  changeEmail,
  changePassword
} from "./change.js";

import { ProfileInfo, TournamentInfo } from "./vars.js";
import { startAiMode, stopAiMode, isAiModeActive } from "./ai.js";
import { initStatsDashboard} from "./stats.js";
import { friendsListInviteUL, getGameVisibility} from "./ui.js";
import { loginModal, closeLoginButton, logoutButton,usernameInput, passwordInput, submitLoginButton, dontHaveAnAccountButton} from "./ui.js";
import { registerModal, closeRegisterButton, submitRegisterButton, regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput, alreadyHaveAnAccountButton} from "./ui.js";
import { twoFAOptionCancelButton, twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput, twoFACancelButton} from "./ui.js";
import { startMatchButton, exitMatchButton, currentGameButton, currentGameModal, currentGameCancel} from "./ui.js";
import { playRequestSendButton, playRequestUsernameInput, requestListMatchesUL, requestsListFriendsUL, requestListTournamentsUL} from "./ui.js";
import { menuButtons, createGameModal, updateCurrentGame, requestsTypeButtons, requestsTypeOptions, requestGameModal,requestFriendsButton} from "./ui.js";
import { submitTournamentCreationButton, tournamentSizeInput} from "./ui.js";
import { findGameButton, findGameCancelButton, findGameModal, findGameListUL, getSelectedMode} from "./ui.js";
import { invitePlayersModal, invitePlayersCancelButton, invitePlayersCurrentGameButton, invitePlayersMatchButton, invitePlayersTournamentButton } from "./ui.js";
import { renderGamesList, createGameButton, createGameCancelButton, gameCreateSubmitButton, requestsCancelButton} from "./ui.js";
import { show, hide, showMenu, notificationBox, notificationBoxText, renderPendingRequests, requestPlayButton} from "./ui.js";
import { openMenuButton, notificationAcceptButton, topBarDisplayName, makeVisible, updateOpponentUI, updateProfileUI,  googleLoginButton } from "./ui.js";
import { GameStatus, setGameStatus, getGameStatus, GameType, setGameType, getGameType } from "./vars.js";

import { BASE_URL, MATCH_URL, TOURNAMENT_URL, USER_URL, POST, GET, INVITE_URL, RESPOND_URL, START_URL, EXIT_URL, JOIN_URL, REQUESTS_URL, INFO_URL } from "./vars.js";
import { setCurrentMatchId, getCurrentMatchId, setCurrentTournamentId, getDisplaySide, setDisplaySide, getCurrentTournamentId, setCurrentOpponentId } from "./vars.js";
import { getCurrentOpponentId, setInviteFrom, getInviteFrom, setMatchMode, NOTIFICATION_TIME  } from "./vars.js";

import { registerUser, loginUser, logoutUser, configure2FA, verify2FA } from "./auth.js";

import { userSocket, initializeWebSocket, restoreSession } from "./websocket.js";

import {httpEvent, initKeyHandling} from "./events.js";



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


googleLoginButton.onclick = () => {
  window.location.href = "/auth/google";
};

initStatsDashboard();

alreadyHaveAnAccountButton.onclick = () => {
	hide(registerModal);
	show(loginModal);
	showNotification("You must sign in in order to continue!");
};

twoFACancelButton.onclick = () => hide(twoFAOptionModal);

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

logoutButton.onclick = () => logoutUser(logoutButton);

currentGameButton.onclick = () => show(currentGameModal);

currentGameCancel.onclick = () => hide(currentGameModal);


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
/*       loadDashboard(); */
    }

	});
});


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

		if (targetId === "requests_friends")
			renderRequestLists(requestsListFriendsUL, "friends");
		else if (targetId === "requests_games")
			renderRequestLists(requestListMatchesUL, "matches");
		else if (targetId === "requests_tournaments")
			renderRequestLists(requestListTournamentsUL, "tournaments");
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
	renderRequestLists(requestsListFriendsUL, "friends");
};

requestsCancelButton.onclick = () => {
	hide(requestGameModal);
}

invitePlayersCurrentGameButton.onclick = async () => {
	hide(currentGameModal);
	show(invitePlayersModal);
	searchOnlineFriends("tournaments", friendsListInviteUL);// CAMBIAR A RENDER FRIENDS---------------------------------------------
};

// CAMBIAR A RENDER FRIENDS---------------------------------------------
invitePlayersMatchButton.onclick = async () => {
	hide(createGameModal);
	show(invitePlayersModal);
	searchOnlineFriends("friends", friendsListInviteUL);
	
};
// CAMBIAR A RENDER FRIENDS---------------------------------------------
invitePlayersTournamentButton.onclick = async () => {
	hide(createGameModal);
	show(invitePlayersModal);
	searchOnlineFriends("friends", friendsListInviteUL);
};

invitePlayersCancelButton.onclick = () => hide(invitePlayersModal);


createGameButton.onclick = () => {
	if (!userSocket) {
		show(loginModal);
		return ;
	}
	show(createGameModal);
};

createGameCancelButton.onclick = () => hide(createGameModal);

gameCreateSubmitButton.onclick = async () => {

	if (getSelectedMode() === "online")
		startOnlineGame();
	else if (getSelectedMode() === "tournament")
		createTournament();
	else
		startLocalGame(getSelectedMode());
};


findGameButton.onclick = async () => {
	if (!userSocket) {
		show(loginModal);
		return ;
	}
	await searchAvailableGames("tournaments", findGameListUL); // SHOULD CHANGE TO ANY
	show(findGameModal);
};
	
findGameCancelButton.onclick = () => hide(findGameModal);

async function startLocalGame(match_type: string) {


    try {
		
        const response = await httpEvent(POST, `/${BASE_URL}/${MATCH_URL}/`, { type: match_type, visibility: false});

        if (response.status !== 200) {
            return showNotification(response.msg);
        }
		setCurrentMatchId(response.match_id);

    }
    catch (err: any) {
    	console.log(err?.msg ?? "Request failed");
    }
}

async function startOnlineGame() {

    const targetUsername = playRequestUsernameInput.value.trim();
    if (targetUsername.length === 0 && getGameVisibility() === false) {
        return showNotification("Username field empty");
    }
    try {
		
        const response = await httpEvent(POST, `/${BASE_URL}/${MATCH_URL}/`, { type: "online",  visibility: getGameVisibility() });

        if (response.status !== 200) {
            return showNotification(response.msg);
        }
		setCurrentMatchId(response.match_id);
        try {
			
            const response2 = await httpEvent(POST, `/${BASE_URL}/${MATCH_URL}/${getCurrentMatchId()}/${INVITE_URL}`, { username: targetUsername});
  
            showNotification(response2.msg);
            if (response2.status !== 200) {
                return ;
            }
        }
        catch (err: any) {
        	console.error(err?.msg ?? "Request failed");
        } 
    }
    catch (err: any) {
    	console.error(err?.msg ?? "Request failed");
    }
};

async function createTournament() {

    const size = tournamentSizeInput.value;

    if (size.length === 0)
        return ;

    try {
		
        const response = await httpEvent(POST, `/${BASE_URL}/${TOURNAMENT_URL}/`, { size: size, visibility: getGameVisibility() });

        showNotification(response.msg);
        if (response.status !== 200)
            return ;
		setCurrentTournamentId(response.tournament_id);

    } catch (err: any) {
    	console.error(err?.msg ?? "Request failed");
    }
};

export async function searchOnlineFriends(URL_TYPE: string, ul_list: HTMLUListElement) {

	const response = await httpEvent(GET, `/${BASE_URL}/${URL_TYPE}/`);
	if (response.status !== 200)
		return showNotification(response.msg);

	renderGamesList(ul_list, response.target, async (id) => {
		try {
			
			const res = await httpEvent(POST, `/${BASE_URL}/${URL_TYPE}/${id}/${JOIN_URL}`);

			showNotification(res.msg);
			if (res.status === 200)
				hide(createGameModal);
            
		} catch (err: any) {

			showNotification(err?.msg ?? "Request failed");
		}
	});
}

export async function searchAvailableGames(URL_TYPE: string, ul_list: HTMLUListElement) {

	const response = await httpEvent(GET, `/${BASE_URL}/${URL_TYPE}/`);
	if (response.status !== 200)
		return showNotification(response.msg);
	renderGamesList(ul_list, response.target, async (id) => {
		try {
			
			const res = await httpEvent(POST, `/${BASE_URL}/${URL_TYPE}/${id}/${JOIN_URL}`);

			showNotification(res.msg);
			if (res.status === 200)
				hide(createGameModal);
            
		} catch (err: any) {

			showNotification(err?.msg ?? "Request failed");
		}
	});
}


startMatchButton.onclick = async () => {

  showCanvas();
  hide(startMatchButton);
	if (getGameType() !== GameType.TWO_PLAYER && getGameType() !== GameType.AI)
    	showNotification("Waiting for player...");

    try {

		let URL = `/${BASE_URL}/${MATCH_URL}/${getCurrentMatchId()}/${START_URL}`;
		if (getGameType() === GameType.TOURNAMENT)
			URL = `/${BASE_URL}/${TOURNAMENT_URL}/${getCurrentTournamentId()}/${MATCH_URL}/${getCurrentMatchId()}/${START_URL}`;

        const response = await httpEvent(POST, URL);

        if (response.status !== 200 && response.status !== 202){
            return showNotification(response.msg);
        }
		    hide(currentGameModal);
        setGameStatus(GameStatus.IN_GAME);
        initKeyHandling();
    }
    catch (err: any) {

    	console.log(err?.msg ?? "Request failed");
    }
};

exitMatchButton.onclick = async () => {

    hide(exitMatchButton);
    try {

		let URL = `/${BASE_URL}/${MATCH_URL}/${getCurrentMatchId()}/${EXIT_URL}`;
		if (getGameType() === GameType.TOURNAMENT)
			URL = `/${BASE_URL}/${TOURNAMENT_URL}/${getCurrentTournamentId()}/${MATCH_URL}/${getCurrentMatchId()}/${EXIT_URL}`;

        const response = await httpEvent(POST, URL);

        showNotification(response.msg);
        if (response.status !== 200)
            return ;
        showMenu();
    }
    catch (err: any) {
    	console.log(err?.msg ?? "Request failed");
    }
};


async function respondToInviteRequest(TYPE_URL: string, targetId: string, accept: boolean) {

    try {

        const response = await httpEvent(POST, `/${BASE_URL}/${TYPE_URL}/${targetId}/${RESPOND_URL}`, { accept });

		showNotification(response.msg);
        if (response.status !== 200)
            return ;

    } catch (err: any) {
    	console.error(err?.msg ?? "Request failed");
    }
}

async function renderRequestLists(UL: HTMLUListElement, REQUEST_TYPE: string) {

    try {
		show(requestGameModal);
        const response = await httpEvent(GET, `/${BASE_URL}/${USER_URL}/${REQUESTS_URL}/${REQUEST_TYPE}`);

        if (response.status !== 200) {
            showNotification(response.msg);
            return ;
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

export async function getProfileInfo(reset: boolean) {

	if (reset === true) {
		updateProfileUI("PONG", "ft_transcendence.pong.com");
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

		const response = await httpEvent(GET, `/${BASE_URL}/${USER_URL}/me/${INFO_URL}`);
		if (response.status !== 200)
			return ;
        show(logoutButton);

		const info = response.target;
		updateProfileUI(info.display_name, info.username);
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

// if (playAgainstAIButton) {
//   playAgainstAIButton.onclick = () => {
//     startAiMode();
//   };
// }

// ==========================================
// SETTINGS MENU LOGIC
// ==========================================

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
      updateProfileUI(newName, currentUserName);
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
      updateProfileUI(currentDisplayname, newUserName);
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
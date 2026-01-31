import { loadAnimation, showLoader, hideLoader } from "./ui.js";
import {
  loginModal,
  closeLoginButton,
  logoutButton,
  usernameInput,
  passwordInput,
  submitLoginButton,
  dontHaveAnAccountButton,
} from "./ui.js";
import {
  registerModal,
  closeRegisterButton,
  submitRegisterButton,
  regUsernameInput,
  regDisplaynameInput,
  regEmailInput,
  regPasswordInput,
  alreadyHaveAnAccountButton,
} from "./ui.js";
import {
  twoFAModal,
  twoFAOptionModal,
  twoFAEmailButton,
  twoFASubmitButton,
  twoFASkipButton,
  twoFAAuthButton,
  twoFAInput,
  twoFACancelButton,
} from "./ui.js";
import {
  startMatchButton,
  playLocallyButton,
  exitMatchButton,
  playAgainstAIButton,
} from "./ui.js";
import {
  playRequestModal,
  playAgainstUserButton,
  playRequestUsernameInput,
  playRequestCloseButton,
  playRequestSendButton,
} from "./ui.js";
import { menuButtons, getInviteFrom } from "./ui.js";
import {
  openCreateTournamentButton,
  closeCreateTournamentButton,
  submitTournamentCreationButton,
  createTournamentModal,
  aliasTournamentInput,
  tournamentSizeInput,
} from "./ui.js";
import {
  openSearchTournamentButton,
  closeSearchTournamentButton,
  searchTournamentsModal,
  renderTournamentList,
} from "./ui.js";
import {
  show,
  hide,
  showMenu,
  showNotification,
  renderPendingRequests,
  mirrorCanvas,
  getDisplaySide,
  setDisplaySide,
} from "./ui.js";
import {
  openMenuButton,
  notificationAcceptButton,
  topBarDisplayName,
  makeVisible,
  updateOpponentUI,
  updateProfileUI,
  googleLoginButton,
} from "./ui.js";

import { ProfileInfo, TournamentInfo } from "./vars.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  configure2FA,
  verify2FA,
  startTokenValidationInterval,
} from "./auth.js";

import { userSocket, restoreSession } from "./websocket.js";

import { oneTimeEvent, setMatchMode, initKeyHandling } from "./events.js";
import { startAiMode, stopAiMode, isAiModeActive } from "./ai.js";

googleLoginButton.onclick = () => {
  window.location.href = "/auth/google";
};

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    if (!targetId) return;
    menuButtons.forEach((btn) => btn.classList.remove("active-border"));
    button.classList.add("active-border");
    const allLists = document.querySelectorAll<HTMLElement>(".pong-list");
    allLists.forEach((list) => {
      if (list.id === targetId) show(list);
      else hide(list);
    });
    if (targetId === "request_list") {
      renderRequestLists();
    }
  });
});

alreadyHaveAnAccountButton.onclick = () => {
  hide(registerModal);
  show(loginModal);
  showNotification("You must sign in in order to continue!");
};

submitRegisterButton.onclick = async () => {
  const result = await registerUser(
    regUsernameInput,
    regDisplaynameInput,
    regEmailInput,
    regPasswordInput,
  );

  if (result.status === 0 && result.setupToken) {
    hide(registerModal);
    show(twoFAOptionModal);
    twoFAEmailButton.onclick = () => {
      configure2FA(
        result.setupToken!,
        "2FAmail",
        twoFAOptionModal,
        loginModal,
        registerModal,
      );
    };
    twoFASkipButton.onclick = twoFACancelButton.onclick = () => {
      configure2FA(
        result.setupToken!,
        "skip",
        twoFAOptionModal,
        loginModal,
        registerModal,
      );
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
    startTokenValidationInterval();
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
        startTokenValidationInterval();
      }
    };
  } else {
    showNotification(result.error || "User/Password Incorrect");
  }
};

closeLoginButton.onclick = () => hide(loginModal);

logoutButton.onclick = () => logoutUser(logoutButton);

playAgainstUserButton.onclick = () => {
  if (!userSocket) {
    show(loginModal);
    showNotification("You must sign in in order to continue!!!");
    return;
  }
  show(playRequestModal);
};

playRequestSendButton.onclick = async () => {
  const target_username = playRequestUsernameInput.value.trim();
  if (target_username.length === 0) {
    alert("Username field empty");
    return;
  }

  try {
    const result = await oneTimeEvent(
      "SEND_INVITE_REQUEST",
      "SEND_INVITE_RESPONSE",
      target_username,
    );

    if (!result || !result.target) {
      showNotification("No response from server");
      return;
    }
    if (result.target !== target_username) {
      showNotification("Username response doesnt match invitation target");
      return;
    }
    if (result.status !== 200) {
      showNotification(result.msg);
      return;
    }
    hide(playRequestModal);
  } catch {
    showNotification("Failed to send invite");
  }
};

playRequestCloseButton.onclick = () => hide(playRequestModal);

startMatchButton.onclick = async () => {
  hide(startMatchButton);
  show(openMenuButton);
  makeVisible(topBarDisplayName);
  showNotification("Waiting for player...");

  try {
    const result = await oneTimeEvent(
      "START_MATCH_REQUEST",
      "START_MATCH_RESPONSE",
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }
    showNotification(result.msg);
    if (result.status !== 200 && result.status !== 202) return;
    if ((result.target as string) !== getDisplaySide()) {
      setDisplaySide(result.target as string);
      mirrorCanvas();
    }
    show(exitMatchButton);
    if (result.status === 200) setMatchMode("single");
    else if (result.status === 202) setMatchMode("dual");
    initKeyHandling();
  } catch {
    showNotification("Failed to start match");
  }
};

exitMatchButton.onclick = async () => {
  if (isAiModeActive()) {
    stopAiMode();
    return;
  }

  hide(exitMatchButton);
  try {
    const result = await oneTimeEvent(
      "EXIT_MATCH_REQUEST",
      "EXIT_MATCH_RESPONSE",
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }
    showNotification(result.msg);
    if (result.status !== 200) return;
    showMenu();
  } catch {
    showNotification("Failed to exit match");
  }
};

playLocallyButton.onclick = async () => {
  if (!userSocket) {
    show(loginModal);
    showNotification("You must sign in in order to continue!!!");
    return;
  }
  try {
    const result = await oneTimeEvent(
      "PLAY_LOCALLY_REQUEST",
      "PLAY_LOCALLY_RESPONSE",
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }
    showNotification(result.msg);
    if (result.status !== 200) return;
  } catch {
    showNotification("Failed to start local match");
  }
};

playAgainstAIButton.onclick = () => {
  startAiMode();
};

openCreateTournamentButton.onclick = () => {
  if (!userSocket) {
    show(loginModal);
    showNotification("You must sign in in order to continue!!!");
    return;
  }
  show(createTournamentModal);
};

submitTournamentCreationButton.onclick = async () => {
  const alias = aliasTournamentInput.value.trim();
  const size = tournamentSizeInput.value;

  if (alias.length === 0 || size.length === 0) return;

  try {
    const result = await oneTimeEvent(
      "CREATE_TOURNAMENT_REQUEST",
      "CREATE_TOURNAMENT_RESPONSE",
      alias,
      size,
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }

    if (result.status !== 200) {
      hide(createTournamentModal);
      showNotification(result.msg);
      return;
    }
    showNotification(result.msg);
    hide(createTournamentModal);
  } catch {
    showNotification("Failed to create tournament");
  }
};

closeCreateTournamentButton.onclick = () => hide(createTournamentModal);

openSearchTournamentButton.onclick = async () => {
  if (!userSocket) {
    show(loginModal);
    showNotification("You must sign in in order to continue!!!");
    return;
  }
  try {
    const result = await oneTimeEvent(
      "SEARCH_TOURNAMENT_REQUEST",
      "SEARCH_TOURNAMENT_RESPONSE",
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }
    if (result.status !== 200) {
      showNotification(result.msg);
      hide(searchTournamentsModal);
      return;
    }
    const joinButtons = renderTournamentList(result.target as TournamentInfo[]);
    show(searchTournamentsModal);
    for (const btn of joinButtons) {
      const id = btn.dataset.id!;
      const alias = "lolxd";

      btn.onclick = async () => {
        try {
          const joinResult = await oneTimeEvent(
            "JOIN_TOURNAMENT_REQUEST",
            "JOIN_TOURNAMENT_RESPONSE",
            id,
            alias,
          );

          if (!joinResult) {
            showNotification("No response from server");
            return;
          }
          showNotification(joinResult.msg);
          if (joinResult.status !== 200) {
            hide(searchTournamentsModal);
            return;
          }
          hide(searchTournamentsModal);
        } catch {
          showNotification("Failed to join tournament");
        }
      };
    }
  } catch {
    showNotification("Failed to search tournaments");
  }
};

closeSearchTournamentButton.onclick = () => hide(searchTournamentsModal);

notificationAcceptButton.onclick = async () => {
  try {
    hide(notificationAcceptButton);
    const result = await oneTimeEvent(
      "REPLY_INVITE_REQUEST",
      "REPLY_INVITE_RESPONSE",
      getInviteFrom(),
      "yes",
    );

    if (!result) {
      showNotification("No response from server");
      return;
    }

    showNotification(result.msg);
  } catch {
    showNotification("Failed to reply to invite");
  }
};

async function renderRequestLists() {
  try {
    const result = await oneTimeEvent(
      "GET_PENDING_REQUEST",
      "GET_PENDING_RESPONSE",
    );
    if (!result || result.status !== 200) {
      showNotification(result?.msg || "Failed to fetch requests");
      return;
    }
    const joinButtons = renderPendingRequests(result.target as ProfileInfo[]);
    for (const btn of joinButtons) {
      btn.onclick = async () => {
        const username = btn.dataset.username!;
        try {
          if (btn.textContent === "ACCEPT") {
            const res = await oneTimeEvent(
              "REPLY_INVITE_REQUEST",
              "REPLY_INVITE_RESPONSE",
              username,
            );
            if (!res) {
              showNotification("No response from server");
              return;
            }
            showNotification(res.msg);
            // if (res.status === 200)
            // 	showCanvas();
          } else if (btn.textContent === "X") {
            const res = await oneTimeEvent(
              "REPLY_INVITE_REQUEST",
              "REPLY_INVITE_RESPONSE",
              username,
              "decline",
            );
            if (!res) {
              showNotification("No response from server");
              return;
            }
            showNotification(res.msg);
          }
        } catch {
          showNotification("Failed to reply to invite");
        }
      };
    }
  } catch {
    showNotification("Error fetching pending requests");
  }
}

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

  if (restored) {
    startTokenValidationInterval();
  } else {
    console.log("No hay sesión activa");
  }
})();

export async function getProfileInfo(reset: boolean) {
  if (reset === true) {
    updateProfileUI("PONG", "ft_transcendence.pong.com");
    return;
  }
  try {
    const result = await oneTimeEvent("INFO_REQUEST", "INFO_RESPONSE");
    if (!result || result.status !== 200 || !result.target) return;
    show(logoutButton);

    const info = result.target as ProfileInfo;
    updateProfileUI(info.display_name, info.username);
  } catch {
    showNotification("Failed to fetch personal data from server");
  }
}

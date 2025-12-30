interface SearchMatchResponse {
  type: "SEARCH_MATCH_RESPONSE";
  status: number;
  matches: string[];
}
interface CreateMatchResponse {
  type: "CREATE_MATCH_RESPONSE";
  status: number;
  msg: string;
}
interface CreateMatchAIResponse {
  type: "CREATE_MATCH_AI_RESPONSE";
  status: number;
  msg: string;
}
interface JoinMatchResponse {
  type: "JOIN_MATCH_RESPONSE";
  status: number;
  target: string;
}
interface JoinedMessage {
  type: "PLAYER_JOINED_MATCH";
}
type ServerMessage =
  | SearchMatchResponse
  | CreateMatchResponse
  | CreateMatchAIResponse
  | JoinMatchResponse
  | JoinedMessage;

function sendRequest(
  userSocket: WebSocket,
  request: string,
  payload?: Record<string, any>
) {
  const msg = payload ? { type: request, ...payload } : { type: request };
  userSocket.send(JSON.stringify(msg));
}

export function searchForMatch(
  userSocket: WebSocket
): Promise<string[] | null> {
  return new Promise((resolve, reject) => {
    if (userSocket.readyState === WebSocket.OPEN) {
      sendRequest(userSocket, "SEARCH_MATCH_REQUEST");
    } else {
      userSocket.onopen = () => sendRequest(userSocket, "SEARCH_MATCH_REQUEST");
    }

    userSocket.onmessage = (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (data.type === "SEARCH_MATCH_RESPONSE") {
          if (data.status === 200) {
            resolve(data.matches);
          } else {
            resolve(null);
          }
        }
      } catch (err) {
        console.error("Error parsing search for players response:", err);
        resolve(null);
      }
    };
  });
}

export function createNewMatch(
  userSocket: WebSocket,
  boardTheme?: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (userSocket.readyState === WebSocket.OPEN) {
      sendRequest(userSocket, "CREATE_MATCH_REQUEST", { boardTheme });
    } else {
      userSocket.onopen = () =>
        sendRequest(userSocket, "CREATE_MATCH_REQUEST", { boardTheme });
    }

    userSocket.onmessage = (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (data.type === "CREATE_MATCH_RESPONSE") {
          if (data.status === 200) {
            console.log(data.msg);
            resolve(0);
          } else {
            resolve(1);
          }
        }
      } catch (err) {
        resolve(2);
      }
    };
  });
}

export function createNewAIMatch(
  userSocket: WebSocket,
  boardTheme?: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (userSocket.readyState === WebSocket.OPEN) {
      sendRequest(userSocket, "CREATE_MATCH_AI_REQUEST", { boardTheme });
    } else {
      userSocket.onopen = () =>
        sendRequest(userSocket, "CREATE_MATCH_AI_REQUEST", { boardTheme });
    }

    userSocket.onmessage = (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (data.type === "CREATE_MATCH_AI_RESPONSE") {
          if (data.status === 200) {
            console.log(data.msg);
            resolve(0);
          } else {
            resolve(1);
          }
        }
      } catch (err) {
        resolve(2);
      }
    };
  });
}

export function joinMatch(
  userSocket: WebSocket,
  target_username: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (
          data.type === "JOIN_MATCH_RESPONSE" &&
          data.target === target_username
        ) {
          userSocket.removeEventListener("message", handler);

          if (data.status === 200) {
            alert(`Joined match with ${data.target}`);
          } else {
            alert(`${data.target}'s match is already full.`);
          }
          resolve();
        }
      } catch (err) {
        console.error("Error parsing JOIN_MATCH_RESPONSE:", err);
        userSocket.removeEventListener("message", handler);
        reject(err);
      }
    };
    userSocket.addEventListener("message", handler);
    sendRequest(userSocket, "JOIN_MATCH_REQUEST", { target: target_username });
  });
}

export function playerJoinedMatch(userSocket: WebSocket): Promise<number> {
  return new Promise((resolve, reject) => {
    if (userSocket.readyState === WebSocket.OPEN) {
      sendRequest(userSocket, "READY_TO_JOIN");
    } else {
      userSocket.onopen = () => sendRequest(userSocket, "READY_TO_JOIN");
    }

    userSocket.onmessage = (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);

        if (data.type === "PLAYER_JOINED_MATCH") {
          resolve(0);
        }
      } catch (err) {
        console.error("Error parsing search for players response:", err);
        resolve(1);
      }
    };
  });
}

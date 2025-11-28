
interface SearchingMessage {type: "SEARCH_RESPONSE"; status: number; user: string;}
type ServerMessage = SearchingMessage;

export function searchForPlayers(userSocket: WebSocket): Promise<number> {

	return new Promise((resolve, reject) => {

		const sendSearchRequest = () => {
			const searchingForPlayersMessage = {
				type: "SEARCH_REQUEST",
			};
			userSocket.send(JSON.stringify(searchingForPlayersMessage));
		};


		if (userSocket.readyState === WebSocket.OPEN) {
			sendSearchRequest();
		} else {
			userSocket.onopen = sendSearchRequest;
		}

		userSocket.onmessage = (event: MessageEvent) => {
			try {
				const data: ServerMessage = JSON.parse(event.data);

				if (data.type === "SEARCH_RESPONSE") {
					if (data.status === 200) {
						console.log("Match found against user: " + data.user);
						
						resolve(1);
					} else {
						console.log("Waiting for players...");
						resolve(0);
					}
				}
			} catch (err) {
				console.error("Error parsing search for players response:", err);
				resolve(0);
			}
		};
	});
}


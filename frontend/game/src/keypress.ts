
export function sendKeyPressEvents(userSocket: WebSocket): void {

	document.addEventListener("keydown", (e: KeyboardEvent) => {

		if (e.key === "w")
            userSocket.send(JSON.stringify({ type: "MOVE", move: "MOVE_UP"}));
		if (e.key === "s")
            userSocket.send(JSON.stringify({ type: "MOVE", move: "MOVE_DOWN" }));
	});

	document.addEventListener("keyup", (e: KeyboardEvent) => {

		if (e.key === "w" || e.key === "s")
            userSocket.send(JSON.stringify({ type: "MOVE", move: "STOP" }));
	});
}

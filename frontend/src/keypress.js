
export function keyPressEvents(socket) {

	document.addEventListener("keydown", (e) => {
		if (e.key === "w")
            socket.send(JSON.stringify({ type: "MOVE_UP_1" }));
		if (e.key === "s")
            socket.send(JSON.stringify({ type: "MOVE_DOWN_1" }));
		if (e.key === "ArrowUp")
            socket.send(JSON.stringify({ type: "MOVE_UP_2" }));
		if (e.key === "ArrowDown")
            socket.send(JSON.stringify({ type: "MOVE_DOWN_2" }));
	});

	document.addEventListener("keyup", (e) => {

		if (e.key === "w" || e.key === "s")
            socket.send(JSON.stringify({ type: "STOP_1" }));
		if (e.key === "ArrowUp" || e.key === "ArrowDown")
            socket.send(JSON.stringify({ type: "STOP_2" }));
	});
}

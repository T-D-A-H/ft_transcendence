function LOGGER(code, firstMsg, secondMsg, ...restMsgs) {
	const reset = "\x1b[0m";
	let codeColor = "";

	if (typeof code === "number") {
		if (code >= 200 && code <= 299) codeColor = "\x1b[32;1m";
		else if (code >= 400 && code <= 499) codeColor = "\x1b[31;1m";
		else if (code >= 500 && code <= 599) codeColor = "\x1b[33;1m";
		else codeColor = "\x1b[37;1m";
	}
	else {

		restMsgs.unshift(secondMsg);
		secondMsg = firstMsg;
		firstMsg = code;
		code = null;
		codeColor = "\x1b[37;1m";
	}

	const codeText = code !== null ? `${codeColor}[${code}]${reset} ` : "";
	const firstText = firstMsg ? `${codeColor}${firstMsg}${reset} - ` : "";
	const secondText = secondMsg ? `\x1b[34;1m${secondMsg}${reset}: ` : "";
	const messageText = restMsgs.length
		? restMsgs.map(m => String(m).toUpperCase()).join(" ")
		: "";

	console.log(codeText + firstText + secondText + messageText);
}



module.exports = LOGGER;

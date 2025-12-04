function LOGGER(code, title, ...msgs) {
    let color = "";

    if (typeof code === "number") {
        if (code >= 200 && code <= 299)      color = "\x1b[32;1m"; // bold green
        else if (code >= 400 && code <= 499) color = "\x1b[31;1m"; // bold red
        else if (code >= 500 && code <= 599) color = "\x1b[33;1m"; // bold yellow
        else                                 color = "\x1b[37;1m"; // bold white
    } else {

        msgs.unshift(title);
        title = code;
        code = null;
        color = "\x1b[37;1m";
    }

    const reset = "\x1b[0m";

    const prefix = code !== null ? color + `[${code}] ${String(title).toUpperCase()}` + reset : "";

    const messageText = msgs.map(m => String(m)).join(" ");

    console.log(prefix + (messageText ? " " + messageText : ""));
}

module.exports = LOGGER;
export type TwoFAMethod = "skip" | "2FAmail";

export interface Set2FAResponse {
	status?: "ok" | "error";
	error?: string;
}

export async function set2FA(
	method: TwoFAMethod,
	setupToken?: string
): Promise<Set2FAResponse> {
	try {
		const res = await fetch("/api/set-2fa", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${setupToken}`
			},
			body: JSON.stringify({ method })
		});

		return await res.json();
	} catch {
		return {
			status: "error",
			error: "Error de red"
		};
	}
}

export async function changeDisplayName(newName: string): Promise<{ status: number; msg?: string }> {    
    try {
        if (!newName || newName.trim().length === 0) {
            return { status: 1, msg: "Name cannot be empty" };
        }
        
        const res = await fetch("/api/change-display-name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newName: newName }), 
            credentials: "include"
        });

        const result = await res.json();

        if (res.ok) {
            return { status: 0, msg: "Success" };
        }

        return { status: 1, msg: result.msg || "Error updating name" };

    } catch (msg) {
        return { status: 1, msg: "Connection error" };
    }
}

export async function changeUserName(newName: string): Promise<{ status: number; msg?: string }> {    
    try {

        // ! ---- Validate Username ----
/*         const usernameRegex = /^[a-zA-Z0-9_]+$/;
        
        if (!usernameRegex.test(newName)) {
            return { 
                status: 1, 
                msg: "El usuario solo puede contener letras, números y guiones bajos (sin espacios)." 
            };
        }
        
        if (newName.length < 3 || newName.length > 20) {
            return { 
                status: 1, 
                msg: "El usuario debe tener entre 3 y 20 caracteres." 
            };
        } */
        
        const res = await fetch("/api/change-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newName: newName }), 
            credentials: "include"
        });

        const result = await res.json();

        if (res.ok) {
            return { status: 0, msg: "Success" };
        }
        
        return { status: 1, msg: result.msg};

    } catch (msg) {
        return { status: 1, msg: "Connection error" };
    }
}

export async function changeEmail(newName: string): Promise<{ status: number; msg?: string }> {    
    try {

 	    // ! ---- Validate Email ----
/*  	    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (!emailRegex.test(newName)) {
            return { 
                status: 1, 
                msg: "Incorrect format (ej: usuario@dominio.com)" 
            };
        } */

        const res = await fetch("/api/change-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newName: newName }), 
            credentials: "include"
        });

        const result = await res.json();

        if (res.ok) {
            return { status: 0, msg: "Success" };
        }
        
        return { status: 1, msg: result.msg};

    } catch (msg) {
        return { status: 1, msg: "Connection error" };
    }
}

export async function changePassword(newPass: string, oldPass: string): Promise<{ status: number; msg?: string }> {    
    try {

 	    // ! ---- Validate Pass ----
/*         const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        
        if (!PASSWORD_REGEX.test(newPass)) {
            return {status: 1, msg: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."};
        } */

        const res = await fetch("/api/change-pass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPass: newPass,  oldPass: oldPass }), 
            credentials: "include"
        });

        const result = await res.json();

        if (res.ok) {
            return { status: 0, msg: "Success" };
        }
        
        return { status: 1, msg: result.error};

    } catch (msg) {
        return { status: 1, msg: "Connection error" };
    }
}

export async function changeAvatar(avatarSymbol: string) {
    try {
        const response = await fetch("/api/change-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar: avatarSymbol }),
            credentials: "include"
        });
        return await response.json();
    } catch (error) {
        return { status: 1, msg: "Connection error" };
    }
}
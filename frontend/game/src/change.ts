// auth.ts (o el archivo donde tengas tus funciones fetch)

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

        // Devolvemos el error que venga del backend o uno genérico
        return { status: 1, msg: result.error || "Error updating name" };

    } catch (error) {
        return { status: 1, msg: "Connection error" };
    }
}

export async function changeUserName(newName: string): Promise<{ status: number; msg?: string }> {    
    try {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
	
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
        }
        
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
        
        return { status: 1, msg: result.error || "Error updating name" };

    } catch (error) {
        return { status: 1, msg: "Connection error" };
    }
}
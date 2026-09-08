import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Acceso denegado. Token no proporcionado o formato inválido." });
        return;
    }

    // Aseguramos que el token extraído sea un string limpio
    const token: string = authHeader.split(" ")[1]!;

    try {
        const secret = process.env.JWT_SECRET || "secreto_super_seguro";

        const decoded = jwt.verify(token, secret) as unknown as { sub: string; email: string };

        req.user = { id: decoded.sub, email: decoded.email };

        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado." });
        return;
    }
};
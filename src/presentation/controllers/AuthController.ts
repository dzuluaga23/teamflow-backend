import { Request, Response } from "express";
import { LoginUserService } from "../../application/use-cases/LoginUserService";

export class AuthController {
    constructor(private loginUserService: LoginUserService) { }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;
            const result = await this.loginUserService.execute({ email, password });

            return res.status(200).json({
                message: "Inicio de sesión exitoso",
                data: result
            });
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }
}
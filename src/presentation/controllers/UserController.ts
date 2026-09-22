import { Request, Response } from "express";
import { CreateUserService } from "../../application/use-cases/CreateUserService";
import { GetUserProfileService } from "../../application/use-cases/GetUserProfileService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class UserController {
    constructor(private createUserUseCase: CreateUserService,
        private getUserProfileService: GetUserProfileService) { }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, password } = req.body;

            const user = await this.createUserUseCase.execute({ name, email, password });

            return res.status(201).json({
                message: "Usuario creado con éxito",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getMe(req: AuthRequest, res: Response): Promise<Response> {
        try {
            // El authMiddleware ya extrajo el ID del token y lo puso en req.user
            const userId = req.user?.id as string;

            const profile = await this.getUserProfileService.execute(userId);

            return res.status(200).json({
                message: "Perfil obtenido con éxito",
                data: profile
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
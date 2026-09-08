import { Request, Response } from "express";
import { CreateUserService } from "../../application/use-cases/CreateUserService";

export class UserController {
    constructor(private createUserUseCase: CreateUserService) { }

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
}
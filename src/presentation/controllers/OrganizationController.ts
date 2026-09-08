import { Response } from "express";
import { CreateOrganizationService } from "../../application/use-cases/CreateOrganizationService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class OrganizationController {
    constructor(private createOrganizationService: CreateOrganizationService) { }

    async create(req: AuthRequest, res: Response): Promise<Response> {
        try {
            // El token ya validó quién es el usuario
            const userId = req.user?.id;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: "El nombre de la organización es obligatorio" });
            }

            const organization = await this.createOrganizationService.execute({ name });

            return res.status(201).json({
                message: "Organización creada con éxito",
                data: {
                    id: organization.id,
                    name: organization.name,
                    createdBy: userId
                }
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
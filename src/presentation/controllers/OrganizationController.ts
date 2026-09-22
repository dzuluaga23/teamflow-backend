import { Response } from "express";
import { CreateOrganizationService } from "../../application/use-cases/CreateOrganizationService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { GetOrganizationsService } from "../../application/use-cases/GetOrganizationsService";
import { DeleteOrganizationService } from "../../application/use-cases/DeleteOrganizationService";

export class OrganizationController {
    constructor(
        private createOrganizationService: CreateOrganizationService,
        private getOrganizationsService: GetOrganizationsService,
        private deleteOrganizationService: DeleteOrganizationService) { }

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

    async getAll(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const organizations = await this.getOrganizationsService.execute();

            return res.status(200).json({
                message: "Organizaciones obtenidas con éxito",
                data: organizations
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
    async delete(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const organizationId = req.params.organizationId as string;
            if (!organizationId) return res.status(400).json({ error: "ID de organización obligatorio" });

            await this.deleteOrganizationService.execute(organizationId);
            return res.status(200).json({ message: "Organización eliminada con éxito" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
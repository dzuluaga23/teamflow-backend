import { Response } from "express";
import { CreateProjectService } from "../../application/use-cases/CreateProjectService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { GetProjectsByOrganizationService } from "../../application/use-cases/GetProjectsByOrganizationService";
import { DeleteProjectService } from "../../application/use-cases/DeleteProjectService";

export class ProjectController {
    constructor(
        private createProjectService: CreateProjectService,
        private getProjectsService: GetProjectsByOrganizationService,
        private deleteProjectService: DeleteProjectService
    ) { }

    async create(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const { name, description, organizationId } = req.body;

            if (!name || !organizationId) {
                return res.status(400).json({ error: "El nombre y el ID de la organización son obligatorios" });
            }

            const project = await this.createProjectService.execute({ name, description, organizationId });

            return res.status(201).json({
                message: "Proyecto creado con éxito",
                data: {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    organizationId: project.organizationId
                }
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getByOrganization(req: AuthRequest, res: Response): Promise<Response> {
        try {
            // Forzamos la extracción asegurando que sea un string plano
            const organizationId = req.params.organizationId as string;

            if (!organizationId) {
                return res.status(400).json({ error: "El ID de la organización es obligatorio en la ruta" });
            }

            const projects = await this.getProjectsService.execute(organizationId);

            return res.status(200).json({
                message: "Proyectos obtenidos con éxito",
                data: projects
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const projectId = req.params.projectId as string;

            if (!projectId) {
                return res.status(400).json({ error: "El ID del proyecto es obligatorio" });
            }

            await this.deleteProjectService.execute(projectId);

            return res.status(200).json({
                message: "Proyecto eliminado con éxito"
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
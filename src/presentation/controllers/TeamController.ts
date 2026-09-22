import { Response } from "express";
import { CreateTeamService } from "../../application/use-cases/CreateTeamService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AddUserToTeamService } from "../../application/use-cases/AddUserToTeamService";
import { GetTeamMembersService } from "../../application/use-cases/GetTeamMembersService";
import { GetTeamsByOrganizationService } from "../../application/use-cases/GetTeamsByOrganizationService";
import { DeleteTeamService } from "../../application/use-cases/DeleteTeamService";

export class TeamController {
    constructor(
        private createTeamService: CreateTeamService,
        private addUserToTeamService: AddUserToTeamService,
        private getTeamMembersService: GetTeamMembersService,
        private getTeamsByOrganizationService: GetTeamsByOrganizationService,
        private deleteTeamService: DeleteTeamService) { }

    async create(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const { name, organizationId } = req.body;

            if (!name || !organizationId) {
                return res.status(400).json({ error: "El nombre y el ID de la organización son obligatorios" });
            }

            const team = await this.createTeamService.execute({ name, organizationId });

            return res.status(201).json({
                message: "Equipo creado con éxito",
                data: {
                    id: team.id,
                    name: team.name,
                    organizationId: team.organizationId
                }
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async addUser(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const { userId, teamId } = req.body;

            if (!userId || !teamId) {
                return res.status(400).json({ error: "El userId y el teamId son obligatorios" });
            }

            await this.addUserToTeamService.execute({ userId, teamId });

            return res.status(200).json({
                message: "Usuario añadido al equipo con éxito"
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getMembers(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const teamId = req.params.teamId as string;

            if (!teamId) {
                return res.status(400).json({ error: "El ID del equipo es obligatorio" });
            }

            const members = await this.getTeamMembersService.execute(teamId);

            return res.status(200).json({
                message: "Miembros obtenidos con éxito",
                data: members
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getByOrganization(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const organizationId = req.params.organizationId as string;

            if (!organizationId) {
                return res.status(400).json({ error: "El ID de la organización es obligatorio" });
            }

            const teams = await this.getTeamsByOrganizationService.execute(organizationId);

            return res.status(200).json({
                message: "Equipos obtenidos con éxito",
                data: teams
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const teamId = req.params.teamId as string;
            if (!teamId) return res.status(400).json({ error: "ID de equipo obligatorio" });

            await this.deleteTeamService.execute(teamId);
            return res.status(200).json({ message: "Equipo eliminado con éxito" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
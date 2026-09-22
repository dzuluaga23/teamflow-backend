import { Response } from "express";
import { CreateTeamService } from "../../application/use-cases/CreateTeamService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AddUserToTeamService } from "../../application/use-cases/AddUserToTeamService";
import { GetTeamMembersService } from "../../application/use-cases/GetTeamMembersService";

export class TeamController {
    constructor(
        private createTeamService: CreateTeamService,
        private addUserToTeamService: AddUserToTeamService,
        private getTeamMembersService: GetTeamMembersService) { }

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
}
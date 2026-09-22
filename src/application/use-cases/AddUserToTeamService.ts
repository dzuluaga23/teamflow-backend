import { ITeamRepository } from "../../domain/repositories/ITeamRepository";
import { AddUserToTeamDTO } from "../dto/AddUserToTeamDTO";

export class AddUserToTeamService {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(data: AddUserToTeamDTO): Promise<void> {
        if (!data.userId || !data.teamId) {
            throw new Error("El ID del usuario y el ID del equipo son obligatorios");
        }
        await this.teamRepository.addUserToTeam(data.userId, data.teamId);
    }
}
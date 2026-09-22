import { ITeamRepository } from "../../domain/repositories/ITeamRepository";

export class DeleteTeamService {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(teamId: string): Promise<void> {
        if (!teamId) throw new Error("El ID del equipo es obligatorio");
        await this.teamRepository.delete(teamId);
    }
}
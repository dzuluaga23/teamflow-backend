import { ITeamRepository } from "../../domain/repositories/ITeamRepository";

export class GetTeamMembersService {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(teamId: string) {
        const members = await this.teamRepository.getMembers(teamId);

        // Retornamos solo la información pública y segura
        return members.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email
        }));
    }
}
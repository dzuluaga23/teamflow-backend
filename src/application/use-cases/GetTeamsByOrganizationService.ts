import { ITeamRepository } from "../../domain/repositories/ITeamRepository";

export class GetTeamsByOrganizationService {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(organizationId: string) {
        if (!organizationId) throw new Error("El ID de la organización es obligatorio");
        return await this.teamRepository.findByOrganizationId(organizationId);
    }
}
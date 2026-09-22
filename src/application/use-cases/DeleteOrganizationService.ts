import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

export class DeleteOrganizationService {
    constructor(private organizationRepository: IOrganizationRepository) { }

    async execute(organizationId: string): Promise<void> {
        if (!organizationId) throw new Error("El ID de la organización es obligatorio");
        await this.organizationRepository.delete(organizationId);
    }
}
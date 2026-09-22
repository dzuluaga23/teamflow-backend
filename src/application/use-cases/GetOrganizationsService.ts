import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

export class GetOrganizationsService {
    constructor(private organizationRepository: IOrganizationRepository) { }

    async execute() {
        return await this.organizationRepository.findAll();
    }
}
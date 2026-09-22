import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";

export class GetProjectsByOrganizationService {
    constructor(private projectRepository: IProjectRepository) { }

    async execute(organizationId: string): Promise<Project[]> {
        return await this.projectRepository.findByOrganizationId(organizationId);
    }
}
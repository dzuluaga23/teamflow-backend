import { Project } from "../entities/Project";

export interface IProjectRepository {
    findById(id: string): Promise<Project | null>;
    findByOrganizationId(organizationId: string): Promise<Project[]>;
    save(project: Project): Promise<void>;
}
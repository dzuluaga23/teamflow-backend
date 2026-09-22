import { IProjectRepository } from "../../domain/repositories/IProjectRepository";

export class DeleteProjectService {
    constructor(private projectRepository: IProjectRepository) { }

    async execute(projectId: string): Promise<void> {
        if (!projectId) {
            throw new Error("El ID del proyecto es obligatorio");
        }
        await this.projectRepository.delete(projectId);
    }
}
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task } from "../../domain/entities/Task";

export class GetTasksByProjectService {
    constructor(private taskRepository: ITaskRepository) { }

    async execute(projectId: string): Promise<Task[]> {
        return await this.taskRepository.findByProjectId(projectId);
    }
}
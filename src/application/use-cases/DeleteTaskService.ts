import { ITaskRepository } from "../../domain/repositories/ITaskRepository";

export class DeleteTaskService {
    constructor(private taskRepository: ITaskRepository) { }

    async execute(taskId: string): Promise<void> {
        if (!taskId) {
            throw new Error("El ID de la tarea es obligatorio");
        }
        await this.taskRepository.delete(taskId);
    }
}
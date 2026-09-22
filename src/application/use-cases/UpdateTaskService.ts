import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { UpdateTaskDTO } from "../dto/UpdateTaskDTO";

export class UpdateTaskService {
    constructor(private taskRepository: ITaskRepository) { }

    async execute(taskId: string, data: UpdateTaskDTO) {
        if (!data.status && !data.priority) {
            throw new Error("Debe proporcionar al menos un estado o una prioridad para actualizar");
        }

        return await this.taskRepository.update(taskId, data);
    }
}
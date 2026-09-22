import { ITaskRepository } from "../../domain/repositories/ITaskRepository";

export class AssignTaskService {
    constructor(private taskRepository: ITaskRepository) { }

    async execute(taskId: string, assigneeId: string): Promise<void> {
        if (!taskId || !assigneeId) {
            throw new Error("El ID de la tarea y el ID del responsable son obligatorios");
        }

        // Aquí en el futuro podrías validar si el usuario realmente pertenece al equipo del proyecto

        await this.taskRepository.assignTask(taskId, assigneeId);
    }
}
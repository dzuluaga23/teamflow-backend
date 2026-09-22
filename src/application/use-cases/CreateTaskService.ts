import crypto from "node:crypto";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task, TaskStatus, TaskPriority } from "../../domain/entities/Task";
import { CreateTaskDTO } from "../dto/CreateTaskDTO";

export class CreateTaskService {
    constructor(private taskRepository: ITaskRepository) { }

    async execute(data: CreateTaskDTO): Promise<Task> {
        const now = new Date();

        // Usamos el string directo ("BACKLOG" y "MEDIUM") en lugar de la notación de objeto
        const status = (data.status as TaskStatus) || "BACKLOG";
        const priority = (data.priority as TaskPriority) || "MEDIUM";

        const newTask = new Task(
            crypto.randomUUID(),
            data.title,
            data.description || "",
            status,
            priority,
            data.projectId,
            data.assigneeId || null,
            now,
            now
        );

        await this.taskRepository.save(newTask);

        return newTask;
    }
}
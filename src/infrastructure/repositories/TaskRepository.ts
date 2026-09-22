import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task, TaskStatus, TaskPriority } from "../../domain/entities/Task";
import { UpdateTaskDTO } from "../../application/dto/UpdateTaskDTO";
import { prisma } from "../database/prisma";

export class TaskRepository implements ITaskRepository {
    async findById(id: string): Promise<Task | null> {
        const data = await prisma.task.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;
        return new Task(
            data.id,
            data.title,
            data.description,
            data.status as TaskStatus,
            data.priority as TaskPriority,
            data.projectId,
            data.assigneeId,
            data.createdAt,
            data.updatedAt
        );
    }

    async findByProjectId(projectId: string): Promise<Task[]> {
        const data = await prisma.task.findMany({
            where: { projectId, deletedAt: null }
        });

        return data.map(task =>
            new Task(
                task.id,
                task.title,
                task.description,
                task.status as TaskStatus,
                task.priority as TaskPriority,
                task.projectId,
                task.assigneeId,
                task.createdAt,
                task.updatedAt
            )
        );
    }

    async save(task: Task): Promise<void> {
        await prisma.task.upsert({
            where: { id: task.id },
            update: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assigneeId: task.assigneeId,
                updatedAt: task.updatedAt,
            },
            create: {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assigneeId: task.assigneeId,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            }
        });
    }

    async update(taskId: string, data: UpdateTaskDTO): Promise<Task> {
        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.priority && { priority: data.priority })
            }
        });

        return new Task(
            updated.id,
            updated.title,
            updated.description || "",
            updated.status as any, // Casteo temporal a tu enum/type
            updated.priority as any,
            updated.projectId,
            updated.assigneeId,
            updated.createdAt,
            updated.updatedAt
        );
    }

    async assignTask(taskId: string, assigneeId: string): Promise<void> {
        await prisma.task.update({
            where: { id: taskId },
            data: { assigneeId }
        });
    }

    async delete(taskId: string): Promise<void> {
        await prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date() } // <-- Llenamos el campo con la fecha actual
        });
    }
}
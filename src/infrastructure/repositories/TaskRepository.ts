import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task, TaskStatus, TaskPriority } from "../../domain/entities/Task";
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
}
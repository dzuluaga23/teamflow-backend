import { Task } from "../entities/Task";

export interface ITaskRepository {
    findById(id: string): Promise<Task | null>;
    findByProjectId(projectId: string): Promise<Task[]>;
    save(task: Task): Promise<void>;
}
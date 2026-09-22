import { UpdateTaskDTO } from "../../application/dto/UpdateTaskDTO";
import { Task } from "../entities/Task";

export interface ITaskRepository {
    findById(id: string): Promise<Task | null>;
    findByProjectId(projectId: string): Promise<Task[]>;
    save(task: Task): Promise<void>;
    assignTask(taskId: string, assigneeId: string): Promise<void>;
    update(taskId: string, data: UpdateTaskDTO): Promise<Task>;
    delete(taskId: string): Promise<void>;
}
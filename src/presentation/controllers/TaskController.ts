import { Response } from "express";
import { CreateTaskService } from "../../application/use-cases/CreateTaskService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { GetTasksByProjectService } from "../../application/use-cases/GetTasksByProjectService";
import { UpdateTaskService } from "../../application/use-cases/UpdateTaskService";
import { UpdateTaskDTO } from "../../application/dto/UpdateTaskDTO";
import { AssignTaskService } from "../../application/use-cases/AssignTaskService";

export class TaskController {
    constructor(
        private createTaskService: CreateTaskService,
        private getTasksService: GetTasksByProjectService,
        private updateTaskService: UpdateTaskService,
        private assignTaskService: AssignTaskService
    ) { }

    async create(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const { title, description, status, priority, projectId, assigneeId } = req.body;

            if (!title || !projectId) {
                return res.status(400).json({ error: "El título y el ID del proyecto son obligatorios" });
            }

            const task = await this.createTaskService.execute({
                title,
                description,
                status,
                priority,
                projectId,
                assigneeId
            });

            return res.status(201).json({
                message: "Tarea creada con éxito",
                data: {
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    projectId: task.projectId
                }
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getByProject(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const projectId = req.params.projectId as string;

            if (!projectId) {
                return res.status(400).json({ error: "El ID del proyecto es obligatorio en la ruta" });
            }

            const tasks = await this.getTasksService.execute(projectId);

            return res.status(200).json({
                message: "Tareas obtenidas con éxito",
                data: tasks
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const taskId = req.params.taskId as string;

            // Agregamos "|| {}" como red de seguridad. Si req.body es undefined, usa un objeto vacío.
            const { status, priority } = req.body || {};

            if (!taskId) {
                return res.status(400).json({ error: "El ID de la tarea es obligatorio en la ruta" });
            }

            // Validamos explícitamente antes de llamar al servicio
            if (!status && !priority) {
                return res.status(400).json({ error: "Debes enviar al menos un status o priority válido en formato JSON" });
            }

            const updatedTask = await this.updateTaskService.execute(taskId, { status, priority });

            return res.status(200).json({
                message: "Tarea actualizada con éxito",
                data: updatedTask
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async assign(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const taskId = req.params.taskId as string;
            const { assigneeId } = req.body || {};

            if (!taskId || !assigneeId) {
                return res.status(400).json({ error: "El ID de la tarea en la ruta y el assigneeId en el body son obligatorios" });
            }

            await this.assignTaskService.execute(taskId, assigneeId);

            return res.status(200).json({
                message: "Responsable asignado a la tarea con éxito"
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export interface CreateTaskDTO {
    title: string;
    description?: string;
    status?: "BACKLOG" | "IN_PROGRESS" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    projectId: string;
    assigneeId?: string;
}
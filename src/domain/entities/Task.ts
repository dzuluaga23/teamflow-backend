export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export class Task {
    constructor(
        public readonly id: string,
        public title: string,
        public description: string,
        public status: TaskStatus,
        public priority: TaskPriority,
        public readonly projectId: string,
        public assigneeId: string | null,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public changeStatus(newStatus: TaskStatus): void {
        this.status = newStatus;
        this.updatedAt = new Date();
    }

    public assignTo(userId: string): void {
        this.assigneeId = userId;
        this.updatedAt = new Date();
    }
}
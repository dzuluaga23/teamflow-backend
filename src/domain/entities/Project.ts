export class Project {
    constructor(
        public readonly id: string,
        public name: string,
        public description: string,
        public readonly organizationId: string,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public updateDetails(name: string, description: string): void {
        if (name.trim().length === 0) throw new Error("El nombre no puede estar vacío");
        this.name = name;
        this.description = description;
        this.updatedAt = new Date();
    }
}
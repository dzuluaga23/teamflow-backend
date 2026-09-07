export class Organization {
    constructor(
        public readonly id: string,
        public name: string,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public updateName(newName: string): void {
        if (newName.trim().length < 3) {
            throw new Error("El nombre de la organización debe tener al menos 3 caracteres");
        }
        this.name = newName;
        this.updatedAt = new Date();
    }
}
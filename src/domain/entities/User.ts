export class User {
    constructor(
        public readonly id: string,
        public name: string,
        public email: string,
        public passwordHash: string,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public changeName(newName: string): void {
        if (newName.trim().length === 0) {
            throw new Error("El nombre no puede estar vacío");
        }
        this.name = newName;
        this.updatedAt = new Date();
    }
}
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { prisma } from "../database/prisma";

export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;

        // Convertimos el dato crudo de Prisma a nuestra Entidad de Dominio
        return new User(data.id, data.name, data.email, data.passwordHash, data.createdAt, data.updatedAt);
    }

    async findByEmail(email: string): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: { email, deletedAt: null }
        });

        if (!data) return null;
        return new User(data.id, data.name, data.email, data.passwordHash, data.createdAt, data.updatedAt);
    }

    async save(user: User): Promise<void> {
        // Upsert: Si existe lo actualiza, si no existe lo crea
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                updatedAt: user.updatedAt,
            },
            create: {
                id: user.id,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    }
}
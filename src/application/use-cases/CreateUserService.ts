import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { CreateUserDTO } from "../dto/CreateUserDTO";

export class CreateUserService {
    // Inyectamos el contrato del repositorio (Inversión de dependencias)
    constructor(private userRepository: IUserRepository) { }

    async execute(data: CreateUserDTO): Promise<User> {
        // 1. Validar la regla de negocio: ¿El correo ya existe?
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("El correo ya está registrado en el sistema");
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // 3. Crear la entidad pura de Dominio
        const now = new Date();
        const newUser = new User(
            crypto.randomUUID(),
            data.name,
            data.email,
            passwordHash,
            now,
            now
        );

        // 4. Delegar el guardado a la capa de Infraestructura
        await this.userRepository.save(newUser);

        return newUser;
    }
}
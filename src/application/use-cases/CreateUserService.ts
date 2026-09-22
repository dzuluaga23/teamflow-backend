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

        // 2. Formatear el nombre a Title Case (Primera letra de cada palabra en mayúscula)
        const formattedName = data.name
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        // 3. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // 4. Crear la entidad pura de Dominio con el nombre formateado
        const now = new Date();
        const newUser = new User(
            crypto.randomUUID(),
            formattedName,
            data.email,
            passwordHash,
            now,
            now
        );

        // 5. Delegar el guardado a la capa de Infraestructura
        await this.userRepository.save(newUser);

        return newUser;
    }
}
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { LoginUserDTO } from "../dto/LoginUserDTO";

export class LoginUserService {
    constructor(private userRepository: IUserRepository) { }

    async execute(data: LoginUserDTO): Promise<{ token: string; user: { id: string; name: string; email: string } }> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Credenciales inválidas");
        }

        const secret = process.env.JWT_SECRET || "secreto_super_seguro";
        const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "1d" });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        };
    }
}
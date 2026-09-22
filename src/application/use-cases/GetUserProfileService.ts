import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class GetUserProfileService {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Retornamos los datos limpios sin el passwordHash
        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }
}
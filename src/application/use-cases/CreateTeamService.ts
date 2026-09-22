import crypto from "node:crypto";
import { ITeamRepository } from "../../domain/repositories/ITeamRepository";
import { Team } from "../../domain/entities/Team";
import { CreateTeamDTO } from "../dto/CreateTeamDTO";

export class CreateTeamService {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(data: CreateTeamDTO): Promise<Team> {
        const now = new Date();

        const newTeam = new Team(
            crypto.randomUUID(),
            data.name,
            data.organizationId,
            now,
            now
        );

        await this.teamRepository.save(newTeam);

        return newTeam;
    }
}
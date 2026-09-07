import { ITeamRepository } from "../../domain/repositories/ITeamRepository";
import { Team } from "../../domain/entities/Team";
import { prisma } from "../database/prisma";

export class TeamRepository implements ITeamRepository {
    async findById(id: string): Promise<Team | null> {
        const data = await prisma.team.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;
        return new Team(data.id, data.name, data.organizationId, data.createdAt, data.updatedAt);
    }

    async findByOrganizationId(organizationId: string): Promise<Team[]> {
        const data = await prisma.team.findMany({
            where: { organizationId, deletedAt: null }
        });

        return data.map(team =>
            new Team(team.id, team.name, team.organizationId, team.createdAt, team.updatedAt)
        );
    }

    async save(team: Team): Promise<void> {
        await prisma.team.upsert({
            where: { id: team.id },
            update: {
                name: team.name,
                organizationId: team.organizationId,
                updatedAt: team.updatedAt,
            },
            create: {
                id: team.id,
                name: team.name,
                organizationId: team.organizationId,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt,
            }
        });
    }
}
import { ITeamRepository } from "../../domain/repositories/ITeamRepository";
import { Team } from "../../domain/entities/Team";
import { prisma } from "../database/prisma";
import { User } from "../../domain/entities/User";

export class TeamRepository implements ITeamRepository {
    async findById(id: string): Promise<Team | null> {
        const data = await prisma.team.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;
        return new Team(data.id, data.name, data.organizationId, data.createdAt, data.updatedAt);
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

    async addUserToTeam(userId: string, teamId: string): Promise<void> {
        await prisma.teamMember.create({
            data: {
                userId,
                teamId
            }
        });
    }

    async getMembers(teamId: string): Promise<User[]> {
        const teamMembers = await prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: true // Traemos toda la info del usuario asociado
            }
        });

        // Convertimos a entidades de dominio
        return teamMembers.map(tm => new User(
            tm.user.id,
            tm.user.name,
            tm.user.email,
            tm.user.passwordHash,
            tm.user.createdAt,
            tm.user.updatedAt
        ));
    }

    async findByOrganizationId(organizationId: string): Promise<Team[]> {
        const data = await prisma.team.findMany({
            where: { organizationId, deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });

        return data.map(t => new Team(
            t.id,
            t.name,
            t.organizationId,
            t.createdAt,
            t.updatedAt
        ));
    }

    async delete(teamId: string): Promise<void> {
        await prisma.team.update({
            where: { id: teamId },
            data: { deletedAt: new Date() }
        });
    }
}
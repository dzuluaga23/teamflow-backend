import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { prisma } from "../database/prisma";

export class ProjectRepository implements IProjectRepository {
    async findById(id: string): Promise<Project | null> {
        const data = await prisma.project.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;
        return new Project(data.id, data.name, data.description, data.organizationId, data.createdAt, data.updatedAt);
    }

    async findByOrganizationId(organizationId: string): Promise<Project[]> {
        const data = await prisma.project.findMany({
            where: { organizationId, deletedAt: null }
        });

        return data.map(project =>
            new Project(project.id, project.name, project.description, project.organizationId, project.createdAt, project.updatedAt)
        );
    }

    async save(project: Project): Promise<void> {
        await prisma.project.upsert({
            where: { id: project.id },
            update: {
                name: project.name,
                description: project.description,
                organizationId: project.organizationId,
                updatedAt: project.updatedAt,
            },
            create: {
                id: project.id,
                name: project.name,
                description: project.description,
                organizationId: project.organizationId,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            }
        });
    }

    async delete(projectId: string): Promise<void> {
        await prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() }
        });
    }
}
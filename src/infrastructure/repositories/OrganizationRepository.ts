import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/Organization";
import { prisma } from "../database/prisma";

export class OrganizationRepository implements IOrganizationRepository {
    async findById(id: string): Promise<Organization | null> {
        const data = await prisma.organization.findFirst({
            where: { id, deletedAt: null }
        });

        if (!data) return null;
        return new Organization(data.id, data.name, data.createdAt, data.updatedAt);
    }

    async save(organization: Organization): Promise<void> {
        await prisma.organization.upsert({
            where: { id: organization.id },
            update: {
                name: organization.name,
                updatedAt: organization.updatedAt,
            },
            create: {
                id: organization.id,
                name: organization.name,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt,
            }
        });
    }

    async findAll(): Promise<Organization[]> {
        const data = await prisma.organization.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });

        return data.map(org => new Organization(
            org.id,
            org.name,
            org.createdAt,
            org.updatedAt
        ));
    }

    async delete(organizationId: string): Promise<void> {
        await prisma.organization.update({
            where: { id: organizationId },
            data: { deletedAt: new Date() }
        });
    }
}
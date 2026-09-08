import crypto from "node:crypto";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/Organization";
import { CreateOrganizationDTO } from "../dto/CreateOrganizationDTO";

export class CreateOrganizationService {
    constructor(private organizationRepository: IOrganizationRepository) { }

    async execute(data: CreateOrganizationDTO): Promise<Organization> {
        const now = new Date();

        const newOrganization = new Organization(
            crypto.randomUUID(),
            data.name,
            now,
            now
        );

        await this.organizationRepository.save(newOrganization);

        return newOrganization;
    }
}
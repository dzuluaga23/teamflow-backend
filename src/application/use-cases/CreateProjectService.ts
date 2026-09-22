import crypto from "node:crypto";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { CreateProjectDTO } from "../dto/CreateProjectDTO";

export class CreateProjectService {
    constructor(private projectRepository: IProjectRepository) { }

    async execute(data: CreateProjectDTO): Promise<Project> {
        const now = new Date();

        const newProject = new Project(
            crypto.randomUUID(),
            data.name,
            data.description || "",
            data.organizationId,
            now,
            now
        );

        await this.projectRepository.save(newProject);

        return newProject;
    }
}
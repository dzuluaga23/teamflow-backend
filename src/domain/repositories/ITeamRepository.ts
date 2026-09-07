import { Team } from "../entities/Team";

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByOrganizationId(organizationId: string): Promise<Team[]>;
    save(team: Team): Promise<void>;
}
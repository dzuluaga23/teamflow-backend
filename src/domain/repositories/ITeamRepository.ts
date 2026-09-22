import { Team } from "../entities/Team";
import { User } from "../entities/User";


export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByOrganizationId(organizationId: string): Promise<Team[]>;
    save(team: Team): Promise<void>;
    addUserToTeam(userId: string, teamId: string): Promise<void>;
    getMembers(teamId: string): Promise<User[]>;
    delete(teamId: string): Promise<void>;
}
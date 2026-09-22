import express from "express";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { CreateUserService } from "./application/use-cases/CreateUserService";
import { GetUserProfileService } from "./application/use-cases/GetUserProfileService";
import { UserController } from "./presentation/controllers/UserController";

import { LoginUserService } from "./application/use-cases/LoginUserService";
import { AuthController } from "./presentation/controllers/AuthController";
import { authMiddleware } from "./presentation/middlewares/authMiddleware";

import { OrganizationRepository } from "./infrastructure/repositories/OrganizationRepository";
import { CreateOrganizationService } from "./application/use-cases/CreateOrganizationService";
import { OrganizationController } from "./presentation/controllers/OrganizationController";

import { TeamRepository } from "./infrastructure/repositories/TeamRepository";
import { CreateTeamService } from "./application/use-cases/CreateTeamService";
import { AddUserToTeamService } from "./application/use-cases/AddUserToTeamService";
import { TeamController } from "./presentation/controllers/TeamController";
import { GetTeamMembersService } from "./application/use-cases/GetTeamMembersService";

import { ProjectRepository } from "./infrastructure/repositories/ProjectRepository";
import { CreateProjectService } from "./application/use-cases/CreateProjectService";
import { GetProjectsByOrganizationService } from "./application/use-cases/GetProjectsByOrganizationService";
import { ProjectController } from "./presentation/controllers/ProjectController";

import { TaskRepository } from "./infrastructure/repositories/TaskRepository";
import { CreateTaskService } from "./application/use-cases/CreateTaskService";
import { GetTasksByProjectService } from "./application/use-cases/GetTasksByProjectService";
import { TaskController } from "./presentation/controllers/TaskController";
import { UpdateTaskService } from "./application/use-cases/UpdateTaskService";
import { AssignTaskService } from "./application/use-cases/AssignTaskService";

const app = express();
app.use(express.json());

// 1. Instanciamos la infraestructura (Repositories)
const userRepository = new UserRepository();
const organizationRepository = new OrganizationRepository();
const teamRepository = new TeamRepository();
const projectRepository = new ProjectRepository();
const taskRepository = new TaskRepository();

// 2. Instanciamos los casos de uso (Services)
const createUserService = new CreateUserService(userRepository);
const getUserProfileService = new GetUserProfileService(userRepository);
const loginUserService = new LoginUserService(userRepository);
const createOrganizationService = new CreateOrganizationService(organizationRepository);

const createTeamService = new CreateTeamService(teamRepository);
const addUserToTeamService = new AddUserToTeamService(teamRepository);
const getTeamMembersService = new GetTeamMembersService(teamRepository);

const createProjectService = new CreateProjectService(projectRepository);
const getProjectsService = new GetProjectsByOrganizationService(projectRepository);

const createTaskService = new CreateTaskService(taskRepository);
const getTasksService = new GetTasksByProjectService(taskRepository);
const updateTaskService = new UpdateTaskService(taskRepository);
const assignTaskService = new AssignTaskService(taskRepository);

// 3. Instanciamos los controladores inyectando sus dependencias
const userController = new UserController(createUserService, getUserProfileService);
const authController = new AuthController(loginUserService);
const organizationController = new OrganizationController(createOrganizationService);

const teamController = new TeamController(createTeamService, addUserToTeamService, getTeamMembersService);

const projectController = new ProjectController(createProjectService, getProjectsService);
const taskController = new TaskController(createTaskService, getTasksService, updateTaskService, assignTaskService);

// 4. Definimos las rutas HTTP
app.post("/api/users", (req, res) => userController.create(req, res));
app.get("/api/auth/me", authMiddleware, (req, res) => userController.getMe(req, res));
app.post("/api/auth/login", (req, res) => authController.login(req, res));

app.post("/api/organizations", authMiddleware, (req, res) => organizationController.create(req, res));

app.post("/api/teams", authMiddleware, (req, res) => teamController.create(req, res));
app.post("/api/teams/members", authMiddleware, (req, res) => teamController.addUser(req, res));
app.get("/api/teams/:teamId/members", authMiddleware, (req, res) => teamController.getMembers(req, res));

app.post("/api/projects", authMiddleware, (req, res) => projectController.create(req, res));
app.get("/api/organizations/:organizationId/projects", authMiddleware, (req, res) => projectController.getByOrganization(req, res));

app.post("/api/tasks", authMiddleware, (req, res) => taskController.create(req, res));
app.get("/api/projects/:projectId/tasks", authMiddleware, (req, res) => taskController.getByProject(req, res));
app.patch("/api/tasks/:taskId", authMiddleware, (req, res) => taskController.update(req, res));
app.patch("/api/tasks/:taskId/assign", authMiddleware, (req, res) => taskController.assign(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de TeamFlow corriendo en http://localhost:${PORT}`);
});
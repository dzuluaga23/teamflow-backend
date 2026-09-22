import express from "express";

// Importaciones de Autenticación y Usuarios
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { CreateUserService } from "./application/use-cases/CreateUserService";
import { GetUserProfileService } from "./application/use-cases/GetUserProfileService";
import { UserController } from "./presentation/controllers/UserController";
import { LoginUserService } from "./application/use-cases/LoginUserService";
import { AuthController } from "./presentation/controllers/AuthController";
import { authMiddleware } from "./presentation/middlewares/authMiddleware";

// Importaciones de Organizaciones
import { OrganizationRepository } from "./infrastructure/repositories/OrganizationRepository";
import { CreateOrganizationService } from "./application/use-cases/CreateOrganizationService";
import { GetOrganizationsService } from "./application/use-cases/GetOrganizationsService";
import { DeleteOrganizationService } from "./application/use-cases/DeleteOrganizationService";
import { OrganizationController } from "./presentation/controllers/OrganizationController";

// Importaciones de Equipos
import { TeamRepository } from "./infrastructure/repositories/TeamRepository";
import { CreateTeamService } from "./application/use-cases/CreateTeamService";
import { AddUserToTeamService } from "./application/use-cases/AddUserToTeamService";
import { GetTeamMembersService } from "./application/use-cases/GetTeamMembersService";
import { GetTeamsByOrganizationService } from "./application/use-cases/GetTeamsByOrganizationService";
import { DeleteTeamService } from "./application/use-cases/DeleteTeamService";
import { TeamController } from "./presentation/controllers/TeamController";

// Importaciones de Proyectos
import { ProjectRepository } from "./infrastructure/repositories/ProjectRepository";
import { CreateProjectService } from "./application/use-cases/CreateProjectService";
import { GetProjectsByOrganizationService } from "./application/use-cases/GetProjectsByOrganizationService";
import { DeleteProjectService } from "./application/use-cases/DeleteProjectService";
import { ProjectController } from "./presentation/controllers/ProjectController";

// Importaciones de Tareas
import { TaskRepository } from "./infrastructure/repositories/TaskRepository";
import { CreateTaskService } from "./application/use-cases/CreateTaskService";
import { GetTasksByProjectService } from "./application/use-cases/GetTasksByProjectService";
import { UpdateTaskService } from "./application/use-cases/UpdateTaskService";
import { AssignTaskService } from "./application/use-cases/AssignTaskService";
import { DeleteTaskService } from "./application/use-cases/DeleteTaskService";
import { TaskController } from "./presentation/controllers/TaskController";

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
const getOrganizationsService = new GetOrganizationsService(organizationRepository);
const deleteOrganizationService = new DeleteOrganizationService(organizationRepository);

const createTeamService = new CreateTeamService(teamRepository);
const addUserToTeamService = new AddUserToTeamService(teamRepository);
const getTeamMembersService = new GetTeamMembersService(teamRepository);
const getTeamsByOrganizationService = new GetTeamsByOrganizationService(teamRepository);
const deleteTeamService = new DeleteTeamService(teamRepository);

const createProjectService = new CreateProjectService(projectRepository);
const getProjectsService = new GetProjectsByOrganizationService(projectRepository);
const deleteProjectService = new DeleteProjectService(projectRepository);

const createTaskService = new CreateTaskService(taskRepository);
const getTasksService = new GetTasksByProjectService(taskRepository);
const updateTaskService = new UpdateTaskService(taskRepository);
const assignTaskService = new AssignTaskService(taskRepository);
const deleteTaskService = new DeleteTaskService(taskRepository);

// 3. Instanciamos los controladores inyectando sus dependencias
const userController = new UserController(createUserService, getUserProfileService);
const authController = new AuthController(loginUserService);
const organizationController = new OrganizationController(createOrganizationService, getOrganizationsService, deleteOrganizationService);
const teamController = new TeamController(createTeamService, addUserToTeamService, getTeamMembersService, getTeamsByOrganizationService, deleteTeamService);
const projectController = new ProjectController(createProjectService, getProjectsService, deleteProjectService);
const taskController = new TaskController(createTaskService, getTasksService, updateTaskService, assignTaskService, deleteTaskService);

// 4. Definimos las rutas HTTP
// --- Auth & Users ---
app.post("/api/users", (req, res) => userController.create(req, res));
app.post("/api/auth/login", (req, res) => authController.login(req, res));
app.get("/api/auth/me", authMiddleware, (req, res) => userController.getMe(req, res));

// --- Organizations ---
app.post("/api/organizations", authMiddleware, (req, res) => organizationController.create(req, res));
app.get("/api/organizations", authMiddleware, (req, res) => organizationController.getAll(req, res));
app.delete("/api/organizations/:organizationId", authMiddleware, (req, res) => organizationController.delete(req, res));

// --- Teams ---
app.post("/api/teams", authMiddleware, (req, res) => teamController.create(req, res));
app.get("/api/organizations/:organizationId/teams", authMiddleware, (req, res) => teamController.getByOrganization(req, res));
app.post("/api/teams/members", authMiddleware, (req, res) => teamController.addUser(req, res));
app.get("/api/teams/:teamId/members", authMiddleware, (req, res) => teamController.getMembers(req, res));
app.delete("/api/teams/:teamId", authMiddleware, (req, res) => teamController.delete(req, res));

// --- Projects ---
app.post("/api/projects", authMiddleware, (req, res) => projectController.create(req, res));
app.get("/api/organizations/:organizationId/projects", authMiddleware, (req, res) => projectController.getByOrganization(req, res));
app.delete("/api/projects/:projectId", authMiddleware, (req, res) => projectController.delete(req, res));

// --- Tasks ---
app.post("/api/tasks", authMiddleware, (req, res) => taskController.create(req, res));
app.get("/api/projects/:projectId/tasks", authMiddleware, (req, res) => taskController.getByProject(req, res));
app.patch("/api/tasks/:taskId", authMiddleware, (req, res) => taskController.update(req, res));
app.patch("/api/tasks/:taskId/assign", authMiddleware, (req, res) => taskController.assign(req, res));
app.delete("/api/tasks/:taskId", authMiddleware, (req, res) => taskController.delete(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de TeamFlow corriendo en http://localhost:${PORT}`);
});
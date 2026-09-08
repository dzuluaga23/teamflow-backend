import express from "express";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { CreateUserService } from "./application/use-cases/CreateUserService";
import { UserController } from "./presentation/controllers/UserController";
import { LoginUserService } from "./application/use-cases/LoginUserService";
import { AuthController } from "./presentation/controllers/AuthController";
import { authMiddleware } from "./presentation/middlewares/authMiddleware";
import { OrganizationRepository } from "./infrastructure/repositories/OrganizationRepository";
import { CreateOrganizationService } from "./application/use-cases/CreateOrganizationService";
import { OrganizationController } from "./presentation/controllers/OrganizationController";

const app = express();
app.use(express.json());

// 1. Instanciamos la infraestructura
const userRepository = new UserRepository();
const organizationRepository = new OrganizationRepository();

// 2. Inyectamos el repositorio en el caso de uso (Servicio)
const createUserService = new CreateUserService(userRepository);
const loginUserService = new LoginUserService(userRepository);
const createOrganizationService = new CreateOrganizationService(organizationRepository);
// 3. Inyectamos el servicio en el controlador
const userController = new UserController(createUserService);
const authController = new AuthController(loginUserService);
const organizationController = new OrganizationController(createOrganizationService);

// 4. Definimos la ruta HTTP
app.post("/api/users", (req, res) => userController.create(req, res));
app.post("/api/auth/login", (req, res) => authController.login(req, res));
app.post("/api/organizations", authMiddleware, (req, res) => organizationController.create(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de TeamFlow corriendo en http://localhost:${PORT}`);
});
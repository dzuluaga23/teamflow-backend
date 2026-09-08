import express from "express";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { CreateUserService } from "./application/use-cases/CreateUserService";
import { UserController } from "./presentation/controllers/UserController";
import { LoginUserService } from "./application/use-cases/LoginUserService";
import { AuthController } from "./presentation/controllers/AuthController";

const app = express();
app.use(express.json());

// 1. Instanciamos la infraestructura
const userRepository = new UserRepository();

// 2. Inyectamos el repositorio en el caso de uso (Servicio)
const createUserService = new CreateUserService(userRepository);
const loginUserService = new LoginUserService(userRepository);
// 3. Inyectamos el servicio en el controlador
const userController = new UserController(createUserService);
const authController = new AuthController(loginUserService);

// 4. Definimos la ruta HTTP
app.post("/api/users", (req, res) => userController.create(req, res));
app.post("/api/auth/login", (req, res) => authController.login(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de TeamFlow corriendo en http://localhost:${PORT}`);
});
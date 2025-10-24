import { Router } from "express";
import * as loginController from "../controllers/login.controller.js";

const route = Router();

route.post("/login", loginController.login);

export default route;

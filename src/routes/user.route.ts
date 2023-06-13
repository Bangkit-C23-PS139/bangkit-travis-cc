import UserController from '@/controllers/user.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/self`, authMiddleware, this.userController.getMySelf);
    this.router.get(`${this.path}/`, authMiddleware, this.userController.getUsers);
    this.router.get(`${this.path}/:id`, authMiddleware, this.userController.getUserById);
    this.router.put(`${this.path}/self`, authMiddleware, this.userController.editMySelf);
    this.router.put(`${this.path}/:id`, authMiddleware, this.userController.editUser);
    this.router.delete(`${this.path}`, authMiddleware, this.userController.deleteUsers);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.userController.deleteUserByUserId);
  }
}

export default UserRoute;

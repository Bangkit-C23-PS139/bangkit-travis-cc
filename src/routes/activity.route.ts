import ActivityController from '@/controllers/activity.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class ActivityRoute implements Routes {
  public path = '/activity';
  public router = Router();
  public activityController = new ActivityController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, this.activityController.addActivity);
    this.router.get(`${this.path}`, this.activityController.getActivity);
    this.router.get(`${this.path}/:id`, this.activityController.getActivityByID);
    this.router.get(`${this.path}/user/find`, authMiddleware, this.activityController.getActivityByUser);
    this.router.post(`${this.path}/:id/link`, authMiddleware, this.activityController.linkUser);
    this.router.post(`${this.path}/:id/unlink/`, authMiddleware, this.activityController.unlinkUser);
  }
}

export default ActivityRoute;

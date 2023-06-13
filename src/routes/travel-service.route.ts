import TravelServiceController from '@/controllers/travel-service.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class TravelServiceRoute implements Routes {
  public path = '/travel/service';
  public router = Router();
  public serviceController = new TravelServiceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, this.serviceController.addTravelService);
    this.router.get(`${this.path}`, this.serviceController.getTravelServices);
    this.router.get(`${this.path}/:id`, this.serviceController.getTravelServiceById);
    this.router.put(`${this.path}/:id`, authMiddleware, this.serviceController.updateTravelService);
    this.router.delete(`${this.path}`, authMiddleware, this.serviceController.deleteTravelServices);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.serviceController.deleteTravelServiceById);
  }
}

export default TravelServiceRoute;

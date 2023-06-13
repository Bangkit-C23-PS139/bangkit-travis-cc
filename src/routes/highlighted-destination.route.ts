import HighlightedDestinationController from '@/controllers/highlighted-destination.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class HighlightedDestinationRoute implements Routes {
  public path = '/destination';
  public router = Router();
  public destinationController = new HighlightedDestinationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, this.destinationController.addDestination);
    this.router.get(`${this.path}`, this.destinationController.getDestinations);
    this.router.get(`${this.path}/:id`, this.destinationController.getDestinationById);
    this.router.put(`${this.path}/:id`, authMiddleware, this.destinationController.updateDestination);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.destinationController.deleteDestinationById);
    this.router.delete(`${this.path}`, authMiddleware, this.destinationController.deleteDestination);
  }
}

export default HighlightedDestinationRoute;

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from 'express';
import { ILike, getRepository } from 'typeorm';
import { nanoid } from 'nanoid';
import { TypeLocation } from '@/interfaces/activity.interface';
import { HttpException } from '@/exceptions/HttpException';
import { TravelServiceRequest } from '@/interfaces/travel-service.interface';
import TravelServiceEntity from '@/entity/travel-service.entity';

class TravelServiceController {
  public addTravelService = async (req: Request, res: Response, next: NextFunction) => {
    const travelServiceRequest: TravelServiceRequest = req.body;
    const travelServiceRepository = getRepository(TravelServiceEntity);

    const newTravelService = new TravelServiceEntity(
      nanoid(32),
      travelServiceRequest.service_name,
      travelServiceRequest.location,
      travelServiceRequest.description,
      travelServiceRequest.service_provider,
      travelServiceRequest.service_price,
      travelServiceRequest.gmap_link,
      travelServiceRequest.background_img,
      travelServiceRequest.image_gallery,
      travelServiceRequest.contact_number,
    );

    if (!(travelServiceRequest.location.toUpperCase() in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
      return;
    }

    const duplicateDestination =
      (await travelServiceRepository.count({
        where: {
          service_name: travelServiceRequest.service_name,
          service_provider: travelServiceRequest.service_provider,
          location: travelServiceRequest.location,
        },
      })) > 0;
    if (duplicateDestination) {
      next(new HttpException(404, 'Duplicate travel service found'));
      return;
    }
    travelServiceRepository
      .save(newTravelService)
      .then(async r => {
        res.status(201).send({
          message: 'Successfully add new travel service',
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, e));
      });
  };

  public getTravelServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 10;
      const repository = getRepository(TravelServiceEntity);
      const { city, page, pagesize, sort } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;

      const searchKey: string = city == null || typeof city == 'undefined' ? '' : city.toString().toUpperCase() in TypeLocation ? city : 'Invalid';
      if (searchKey == 'Invalid') {
        next(new HttpException(400, 'Search key error: Invalid city.'));
        return;
      }

      // @ts-ignore
      const [travelServiceData, nTravelServiceData] = await repository.findAndCount({
        where: { location: ILike(`%${searchKey}%`) },
        skip: offsetSize * offset,
        take: offsetSize,
        order: {
          location: sort === 'DESC' ? 'DESC' : 'ASC',
        },
      });
      res.status(200).json({
        data: {
          data: travelServiceData,
          count: nTravelServiceData,
          totalPages: Math.ceil(nTravelServiceData / 50),
          page: offset,
        },
        message: 'Berhasil get all travel services',
      });
    } catch (error) {
      next(error);
    }
  };

  public getTravelServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const serviceId = req.params.id;
      const repository = getRepository(TravelServiceEntity);
      const data = await repository.findOne({
        where: { id: serviceId },
      });
      if (!data) {
        next(new HttpException(404, 'Service not found'));
        return;
      }

      res.status(200).json({
        data: data,
        message: 'Berhasil menemukan travel service',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTravelService = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { service_name, location, description, service_provider, service_price, gmap_link, background_img, image_gallery, contact_number } =
      req.body;

    const travelServiceRepository = getRepository(TravelServiceEntity);

    const findTravelService = await travelServiceRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!findTravelService) {
      next(new HttpException(404, 'Travel service not found!'));
      return;
    }

    findTravelService.edit(
      service_name,
      location,
      description,
      service_provider,
      service_price,
      gmap_link,
      background_img,
      image_gallery,
      contact_number,
    );
    if (findTravelService.location === undefined) {
      next(new HttpException(400, 'Invalid Location inputed'));
      return;
    }

    travelServiceRepository
      .save(findTravelService)
      .then(r => {
        res.status(200).send({
          message: 'successfully updated travel service with id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'something wrong happened: ' + e));
      });
  };

  public async deleteTravelServices(req: Request, res: Response, next: NextFunction) {
    const travelServiceRepository = getRepository(TravelServiceEntity);

    const findTravelService = await travelServiceRepository.find();
    travelServiceRepository
      .softRemove(findTravelService)
      .then(r => {
        res.status(200).send({
          message: 'Successfully removed all travel services',
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async deleteTravelServiceById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const travelServiceRepository = getRepository(TravelServiceEntity);

    const findTravelService = await travelServiceRepository.findOne({
      where: { id: id },
    });
    if (!findTravelService) {
      next(new HttpException(404, 'Travel Service not found'));
      return;
    }

    travelServiceRepository
      .softRemove(findTravelService)
      .then(r => {
        res.status(200).send({
          message: 'Successfully deleted travel service of id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something wrong happened: ' + e));
      });
  }
}

export default TravelServiceController;

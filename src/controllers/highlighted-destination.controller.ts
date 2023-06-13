/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from 'express';
import { ILike, getRepository } from 'typeorm';
import HighlightedDestinationEntity from '../entity/highlighted-destination.entity';
import { HighlightedDestinationRequest } from '@/interfaces/highlighted-destination.interface';
import { nanoid } from 'nanoid';
import { TypeLocation } from '@/interfaces/activity.interface';
import { HttpException } from '@/exceptions/HttpException';

class HighlightedDestinationController {
  public addDestination = async (req: Request, res: Response, next: NextFunction) => {
    const destinationRequest: HighlightedDestinationRequest = req.body;
    const destinationRepository = getRepository(HighlightedDestinationEntity);

    const newDestination = new HighlightedDestinationEntity(
      nanoid(32),
      destinationRequest.destination_name,
      destinationRequest.location,
      destinationRequest.description,
      destinationRequest.gmap_link,
      destinationRequest.background_img,
      destinationRequest.image_gallery,
      destinationRequest.activity,
      destinationRequest.contact_number,
    );

    if (!(destinationRequest.location.toUpperCase() in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
      return;
    }

    const duplicateDestination =
      (await destinationRepository.count({
        where: {
          destination_name: destinationRequest.destination_name,
          location: destinationRequest.location,
        },
      })) > 0;
    if (duplicateDestination) {
      next(new HttpException(404, 'Duplicate destination found'));
      return;
    }
    destinationRepository
      .save(newDestination)
      .then(async r => {
        res.status(201).send({
          message: 'Successfully add new destination',
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, e));
      });
  };

  public getDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 10;
      const repository = getRepository(HighlightedDestinationEntity);
      const { city, page, pagesize, sort } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;

      const searchKey: string = city == null || typeof city == 'undefined' ? '' : city.toString().toUpperCase() in TypeLocation ? city : 'Invalid';
      if (searchKey == 'Invalid') {
        next(new HttpException(400, 'Search key error: Invalid city.'));
        return;
      }

      // @ts-ignore
      const [destinationData, nDestinationsData] = await repository.findAndCount({
        where: { location: ILike(`%${searchKey}%`) },
        skip: offsetSize * offset,
        take: offsetSize,
        order: {
          location: sort === 'DESC' ? 'DESC' : 'ASC',
        },
      });
      res.status(200).json({
        data: {
          data: destinationData,
          count: nDestinationsData,
          totalPages: Math.ceil(nDestinationsData / 50),
          page: offset,
        },
        message: 'Berhasil get all highlighted destinations',
      });
    } catch (error) {
      next(error);
    }
  };

  public getDestinationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinationId = req.params.id;
      const repository = getRepository(HighlightedDestinationEntity);
      const data = await repository.findOne({
        where: { id: destinationId },
      });
      if (!data) {
        next(new HttpException(404, 'No destination found'));
        return;
      }

      res.status(200).json({
        data: data,
        message: 'Berhasil menemukan destinasi',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateDestination = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { destination_name, location, description, background_img, gmap_link, image_gallery, activity, contact_number } = req.body;

    const destinationRepository = getRepository(HighlightedDestinationEntity);

    const findDestination = await destinationRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!findDestination) {
      next(new HttpException(404, 'destination not found!'));
      return;
    }

    findDestination.edit(destination_name, location, description, background_img, gmap_link, image_gallery, activity, contact_number);
    if (findDestination.location === undefined) {
      next(new HttpException(400, 'Invalid Location inputed'));
      return;
    }

    destinationRepository
      .save(findDestination)
      .then(r => {
        res.status(200).send({
          message: 'successfully updated destination with id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'something wrong happened: ' + e));
      });
  };

  public async deleteDestination(req: Request, res: Response, next: NextFunction) {
    const destinationRepository = getRepository(HighlightedDestinationEntity);

    const findDestination = await destinationRepository.find();
    destinationRepository
      .softRemove(findDestination)
      .then(r => {
        res.status(200).send({
          message: 'Successfully removed all destinations',
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async deleteDestinationById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const destinationRepository = getRepository(HighlightedDestinationEntity);

    const findDestination = await destinationRepository.findOne({
      where: { id: id },
    });
    if (!findDestination) {
      next(new HttpException(404, 'Destination not found'));
      return;
    }

    destinationRepository
      .softRemove(findDestination)
      .then(r => {
        res.status(200).send({
          message: 'Successfully deleted highlighted destination of id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something wrong happened: ' + e));
      });
  }
}

export default HighlightedDestinationController;

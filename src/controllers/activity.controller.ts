/* eslint-disable @typescript-eslint/ban-ts-comment */
import ActivityEntity from '@/entity/activity.entity';
import UserEntity from '@/entity/user.entity';
import { HttpException } from '@/exceptions/HttpException';
import { ActivityRequest, TypeLocation } from '@/interfaces/activity.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { ILike, getRepository } from 'typeorm';

class ActivityController {
  public async addActivity(req: Request, res: Response, next: NextFunction) {
    const activityRequest: ActivityRequest = req.body;

    const activityRepository = getRepository(ActivityEntity);
    const userRepository = getRepository(UserEntity);

    const newActivity = new ActivityEntity(
      nanoid(32),
      activityRequest.activity_name,
      activityRequest.location,
      activityRequest.description,
      activityRequest.background_img,
      activityRequest.gmap_link,
      activityRequest.start_time,
      activityRequest.end_time,
    );

    if (!(activityRequest.location.toUpperCase() in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
      return;
    }

    if (activityRequest.start_time > activityRequest.end_time) {
      next(new HttpException(400, 'Invalid activity time/duration'));
      return;
    }

    const duplicateActivity =
      (await activityRepository.count({
        where: {
          activity_name: activityRequest.activity_name,
          location: activityRequest.location,
        },
      })) > 0;
    if (duplicateActivity) {
      next(new HttpException(404, 'Duplicate activity found'));
      return;
    }

    if (activityRequest.users) {
      const userList = [];
      for (let i = 0; i < activityRequest.users.length; i++) {
        const checkUser = await userRepository.findOne({
          where: {
            id: activityRequest.users[i].id,
            email: activityRequest.users[i].email,
          },
        });
        if (checkUser) userList.push(checkUser);
      }

      newActivity.users = userList;

      if (activityRequest.users.length === userList.length) {
        activityRepository.save(newActivity).then(async r => {
          res.status(201).send({
            message: 'Successfully add new activity',
            data: r,
          });
        });
      }
    } else {
      activityRepository
        .save(newActivity)
        .then(async r => {
          res.status(201).send({
            message: 'Successfully add new activity',
            data: r,
          });
        })
        .catch(e => {
          next(new HttpException(500, e));
        });
    }
  }

  public async getActivity(req: RequestWithUser, res: Response, next: NextFunction) {
    const { page, city, pagesize, sort } = req.query;
    const activityRepository = getRepository(ActivityEntity);
    // @ts-ignore
    const pageSize = pagesize ? parseInt(pagesize) : 10;
    // @ts-ignore
    const searchKey: string = city == null || typeof city == 'undefined' ? '' : city.toString().toUpperCase() in TypeLocation ? city : 'Invalid';
    if (searchKey == 'Invalid') {
      next(new HttpException(400, 'Search key error: Invalid city.'));
      return;
    }

    let pageNumber: number;
    if (typeof page === 'string') {
      pageNumber = typeof page == 'undefined' ? 0 : parseInt(page);
    } else if (typeof page === 'number') {
      pageNumber = typeof page == 'undefined' ? 0 : parseInt(page);
    } else {
      pageNumber = 0;
    }

    const [allActivity, totalActivity] = await activityRepository.findAndCount({
      where: { location: ILike(`%${searchKey}%`) },
      take: pageSize,
      skip: pageNumber & pageSize,
      order: {
        location: sort === 'DESC' ? 'DESC' : 'ASC',
      },
    });

    if (totalActivity != null && allActivity != null) {
      res.status(200).send({
        message: 'Successfully get all activities',
        data: allActivity,
        page: page,
        totalActivity: totalActivity,
        totalPage: Math.floor(totalActivity / pageSize) + (totalActivity % pageSize > 0 ? 1 : 0),
      });
    } else {
      next(new HttpException(500, 'Something went wrong while querying for results.'));
    }
  }

  public async getActivityByID(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const activityRepository = getRepository(ActivityEntity);
    const findActivity = await activityRepository.findOne({
      where: { id: id },
      relations: ['users'],
    });

    if (findActivity) {
      res.status(200).send({
        message: 'Successfuly get activity with id: ' + id,
        data: findActivity,
      });
    } else {
      next(new HttpException(404, 'This activity does not exist'));
    }
  }

  public async deleteActivity(req: Request, res: Response, next: NextFunction) {
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.find();
    activityRepository
      .softRemove(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully removed all activities',
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async linkUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userId = req.user.userId;

    const userRepository = getRepository(UserEntity);
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne(id, { relations: ['users'] });
    if (!findActivity) {
      next(new HttpException(404, 'activity not found'));
      return;
    }

    const findUser = await userRepository.findOne(userId);
    if (!findUser) {
      next(new HttpException(404, 'user not found'));
      return;
    }

    if (!findActivity.users) {
      findActivity.users = [];
    }

    const flag = true;
    findActivity.users.map(user => {
      if (user.id === userId) {
        next(new HttpException(400, 'User already exists in this activity'));
        return;
      }
    });
    if (!flag) {
      return;
    }

    findActivity.users.push(findUser);
    activityRepository
      .save(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully add user: ' + findUser.nama + ' to activity: ' + r.activity_name,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async unlinkUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRepository = getRepository(UserEntity);
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne(id, { relations: ['users'] });
    if (!findActivity) {
      next(new HttpException(404, 'Activity not found'));
      return;
    }

    const findUser = await userRepository.findOne(userId);
    if (!findUser) {
      next(new HttpException(404, 'User not found'));
      return;
    }
    const newUsers = [];
    findActivity.users.map(user => {
      if (user.id !== userId) {
        newUsers.push(user);
      }
    });
    findActivity.users = newUsers;

    activityRepository
      .save(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully remove user: ' + userId + ' from activity: ' + r.activity_name,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async getActivityByUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { pg, pgsize, userId } = req.query;
    const activityRepository = getRepository(ActivityEntity);

    let currPage = 0;
    let pageSize = 20;
    if (typeof pg === 'string') {
      currPage = pg ? parseInt(pg) : 0;
    }
    if (typeof pgsize === 'string') {
      pageSize = pgsize ? parseInt(pgsize) : 20;
    }

    const findActivities = await activityRepository.query(
      `SELECT ae.*, uae.user FROM activity_entity ae
      LEFT JOIN user_activities_entity uae ON ae.id = uae.activities
      WHERE uae.user ='${userId}' AND ae."deletedAt" IS NULL
      LIMIT ${pageSize}
      OFFSET ${currPage * pageSize}`,
    );

    if (findActivities.length > 0) {
      res.status(200).send({
        message: 'Berhasil mendapatkan aktivitas',
        data: findActivities,
      });
    } else {
      next(new HttpException(404, 'Data not found'));
      return;
    }
  }

  public updateActivity = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { activity_name, location, description, background_img, gmap_link, start_time, end_time } = req.body;

    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne({
      where: {
        id: id,
      },
      relations: ['users'],
    });
    if (!findActivity) {
      next(new HttpException(404, 'activity not found!'));
      return;
    }

    findActivity.edit(activity_name, location, description, background_img, gmap_link, start_time, end_time);
    if (findActivity.location === undefined) {
      next(new HttpException(400, 'Invalid Location inputed'));
      return;
    }

    activityRepository
      .save(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'successfully updated activity with id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'something wrong happened: ' + e));
      });
  };

  public async deleteActivityById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const activityRepository = await getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne({
      where: { id: id },
      relations: ['users'],
    });
    if (!findActivity) {
      next(new HttpException(404, 'Activity not found'));
      return;
    }

    activityRepository
      .softRemove(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully deleted activity of id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something wrong happened: ' + e));
      });
  }
}

export default ActivityController;

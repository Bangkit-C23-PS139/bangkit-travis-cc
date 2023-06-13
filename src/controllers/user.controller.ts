/* eslint-disable @typescript-eslint/ban-ts-comment */
import UserEntity from '@/entity/user.entity';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { NextFunction, Request, Response } from 'express';
import { Like, getRepository } from 'typeorm';

class UserController {
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 10;
      const repository = getRepository(UserEntity);
      const { page, pagesize } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;
      // @ts-ignore
      const [usersData, nUsersData] = await repository.findAndCount({
        relations: ['activities'],
        skip: offsetSize * offset,
        take: offsetSize,
      });
      res.status(200).json({
        data: {
          data: usersData,
          count: nUsersData,
          totalPages: Math.ceil(nUsersData / 50),
          page: offset,
        },
        message: 'Berhasil get all user',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const repository = getRepository(UserEntity);
      const userData = await repository.findOne({
        where: { id: userId },
        relations: ['activities'],
      });

      res.status(200).json({
        data: userData,
        message: 'Berhasil menemukan user',
      });
    } catch (error) {
      next(error);
    }
  };

  public getMySelf = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.userId;
      const repository = getRepository(UserEntity);
      const userData = await repository.findOne({
        where: { id: userId },
        relations: ['activities'],
      });

      res.status(200).json({
        data: userData,
        message: 'Berhasil menemukan user',
      });
    } catch (error) {
      next(error);
    }
  };

  public editMySelf = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { nama, gender, age, travel_preferences, picture_url } = req.body;
      const userRepository = getRepository(UserEntity);
      const foundUser = await userRepository.findOne({
        where: { id: userId },
      });
      if (foundUser) {
        foundUser.nama = nama ? nama : foundUser.nama;
        foundUser.gender = gender ? gender : foundUser.gender;
        foundUser.age = age ? age : foundUser.age;
        foundUser.travel_preferences = travel_preferences ? travel_preferences : foundUser.travel_preferences;
        foundUser.picture_url = picture_url ? picture_url : foundUser.picture_url;
        await userRepository.save(foundUser);
      }
      res.status(200).send({
        message: 'berhasil update detail user',
        data: foundUser,
      });
    } catch (error) {
      next(error);
    }
  };

  public editUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { nama, gender, age, travel_preferences, picture_url } = req.body;
      const userRepository = getRepository(UserEntity);
      const foundUser = await userRepository.findOne({
        where: { id: id },
      });
      if (!foundUser) {
        next(new HttpException(404, 'User not found'));
        return;
      } else {
        foundUser.nama = nama ? nama : foundUser.nama;
        foundUser.gender = gender ? gender : foundUser.gender;
        foundUser.age = age ? age : foundUser.age;
        foundUser.travel_preferences = travel_preferences ? travel_preferences : foundUser.travel_preferences;
        foundUser.picture_url = picture_url ? picture_url : foundUser.picture_url;
        await userRepository.save(foundUser);
      }
      res.status(200).send({
        message: 'berhasil update detail user',
        data: foundUser,
      });
    } catch (error) {
      next(error);
    }
  };

  public async deleteUsers(req: Request, res: Response, next: NextFunction) {
    const userRepository = getRepository(UserEntity);

    const findUser = await userRepository.find();
    userRepository
      .softRemove(findUser)
      .then(r => {
        res.status(200).send({
          message: 'Successfully removed all users',
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async deleteUserByUserId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userRepository = getRepository(UserEntity);

    const findUsers = await userRepository.findOne({
      where: { id: id },
      relations: ['activities'],
    });
    if (!findUsers) {
      next(new HttpException(404, 'User not found'));
      return;
    }

    userRepository
      .softRemove(findUsers)
      .then(r => {
        res.status(200).send({
          message: 'Successfully deleted user of id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something wrong happened: ' + e));
      });
  }
}

export default UserController;

import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status';

import { userRepository } from '../repository/user';
import { CreateUserInputSchema, DeleteUserInputSchema, UpdateUserInputSchema } from '../types/user';

export class UserController {
  public static async addUser(req: Request, res: Response): Promise<Response> {
    try {
      const validatedUser = CreateUserInputSchema.parse(req.body);
      const user = await userRepository.createUser(validatedUser);

      return res.status(HTTP_STATUS.OK).send(user);
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(error);
    }
  }

  public static async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const validatedUser = DeleteUserInputSchema.parse({ userId });
      const user = await userRepository.deleteUser(validatedUser.userId);

      return res.status(HTTP_STATUS.OK).send(user);
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(error);
    }
  }

  public static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const validatedUser = UpdateUserInputSchema.parse(req.body);
      const user = await userRepository.updateUser(validatedUser.userId, validatedUser);

      return res.status(HTTP_STATUS.OK).send(user);
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(error);
    }
  }
}

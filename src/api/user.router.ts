import { Router } from 'express';

import { UserController } from './user.controller';

export class UsersRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.createRouter();
  }

  private createRouter() {
    this.router.post('/', UserController.addUser);
    this.router.put('/', UserController.updateUser);
    this.router.delete('/:userId', UserController.deleteUser);
  }
}

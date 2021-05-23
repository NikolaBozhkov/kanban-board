import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { usersMap } from './data-store';
import { User } from './data-types';

@Controller('api/users')
export class UserController {

  @Post()
  add(req: Request, res: Response) {
    if (req.body.firstName === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'First name is required' });
    } else if (req.body.lastName === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Last name is required' });
    }

    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const id = uuidv4();

    usersMap.set(id, { firstName, lastName, id });

    res.status(StatusCodes.CREATED).send(usersMap.get(id));
  }
}
import { Request, Response } from 'express';
import { Controller, Get, Post, Delete } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { listsMap, cardsMap } from './data-store';
import { createError } from './helpers';
import { getPopulatedLists } from '../shared/data-utils';

@Controller('api/lists')
export class ListController {
  
  @Post()
  add(req: Request, res: Response) {
    if (req.body.title === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('Title is required'));
    }

    const title = req.body.title as string;
    if (title == "") {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('Title cannot be empty'));
    }

    const id = uuidv4();

    listsMap.set(id, { title, id });

    res.status(StatusCodes.CREATED).json(listsMap.get(id));
  }

  @Delete()
  remove(req: Request, res: Response) {
    if (req.body.id === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('List id is required'));
    }

    const id = req.body.id as string;
    const didRemoveList = listsMap.delete(id);
    if (!didRemoveList) {
      return res.status(StatusCodes.NOT_FOUND).json(createError(`Cannot find list with the given id: ${id}`));
    }

    res.sendStatus(StatusCodes.NO_CONTENT);
  }

  @Get()
  getAll(req: Request, res: Response) {
    res.status(StatusCodes.OK).json([...listsMap.values()]);
  }

  @Get('populated')
  getAllPopulated(req: Request, res: Response) {
    const populatedLists = getPopulatedLists(listsMap, cardsMap);
    res.status(StatusCodes.OK).json(populatedLists);
  }
}
import { Request, Response } from 'express';
import { Controller, Get, Post, Delete, Put } from '@overnightjs/core';
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
      return this.errorResponseTitleRequired(res);
    }

    const title = req.body.title as string;
    if (title == '') {
      return this.errorResponseTitleEmpty(res);
    }

    const id = uuidv4();

    listsMap.set(id, { title, id });

    res.status(StatusCodes.CREATED).json(listsMap.get(id));
  }

  @Put()
  update(req: Request, res: Response) {
    if (req.body.id === undefined) {
      return this.errorResponseIdRequired(res);
    } else if (req.body.title === undefined) {
      return this.errorResponseTitleRequired(res);
    }

    const title = req.body.title as string;
    if (title == '') {
      return this.errorResponseTitleEmpty(res);
    }

    const id = req.body.id as string;
    const list = listsMap.get(id);
    if (list === undefined) {
      return this.errorResponseListNotFound(res, id);
    }

    list.title = title;

    return res.status(StatusCodes.OK).json(list);
  }

  @Delete()
  remove(req: Request, res: Response) {
    if (req.body.id === undefined) {
      return this.errorResponseIdRequired(res);
    }

    const id = req.body.id as string;
    const didRemoveList = listsMap.delete(id);
    if (!didRemoveList) {
      return this.errorResponseListNotFound(res, id);
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

  private errorResponseListNotFound(res: Response, id: string): Response {
    return res.status(StatusCodes.NOT_FOUND).json(createError(`Cannot find list with the given id: ${id}`));
  }

  private errorResponseIdRequired(res: Response): Response {
    return res.status(StatusCodes.BAD_REQUEST).json(createError('List id is required'));
  }

  private errorResponseTitleRequired(res: Response): Response {
    return res.status(StatusCodes.BAD_REQUEST).json(createError('Title is required'));
  }

  private errorResponseTitleEmpty(res: Response): Response {
    return res.status(StatusCodes.BAD_REQUEST).json(createError('Title cannot be empty'));
  }
}
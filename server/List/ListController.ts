import { NextFunction, Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Controller, Get, Post, Delete, Put, Middleware } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { listsMap, cardsMap } from '../data-store';
import { getPopulatedLists } from '../../shared/data-utils';
import { IList } from '../../shared/data-types';
import { TitleRecord, titleMiddleware, ListRecord, listByIdMiddleware } from './list-middleware';

@Controller('api/lists')
export class ListController {
  
  @Post()
  @Middleware(titleMiddleware)
  add(req: Request, res: Response<IList, TitleRecord>) {
    const title = res.locals.title;
    const id = uuidv4();

    listsMap.set(id, { title, id });

    res.status(StatusCodes.CREATED).json(listsMap.get(id));
  }

  @Put()
  @Middleware([titleMiddleware, listByIdMiddleware])
  update(req: Request, res: Response<IList, TitleRecord & ListRecord>) {
    const list = res.locals.list;
    const title = res.locals.title;
    list.title = title;

    res.status(StatusCodes.OK).json(list);
  }

  @Delete()
  @Middleware(listByIdMiddleware)
  remove(req: Request, res: Response<void, ListRecord>) {
    const id = res.locals.list.id;
    listsMap.delete(id);

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
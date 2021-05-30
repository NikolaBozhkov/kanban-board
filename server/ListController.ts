import { Request, Response } from 'express';
import { Controller, Get, Post, Delete, Put, Middleware } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { listsMap, cardsMap } from './data-store';
import { getPopulatedLists } from '../shared/data-utils';
import { IList } from '../shared/data-types';
import { TitleRecord, titleMiddlewareFactory, ListRecord, listByIdMiddlewareFactory } from './common-middleware';
import { badRequest } from './helpers';

@Controller('api/lists')
export class ListController {
  
  @Post()
  @Middleware(titleMiddlewareFactory())
  add(req: Request, res: Response<IList, TitleRecord>) {
    const title = res.locals.title;
    const id = uuidv4();

    listsMap.set(id, { title, id, position: listsMap.size });

    res.status(StatusCodes.CREATED).json(listsMap.get(id));
  }

  @Put()
  @Middleware([
    titleMiddlewareFactory(), 
    ...listByIdMiddlewareFactory('id')
  ])
  update(req: Request, res: Response<IList, TitleRecord & ListRecord>) {
    const list = res.locals.list;
    const title = res.locals.title;
    list.title = title;

    res.status(StatusCodes.OK).json(list);
  }

  @Delete()
  @Middleware(listByIdMiddlewareFactory('id'))
  delete(req: Request, res: Response<void, ListRecord>) {
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

  @Put('move')
  @Middleware(listByIdMiddlewareFactory('id'))
  move(req: Request, res: Response<any, ListRecord>) {
    if (req.body.targetPosition === undefined) {
      return badRequest(res, 'targetPosition is required');
    }

    const targetPosition = +req.body.targetPosition;
    if (isNaN(targetPosition)) {
      return badRequest(res, 'targetPosition must be a number');
    }

    if (targetPosition < 0 || targetPosition >= listsMap.size) {
      return badRequest(res, 'targetPosition is out of bounds');
    }

    const targetList = res.locals.list;

    listsMap.forEach((list) => {
      // Move each list between the list position and the target position by +/- 1
      if (targetPosition > targetList.position) {
        if (targetList.position < list.position && list.position <= targetPosition) {
          list.position -= 1;
        }
      } else {
        if (targetPosition <= list.position && list.position < targetList.position) {
          list.position += 1;
        }
      }
    });

    targetList.position = targetPosition;

    const lists = [...listsMap.values()];
    return res.status(StatusCodes.OK).json(lists);
  }
}
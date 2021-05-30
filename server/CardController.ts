import { Request, Response } from 'express';
import { Controller, Middleware, Post, Put } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { cardsMap, listsMap, createCard } from './data-store';
import { createError } from './helpers';
import { ActionType } from '../shared/data-types';
import { cardByIdMiddlewareFactory, CardRecord, listByIdMiddlewareFactory, ListRecord, titleMiddlewareFactory, TitleRecord } from './common-middleware';

// type CardUpdateFieldsRecord = Record<string, any> & Record<'title'?, string>;

@Controller('api/cards')
export class CardController {

  @Post()
  @Middleware([
    titleMiddlewareFactory(), 
    ...listByIdMiddlewareFactory('listId')
  ])
  add(req: Request, res: Response<any, TitleRecord & ListRecord>) {
    const title = res.locals.title;
    const list = res.locals.list;

    const card = createCard(title, list.id);

    card.history.push({ 
      userId: 'current user',
      description: `User added this card to ${list.title}`,
      type: ActionType.Add,
      date: new Date()
    });

    cardsMap.set(card.id, card);

    res.status(StatusCodes.CREATED).json(card);
  }

  @Put()
  @Middleware([
    titleMiddlewareFactory(true),
    ...cardByIdMiddlewareFactory('id')
  ])
  update(req: Request, res: Response<any, Partial<TitleRecord> & CardRecord>) {
    const card = res.locals.card;
    let modifiedProps: string[] = [];

    if (res.locals.title !== undefined) {
      card.title = res.locals.title;
      modifiedProps.push('title');
    }

    if (req.body.description !== undefined) {
      card.description = req.body.description as string;
      modifiedProps.push('description');
    }

    let modifiedPropsJoined: string;
    if (modifiedProps.length > 1) {
      const count = modifiedProps.length;
      modifiedPropsJoined = modifiedProps.slice(0, count - 1).join(', ').concat(` and ${ modifiedProps[count - 1]}`);
    } else {
      modifiedPropsJoined = modifiedProps[0];
    }

    card.history.push({
      userId: 'current user',
      description: `User modified ${modifiedPropsJoined}`,
      type: ActionType.Edit,
      date: new Date()
    });

    return res.status(StatusCodes.OK).json(card);
  }

  private errorResponseEmptyTitle(res: Response): Response {
    return res.status(StatusCodes.BAD_REQUEST).json(createError('Title cannot be empty'));
  }
}
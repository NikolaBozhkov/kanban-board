import { Request, Response } from 'express';
import { Controller, Delete, Middleware, Post, Put } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { cardsMap, createCard, listsMap } from './data-store';
import { getCards, getPopulatedLists } from '../shared/data-utils';
import { ActionType } from '../shared/data-types';
import { cardByIdMiddlewareFactory, CardRecord, listByIdMiddlewareFactory, ListRecord, targetPositionMiddleware, TargetPositionRecord, titleMiddlewareFactory, TitleRecord } from './common-middleware';
import { badRequest } from './helpers';

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
    
    const cards = getCards(cardsMap, list.id);
    cards.forEach(card => card.position += 1);
    const card = createCard(title, list.id, 0);

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
      card.description = (req.body.description as string).trim();
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

  @Delete()
  @Middleware(cardByIdMiddlewareFactory('id'))
  delete(req: Request, res: Response<any, CardRecord>) {
    const card = res.locals.card;
    cardsMap.delete(card.id);

    res.sendStatus(StatusCodes.NO_CONTENT);
  }

  @Put('move')
  @Middleware([
    targetPositionMiddleware,
    ...cardByIdMiddlewareFactory('id'),
    ...listByIdMiddlewareFactory('listId')
  ])
  move(req: Request, res: Response<any, TargetPositionRecord & ListRecord & CardRecord>) {
    const targetPosition = res.locals.targetPosition;
    const listTarget = res.locals.list;
    const targetCard = res.locals.card;

    const listCards = getCards(cardsMap, listTarget.id);
    if (targetPosition < 0 || targetPosition >= listCards.length) {
      return badRequest(res, 'targetPosition is out of bounds');
    }

    // A bit of copy pasting and not really smart solutions here, not a fan of doing things in a rush
    // Moving to different list
    if (targetCard.listId != listTarget.id) {
      listCards.forEach(card => {
        if (card.position >= targetPosition) {
          card.position += 1;
        }
      });
    } else {
      listCards.forEach(card => {
        // Move each list between the list position and the target position by +/- 1
        if (targetPosition > targetCard.position) {
          if (targetCard.position < card.position && card.position <= targetPosition) {
            card.position -= 1;
          }
        } else {
          if (targetPosition <= card.position && card.position < targetCard.position) {
            card.position += 1;
          }
        }
      });
    }

    targetCard.listId = listTarget.id;
    targetCard.position = targetPosition;

    return res.status(StatusCodes.OK).json(getPopulatedLists(listsMap, cardsMap));
  }
}
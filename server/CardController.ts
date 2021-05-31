import { Request, Response } from 'express';
import { Controller, Delete, Middleware, Post, Put } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { cardsMap, createCard, listsMap } from './data-store';
import { getCards, getPopulatedLists } from '../shared/data-utils';
import { ActionType, ICard, IEditAction, IMoveAction } from '../shared/data-types';
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

    let prevTitle: string | undefined;
    if (res.locals.title !== undefined) {
      prevTitle = card.title;
      card.title = res.locals.title;
      modifiedProps.push('title');
    }

    let prevDescription: string | undefined;
    if (req.body.description !== undefined) {
      prevDescription = card.description;
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

    const action: IEditAction = {
      userId: 'current user',
      description: `Modified ${modifiedPropsJoined}`,
      type: ActionType.Edit,
      date: new Date(),
      prevTitle,
      prevDescription
    };

    card.history.push(action);

    return res.status(StatusCodes.OK).json(card);
  }

  @Delete()
  @Middleware(cardByIdMiddlewareFactory('id'))
  delete(req: Request, res: Response<any, CardRecord>) {
    const card = res.locals.card;
    cardsMap.delete(card.id);

    const cards = getCards(cardsMap, card.listId);
    this.pullCardsUp(cards, card.position);

    res.status(StatusCodes.OK).json(getPopulatedLists(listsMap, cardsMap));
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
    if (targetPosition < 0 || targetPosition > listCards.length) {
      return badRequest(res, 'targetPosition is out of bounds');
    }

    const prevListId = targetCard.listId;
    const prevPosition = targetCard.position;

    this.moveCard(targetCard, listTarget.id, targetPosition);

    const moveAction: IMoveAction = {
      userId: 'current user',
      description: `Moved from ${listsMap.get(prevListId)?.title}(${prevPosition}) to ${listTarget.title}(${targetPosition})`,
      type: ActionType.Move,
      date: new Date(),
      prevListId,
      prevPosition
    };

    targetCard.history.push(moveAction);

    targetCard.listId = listTarget.id;
    targetCard.position = targetPosition;

    return res.status(StatusCodes.OK).json(getPopulatedLists(listsMap, cardsMap));
  }

  @Put('undo') 
  @Middleware(cardByIdMiddlewareFactory('id'))
  undo(req: Request, res: Response<any, CardRecord>) {
    const card = res.locals.card;

    // Can't undo creation
    if (card.history.length <= 1) {
      return res.status(StatusCodes.NOT_MODIFIED).json(card);
    }

    const lastAction = card.history.pop();

    if (lastAction?.type == ActionType.Edit) {
      const editAction = lastAction as IEditAction;

      if (editAction?.prevTitle) {
        card.title = editAction.prevTitle;
      }

      if (editAction?.prevDescription) {
        card.description = editAction.prevDescription;
      }
    } else if (lastAction?.type == ActionType.Move) {
      const moveAction = lastAction as IMoveAction;
      this.moveCard(card, moveAction.prevListId, moveAction.prevPosition);
    }

    return res.status(StatusCodes.OK).json(getPopulatedLists(listsMap, cardsMap));
  }

  private moveCards(cards: ICard[], currentPosition: number, targetPosition: number) {
    cards.forEach(card => {
      // Move each list between the list position and the target position by +/- 1
      if (targetPosition > currentPosition) {
        if (currentPosition < card.position && card.position <= targetPosition) {
          card.position -= 1;
        }
      } else {
        if (targetPosition <= card.position && card.position < currentPosition) {
          card.position += 1;
        }
      }
    });
  }

  private pullCardsUp(cards: ICard[], thresholdPosition: number) {
    cards.forEach(card => {
      if (card.position > thresholdPosition) {
        card.position -= 1;
      }
    });
  }

  private moveCard(targetCard: ICard, targetListId: string, targetPosition: number): boolean {
    if (!listsMap.has(targetListId) || !listsMap.has(targetCard.listId)) { return false; }

    const targetListCards = getCards(cardsMap, targetListId);
    const currentListCards = getCards(cardsMap, targetCard.listId);

    if (targetCard.listId != targetListId) {
      // Push each card in the target list down
      targetListCards.forEach(card => {
        if (card.position >= targetPosition) {
          card.position += 1;
        }
      });

      // Pull each card in the current list up
      this.pullCardsUp(currentListCards, targetCard.position);
    } else {
      this.moveCards(targetListCards, targetCard.position, targetPosition);
    }

    targetCard.listId = targetListId;

    // If the list changed and the position is out of bounds use the current length (last + 1)
    targetCard.position = Math.min(targetPosition, targetListCards.length);

    return true;
  }
}
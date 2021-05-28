import { Request, Response } from 'express';
import { Controller, Post, Put } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { cardsMap, listsMap, createCard } from './data-store';
import { createError } from './helpers';


@Controller('api/cards')
export class CardController {

  @Post()
  add(req: Request, res: Response) {
    if (req.body.title === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('Title is required'));
    } else if (req.body.listId === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('List id is required'));
    }

    const title = req.body.title as string;
    if (title == '') {
      return this.errorResponseEmptyTitle(res);
    }

    const listId = req.body.listId as string;
    if (!listsMap.has(listId)) {
      return res.status(StatusCodes.NOT_FOUND).json(createError('No list exists for the given id'));
    }

    const card = createCard(title, listId);
    cardsMap.set(card.id, card);

    res.status(StatusCodes.CREATED).json(card);
  }

  @Put()
  update(req: Request, res: Response) {
    if (req.body.id === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json(createError('Card id is required'));
    }

    const id = req.body.id as string;

    if (!cardsMap.has(id)) {
      return res.status(StatusCodes.NOT_FOUND).json(createError(`Cannot find card with the given id: ${id}`));
    }

    const card = cardsMap.get(id)!;

    if (req.body.title) {
      const title = req.body.title as string;
      if (title == '') {
        return this.errorResponseEmptyTitle(res);
      }
      
      card.title = title;
    }

    if (req.body.description) {
      card.description = req.body.description as string;
    }

    return res.status(StatusCodes.OK).json(card);
  }

  private errorResponseEmptyTitle(res: Response): Response {
    return res.status(StatusCodes.BAD_REQUEST).json(createError('Title cannot be empty'));
  }
}
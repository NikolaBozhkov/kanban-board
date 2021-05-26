import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { cardsMap, listsMap, createCard } from './data-store';


@Controller('api/cards')
export class CardController {

  @Post()
  add(req: Request, res: Response) {
    if (req.body.title === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title is required' });
    } else if (req.body.listId === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'List id is required' });
    }

    const title = req.body.title as string;
    if (title == '') {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title cannot be empty' });
    }

    const listId = req.body.listId as string;
    if (!listsMap.has(listId)) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'No list exists for the given id' });
    }

    const card = createCard(title, listId);
    cardsMap.set(card.id, card);

    res.status(StatusCodes.CREATED).json(card);
  }
}
import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { listsMap, cardsMap } from './data-store';

@Controller('api/lists')
export class ListController {
  
  @Post()
  add(req: Request, res: Response) {
    if (req.body.title === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Title is required' });
    }

    const title = req.body.title as string;
    const id = uuidv4();

    listsMap.set(id, { title, id });

    res.status(StatusCodes.CREATED).json(listsMap.get(id));
  }

  @Get()
  getAll(req: Request, res: Response) {
    res.status(StatusCodes.OK).json([...listsMap.values()]);
  }

  @Get('populated')
  getAllPopulated(req: Request, res: Response) {
    let populatedLists = [...listsMap.values()].map((list) => {
      const cards = [...cardsMap.values()].filter((card) => card.listId == list.id);
      return {
        ...list,
        cards
      };
    });

    res.status(StatusCodes.OK).json(populatedLists);
  }
}
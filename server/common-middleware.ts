import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ICard, IList } from '../shared/data-types';
import { cardsMap, listsMap } from './data-store';
import { badRequest, notFound } from './helpers';

type Opt = {
  title?: string;
}

export type TitleRecord = Record<string, any> & Record<'title', string>;

export function titleMiddlewareFactory(optional: boolean = false) {
  return (req: Request, res: Response<any, Partial<TitleRecord>>, next: NextFunction) => {
    if (req.body.title === undefined) {
      if (optional) {
        return next();
      } else {
        return badRequest(res, 'Title is required');
      }
    }
  
    const title = (req.body.title as string).trim();
    if (title == '') {
      return badRequest(res, 'Title cannot be empty');
    }
  
    res.locals.title = title;
    next();
  }
}

export type ListRecord = Record<string, any> & Record<'list', IList>;

export function listByIdMiddlewareFactory(bodyKey: 'id' | 'listId') {
  const mapRecordMiddleware = mapRecordMiddlewareFactory(bodyKey, listsMap);

  const listRecordMiddleware = (req: Request, res: Response<any, MapRecord & ListRecord>, next: NextFunction) => {
    res.locals.list = res.locals.record;
    next();
  }

  return [mapRecordMiddleware, listRecordMiddleware];
}

export type CardRecord = Record<string, any> & Record<'card', ICard>;

export function cardByIdMiddlewareFactory(bodyKey: 'id' | 'cardId') {
  const mapRecordMiddleware = mapRecordMiddlewareFactory(bodyKey, cardsMap);

  const cardRecordMiddleware = (req: Request, res: Response<any, MapRecord & CardRecord>, next: NextFunction) => {
    res.locals.card = res.locals.record;
    next();
  }

  return [mapRecordMiddleware, cardRecordMiddleware];
}

type MapRecord = Record<string, any> & Record<'record', any>;

function mapRecordMiddlewareFactory(bodyKey: string, map: Map<string, unknown>) {
  return (req: Request, res: Response<any, MapRecord>, next: NextFunction) => {
    if (req.body[bodyKey] === undefined) {
      return badRequest(res, `${bodyKey} is required`);
    }

    const id = req.body[bodyKey] as string;
    const record = map.get(id);
    if (record === undefined) {
      return notFound(res, `No record found for ${bodyKey}: ${id}`)
    }
    
    res.locals.record = record;
    next();
  }
}
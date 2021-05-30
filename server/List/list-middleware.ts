import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IList } from '../../shared/data-types';
import { listsMap } from '../data-store';
import { createError } from '../helpers';

export type TitleRecord = Record<string, any> & Record<'title', string>;

export function titleMiddleware(req: Request, res: Response<any, TitleRecord>, next: NextFunction) {
  if (req.body.title === undefined) {
    return errorResponseTitleRequired(res);
  }

  const title = (req.body.title as string).trim();
  if (title == '') {
    return errorResponseTitleEmpty(res);
  }

  res.locals.title = title;
  next();
}

export type ListRecord = Record<string, any> & Record<'list', IList>;

export function listByIdMiddleware(req: Request, res: Response<any, ListRecord>, next: NextFunction) {
  if (req.body.id === undefined) {
    return errorResponseIdRequired(res);
  }

  const id = req.body.id as string;
  const list = listsMap.get(id);
  if (list === undefined) {
    return errorResponseListNotFound(res, id);
  }

  res.locals.list = list;
  next();
}

function errorResponseListNotFound(res: Response, id: string): Response {
  return res.status(StatusCodes.NOT_FOUND).json(createError(`Cannot find list with the given id: ${id}`));
}

function errorResponseIdRequired(res: Response): Response {
  return res.status(StatusCodes.BAD_REQUEST).json(createError('List id is required'));
}

function errorResponseTitleRequired(res: Response): Response {
  return res.status(StatusCodes.BAD_REQUEST).json(createError('Title is required'));
}

function errorResponseTitleEmpty(res: Response): Response {
  return res.status(StatusCodes.BAD_REQUEST).json(createError('Title cannot be empty'));
}
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function createError(error: string): { error: string } {
  return { error }
}

export function badRequest(res: Response, error: string): Response {
  return errorResponse(res, StatusCodes.BAD_REQUEST, error);
}

export function notFound(res: Response, error: string): Response {
  return errorResponse(res, StatusCodes.NOT_FOUND, error);
}

export function errorResponse(res: Response, status: StatusCodes, error: string) {
  return res.status(status).json(createError(error));
}
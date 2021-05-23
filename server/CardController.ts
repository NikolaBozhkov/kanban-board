import { Request, Response } from 'express';
import { Controller } from '@overnightjs/core';
import { Card } from './data-types';

let cards: Card[] = [];

@Controller('api/cards')
export class CardController {
  
}
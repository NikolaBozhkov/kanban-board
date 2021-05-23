import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
import { User } from './data-types';

let users: User[] = [];

@Controller('api/users')
export class UserController {
}
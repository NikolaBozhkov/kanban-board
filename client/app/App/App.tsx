import React, { createContext } from 'react';
import { HttpClient } from '../../http/HttpClient';
import { Board } from '../Board';
import { BoardStore } from '../Board/BoardStore';
import { CardService, ICardService } from '../Card/CardService';
import { ListService, IListService } from '../List/ListService';

import './App.scss';

const httpClient = new HttpClient();

type Deps = {
  listService: IListService;
  cardService: ICardService;
  boardStore: BoardStore;
};

const deps: Deps = {
  listService: new ListService(httpClient),
  cardService: new CardService(httpClient),
  boardStore: new BoardStore()
};

export const DepsContext = createContext<Deps>(deps);

export function App(): JSX.Element {
  return (
    <DepsContext.Provider value={deps}>
      <Board />
    </DepsContext.Provider>
  );
}
import React, { createContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { HttpClient } from '../../http/HttpClient';
import { Board } from '../Board';
import { CardDetails } from '../CardDetails';
import { BoardStore } from '../store/BoardStore';
import { CardService, ICardService } from '../Card/CardService';
import { ListService, IListService } from '../List/ListService';

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
      <Router>
        <Board />
        <Switch>
          <Route path="/card/:id">
            <CardDetails />
          </Route>
        </Switch>
      </Router>
    </DepsContext.Provider>
  );
}
import { Action as ReduxAction, createStore } from 'redux';
import { IPopulatedList, IList, ICard } from '../../../shared/data-types';

enum Action {
  SetLists,
  AddList,
  RemoveList,
  AddCard
}

type SetListsAction = ReduxAction<Action> & {
  lists: IPopulatedList[]
};

function createSetListsAction(lists: IPopulatedList[]): SetListsAction {
  return { type: Action.SetLists, lists };
}

type AddListAction = ReduxAction<Action> & {
  list: IList
};

function createAddListAction(list: IList): AddListAction {
  return { type: Action.AddList, list };
}

type RemoveListAction = ReduxAction<Action> & {
  id: string
};

function createRemoveListAction(id: string): RemoveListAction {
  return { type: Action.RemoveList, id };
}

type AddCardAction = ReduxAction<Action> & {
  card: ICard
};

function createAddCardAction(card: ICard): AddCardAction {
  return { type: Action.AddCard, card };
}

type BoardState = {
  lists: IPopulatedList[]
}

function boardReducer(state: BoardState = { lists: [] }, action: ReduxAction<Action>): BoardState {
  switch (action.type) {
    case Action.SetLists: {
      const newLists = (action as SetListsAction).lists;
      return { lists: newLists };
    }
    case Action.AddList: {
      const newList = { ...(action as AddListAction).list, cards: [] };
      return { lists: [...state.lists, newList] };
    }
    case Action.RemoveList: {
      const id = (action as RemoveListAction).id;
      return { lists: state.lists.filter(l => l.id != id) };
    }
    case Action.AddCard: {
      const card = (action as AddCardAction).card;
      const newLists = state.lists.map(list => {
        if (list.id == card.listId) {
          return { ...list, cards: [card, ...list.cards] };
        }

        return list;
      });

      return { lists: newLists };
    }
    default:
      return state
  }
}

const store = createStore(boardReducer, { lists: [] });

export class BoardStore {
  subscribeToLists(callback: (lists: IPopulatedList[]) => void): void {
    store.subscribe(() => {
      callback(store.getState().lists);
    });
  }

  getLists(): IPopulatedList[] {
    return store.getState().lists;
  }

  setLists(lists: IPopulatedList[]): void {
    store.dispatch(createSetListsAction(lists));
  }

  addList(list: IList): void {
    store.dispatch(createAddListAction(list));
  }

  removeList(id: string): void {
    store.dispatch(createRemoveListAction(id));
  }

  addCard(card: ICard): void {
    store.dispatch(createAddCardAction(card));
  }
}
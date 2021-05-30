import { Action as ReduxAction, createStore, Unsubscribe } from 'redux';
import { Map } from 'immutable';
import { IPopulatedList, IList, ICard } from '../../../shared/data-types';
import { getPopulatedLists } from '../../../shared/data-utils';

enum Action {
  SetLists,
  AddList,
  UpdateList,
  RemoveList,
  AddCard,
  UpdateCard
}

// Set lists

type SetListsAction = ReduxAction<Action> & {
  lists: IPopulatedList[]
};

function createSetListsAction(lists: IPopulatedList[]): SetListsAction {
  return { type: Action.SetLists, lists };
}

// Add list

type ListAction = ReduxAction<Action> & {
  list: IList
};

function createAddListAction(list: IList): ListAction {
  return { type: Action.AddList, list };
}

// Update list

function createUpdateListAction(list: IList): ListAction {
  return { type: Action.UpdateList, list };
}

// Remove list

type RemoveListAction = ReduxAction<Action> & {
  id: string
};

function createRemoveListAction(id: string): RemoveListAction {
  return { type: Action.RemoveList, id };
}

// Add card

type CardAction = ReduxAction<Action> & {
  card: ICard
};

function createAddCardAction(card: ICard): CardAction {
  return { type: Action.AddCard, card };
}

// Update card

function createUpdateCardAction(card: ICard): CardAction {
  return { type: Action.UpdateCard, card };
}

type BoardState = {
  listsMap: Map<string, IList>;
  cardsMap: Map<string, ICard>;
  lists: IPopulatedList[];
}

const defaultState = { 
  listsMap: Map<string, IList>(), 
  cardsMap: Map<string, ICard>(), 
  lists: [] 
};

function boardReducer(state: BoardState = defaultState, action: ReduxAction<Action>): BoardState {
  function syncFromMaps(listsMap: Map<string, IList>, cardsMap: Map<string, ICard>): BoardState {
    const lists = getPopulatedLists(listsMap, cardsMap);
    return {
      listsMap,
      cardsMap,
      lists
    };
  }

  function syncFromPopulatedLists(lists: IPopulatedList[]): BoardState {
    const maps = lists.reduce((res, list) => {
      res.listsMap = res.listsMap.set(list.id, list as IList);
      list.cards.forEach(card => {
        res.cardsMap = res.cardsMap.set(card.id, card)
      });
      return res;
    }, { 
      listsMap: Map<string, IList>(), 
      cardsMap: Map<string, ICard>() 
    });

    return { ...maps, lists };
  }

  switch (action.type) {
    case Action.SetLists: {
      const lists = (action as SetListsAction).lists;
      return syncFromPopulatedLists(lists);
    }
    case Action.AddList:
    case Action.UpdateList: {
      const newList = (action as ListAction).list;
      const listsMap = state.listsMap.set(newList.id, newList);
      return syncFromMaps(listsMap, state.cardsMap);
    }
    case Action.RemoveList: {
      const id = (action as RemoveListAction).id;
      const lists = state.lists.filter(list => list.id != id);
      return syncFromPopulatedLists(lists);
    }
    case Action.AddCard:
    case Action.UpdateCard: {
      const card = (action as CardAction).card;
      const cardsMap = state.cardsMap.set(card.id, card);
      return syncFromMaps(state.listsMap, cardsMap);
    }
    default:
      return state
  }
}

const store = createStore(boardReducer, defaultState);

export class BoardStore {
  subscribeToLists(callback: (lists: IPopulatedList[]) => void): Unsubscribe {
    return store.subscribe(() => {
      callback(store.getState().lists);
    });
  }

  getLists(): IPopulatedList[] {
    return store.getState().lists;
  }

  getCardAndList(cardId: string): { card: ICard, list: IList } | undefined {
    const cardsWithList = this.getLists().reduce((res, list) => {
      const current = list.cards.map(card => { 
        return { card, list: list as IList };
      });
      return res.concat(current); 
    }, new Array<{ card: ICard, list: IList }>());

    return cardsWithList.find(elem => elem.card.id == cardId);
  }

  setLists(lists: IPopulatedList[]): void {
    store.dispatch(createSetListsAction(lists));
  }

  addList(list: IList): void {
    store.dispatch(createAddListAction(list));
  }

  updateList(list: IList): void {
    store.dispatch(createUpdateListAction(list));
  }

  removeList(id: string): void {
    store.dispatch(createRemoveListAction(id));
  }

  addCard(card: ICard): void {
    store.dispatch(createAddCardAction(card));
  }

  updateCard(card: ICard): void {
    store.dispatch(createUpdateCardAction(card));
  }
}
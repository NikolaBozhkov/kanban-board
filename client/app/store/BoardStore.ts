import { Action as ReduxAction, createStore, Unsubscribe } from 'redux';
import { Map } from 'immutable';
import { IPopulatedList, IList, ICard } from '../../../shared/data-types';
import { getCards, getPopulatedLists } from '../../../shared/data-utils';

enum Action {
  SetLists,
  UpdateLists,
  AddList,
  UpdateList,
  RemoveList,
  AddCard,
  UpdateCard,
  RemoveCard
}

// Set lists

type SetListsAction = ReduxAction<Action> & {
  lists: IPopulatedList[]
};

function createSetListsAction(lists: IPopulatedList[]): SetListsAction {
  return { type: Action.SetLists, lists };
}

// Set lists

type UpdateListsAction = ReduxAction<Action> & {
  lists: IList[]
};

function createUpdateListsAction(lists: IList[]): UpdateListsAction {
  return { type: Action.UpdateLists, lists };
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

type IdAction = ReduxAction<Action> & {
  id: string
};

function createRemoveListAction(id: string): IdAction {
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

// Remove card

function createRemoveCardAction(id: string): IdAction {
  return { type: Action.RemoveCard, id };
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
    const lists = getPopulatedLists(listsMap, cardsMap).sort((a, b) => a.position - b.position);
    lists.forEach(list => list.cards.sort((a, b) => a.position - b.position));
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

    const sortedLists = lists.sort((a, b) => a.position - b.position);
    sortedLists.forEach(list => list.cards.sort((a, b) => a.position - b.position));

    return { ...maps, lists: sortedLists };
  }

  switch (action.type) {
    case Action.SetLists: {
      const lists = (action as SetListsAction).lists;
      return syncFromPopulatedLists(lists);
    }
    case Action.UpdateLists: {
      const lists = (action as UpdateListsAction).lists;
      let listsMap = state.listsMap.clear();
      lists.forEach(list => {
        listsMap = listsMap.set(list.id, list);
      });

      return syncFromMaps(listsMap, state.cardsMap);
    }
    case Action.AddList:
    case Action.UpdateList: {
      const newList = (action as ListAction).list;
      const listsMap = state.listsMap.set(newList.id, newList);
      return syncFromMaps(listsMap, state.cardsMap);
    }
    case Action.RemoveList: {
      const id = (action as IdAction).id;
      const listsMap = state.listsMap.delete(id);
      return syncFromMaps(listsMap, state.cardsMap);
    }
    case Action.AddCard: {
      const addedCard = (action as CardAction).card;

      let cardsMap = state.cardsMap.reduce((res, card) => {
        if (card.listId == addedCard.listId) {
          card.position += 1;
        }

        return res;
      }, state.cardsMap);

      cardsMap = cardsMap.set(addedCard.id, addedCard);

      return syncFromMaps(state.listsMap, cardsMap);
    }
    case Action.UpdateCard: {
      const card = (action as CardAction).card;
      const cardsMap = state.cardsMap.set(card.id, card);
      return syncFromMaps(state.listsMap, cardsMap);
    }
    case Action.RemoveCard: {
      const id = (action as IdAction).id;
      const cardsMap = state.cardsMap.delete(id);
      return syncFromMaps(state.listsMap, cardsMap);
    }
    default:
      return state
  }
}

const store = createStore(boardReducer, defaultState);

export class BoardStore {
  subscribeToPopulatedLists(callback: (lists: IPopulatedList[]) => void): Unsubscribe {
    return store.subscribe(() => {
      callback(this.getPopulatedLists());
    });
  }

  subscribeToLists(callback: (lists: IList[]) => void): Unsubscribe {
    return store.subscribe(() => {
      callback(this.getLists());
    });
  }

  getPopulatedLists(): IPopulatedList[] {
    return store.getState().lists;
  }

  getLists(): IList[] {
    return Array.from(store.getState().listsMap.values());
  }

  getCardAndList(cardId: string): { card: ICard, list: IList } | undefined {
    const cardsWithList = this.getPopulatedLists().reduce((res, list) => {
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

  updateLists(lists: IList[]): void {
    store.dispatch(createUpdateListsAction(lists));
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

  removeCard(id: string): void {
    store.dispatch(createRemoveCardAction(id));
  }
}
import Immutable from 'immutable';
import { ICard, IList, IPopulatedList } from "./data-types";

export function getPopulatedLists(
  listsMap: Map<string, IList> | Immutable.Map<string, IList>,
  cardsMap: Map<string, ICard> | Immutable.Map<string, ICard>): IPopulatedList[] {
    
  const populatedLists = Array.from(listsMap.values()).map((list) => {
    const cards = Array.from(cardsMap.values()).filter((card) => card.listId == list.id);
    return {
      ...list,
      cards
    };
  });

  return populatedLists;
}
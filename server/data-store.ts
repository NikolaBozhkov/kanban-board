import { ICard, IList, IUser } from '../shared/data-types';
import { v4 as uuidv4 } from 'uuid';

export let cardsMap = new Map<string, ICard>();
export let listsMap = new Map<string, IList>();
export let usersMap = new Map<string, IUser>();

const defaultListTitles = ['To do', 'In progress', 'Done'];
const defaultLists: IList[] = defaultListTitles.map((title) => { 
  return { 
    title, 
    id: uuidv4()
  };
});

defaultLists.forEach((list) => listsMap.set(list.id, list));
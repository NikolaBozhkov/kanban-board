import { ICard, IList, IUser } from '../shared/data-types';
import { v4 as uuidv4 } from 'uuid';

export let cardsMap = new Map<string, ICard>();
export let listsMap = new Map<string, IList>();
export let usersMap = new Map<string, IUser>();

export function createCard(title: string, listId: string): ICard {
  return {
    id: uuidv4(),
    title,
    description: '',
    history: [],
    listId
  }
}

const defaultListTitles = ['To do', 'In progress', 'Done'];
const defaultLists: IList[] = defaultListTitles.map((title) => { 
  return { 
    title, 
    id: uuidv4()
  };
});

defaultLists.forEach((list) => listsMap.set(list.id, list));

for (let i = 0; i < 3; i++) {
  const id = uuidv4();

  let listId: string;
  if (i < 2) {
    listId = [...listsMap.keys()][0];
  } else {
    listId = [...listsMap.keys()][1];
  }

  const card: ICard = { 
    id,
    title: 'Example card ' + i,
    description: 'Description of example card ' + i,
    history: [],
    listId
  };
  cardsMap.set(id, card);
}
export interface Card {
  title: string;
  description: string;
  history: Action[];
  id: string;
  listId: string;
}

export interface List {
  title: string;
  id: string;
}

export interface Action {
  user: User;
  description: string;
}

export interface User {
  firstName: string;
  lastName: string;
  id: string;
}
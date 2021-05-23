export interface ICard {
  title: string;
  description: string;
  history: IAction[];
  id: string;
  listId: string;
}

export interface IList {
  title: string;
  id: string;
}

export interface IAction {
  userId: string;
  description: string;
}

export interface IUser {
  firstName: string;
  lastName: string;
  id: string;
}
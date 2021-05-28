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

export interface IPopulatedList extends IList {
  cards: ICard[];
}

export enum ActionType {
  Edit,
  Add,
  Move
}

export interface IAction {
  userId: string;
  description: string;
  type: ActionType;
  date: Date;
}

export interface IUser {
  firstName: string;
  lastName: string;
  id: string;
}
export interface ICard {
  title: string;
  description: string;
  history: IAction[];
  id: string;
  listId: string;
  position: number;
}

export interface IList {
  title: string;
  id: string;
  position: number;
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

export interface IEditAction extends IAction {
  prevTitle?: string;
  prevDescription?: string;
}

export interface IMoveAction extends IAction {
  prevPosition: number;
  prevListId: string;
}

export interface IUser {
  firstName: string;
  lastName: string;
  id: string;
}
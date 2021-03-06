import { ICard, IPopulatedList } from "../../../shared/data-types";
import { HttpClient } from "../../http/HttpClient";

export interface ICardService {
  add(title: string, listId: string): Promise<ICard>;
  update(id: string, fields: { title?: string, description?:string }): Promise<ICard>;
  delete(id: string): Promise<IPopulatedList[]>;
  move(id: string, listId: string, targetPosition: number): Promise<IPopulatedList[]>;
  undo(id: string): Promise<IPopulatedList[]>;
}

export class CardService implements ICardService {
  constructor(private http: HttpClient) {
  }

  add(title: string, listId: string): Promise<ICard> {
    return this.http.post('cards', { title, listId });
  }

  update(id: string, fields: { title?: string, description?:string }): Promise<ICard> {
    return this.http.put('cards', { id, ...fields });
  }

  delete(id: string): Promise<IPopulatedList[]> {
    return this.http.delete('cards', { id });
  }

  move(id: string, listId: string, targetPosition: number): Promise<IPopulatedList[]> {
    return this.http.put('cards/move', { listId, id, targetPosition });
  }

  undo(id: string): Promise<IPopulatedList[]> {
    return this.http.put('cards/undo', { id });
  }
}
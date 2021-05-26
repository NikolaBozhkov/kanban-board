import { ICard } from "../../../shared/data-types";
import { HttpClient } from "../../http/HttpClient";

export interface ICardService {
  add(title: string, listId: string): Promise<ICard>;
}

export class CardService implements ICardService {
  constructor(private http: HttpClient) {
  }

  add(title: string, listId: string): Promise<ICard> {
    return this.http.post('cards', { title, listId });
  }
}
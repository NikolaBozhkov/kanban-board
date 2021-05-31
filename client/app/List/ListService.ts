import { IList, IPopulatedList } from '../../../shared/data-types';
import { HttpClient } from '../../http/HttpClient';

export interface IListService {
  getAll(): Promise<IList[]>;
  getAllPopulated(): Promise<IPopulatedList[]>;
  add(title: string): Promise<IList>;
  delete(id: string): Promise<IList[]>;
  update(id: string, title: string): Promise<IList>;
  move(id: string, targetPosition: number): Promise<IList[]>;
}

export class ListService implements IListService {
  constructor(private http: HttpClient) {
  }

  async getAllPopulated(): Promise<IPopulatedList[]> {
    return this.http.get<IPopulatedList[]>('lists/populated');
  }

  async getAll(): Promise<IList[]> {
    return this.http.get<IList[]>('lists');
  }

  async add(title: string): Promise<IList> {
    return this.http.post<IList>('lists', { title });
  }

  async delete(id: string): Promise<IList[]> {
    return this.http.delete('lists', { id });
  }

  async update(id: string, title: string): Promise<IList> {
    return this.http.put('lists', { id, title });
  }

  async move(id: string, targetPosition: number): Promise<IList[]> {
    return this.http.put('lists/move', { id, targetPosition });
  }
}
import { IList } from '../../../shared/data-types';

export interface IListService {
  add: (title: string) => Promise<IList>
}
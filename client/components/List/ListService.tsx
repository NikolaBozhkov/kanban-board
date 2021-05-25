import { useState, useEffect } from 'react';

import { IList } from '../../../shared/data-types';
import { HttpClient } from '../../http/HttpClient';
import { IListService } from './IListService';

export class ListService implements IListService {
  constructor(private http: HttpClient) {
  }

  async getAll(): Promise<IList[]> {
    return this.http.get<IList[]>('lists');
  }

  async add(title: string): Promise<IList> {
    return this.http.post<IList>('lists', { title });
  }

  async delete(id: string): Promise<void> {
    return this.http.voidDelete('lists', { id });
  }
}

// export function useFetch(url: string, options?: RequestInit) {
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(url, options);
//         const json = await res.json();
//         setResponse(res);
//       } catch (error) {
//         setError(error);
//       }
//     };

//     fetchData();
//   }, []);

//   return { response, error };
// }
export interface IHttpClient {
  get<T>(apiUrl: string, body?: any): Promise<T>;
  post<T>(apiUrl: string, body: any): Promise<T>;
  put<T>(apiUrl: string, body: any): Promise<T>;
  delete<T>(apiUrl: string, body: any): Promise<T>;
}
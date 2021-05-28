export interface IHttpClient {
  get<T>(apiUrl: string, body?: unknown): Promise<T>;
  post<T>(apiUrl: string, body: unknown): Promise<T>;
  put<T>(apiUrl: string, body: unknown): Promise<T>;
  delete<T>(apiUrl: string, body: unknown): Promise<T>;
}
type ResponseError = {
  error: string
};

export class HttpClient {
  async get<T>(apiUrl: string): Promise<T> {
    return this.genericRequest<T>(apiUrl, 'GET');
  }

  async post<T>(apiUrl: string, body: unknown): Promise<T> {
    return this.genericRequest<T>(apiUrl, 'POST', body);
  }

  async put<T>(apiUrl: string, body: unknown): Promise<T> {
    return this.genericRequest<T>(apiUrl, 'POST', body);
  }

  async delete<T>(apiUrl: string, body: unknown): Promise<T> {
    return this.genericRequest<T>(apiUrl, 'DELETE', body);
  }

  async voidDelete(apiUrl: string, body: unknown): Promise<void> {
    return this.voidRequest(apiUrl, 'DELETE', body);
  }

  private async genericRequest<T>(apiUrl: string, method: string, body?: unknown): Promise<T> {
    return this.request<T>((res) => {
      return this.parseResponseJson<T>(res);
    }, apiUrl, method, body);
  }

  private async voidRequest(apiUrl: string, method: string, body?: unknown): Promise<void> {
    return this.request(() => {
      return Promise.resolve();
    }, apiUrl, method, body);
  }

  private async request<T>(okHandler: (res: Response) => Promise<T>, apiUrl: string, method: string, body?: unknown): Promise<T> {
    const options: RequestInit = {
      method
    };

    if (body) {
      options.headers = {
        'Content-Type': 'application/json'
      };

      options.body = JSON.stringify(body);
    }

    const res = await fetch('http://localhost:3000/api/' + apiUrl, options);

    if (res.ok) {
      return okHandler(res);
    } else {
      try {
        const err = await this.parseResponseJson<ResponseError>(res);
        if (err) {
          return Promise.reject(err.error);
        } else {
          return Promise.reject(res);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  private async parseResponseJson<T>(res: Response): Promise<T> {
    try {
      const text = await res.text();
      if (text.length != 0) {
        const json = JSON.parse(text);
        const data = json as T;
        if (data) {
          return Promise.resolve(data);
        } else {
          return Promise.reject(`Response returned with status ${res.status}(${res.statusText}) but the json couldn't be parsed to the generic type`);
        }
      } else {
        return Promise.reject('No response body');
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
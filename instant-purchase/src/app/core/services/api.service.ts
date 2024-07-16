import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';

interface Paging {
  limit: number;
  offset: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class APIService {
  constructor(protected http: HttpClient) {}

  public call<T>(
    method: string,
    url: string,
    rawParams?:
      | {
          [param: string]:
            | string
            | number
            | boolean
            | readonly (string | number | boolean)[];
        }
      | null
      | Record<string, unknown>
      | FormData,
    options?: Record<
      string,
      string | number | T | HttpParams | object | boolean
    >,
    withPaging?: boolean
  ): Observable<T> {
    url = url.startsWith('http') ? url : `${environment.api_prefix}${url}`;
    options = options || {};

    return Observable.create(
      (observer: {
        next: (arg0: {
          result?: Record<string, object>;
          paging?: Paging;
        }) => void;
        complete: () => void;
        error: (arg0: HttpErrorResponse) => void;
      }) => {
        // eslint-disable-next-line
        let request: Observable<any>;
        switch (method) {
          case 'post':
            request = this.http.post(url, rawParams, options);
            break;
          case 'put':
            request = this.http.put(url, rawParams, options);
            break;
          case 'patch':
            request = this.http.patch(url, rawParams, options);
            break;
          case 'get':
            if (rawParams != null) {
              options = options || {};
              options['params'] = new HttpParams({
                fromObject: rawParams as {
                  [param: string]:
                    | string
                    | number
                    | boolean
                    | readonly (string | number | boolean)[];
                },
              });
            }
            request = this.http.get(url, options);
            break;
          case 'head':
            request = this.http.head(url);
            break;
          case 'delete':
            request = this.http.delete(url, options);
            break;
          default:
            request = this.http.get(url, options);
            break;
        }

        request.subscribe({
          next: (data: {
            result: Record<string, object>;
            results: Record<string, object>;
            paging?: Paging;
          }) => {
            if (withPaging) {
              observer.next(
                data && {
                  result: data.result || data.results,
                  paging: data.paging,
                }
              );
              observer.complete();
            } else {
              const hasResult = data && Object.keys(data).includes('result');
              observer.next(
                data && (hasResult ? data.result : data.results || data)
              );
              observer.complete();
            }
          },
          error: (err: HttpErrorResponse) => observer.error(err),
        });
      }
    );
  }

  public get = <T>(
    url: string,
    options?: Record<
      string,
      string | number | boolean | T | HttpParams | object
    >,
    withPaging?: boolean
  ): Observable<T> => this.call('get', url, null, options, withPaging);
  public post = <T>(
    url: string,
    body?:
      | {
          [param: string]:
            | string
            | number
            | boolean
            | readonly (string | number | boolean)[];
        }
      | null
      | Record<string, unknown>
      | FormData,
    options?: Record<
      string,
      string | number | boolean | T | HttpParams | object
    >
  ): Observable<T> => this.call<T>('post', url, body, options);
  public put = <T>(
    url: string,
    body?: {
      [param: string]:
        | string
        | number
        | boolean
        | readonly (string | number | boolean)[];
    } | null,
    options?: Record<
      string,
      string | number | boolean | T | HttpParams | object
    >
  ): Observable<T> => this.call<T>('put', url, body, options);
  public patch = <T>(
    url: string,
    body?:
      | {
          [param: string]:
            | T
            | string
            | number
            | boolean
            | readonly (string | number | boolean)[];
        }
      | null
      | Record<string, string | number | boolean | T | HttpParams | object>,
    options?: Record<
      string,
      string | number | boolean | T | HttpParams | object
    >
  ): Observable<T> => this.call<T>('patch', url, body, options);
  public head = <T>(url: string): Observable<T> => this.call<T>('head', url);
  public delete = <T>(
    url: string,
    options?: Record<
      string,
      string | number | boolean | T | HttpParams | object
    >
  ): Observable<T> => this.call<T>('delete', url, null, options);
}

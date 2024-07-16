import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export type ServerErrorResponse = HttpErrorResponse & {
  error: { error: { code: number } };
};

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  getClientMessage(error: Error) {
    return error.message;
  }

  getServerMessage(error: HttpErrorResponse) {
    return error.error?.error
      ? `${error.error.error.code}: ${error.error.error.message}`
      : error.message;
  }
}

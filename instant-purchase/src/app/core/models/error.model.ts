import { ErrorCodes } from '@shared/constants';

export interface CustomError {
  error: {
    error: {
      code: ErrorCodes;
      message: string;
    };
  };
}

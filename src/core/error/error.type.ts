export enum ErrorKey {
  INTERNAL = 'INTERNAL',
  UNAUTHORIZED = 'UNAUTHORIZED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  PASSWORD_NOT_MATCH = 'PASSWORD_NOT_MATCH',
  SEAT_EXISTS = 'SEAT_EXISTS',
}

export type TErrorResponse = {
  success: false;
  message: string;
  error_key: ErrorKey;
};

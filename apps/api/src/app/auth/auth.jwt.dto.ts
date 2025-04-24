import { Request } from 'express';

interface ExtraClaims {
  'x-app-allowed-roles': string[];
  'x-app-default-role': string;
  'x-app-user-id': string;
}

interface Extra {
  claims: ExtraClaims;
}

export interface JwtPayload {
  uid: string;
  iss: string;
  exp: number;
  extra: Extra;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export type AppRequest = Request;

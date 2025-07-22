import { Request } from 'express';

interface ExtraClaims {
  'x-app-allowed-roles': string[];
  'x-app-default-role': string;
  'x-app-user-id': string;
}

export class Extra {
  claims: ExtraClaims;
}

export class JwtPayload {
  uid: string;
  iss: string;
  exp: number;
  type: string;
  extra: Extra;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export type AppRequest = Request;

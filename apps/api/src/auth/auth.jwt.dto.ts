import { Request } from 'express';

export class ExtraClaims {
  'allowed_roles': string[];
  'default_role': string;
  'user_id': string;
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

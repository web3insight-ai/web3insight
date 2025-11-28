import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequestWithUser } from '@/auth/auth.jwt.dto';
import { Reflector } from '@nestjs/core';

export enum AuthRole {
  OPTIONAL = 'optional',
  User = 'user',
}

export const AUTH_ROLES_KEY = 'roles';
export const AuthRoles = (role: AuthRole) => SetMetadata(AUTH_ROLES_KEY, role);

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const role = this.reflector.get<AuthRole>(
      AUTH_ROLES_KEY,
      context.getHandler(),
    );

    const token = this.getJwtFromHeader(request);

    if (!token) {
      if (role === AuthRole.OPTIONAL) {
        return true;
      }
      throw new UnauthorizedException();
    }

    try {
      const jwtPayload = await this.verifyToken(token);
      request.user = jwtPayload;
      if (Number(jwtPayload.uid) < 181256 && Number(jwtPayload.uid) != 1) {
        throw new UnauthorizedException();
      }
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private getJwtFromHeader(request: RequestWithUser): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith('Bearer ') && authHeader.length > 7) {
      return authHeader.slice(7);
    }

    return null;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}

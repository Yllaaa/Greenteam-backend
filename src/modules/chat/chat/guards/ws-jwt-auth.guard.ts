import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtPayload, verify } from 'jsonwebtoken';
import { DrizzleService } from 'src/modules/db/drizzle.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly drizzleService: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const authHeader = client.handshake?.headers?.authorization;
    const authQuery = client.handshake?.query?.token as string;
    const authAuth = client.handshake?.auth?.token;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authQuery || authAuth;

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    if (!process.env.JWT_SECRET) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;

      client.data.user = decoded;

      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

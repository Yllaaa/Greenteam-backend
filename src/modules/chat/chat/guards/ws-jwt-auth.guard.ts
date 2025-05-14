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
      throw new UnauthorizedException('chat.chat.errors.MISSING_AUTH_TOKEN');
    }

    if (!process.env.JWT_SECRET) {
      throw new UnauthorizedException('chat.chat.errors.JWT_NOT_CONFIGURED');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;

      client.data.user = decoded;

      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error);
      throw new UnauthorizedException('chat.chat.errors.INVALID_OR_EXPIRED_TOKEN');
    }
  }
}

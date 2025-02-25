import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtPayload, verify } from 'jsonwebtoken';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { users } from 'src/modules/db/schemas/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly drizzleService: DrizzleService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const authHeader = client.handshake?.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.split(' ')[1];
    try {
      if (!process.env.JWT_SECRET) {
        throw new UnauthorizedException('JWT secret is not defined');
      }
      const decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;

      client.data.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

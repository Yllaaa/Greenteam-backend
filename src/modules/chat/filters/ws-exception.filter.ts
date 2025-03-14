import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class AllExceptionsSocketFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    const error = this.isWsException(exception)
      ? exception
      : new WsException('Internal server error');

    const message = this.getErrorMessage(error);

    const errorResponse = {
      event: 'error',
      data: {
        id: client.id,
        message: message,
        status: 'error',
      },
    };

    client.emit('exception', errorResponse);

    console.error('WebSocket Error:', {
      clientId: client.id,
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (this.isAuthenticationError(message)) {
      client.disconnect(true);
    }
  }

  private isWsException(exception: unknown): exception is WsException {
    return exception instanceof WsException;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        return error;
      } else if (typeof error === 'object' && 'message' in error) {
        return error.message as string;
      }
    }
    return 'Internal server error';
  }

  private isAuthenticationError(message: string): boolean {
    return (
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('auth token not provided')
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Injectable()
@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const lang =
      request.query.lang ||
      request.headers['x-custom-lang'] ||
      request.headers['accept-language'] ||
      'en';

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errorObj = exceptionResponse as Record<string, any>;

      if (Array.isArray(errorObj.message)) {
        try {
          const translatedMessages = await Promise.all(
            errorObj.message.map(async (msg: string) => {
              try {
                return await this.i18n.translate(msg, { lang });
              } catch (err) {
                console.log(`Translation failed for key: ${msg}`, err);
                return msg;
              }
            }),
          );
          errorObj.message = translatedMessages;
        } catch (err) {
          console.log(`Translation failed for array of messages`, err);
        }
      } else if (errorObj.message && typeof errorObj.message === 'string') {
        try {
          errorObj.message = await this.i18n.translate(errorObj.message, {
            lang,
          });
        } catch (err) {
          console.log(`Translation failed for key: ${errorObj.message}`, err);
        }
      }

      return response.status(status).json(errorObj);
    } else if (typeof exceptionResponse === 'string') {
      let translatedMessage = exceptionResponse;
      try {
        translatedMessage = await this.i18n.translate(exceptionResponse, {
          lang,
        });
      } catch (err) {
        console.log(`Translation failed for key: ${exceptionResponse}`, err);
      }

      return response.status(status).json({
        statusCode: status,
        message: translatedMessage,
        error: exception.name,
      });
    }

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}

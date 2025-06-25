// i18n-response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang =
      request.query.lang ||
      request.headers['x-custom-lang'] ||
      request.headers['accept-language'] ||
      'en';

    return next.handle().pipe(
      map(async (data) => {
        if (data?.message && typeof data.message === 'string') {
          try {
            data.message = await this.i18n.translate(data.message, { lang });
          } catch (e) {
            console.log(`Failed to translate key: ${data.message}`, e);
          }
        }
        return data;
      }),
    );
  }
}

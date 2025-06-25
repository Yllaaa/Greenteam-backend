import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nHelperService {
  constructor(private readonly i18n: I18nService) {}

  async translate(key: string, lang: string = 'en'): Promise<string> {
    try {
      return await this.i18n.translate(key, { lang });
    } catch (error) {
      return key;
    }
  }

  async error(
    module: string,
    errorKey: string,
    lang: string = 'en',
  ): Promise<string> {
    return this.translate(`${module}.errors.${errorKey}`, lang);
  }

  async notification(
    module: string,
    notificationKey: string,
    lang: string = 'en',
  ): Promise<string> {
    return this.translate(`${module}.notifications.${notificationKey}`, lang);
  }
}

import { IsIn } from 'class-validator';

export class UpdateLanguagePreferenceDto {
  @IsIn(['en', 'es'])
  languagePreference: 'en' | 'es';
}

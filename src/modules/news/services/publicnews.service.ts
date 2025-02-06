import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PublicNewsResponseInterface } from '../interfaces/public-news-response.interface';

@Injectable()
export class PublicNewsService {
  api_key: string;

  constructor(private readonly httpService: HttpService) {
    this.api_key = process.env.PUBLIC_NEWS_API_KEY || '';
  }

  async fetchNews(q: string, from: Date): Promise<PublicNewsResponseInterface> {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('from', from.toISOString().split('T')[0]);
    params.append('sortBy', 'popularity');
    params.append('apiKey', this.api_key);
    const baseURL = 'https://newsapi.org/v2/everything';
    const url = `${baseURL}?${params.toString()}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data =
        typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;
      return data as PublicNewsResponseInterface; // Handle the response data
    } catch (error) {
      throw error; // Handle error
    }
  }
}

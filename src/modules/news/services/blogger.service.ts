import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BloggerBlogResponseInterface, BloggerPostResponseInterface } from '../interfaces/blogger-response.interface';

@Injectable()
export class BloggerService {
    api_key: string;

    constructor(private readonly httpService: HttpService) {
        this.api_key = process.env.BLOGGER_API_KEY || '';
    }

    async fetchPost(blogId: number): Promise<BloggerPostResponseInterface> {
        const baseURL = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`;
        const url = `${baseURL}?key=${this.api_key}`;

        try {
            const response = await firstValueFrom(this.httpService.get(url));
            const data =
                typeof response.data === 'string'
                    ? JSON.parse(response.data)
                    : response.data;
            return data as BloggerPostResponseInterface; // Handle the response data
        } catch (error) {
            throw error; // Handle error
        }
    }


    async fetchPlog(blogURL: string): Promise<BloggerBlogResponseInterface> {
        const params = new URLSearchParams();
        params.append('url', blogURL);
        params.append('key', this.api_key);
        const baseURL = 'https://www.googleapis.com/blogger/v3/blogs/byurl';
        const url = `${baseURL}?${params.toString()}`;
        try {
            const response = await firstValueFrom(this.httpService.get(url));
            const data =
                typeof response.data === 'string'
                    ? JSON.parse(response.data)
                    : response.data;
            return data as BloggerBlogResponseInterface; // Handle the response data
        } catch (error) {
            throw error; // Handle error
        }
    }
}

export interface PublicNewsResponseInterface {
    articles: [
        {
            source: {
                name: string;
            };
            author: string;
            title: string;
            description: string;
            url: string;
            urlToImage: string;
            publishedAt: string;
            content: string;
        },
    ];
}

export interface BloggerBlogResponseInterface {
    id: number,
    name: string,
    description: string,
    published: string,
    updated: string,
    url: string,
}

export interface BloggerPostResponseInterface {
    items: [
        {
            id: number,
            blog: {
                id: number
            },
            published: string,
            updated: string,
            url: string,
            selfLink: string,
            title: string,
            content: string,
            author: {
                id: number,
                displayName: string,
                url: string,
                image: {
                    url: string
                }
            }
        }
    ]
}
type ErrorMessage = {
    message: string
}

type AuthMessage = {
    token: string
}
export async function login(username: string, password: string): Promise<string> {
    return fetch("http://localhost:7070/auth", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "login": username,
            "password": password
        })
    }).then(async r => {
        if (!r.ok) {
            if (r.status != 401) {
                throw new Error(((await r.json()) as ErrorMessage).message);
            } else {
                throw new Error(r.statusText);
            }
        } else {
            return ((await r.json()) as AuthMessage).token;
        }
    })
}

export type UserInfo = {
    id: string,
    login: string,
    name: string,
    avatar: string,
}
export async function getUserInfo(token: string): Promise<UserInfo> {
    return fetch("http://localhost:7070/private/me", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    }).then(async r => {
        if (!r.ok) {
            if (r.status != 401) {
                throw new Error(((await r.json()) as ErrorMessage).message);
            } else {
                throw new Error(r.statusText);
            }
        } else {
            return ((await r.json()) as UserInfo);
        }
    })
}

export type News = {
    id: string,
    title: string,
    image: string,
    content: string,
}

export async function getNews(token: string): Promise<News[]> {
    return fetch("http://localhost:7070/private/news", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    }).then(async r => {
        if (!r.ok) {
            if (r.status != 401) {
                throw new Error(((await r.json()) as ErrorMessage).message);
            } else {
                throw new Error(r.statusText);
            }
        } else {
            return ((await r.json()) as News[]);
        }
    })
}
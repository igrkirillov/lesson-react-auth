import {createContext, Dispatch, FormEvent, SetStateAction, useContext, useEffect, useState, MouseEvent} from 'react'
import './App.css'
import {getNews, getUserInfo, login, News, UserInfo} from "./serverApi";

type Auth = {
    token: string | null,
    profile: UserInfo | null,
    setToken?: Dispatch<SetStateAction<string|null>>,
    setProfile?: Dispatch<SetStateAction<UserInfo|null>>
}

const AuthContext = createContext({token: null, profile: null} as Auth);

function App() {
    const [token, setToken] = useState(getTokenFromStorage());
    const [profile, setProfile] = useState(getProfileFromStorage());
    const onLogin = (username: string, password: string): Promise<UserInfo> => {
        return login(username, password)
            .then(token => {
                setToken(token);
                saveTokenToStorage(token);
                return token;
            })
            .then(getUserInfo)
            .then(userInfo => {
                setProfile(userInfo);
                saveProfileToStorage(userInfo);
                return userInfo;
            })
    }
    const onLogout = () => {
        setToken(null);
        setProfile(null);
        clearAuthFromStorage();
    }
    return (
        <AuthContext.Provider value={{token, setToken, profile, setProfile}}>
            <Header onLogin={onLogin} onLogout={onLogout}></Header>
            <Content></Content>
        </AuthContext.Provider>
    )
}

function getTokenFromStorage(): string | null {
    return localStorage.getItem("token");
}

function getProfileFromStorage(): UserInfo | null {
    let profile = null;
    const profileStr = localStorage.getItem("profile");
    if (profileStr) {
        try {
            profile = JSON.parse(profileStr) as UserInfo;
        } catch (e) {
            console.error(e);
        }
    }
    return profile;
}

function clearAuthFromStorage(): void {
    localStorage.removeItem("auth");
}

function saveTokenToStorage(token: string) {
    localStorage.setItem("token", token);
}

function saveProfileToStorage(profile: UserInfo) {
    localStorage.setItem("profile", JSON.stringify(profile));
}

export default App

type HeaderProps = {
    onLogin: (username: string, password: string) => Promise<UserInfo>
    onLogout: () => void
}

function Header(props: HeaderProps) {
    const {onLogin, onLogout} = props;
    const auth = useContext<Auth>(AuthContext);

    return (
        <div className="header">
            <div className="logo">
                <h1>Neto Social</h1>
            </div>
            {!auth.token
                ? (<HeaderLoginForm onLogin={onLogin}></HeaderLoginForm>)
                : (<HeaderProfileWidget onLogout={onLogout}></HeaderProfileWidget>)}
        </div>
    )
}

type HeaderLoginFormProps = {
    onLogin: (username: string, password: string) => Promise<UserInfo>
}

function HeaderLoginForm(props: HeaderLoginFormProps) {
    const {onLogin} = props;
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = (event.currentTarget[0] as HTMLInputElement).value;
        const password = (event.currentTarget[1] as HTMLInputElement).value;
        onLogin(username, password)
            .catch(e => {
                alert(e.message);
            })
    }
    return (
        <form className="login-form" onSubmit={onSubmit}>
            <input type="text" placeholder="username"></input>
            <input type="text" placeholder="password"></input>
            <input type="submit" value="Login"></input>
        </form>
    )
}

type HeaderProfileProps = {
    onLogout: () => void
}

function HeaderProfileWidget(props: HeaderProfileProps) {
    const {onLogout} = props;
    const auth = useContext<Auth>(AuthContext);
    const onLogoutClick = (event: MouseEvent<HTMLInputElement>) => {
        event.preventDefault();
        onLogout();
    }
    return (
        <div className="user-container">
            <div className="user-name">
                <span>{`Hello, ${auth.profile?.name}`}</span>
            </div>
            <div>
                <img className="user-avatar" src={auth.profile?.avatar} alt="avatar"/>
            </div>
            <div>
                <input type="button" className="logout-button" value="Logout" onClick={onLogoutClick}/>
            </div>
        </div>
    )
}

function Content() {
    const auth = useContext<Auth>(AuthContext);
    return !auth.token ? (<AnonymousContentWidget></AnonymousContentWidget>) : (<NewsWidget></NewsWidget>)
}

function AnonymousContentWidget() {
    return (
        <div>
            <h2>FB and VK killer</h2>
        </div>
    )
}

type NewsWidgetState = {
    loading: boolean,
    news?: News[]
}
function NewsWidget() {
    const auth = useContext<Auth>(AuthContext);
    const [state, setState] = useState({loading: true} as NewsWidgetState);
    useEffect(() => {
        if (auth.token) {
            getNews(auth.token)
                .then(news => setState({...state, loading: false, news: news}))
                .catch(e => alert(e.message));
        }
    }, [auth.token])
    return state.loading ? (<div>Идёт загрузка...</div>)
        : (
            <div className="news-container">
                {state.news?.map(item => <NewsItemWidget key={item.id} {...item}></NewsItemWidget>)}
            </div>
        )
}

function NewsItemWidget(props: News) {
    const {title, image, content} = props;
    return (
        <div className="news-widget">
            <div>
                <img src={image} className="news-photo" alt="news photo"/>
            </div>
            <div>
                <h3>{title}</h3>
            </div>
            <div>
                <span>{content}</span>
            </div>
        </div>
    )
}
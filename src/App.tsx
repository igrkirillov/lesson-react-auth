import {createContext, Dispatch, FormEvent, SetStateAction, useContext, useState} from 'react'
import './App.css'

type Auth = {
    token: string | null,
    profile: string | null,
    setToken?: Dispatch<SetStateAction<string|null>>,
    setProfile?: Dispatch<SetStateAction<string|null>>
}

const AuthContext = createContext({token: null, profile: null} as Auth);

function App() {
    const auth = getAuthFromStorage();
    const [token, setToken] = useState(auth.token);
    const [profile, setProfile] = useState(auth.profile);
    const onLogin = (username: string, password: string) => {
        return Promise.resolve();
    }
    return (
        <AuthContext.Provider value={{token, setToken, profile, setProfile}}>
            <Header onLogin={onLogin}></Header>
            <Content></Content>
        </AuthContext.Provider>
    )
}

function getAuthFromStorage(): Auth {
    return {token: null, profile: null} as Auth;
}

export default App

type HeaderProps = {
    onLogin: (username: string, password: string) => Promise<void>
}

function Header(props: HeaderProps) {
    const {onLogin} = props;
    const auth = useContext<Auth>(AuthContext);

    return (
        <div className="header">
            <div className="logo">
                <h1>Neto Social</h1>
            </div>
            {!auth.token ? (<HeaderLoginForm onLogin={onLogin}></HeaderLoginForm>) : (<HeaderProfileWidget></HeaderProfileWidget>)}
        </div>
    )
}

type HeaderLoginFormProps = {
    onLogin: (username: string, password: string) => Promise<void>
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

function HeaderProfileWidget(props) {
    return (
        <div>Профиль юзера</div>
    )
}

function Content(props) {
    return (
        <div>Content</div>
    )
}
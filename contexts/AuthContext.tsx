import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { setupAPIClient } from "../services/api";

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut: () => void;
    user: User;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    authChannel.postMessage('nextauth.signOut');
    Router.push('/')
}

const userDefault = {
    email: '',
    permissions: [],
    roles: [],
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(userDefault)
    const isAuthenticated = !!user.email;

    useEffect(() => {
       authChannel = new BroadcastChannel('auth');

       authChannel.onmessage = (message) => {
        switch (message.data) {
            case 'nextauth.signOut': 
                signOut();
                break;
                signOut();
                break;
            default: 
                break;
        }
       } 
    },[])

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            setupAPIClient().get('/me').then(response => {
                const { email, permissions, roles } = response.data;

                setUser({ email, roles, permissions });
            }).catch(() => {
                signOut();
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await setupAPIClient().post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            })

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            setupAPIClient().defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}


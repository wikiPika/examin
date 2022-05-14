import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {getAuth, User, signInWithPopup, GoogleAuthProvider, UserCredential} from "firebase/auth";
import {firebaseApp} from "../fb";

const auth = getAuth(firebaseApp);

interface AuthContextProps {
    initialized: boolean;
    currentUser : User | null;
    isAuth : () => boolean;
    userLoaded : boolean;
    signOut : () => Promise<void>;
    googleLogin: () => Promise<UserCredential | void>;
}


const AuthContext = createContext<AuthContextProps>({
    initialized: false,
    currentUser : null,
    isAuth : () => false,
    userLoaded: false,
    signOut : async () => {},
    googleLogin: async () => {}
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider(props: {children: ReactNode}) {
    const {children} = props;
    const [user, setUser] = useState<User | null>();
    const [userLoaded, setUserLoaded] = useState(false);

    useEffect(() => {
        const authUser = auth.currentUser;
        setUser(authUser);

        auth.onAuthStateChanged(async (newUser) => {
            setUser(newUser);
            if(!userLoaded)
                setUserLoaded(true);
        });

    }, []);

    function isAuth():boolean {
        return user != null;
    }

    const signOut = () => auth.signOut();

    function googleLogin() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    const provider : AuthContextProps = {
        initialized: true,
        currentUser : user as User | null,
        isAuth,
        userLoaded,
        googleLogin,
        signOut
    };

    return (
        <AuthContext.Provider value={provider}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
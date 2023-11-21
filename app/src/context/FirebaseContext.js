"use client"
import { createContext, useEffect, useLayoutEffect, useState } from "react";
import { auth, db } from "../../firebaseAdmin";
import { redirect, usePathname, useRouter } from "next/navigation";

export const FirebaseContext = createContext();

export function FirebaseProvider({children}) {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();
    // Whenever user is
    useEffect(() => {
        return auth.onIdTokenChanged(async (user) => {
            if (!user) {
                setUser(null);
                router.push("/");
            } else {
                setUser(user);
            }
        })
    }, [])

    useLayoutEffect(() => {
    }, [])

    return (
        <FirebaseContext.Provider value={(user, db, auth)}>
            {(user || pathname == "/") ? children : <></>}
        </FirebaseContext.Provider>
    )
    
}
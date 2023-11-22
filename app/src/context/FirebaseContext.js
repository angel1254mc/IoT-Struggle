"use client"
import { createContext, useEffect, useLayoutEffect, useState, useTransition } from "react";
import { auth, db } from "../../firebaseAdmin";
import { redirect, usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "@firebase/firestore";

export const FirebaseContext = createContext();

export function FirebaseProvider({children}) {
    const [user, setUser] = useState(null);
    const [userObj, setUserObj] = useState(null);
    const [loading, setLoading] = useState(true);
    const [init, setInit] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    // Whenever user is
    useEffect(() => {
        setInit(true);
        return auth.onIdTokenChanged(async (user) => {
            setLoading(true);
            if (pathname == "/") {
                setLoading(false);
            }
            if (!user) {
                setUser(null);
                setUserObj(null);
                startTransition(() => router.push("/"))
            } else {
                setUser(user);
                const userDocRef = doc(db, "Users", user.uid);
                const userSnap = await getDoc(userDocRef);
                let data = userSnap.data();
                if (userSnap.exists())
                    setUserObj(userSnap.data());
                if (data && !data?.setupComplete && pathname != "/") {
                    console.log(data);
                    startTransition(() => router.push("/setup"))
                }
            }
        })
    }, [])

    useEffect(() => {
        // Welcome to useEffect hell
        if (init && !isPending) {
            setLoading(false);
        }
    }, [isPending])



    // Route the user away if they are not set up, 
    return (
        <FirebaseContext.Provider value={(user, db, auth)}>
            {!loading ? children : <h3 className="text-black">Loading</h3>}
        </FirebaseContext.Provider>
    )
    
}
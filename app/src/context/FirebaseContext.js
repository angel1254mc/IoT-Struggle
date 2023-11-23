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
        setLoading(true);
        return auth.onIdTokenChanged(async (user) => {
            if (!user) {
                setUser(null);
                setUserObj(null);
                if (pathname != "/")
                    return startTransition(() => router.push("/"))
                if (pathname == "/") 
                    return setLoading(false);
            } else {
                setUser(user);
                const userDocRef = doc(db, "Users", user.uid);
                const userSnap = await getDoc(userDocRef);
                let data = userSnap.data();
                console.log(data);
                console.log(pathname);

                if (pathname == "/") {
                    return setLoading(false);
                } else if (pathname.includes("/setup")) {
                    if (data?.setupComplete) 
                        return startTransition(() => router.push("/dashboard"))
                    else {
                    }
                } else if (pathname.includes("dashboard")) {
                    if (!(data?.setupComplete)) {
                        return startTransition(() => router.push("/setup"))
                    } else {
                    }
                }
                setLoading(false);
            }
        })
    }, [isPending])


    const refreshUserObject = async () => {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists())
            setUserObj(userSnap.data());
    }

    // Route the user away if they are not set up, 
    return (
        <FirebaseContext.Provider value={{user, db, auth, refreshUserObject}}>
            {!loading ? children : <h3 className="text-black">Loading</h3>}
        </FirebaseContext.Provider>
    )
    
}
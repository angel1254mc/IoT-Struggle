"use client"
import { FieldPath, collection, doc, documentId, getDocs, onSnapshot, query, where } from '@firebase/firestore';
import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../../../firebaseAdmin';

// Get firebase stuff here, create a context and pass that down to child pages such as dashboard, my bin and all that.
export const AppContext = createContext(null);
const AppLayout = ({children}) => {

    
    const [totalDisposed, setTotalDisposed] = useState(null);
    const [totalRecycled, setTotalRecycled] = useState(null);
    const [weeklyGoal, setWeeklyGoal] = useState(null);
    const [userData, setUserData] = useState(null);
    const [friends, setFriends] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        onSnapshot(doc(db, "Users", auth.currentUser.uid), async doc => {
            const data = doc.data();
            // Just gonna keep it shrimple for now
            setTotalDisposed(data.totalDisposed);
            setTotalRecycled(data.totalRecycled);
            setWeeklyGoal(data.weeklyGoal);
            setUserData(data);
            // Now get friends
            const collectionSnap = await getDocs(collection(db, "Users"));
            const friendsArr = [];
            collectionSnap.docs.forEach((doc) => {
                if (data.friends.includes(doc.id))
                    friendsArr.push({
                    ...doc.data(),
                        id: doc.id,
                    });
            });

            console.log(friendsArr);

            setFriends(friendsArr);

            setLoading(false);
        })
    }, [])
  return (
    <AppContext.Provider value={{
        totalDisposed,
        totalRecycled,
        weeklyGoal,
        loading,
        userData,
        friends
    }}>
        {children}
    </AppContext.Provider>
  )
}

export default AppLayout;
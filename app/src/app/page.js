"use client";
import { faBurger, faNavicon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React, { useContext, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth"
import {useRouter} from 'next/navigation'; 
import { MenuBarContext } from "./layout";
import { Dialog } from '@headlessui/react'
import { FirebaseContext } from "@/context/FirebaseContext.js";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { db, auth } from "../../firebaseAdmin";

const Home = () =>  {
    const { register, handleSubmit, formState: {errors} } = useForm();
    const [fade, setFade] = useState(false);
    const [isPending,  startTransition] = useTransition();
    const [formState, setFormState] = useState("signup");
    const handleFade = () => {
        setFade((state) => !state);
        setTimeout(() => {
            setFormState((state) => (state == "signin" ? "signup" : "signin"));
            setFade((state) => !state);
        }, 500);
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    let [hasError, setHasError] = useState(false);
    let [errorMessage, setErrorMessage] = useState("");

    const signInOut = async () => {
        
        if (formState == "signin"){
            console.log("We're Logging in");
            signInWithEmailAndPassword(auth,email,password)
            .then(async (userCredentials) => {
                console.log(userCredentials.user.uid);
                // get the user object
                const userDocRef = doc(db, "Users", userCredentials.user.uid);
                const userSnap = await getDoc(userDocRef);
                let userObj = null;
                if (!userSnap.exists()) {
                    console.log("ERROR: User object was never created!");
                    // We can create it for them right now
                    userObj = {
                        bin: "", // MAC Address of the bin their account corresponds to, for setup
                        totalRecycled: 0, // Total number of items recycled, updated by recognize.py
                        totalDisposed: 0, // Total number of items disposed, updated by recognize.py
                        typeDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        friends: [], // Array of friend IDs for leaderboard
                        weeklyGoal: 0, // Weekly recycling goal for user. CRON Job updates this at the end of the week.
                        pastData: [
                            // This is where shit gets real
                            // Would be cool to keep track of past recycling data.
                            // Organized by week maybe
                            // Using ISO timestamp to separate out into weeks
                        ],
                        setupComplete: false,
                        displayName: "",
                        photoURL: "",
                    };

                    await setDoc(userDocRef, userObj)
                    // Can't think of anything else but basically this should be it
                }
                userObj = userObj ?? userSnap.data();
                // If the user's account has been setup, route to dashboard.
                // Otherwise FORCE them to setup 😈😈😈😈
                if (userObj?.setupComplete) {
                    startTransition(() => router.push("/dashboard"));
                } else {
                    startTransition(() => router.push("/setup"));
                }
                setErrorMessage("");
            }).catch((error) =>{
                switch(error.code){
                    case 'auth/user-not-found':
                        console.log("ERROR: Specifically, user doesn't exist");
                        setErrorMessage("Specifically, user doesn't exist");
                        break;
                    case 'auth/invalid-login-credentials':
                        console.log("ERROR: Specifically, password is wrong");
                        setErrorMessage("Specifically, password is wrong");
                        break;
                    case 'auth/too-many-requests':
                        console.log("ERROR: Specifically, too many login attempts. Try again later");
                        setErrorMessage("Specifically, too many login attempts. Try again later");
                        break;
                    default:
                        console.log(error);
                        setErrorMessage("Not sure what happened but it doesn't look good");
                }
                setHasError(true);
            });
        }
        else if (formState == "signup"){
            console.log("Signing up now");

            createUserWithEmailAndPassword(auth,email,password)
            .then(async (userCredentials) => {
                console.log(userCredentials.user.uid);
                const userDocRef = doc(db, "Users", userCredentials.user.uid);

                let userObj = {
                    bin: "", // MAC Address of the bin their account corresponds to, for setup
                    totalRecycled: 0, // Total number of items recycled, updated by recognize.py
                    totalDisposed: 0, // Total number of items disposed, updated by recognize.py
                    typeDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    friends: [], // Array of friend IDs for leaderboard
                    weeklyGoal: 0, // Weekly recycling goal for user. CRON Job updates this at the end of the week.
                    pastData: [
                        // This is where shit gets real
                        // Would be cool to keep track of past recycling data.
                        // Organized by week maybe
                        // Using ISO timestamp to separate out into weeks
                    ],
                    setupComplete: false,
                    displayName: "",
                    photoURL: "",
                };

                await setDoc(userDocRef, userObj)

                // Once we've set up an initial user object, push them to setup
                startTransition(() => router.push("/setup"));
                setErrorMessage("");
            }).catch((error) =>{
                switch(error.code){
                    case 'auth/email-already-in-use':
                        console.log("ERROR: Specifically, user already exists");
                        setErrorMessage("Specifically, user already exists");
                        break;
                    case 'auth/weak-password':
                        console.log("ERROR: Specifically, Password sucks");
                        setErrorMessage("Specifically, password sucks");
                        break;
                    default:
                        console.log(error);
                        setErrorMessage("Not sure what happened but it doesn't look good");
                }
                setHasError(true);
            });
        }
    };
    
    return (
        <>
            <div className="max-w-5xl w-full h-auto flex justify-between px-4 py-4">
                <div className="h-8"></div>
            </div>
            <div className="w-full max-w-5xl text-black flex flex-col flex-grow items-center py-2 px-8">
                <h1 className="text-5xl font-black custom-text-gradient bg-horizontal-gradient">
                    IoTrash
                </h1>
                <Image
                    src="/recycle-bin-cute.png"
                    height="600"
                    width="400"
                    className="mt-4 w-40"
                ></Image>

                <form
                    onSubmit={handleSubmit(signInOut)}
                    className={`${
                        fade ? "fade-out" : "fade-in"
                    } w-full text-base rounded-sm bg-white border-[1px] border-[#C3C3C3] mt-4 shadow-xl p-4 flex flex-col`}
                >
                    <label for="email" id="email-label">
                        Email/Username
                    </label>
                    {errors?.email?.message ? <p className="text-red-400 text-xs">{errors?.email?.message}</p> : <></>}
                    <input
                        {...register("email", { required: "Email cannot be empty!" })}
                        className="px-2 py-1 mt-1 border-[1px] border-gray-300"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label for="password">Password</label>
                    {errors?.password?.message ? <p className="text-red-400 text-xs">{errors?.password?.message}</p> : <></>}
                    <input
                        {...register("password", { required: "Password cannot be empty!" })}
                        className="px-2 py-1 mt-1 border-[1px] border-gray-300"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        id="sign-up-button"
                        className="focus-within:translate-y-1 transition-all duration-75 rounded-sm font-semibold mt-8 py-1 px-2 text-center border-[2px] border-gray-500 text-gray-500"
                    >
                        {formState == "signin" ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p
                    id="paragraph-text"
                    className={`${
                        fade ? "fade-out" : "fade-in"
                    } text-sm mt-4 text-gray-600`}
                >
                    {formState == "signin"
                        ? "Or, if you haven't created an account yet"
                        : "Or, if you've already created an account"}
                </p>
                <div
                    className={`${
                        fade ? "fade-out" : "fade-in"
                    } w-full mt-4 flex flex-col text-lg px-4`}
                >
                    <button
                        onClick={handleFade}
                        id="login-button"
                        className="focus-within:translate-y-1 transition-all duration-75 rounded-sm font-semibold py-1 px-2 text-center border-[2px] bg-green-50 border-lightgreen text-lightgreen"
                    >
                        {formState == "signin" ? "Sign Up" : "Log In"}
                    </button>
                </div>
            </div>
            <div className='ErrorPopup' id='ErrorPopup'>

                <Dialog 
                    open={hasError} 
                    onClose={() => setHasError(false)}
                    className="relative z-50"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            
                            <div className="bg-pink-700 border-pink-700">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium font-bold text-center text-white"
                                >Error</Dialog.Title>
                            </div>
                            <Dialog.Description className="text-pink-700 mt-4 font-medium text-center">
                                {errorMessage}
                            </Dialog.Description>
                                <p className="text-sm text-emerald-500 text-center">
                                    Please fix the error and try again.
                                </p>
                            <div className="mt-4 text-center">
                                <button className="bg-green-300 border-green-300 rounded-lg border-8" 
                                onClick={() => {
                                    setHasError(false);
                                    setErrorMessage("");
                                }}>Alright!</button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>

            </div>
        </>
    );
}

export default Home
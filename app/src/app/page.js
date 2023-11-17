"use client";
import { faBurger, faNavicon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { auth } from "../../firebaseAdmin.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth"
import {useRouter} from 'next/navigation'; 
import { MenuBarContext } from "./layout";

export default function Home() {
    const { register, handleSubmit, formState: {errors} } = useForm();

    const [fade, setFade] = useState(false);
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
    const router = useRouter()

    const signInOut = async () => {
        
        if (formState == "signin"){
            console.log("We're Logging in");
            
            signInWithEmailAndPassword(auth,email,password)
            .then((userCredentials) => {
                console.log(userCredentials);
                router.push("/dashboard");
            }).catch((error) =>{
                switch(error.code){
                    case 'auth/user-not-found':
                        console.log("ERROR: Specifically, user doesn't exist");
                        break;
                    case 'auth/invalid-login-credentials':
                        console.log("ERROR: Specifically, password is wrong");
                    break;
                    default:
                        console.log(error);
                }
            });
        }
        else if (formState == "signup"){
            console.log("Signing up now");

            createUserWithEmailAndPassword(auth,email,password)
            .then((userCredentials) => {
                console.log(userCredentials);
                router.push("/dashboard");
            }).catch((error) =>{
                switch(error.code){
                    case 'auth/email-already-in-use':
                        console.log("ERROR: Specifically, user already exists");
                        break;
                    case 'auth/weak-password':
                        console.log("ERROR: Specifically, Password sucks");
                        break;
                    default:
                        console.log(error);
                }
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
        </>
    );
}

/*
~This is test auth code

import SignIn from './auth/SignIn'
import SignUp from './auth/SignUp'
import AuthDetails from './auth/authDetails'

function Home() {
    return(
        <div className="Home">
            <SignIn />
            <SignUp />
            <AuthDetails />
        </div>
    );
}

export default Home;
*/
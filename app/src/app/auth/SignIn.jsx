import React, { useState } from 'react';
import { auth } from "../../../firebaseAdmin.js";
import { signInWithEmailAndPassword } from "firebase/auth"

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = (e) => {
        //sign in stuff
        e.preventDefault();
        console.log("Is this happening?");
        signInWithEmailAndPassword(auth,email,password)
        .then((userCredentials) => {
            console.log(userCredentials);
        }).catch((error) =>{
            console.log(error);
        });
    };

    return(
        <div className='sign-in-container'>
            <form onSubmit={(e) => signIn(e)}>
                <h1>Test Log In</h1>
                <input 
                    type="email" 
                    placeholder='Enter your email' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                ></input>
                <input 
                    type="password" 
                    placeholder='Enter your password' 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                ></input>
                <button type="submit"> Test Log In Button </button>
            </form>
        </div>
    );
};

export default SignIn
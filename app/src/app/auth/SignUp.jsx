import React, { useState } from 'react';
import { auth } from "../../../firebaseAdmin";
import { createUserWithEmailAndPassword } from "firebase/auth"

const SignUp= () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signUp = (e) => {
        //sign in stuff
        e.preventDefault();
        console.log("Is this happening?");
        createUserWithEmailAndPassword(auth,email,password)
        .then((userCredentials) => {
            console.log(userCredentials);
        }).catch((error) =>{
            console.log(error);
        });
    };

    return(
        <div className='sign-up-container'>
            <form onSubmit={(e) => signUp(e)}>
                <h1>Test Sign Up</h1>
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
                <button type="submit"> Test Sign Up Button </button>
            </form>
        </div>
    );
};

export default SignUp
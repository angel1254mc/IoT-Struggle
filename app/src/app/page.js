"use client";
// import { faBurger, faNavicon } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Image from "next/image";
// import { useState } from "react";
// import { useForm } from "react-hook-form";

// export default function Home() {
//     const { register, handleSubmit, formState: {errors} } = useForm();

//     const onSubmit = async () => {
//       console.log("Hello");
//     };
//     const [fade, setFade] = useState(false);
//     const [formState, setFormState] = useState("signup");
//     const handleFade = () => {
//         setFade((state) => !state);
//         setTimeout(() => {
//             setFormState((state) => (state == "signin" ? "signup" : "signin"));
//             setFade((state) => !state);
//         }, 500);
//     };

//     console.log(errors);
//     return (
//         <>
//             <div className="w-full h-auto flex justify-between px-4 py-4">
//                 <div></div>
//                 <FontAwesomeIcon
//                     className="h-8 w-8  text-lightgreen"
//                     icon={faNavicon}
//                 />
//             </div>
//             <div className="w-full text-black flex flex-col flex-grow items-center py-2 px-8">
//                 <h1 className="text-5xl font-black custom-text-gradient bg-horizontal-gradient">
//                     IoTrash
//                 </h1>
//                 <Image
//                     src="/recycle-bin-cute.png"
//                     height="600"
//                     width="400"
//                     className="mt-4 w-40"
//                 ></Image>

//                 {/* <form
//                     onSubmit={handleSubmit(onSubmit)}
//                     className={`${
//                         fade ? "fade-out" : "fade-in"
//                     } w-full text-base rounded-sm bg-white border-[1px] border-[#C3C3C3] mt-4 shadow-xl p-4 flex flex-col`}
//                 >
//                     <label for="email" id="email-label">
//                         Email/Username
//                     </label>
//                     {errors?.email?.message ? <p className="text-red-400 text-xs">{errors?.email?.message}</p> : <></>}
//                     <input
//                         {...register("email", { required: "Email cannot be empty!" })}
//                         className="px-2 py-1 mt-1 border-[1px] border-gray-300"
//                         type="email"
//                         id="email"
//                     />
//                     <label for="password">Password</label>
//                     {errors?.password?.message ? <p className="text-red-400 text-xs">{errors?.password?.message}</p> : <></>}
//                     <input
//                         {...register("password", { required: "Password cannot be empty!" })}
//                         className="px-2 py-1 mt-1 border-[1px] border-gray-300"
//                         type="password"
//                         id="password"
//                     />
//                     <button
//                         type="submit"
//                         id="sign-up-button"
//                         className="focus-within:translate-y-1 transition-all duration-75 rounded-sm font-semibold mt-8 py-1 px-2 text-center border-[2px] border-gray-500 text-gray-500"
//                     >
//                         {formState == "signin" ? "Log In" : "Sign Up"}
//                     </button>
//                 </form> */}

//                 <SignIn />
//                 <SignUp />

//                 <p
//                     id="paragraph-text"
//                     className={`${
//                         fade ? "fade-out" : "fade-in"
//                     } text-sm mt-4 text-gray-600`}
//                 >
//                     {formState == "signin"
//                         ? "Or, if you haven't created an account yet"
//                         : "Or, if you've already created an account"}
//                 </p>
//                 <div
//                     className={`${
//                         fade ? "fade-out" : "fade-in"
//                     } w-full mt-4 flex flex-col text-lg px-4`}
//                 >
//                     <button
//                         onClick={handleFade}
//                         id="login-button"
//                         className="focus-within:translate-y-1 transition-all duration-75 rounded-sm font-semibold py-1 px-2 text-center border-[2px] bg-green-50 border-lightgreen text-lightgreen"
//                     >
//                         {formState == "signin" ? "Sign Up" : "Log In"}
//                     </button>
//                 </div>
//             </div>
//         </>
//     );
// }

import SignIn from './auth/SignIn'
import SignUp from './auth/SignUp'

function Home() {
    return(
        <div className="Home">
            <SignIn />
            <SignUp />
        </div>
    );
}

export default Home;

// "use client";
// import { faBurger, faNavicon } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Image from "next/image";
// import { useState } from "react";
// import { useForm } from "react-hook-form";

// import SignIn from './auth/SignIn'
// import SignUp from './auth/SignUp'

// export default function Home() {
//     const { register, handleSubmit, formState: {errors} } = useForm();

//     const [fade, setFade] = useState(false);
//     const [formState, setFormState] = useState("signup");
//     const handleFade = () => {
//         setFade((state) => !state);
//         setTimeout(() => {
//             setFormState((state) => (state == "signin" ? "signup" : "signin"));
//             setFade((state) => !state);
//         }, 500);
//     };

//     console.log(errors);
//     return (
//         <>
//             <div className="w-full h-auto flex justify-between px-4 py-4">
//                 <div></div>
//                 <FontAwesomeIcon
//                     className="h-8 w-8  text-lightgreen"
//                     icon={faNavicon}
//                 />
//             </div>
//             <div className="w-full text-black flex flex-col flex-grow items-center py-2 px-8">
//                 <h1 className="text-5xl font-black custom-text-gradient bg-horizontal-gradient">
//                     IoTrash
//                 </h1>
//                 <Image
//                     src="/recycle-bin-cute.png"
//                     height="600"
//                     width="400"
//                     className="mt-4 w-40"
//                 ></Image>

//                 <SignIn />
//                 <SignUp />
//             </div>
//         </>
//     );
// }
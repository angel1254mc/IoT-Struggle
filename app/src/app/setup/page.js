"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import MacAddressInput from "./MacAddressInput";
import PersonalInfoInput from "./PersonalInfoInput";
import AddFriendsInput from "./AddFriendsInput";
import { useForm } from "react-hook-form";

const page = () => {
    // Gonna treat this like array indices
    const [navigation, setNavigation] = useState(0);
    const macAddressRef = useRef(null);
    const personalInfoRef = useRef(null);
    const addFriendsRef = useRef(null);
    
    const {
        control,
        formState: {errors},
        register,
    } = useForm();

    const nextPage = () => {
        let currIndex = navigation;
        if (currIndex == 0) {
            macAddressRef.current.classList.remove("fade-in");
            macAddressRef.current.classList.add("fade-out");
        } else if (currIndex == 1) {
            personalInfoRef.current.classList.remove("fade-in");
            personalInfoRef.current.classList.add("fade-out");
        }
        setTimeout(() => {
            setNavigation(state => state + 1);
        }, 500);
    };

    const previousPage = () => {
        let currIndex = navigation;
        if (currIndex == 1) {
            personalInfoRef.current.classList.remove("fade-in");
            personalInfoRef.current.classList.add("fade-out");
        } else if (currIndex == 2) {
            addFriendsRef.current.classList.remove("fade-in");
            addFriendsRef.current.classList.add("fade-out");
        }
        setTimeout(() => {
            setNavigation(state => state - 1);
        }, 500);

    }
    return (
        <>
            <div className="max-w-5xl text-black w-full h-auto flex justify-between px-4 py-4">
                <div className="min-h-4 w-full flex text-xs">
                    <div className="transition-all duration-75 border-b-4 px-2 pb-2 w-1/3 text-gray-400 border-green-600 flex items-center justify-center text-center">
                        MAC Address Setup
                    </div>
                    <div className={`transition-all duration-75 border-b-4 px-2 pb-2 w-1/3 text-gray-400 ${navigation > 0 ? "border-green-600" : ""} flex items-center justify-center text-center`}>
                        Personal/Account Info
                    </div>
                    <div className={`transition-all duration-75 border-b-4 px-2 pb-2 w-1/3 text-gray-400 ${navigation > 1 ? "border-green-600" : ""} flex items-center justify-center text-center`}>
                        Add Friends
                    </div>
                </div>
            </div>
            {navigation == 0 ? (
                <MacAddressInput register={register} innerRef={macAddressRef} />
            ) : navigation == 1 ? (
                <PersonalInfoInput register={register} control={control} innerRef={personalInfoRef}/>
            ) : <AddFriendsInput register={register} control={control} innerRef={addFriendsRef}/>}
            <div
                id="nav-container"
                className="w-full my-4 mb-8 px-4 flex justify-between mt-auto"
            >
                {navigation > 0 ? (
                <button
                    onClick={() => previousPage()}
                    type="button"
                    className="flex text-base font-bold bg-white mr-auto text-green-500 px-8 py-2 rounded-md border-2 border-green-500 "
                >
                    Back
                </button>
                ) : <></> 
                }
                {navigation < 2 ? (
                    <button
                        onClick={() => nextPage()}
                        type="button"
                        className="flex text-base font-bold bg-white text-green-500 px-8 py-2 rounded-md border-2 border-green-500 ml-auto"
                    >
                        Next
                    </button>
                ) : (
                    <></>
                )}
            </div>
        </>
    );
};

export default page;

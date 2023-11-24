"use client";
import Image from "next/image";
import React, { useContext, useRef, useState } from "react";
import MacAddressInput from "./MacAddressInput";
import PersonalInfoInput from "./PersonalInfoInput";
import AddFriendsInput from "./AddFriendsInput";
import { useForm } from "react-hook-form";
import { auth, db, storage } from "../../../firebaseAdmin";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { FirebaseContext } from "@/context/FirebaseContext";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { debounce } from "lodash";

const SetupPage = () => {
    // Gonna treat this like array indices
    const [navigation, setNavigation] = useState(0);
    const [photoURL, setPhotoURL] = useState("/picture.jpg");
    const [validatingBin, setValidatingBin] = useState("idle");
    const router = useRouter();
    const { refreshUserObject } = useContext(FirebaseContext);
    const macAddressRef = useRef(null);
    const personalInfoRef = useRef(null);
    const addFriendsRef = useRef(null);

    const validateBin = async (value) => {
        if (value.length < 1)
            return false;
        let binSnap = await getDoc(doc(db, "Mac-To-Users", value));
        console.log("Bin provided: " + binSnap.exists());
        if (binSnap.exists()) {
            setValidatingBin("valid");
            return true;
        } else {
            setValidatingBin("invalid");
            return false;
        }
    };
    
    // Lord forgive me for what Im about to do
    const schema = yup.object().shape({
        displayName: yup.string().required("Display Name is required!").min(1).max(30, "Display Name should not exceed 30 characters!"),
        bin: yup.string().required("Bin ID is required!").min(1, "Bin ID must have length greater than 0").test("checkBinExists", "Bin does not exist! Did you input your MAC Address correctly?", async value => (
            await new Promise((resolve) => {
                debounce(
                    async (value) => {
                        setValidatingBin("validating");
                        let val = await validateBin(
                            value
                        );
                        resolve(val);
                    },
                    1000,
                    { leading: true }
                )(value);
            })
        )),
        weeklyGoal: yup.number().min(0),
        recycleCategories: yup.array().of(
            yup.string().oneOf(["plastic", "glass", "cardboard", "clothes", "shoes"])
        )
    });
    const {
        control,
        formState: {errors},
        register,
        getFieldState,
        getValues,
        setFocus,
        trigger,
        handleSubmit
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(schema),
        defaultValues: {
            weeklyGoal: 5,
        }
    });

    const binFieldState = getFieldState("bin");
    const displayNameFieldState = getFieldState("displayName");

    const onSubmit = async (data) => {
        console.log(data);
        // Given all the values, we can go ahead
        // and submit this to firebase using the client-sdk
        const userSnap = await getDoc(doc(db, "Users", auth.currentUser.uid));
        
        // Then, use the obtained fields to update the object
        // There's better ways to do this but ima do it this way
        if (!userSnap.exists()) {
            return toast.error("Something went wrong: User with ID does not exist????");
        }

        const userObj = userSnap.data();
        userObj.friends = data.friends;
        userObj.weeklyGoal = data.weeklyGoal;
        userObj.bin = data.bin;
        userObj.displayName = data.displayName;

        // Hard part is uploading the profile picture if there is one
        if (data.picture) {
            const imageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
            // Praying this is actually a picture
            try {
                let snap = await uploadBytes(imageRef, data.picture)
                let url = await getDownloadURL(snap.ref);
                userObj.photoURL = url;
            } catch(err) {
                console.log(err);
                toast.error("There was an error uplaoding profile picture!")
            }
        } else {
            // Presumably already uploaded
            const imageRef = ref(storage, "profile-pictures/picture.jpg");
            // Get the default profile picture and make that their picture!
            let url = await getDownloadURL(imageRef)
            userObj.photoURL = url;
        }

        // One field, recycleCategories, corresponds to the Bin the user has chosen
        const binSnap = await getDoc(doc(db, "Mac-To-Users", data.bin));
        
        if (!binSnap.exists()) {
            return toast.error("Something went wrong: Bin with ID provided does not exist!");
        }

        const binData = binSnap.data();
        // If this has already been set
        if (binData.recycleCategories && binData.recycleCategories.length > 0) {
            // Do nothing
        } else if (data?.recycleCategories?.length > 0) {
            // Assume that if recycleCategories has not been set previously, this is the first time a user is doing this.
            binData.recycleCategories = data.recycleCategories;
        }

        binData.Users.push(auth.currentUser.uid);
        userObj.setupComplete = true;

        // Finally, update both user and bin objects
        try {
            await setDoc(doc(db, "Users", auth.currentUser.uid), userObj);
            await setDoc(doc(db, "Mac-To-Users", data.bin), binData);

        } catch(err) {
            console.log(err);
            toast.error("There was an error Uploading setup changes. See console for details");
        }
        toast.success("Successfully Set Up Account!");
        await refreshUserObject();
        // Finally, route to dashboard
        router.push("/dashboard?setup-complete=true")
    }

    const onError = (errors) => {
        console.log(errors);
    }
    const nextPage = () => {
        if (Object.keys(errors).length > 0 || !binFieldState.isDirty) {
            if (!binFieldState.isDirty) {
                toast.info("Please input Bin ID before continuing!")
                return setFocus("bin");
            }
            // Don't let user move forward if there are errors
            toast.info("Please fix errors before moving forward!");
            if (errors?.bin) {
                return setFocus("bin");
            } else if (errors?.displayName) {
                return setFocus("displayName");
            } else if (errors?.weeklyGoal) {
                return setFocus("weeklyGoal");
            } else if (errors.recycleCategories) {
                return setFocus("recycleCategories");
            }
            return;
        }
        let currIndex = navigation;
        if (currIndex == 0) {
            macAddressRef.current.classList.remove("fade-in");
            macAddressRef.current.classList.add("fade-out");
        } else if (currIndex == 1) {
            if (!displayNameFieldState.isDirty) {
                toast.info("Please input display name before continuing!")
                return setFocus("displayName");
            }
            personalInfoRef.current.classList.remove("fade-in");
            personalInfoRef.current.classList.add("fade-out");
        }
        setTimeout(() => {
            setNavigation(state => state + 1);
        }, 500);
    };

    const previousPage = () => {
        if (Object.keys(errors).length > 0 || !binFieldState.isDirty) {

            if (!binFieldState.isDirty) {
                toast.info("Please input Bin ID before continuing!")
                return setFocus("bin");
            }
            // Don't let user move forward if there are errors
            toast.info("Please fix errors before moving forward!");
            if (errors?.bin) {
                setNavigation(0);
                return setFocus("bin");
            } else if (errors?.displayName) {
                setNavigation(1);
                return setFocus("displayName");
            } else if (errors?.weeklyGoal) {
                setNavigation(1);
                return setFocus("weeklyGoal");
            } else if (errors.recycleCategories) {
                setNavigation(1);
                return setFocus("recycleCategories");
            }
            return;
        }
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
            <form className="w-full h-full flex flex-col" onSubmit={handleSubmit(onSubmit, onError)}>
            {navigation == 0 ? (
                <MacAddressInput errors={errors} validate={validatingBin} getValues={getValues} register={register} innerRef={macAddressRef} />
            ) : navigation == 1 ? (
                <PersonalInfoInput errors={errors} photoURL={photoURL} setPhotoURL={setPhotoURL} register={register} control={control} innerRef={personalInfoRef}/>
            ) : <AddFriendsInput errors={errors} register={register} control={control} innerRef={addFriendsRef}/>}
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
                    </button >
                ) : (
                    <button className="flex text-base font-bold bg-white text-green-500 px-8 py-2 rounded-md border-2 border-green-500 ml-auto">
                        Submit
                    </button>
                )}
            </div>
            </form>
        </>
    );
};

export default SetupPage;

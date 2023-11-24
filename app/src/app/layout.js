"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import { initializeApp } from 'firebase/app';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faX } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useRef, useState } from "react";

import React, { useEffect } from 'react';
import { auth, db } from "../../firebaseAdmin.js";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FirebaseProvider } from "@/context/FirebaseContext";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const MenuBarContext = createContext();
export default function RootLayout({ children }) {

    const router = useRouter();
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = () => {
        signOut(auth).then(() => {
            signOut(auth).then(() => {
                console.log("Sign Out Successful!");
                //close the slide
                menuRef.current.classList.remove("max-w-[100%]");
                menuRef.current.classList.add("max-w-[0px]");
                setMenuOpen(false);
            })
            .then(finished => router.push("/"))
            .catch(error => console.log(error))
        })
    }

    const pushAndToggle = (route) => {
        router.push(route);
        toggleMenu();
    }

    const toggleMenu = () => {
        if (menuOpen) {
            menuRef.current.classList.remove("max-w-[100%]");
            menuRef.current.classList.add("max-w-[0px]")
            setMenuOpen(false);
        } else {
            menuRef.current.classList.remove("max-w-[0px]");
            menuRef.current.classList.add("max-w-[100%]");
            setMenuOpen(true);
        }
    }


    return (
        <html lang="en">
            <head>
                <meta name="application-name" content="PWA App" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="PWA App" />
                <meta name="description" content="Best PWA App in the world" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta
                    name="msapplication-config"
                    content="/icons/browserconfig.xml"
                />
                <meta name="msapplication-TileColor" content="#2B5797" />
                <meta name="msapplication-tap-highlight" content="no" />
                <meta name="theme-color" content="#000000" />

                <link
                    rel="apple-touch-icon"
                    href="/icons/touch-icon-iphone.png"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="152x152"
                    href="/icons/touch-icon-ipad.png"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/icons/touch-icon-iphone-retina.png"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="167x167"
                    href="/icons/touch-icon-ipad-retina.png"
                />

                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/icons/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/icons/favicon-16x16.png"
                />
                <link rel="manifest" href="/manifest.json" />
                <link
                    rel="mask-icon"
                    href="/icons/safari-pinned-tab.svg"
                    color="#5bbad5"
                />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
                />

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content="https://yourdomain.com" />
                <meta name="twitter:title" content="PWA App" />
                <meta
                    name="twitter:description"
                    content="Best PWA App in the world"
                />
                <meta
                    name="twitter:image"
                    content="https://yourdomain.com/icons/android-chrome-192x192.png"
                />
                <meta name="twitter:creator" content="@DavidWShadow" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="PWA App" />
                <meta
                    property="og:description"
                    content="Best PWA App in the world"
                />
                <meta property="og:site_name" content="PWA App" />
                <meta property="og:url" content="https://yourdomain.com" />
                <meta
                    property="og:image"
                    content="https://yourdomain.com/icons/apple-touch-icon.png"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_2048.png"
                    sizes="2048x2732"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_1668.png"
                    sizes="1668x2224"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_1536.png"
                    sizes="1536x2048"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_1125.png"
                    sizes="1125x2436"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_1242.png"
                    sizes="1242x2208"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_750.png"
                    sizes="750x1334"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/images/apple_splash_640.png"
                    sizes="640x1136"
                />
                <ColorSchemeScript forceColorScheme="light"/>
            </head>
            <body className={inter.className} id="sideMenu">
            <MantineProvider forceColorScheme="light">
                <main className="flex bg-gradient h-full min-h-[100vh] relative max-h-screen overflow-hidden flex-col items-start">
                <Toaster/>
                <MenuBarContext.Provider value={{toggleMenu}}>
                <FirebaseProvider>
                  <div className="z-10 w-full flex flex-col items-center min-h-[100vh] max-h-[100vh] overflow-auto text-sm lg:flex">
                    {children}
                  </div>
                  <div ref={menuRef} className="w-full max-w-[0px] transition-all duration-200 ease-in-out z-30 absolute text-green-700 h-full max-h-[100vh] flex flex-col overflow-hidden bg-white">
                      <div onClick={toggleMenu} className="w-full flex justify-end py-6 px-6">
                        <FontAwesomeIcon className="w-10 h-10" icon={faClose}/>
                      </div>
                      {/* <button onClick={() => pushAndToggle("/")} className="flex nav-item text-3xl font-bold px-4 border-green-500 py-4 border-t-[2px]">
                          Home
                      </button> */}
                      <button onClick={() => pushAndToggle("/dashboard")} className="flex nav-item text-3xl font-bold px-4 border-green-500 py-4 border-t-[2px]">
                          Dashboard
                      </button>
                      <button onClick={handleSignOut} className="nav-item flex text-3xl font-bold px-4 border-green-500 py-4 border-y-[2px]">
                          Sign Out
                      </button>
                  </div>
                  </FirebaseProvider>
                </MenuBarContext.Provider>
                </main>
                </MantineProvider>
            </body>
        </html>
    );
}

"use client"
import { faNavicon } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React, { useContext } from 'react'
import { MenuBarContext } from '../layout'

const page = () => {

    const {toggleMenu} = useContext(MenuBarContext);

    //firebase, set the activeUserID to current
    

  return (
    <div className="max-w-5xl w-full min-h-[100vh] flex flex-col gap-y-1 ">
        <div className="w-full px-4 h-auto text-3xl font-semibold text-black">
            <h1>Overview</h1>
        </div>
        <div className="flex flex-col gap-y-2 mt-4 py-2 pb-3 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <p className="text-lg text-lightgreen"><span className="font-semibold">Woohoo!</span> Keep up the Great Work!</p>
            <div className="w-full flex items-end justify-between">
                <h2 className="text-3xl font-bold text-lightgreen">24/30</h2>
                <p className="text-xs text-gray-800">Items Recycled - Weekly Goal</p>
            </div>
            <div className="w-full h-2 rounded-xl overflow-hidden">
                    <div className="h-2 w-1/2 bg-lightgreen"></div>
            </div>
        </div>
        <div className="mt-2">
            <p className="text-gray-600 text-xs px-4 font-semibold">TRASH STATS</p>
        </div>
        <div className="flex flex-col mt-4 py-2 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Recycled Item</h3>
                <p className="text-2xl font-bold text-lightgreen">123</p>
            </div>
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Waste Items</h3>
                <p className="text-2xl font-bold text-lightgreen">243</p>
            </div>
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Ratio</h3>
                <p className="text-2xl font-bold text-lightgreen">0.5062</p>
            </div>
        </div>
    </div>
  )
}

export default page
"use client"
import { faNavicon } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
    <div className="w-full min-h-[100vh] flex flex-col gap-y-1">
        <div className="flex w-full px-4 py-4 justify-end">
            <FontAwesomeIcon
                    className="h-8 w-8 text-lightgreen"
                    icon={faNavicon}
                />
        </div>
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
        <div className="mt-4 mb-2">
            <p className="text-gray-600 text-xs px-4 font-semibold">FRIEND LEADERBOARD</p>
        </div>
        <div className="flex-flex-col">
        <div className="w-full flex text-xs text-gray-600 px-3">
            <p className="text-left w-1/4 pl-14">Place</p>
            <p className="w-1/3 pl-4">User</p>
            <p className="w-1/3">Total Recycled</p>
        </div>
        <div className="flex mb-4 flex-col mt-1 py-2 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <div className="w-full py-1 text-lg flex text-gray-600">
                <p className="text-left pl-14 w-1/4">1st</p>
                <p className="text-left pl-4 w-1/3 flex items-center gap-x-3"><Image className="h-6 w-6 rounded-full" src="/picture.jpg" height={100} width={100}/>Angel</p>
                <p className="text-left pl-2 w-1/4">233</p>
            </div>
            <div className="w-full py-1 text-lg flex text-gray-600">
                <p className="text-left pl-14 w-1/4">2nd</p>
                <p className="text-left pl-4 w-1/3 flex items-center gap-x-3"><Image className="h-6 w-6 rounded-full" src="/picture.jpg" height={100} width={100}/>Angel</p>
                <p className="text-left pl-2 w-1/4">233</p>
            </div>
            <div className="w-full py-1 text-lg flex text-gray-600">
                <p className="text-left pl-14 w-1/4">3rd</p>
                <p className="text-left pl-4 w-1/3 flex items-center gap-x-3"><Image className="h-6 w-6 rounded-full" src="/picture.jpg" height={100} width={100}/>Angel</p>
                <p className="text-left pl-2 w-1/4">233</p>
            </div>
            <div className="w-full py-1 text-lg flex text-gray-600">
                <p className="text-left pl-14 w-1/4">4th</p>
                <p className="text-left pl-4 w-1/3 flex items-center gap-x-3"><Image className="h-6 w-6 rounded-full" src="/picture.jpg" height={100} width={100}/>Angel</p>
                <p className="text-left pl-2 w-1/4">233</p>
            </div>
        </div>
        </div>
    </div>
  )
}

export default page
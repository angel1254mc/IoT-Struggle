"use client"
import { MenuBarContext } from '@/app/layout'
import { faNavicon } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React, { useCallback, useContext } from 'react'
import { AppContext } from '../layout'
import Skeleton from './skeleton'

const DashboardPage = () => {

    const {toggleMenu} = useContext(MenuBarContext);
    const {
        loading,
        friends,
        totalDisposed,
        totalRecycled,
        weeklyGoal,
        userData
    } = useContext(AppContext);

    const generateLeaderboard = useCallback(() => {


        // Order by amount of points
        const leaderboard = [...friends, userData];
        if (leaderboard.length > 1)
            leaderboard.sort(function(a, b) {
                return parseFloat(b.totalRecycled) - parseFloat(a.totalRecycled)
            });
        
        return (
            <>
            {leaderboard.map((user, index) => (
                <div className="w-full py-1 text-lg flex text-gray-600">
                    <p className="text-left pl-14 w-1/4">{index + 1}</p>
                    <div className="text-left pl-4 w-1/3 flex items-center gap-x-3">
                        <div className="relative h-6 w-6">
                            <Image className="h-6 min-w-[1.5rem] w-6 rounded-full object-cover" src={`${user.photoURL ? user.photoURL :"/picture.jpg"}`} width={100} height={100} />
                        </div>
                        <p className='truncate text-ellipsis'>Angel Lopez Pol</p>
                    </div>
                    <p className="text-left pl-2  ml-auto mr-4">{user.totalRecycled}</p>
                </div>
            ))}
            </>
        )
    }, [friends, userData])
    

  return (
    loading ? <></> :
    <div className=" fade-in max-w-5xl w-full min-h-[100vh] flex flex-col gap-y-1 ">
        <div className="flex w-full px-4 py-4 justify-end">
            <button onClick={toggleMenu}>
            <FontAwesomeIcon
                    className="h-8 w-8 text-lightgreen"
                    icon={faNavicon}
                />
            </button>
        </div>
        <div className="w-full px-4 h-auto text-3xl font-semibold text-black">
            <h1>Overview</h1>
        </div>
        <div className="flex flex-col gap-y-2 mt-4 py-2 pb-3 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <p className="text-lg text-lightgreen"><span className="font-semibold">Woohoo!</span> Keep up the Great Work!</p>
            <div className="w-full flex items-end justify-between">
                <h2 className="text-3xl font-bold text-lightgreen">{`${weeklyGoal > 0 ? `${totalRecycled}/${weeklyGoal}` : `${totalRecycled ?? "Loading"}`}`}</h2>
                <p className="text-xs text-gray-800">Items Recycled - Weekly Goal</p>
            </div>
            <div className="w-full transition-all duration-300 ease-in-out h-2 rounded-xl overflow-hidden">
                    <div style={{
                        width: `${parseFloat(totalRecycled/weeklyGoal).toFixed()*100}%`
                    }}className={`h-2 bg-lightgreen`}></div>
            </div>
        </div>
        <div className="mt-2">
            <p className="text-gray-600 text-xs px-4 font-semibold">TRASH STATS</p>
        </div>
        <div className="flex flex-col mt-4 py-2 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Recycled Item</h3>
                <p className="text-2xl font-bold text-lightgreen">{totalRecycled ?? "Loading..."}</p>
            </div>
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Waste Items</h3>
                <p className="text-2xl font-bold text-lightgreen">{totalDisposed ?? "Loading..."}</p>
            </div>
            <div className="px-2 py-1 flex flex-col text-black">
                <h3 className="text-xs font-semibold pb-1 border-b-[1px] border-gray-300">Ratio</h3>
                <p className="text-2xl font-bold text-lightgreen">{totalRecycled == 0 || totalDisposed == 0 ? ("N/A") : parseFloat(totalRecycled/totalDisposed).toFixed(4)}</p>
            </div>
        </div>
        <div className="mt-4 mb-2">
            <p className="text-gray-600 text-xs px-4 font-semibold">FRIEND LEADERBOARD</p>
        </div>
        <div className="flex-flex-col">
        <div className="w-full flex text-xs text-gray-600 px-3">
            <p className="text-left w-1/4 pl-14">Rank</p>
            <p className="w-1/3 pl-4">User</p>
            <p className="w-1/5 ml-auto mr-4 text-right">Total Recycled</p>
        </div>
        <div className="flex mb-4 flex-col mt-1 py-2 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            {loading ? <></> : generateLeaderboard()}
        </div>
        <div className="flex mb-4 flex-col justify-center items-center mt-1 py-2 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <h1 className="text-xl"></h1>
            <Image src="" className="w-96 h-96">

            </Image>
        </div>
        </div>
    </div>
  )
}

export default DashboardPage
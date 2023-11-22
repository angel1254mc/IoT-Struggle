import Image from 'next/image'
import React from 'react'

const MacAddressInput = ({innerRef, register}) => {
  return (
    <div ref={innerRef} className="fade-in max-w-5xl w-full h-full justify-center flex flex-col gap-y-1 mb-4">
        <div className="flex items-center text-gray-700 flex-col gap-y-2 mt-4 p-4 px-5 pb-8  mx-4 border-gray-300 border-[1px] rounded-md shadow-lg bg-white">
            <h1 className="text-4xl  text-center font-bold text-lightgreen">
                Woohoo!
            </h1>
            <p className="font-semibold text-sm w-full text-center">Welcome to IoTrash!</p>
            <Image className="w-[90%] my-4" src="/welcome-iot.png" height="556" width="602"/>
            <p className="text-sm mt-2">Thank you for trying out the app! Before getting started on your recycling journey, we need to set up your IoT Bin!</p>
            <div className="w-full flex mt-4 flex-col">
                <label className="font-bold text-sm"  for="mac-address">Bin MAC Adress</label>
                <p className="text-xs">You can find this value on the sticker on the side of your bin!</p>
                <input
                    {...register("bin", {
                        required: "Bin ID is required!",
                    })}
                    className="px-2 mt-2 py-1 text-base border-[1px] border-gray-300"
                    type="text"
                    value={""}
                    placeholder="e.g. A0:B7:65:FE:DB:5C"
                />
            </div>
        </div>
    </div>
  )
}

export default MacAddressInput
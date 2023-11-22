import { faCamera, faIcons } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MultiSelect } from '@mantine/core'
import Image from 'next/image'
import React from 'react'
import { Controller } from 'react-hook-form'

const PersonalInfoInput = ({innerRef, register, control}) => {
  return (
    <div ref={innerRef} className="fade-in ax-w-5xl w-full h-full mb-4 justify-center flex flex-col gap-y-1 ">
    <div className="flex text-gray-700 flex-col mt-4 p-4 px-5 pb-8  mx-4 border-gray-300 border-[1px] rounded-md shadow-lg bg-white">
        <h1 className="text-4xl pr-2 font-bold text-lightgreen">
            Next, tell us about you!
        </h1>
        <label className="font-bold mt-2 text-sm"  for="display-name">Display Name</label>
        <input
            {...register("displayName", {
                required: "Display Name is required!",
            })}
            className="px-2 mt-2 py-2 text-base border-[1px] border-gray-300"
            type="text"
            placeholder="e.g. Sponge Bob"
        />
        <label className="font-bold text-sm mt-2"  for="weeklyGoal">Weekly Recycling Goal</label>
        <input
            {...register("weeklyGoal", {
                required: "Weekly Recycling Goal is required!",
            })}
            className="px-2 py-2 mt-2 text-base border-[1px] border-gray-300"
            type="text"
            id="weeklyGoal"
            value={""}
            placeholder="e.g. 10 items"
        />
        <label className="font-bold text-sm mt-5" for="profile-picture">Profile Picture</label>
        <div className="flex gap-x-4">
            <Image className="rounded-md w-1/3 h-auto" src="/picture.jpg" height={100} width={100}/>
            <div className="flex flex-col items-center w-full gap-y-2">
                <button className="w-full flex justify-center items-center gap-x-4 px-2 py-2 border-gray-400 border-2 rounded-sm">Upload Image <FontAwesomeIcon icon={faCamera}/></button>
                <p className="text-xs text-gray-400">or</p>
                <button className="w-full flex justify-center items-center gap-x-4 px-2 py-2 border-gray-400 border-2 rounded-sm">Random Icon <FontAwesomeIcon icon={faIcons} /></button>
            </div>
        </div>
        <label className="font-bold text-sm mt-4"  for="weeklyGoal">Materials to Recycle</label>
        <p className="text-xs">You can change your selection in the settings tab later.</p>
        <Controller
             name="recycleCategories"
             control={control}
             render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <MultiSelect
                size="md"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                name={name}
                ref={ref}
                multiple={true}
                placeholder="Pick value"
                data={[
                    {label: "Plastic", value: "plastic"}, 
                    {label: "Cardboard", value: "cardboard"},
                    {label: "Glass", value: "glass"},
                    {label: "Clothes", value: "clothes"},
                    {label: "Shoes", value: "shoes"}
                ]}
                limit={5}
                searchable
              />
            )}
            />
        <p className="text-xs mt-2"><span className="font-bold">Note:</span> if a user already set up this trash bin, these will be preselected for you. You can change these in the settings menu!</p>
    </div>
</div>
  )
}

export default PersonalInfoInput
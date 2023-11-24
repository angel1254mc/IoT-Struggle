import { faCamera, faIcons } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MultiSelect } from '@mantine/core'
import Image from 'next/image'
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'

const PictureInput = ({control, setPhotoURL}) => (
    <>
    <label for="picture" className="w-full flex justify-center items-center gap-x-4 px-2 py-2 border-gray-400 border-2 rounded-sm">Upload Image <FontAwesomeIcon icon={faCamera}/></label>
    <Controller
        control={control}
        name={"picture"}
        render={({field: { value, onChange, ...others}}) => (
            <input
                className="transparent absolute -z-10"
                {...others}
                value={value?.fileName}
                onChange={(event) => {
                    console.log(event.target.files[0]);
                    onChange(event.target.files[0])
                    setPhotoURL(URL.createObjectURL(event.target.files[0]));
                }}
                type="file"
                id="picture"
                />
        )}
    />
    </>
)

const PersonalInfoInput = ({innerRef, register, control, photoURL, setPhotoURL, errors}) => {
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
        <p className="text-xs mt-2 text-red-500 flex flex-wrap text-wrap w-full">{errors?.displayName?.message ?? ""}</p>
        <label className="font-bold text-sm mt-2"  for="weeklyGoal">Weekly Recycling Goal (# of Items)</label>
        <input
            {...register("weeklyGoal", {
                required: "Weekly Recycling Goal is required!",
            })}
            className="px-2 py-2 mt-2 text-base border-[1px] border-gray-300"
            type="number"
            id="weeklyGoal"
            placeholder="e.g. 10 items"
        />
        <label className="font-bold text-sm mt-5" for="profile-picture">Profile Picture</label>
        <div className="flex gap-x-4">
            <div className="min-w-[8rem] object-cover h-32 relative"><Image className="rounded-md object-cover h-auto" src={photoURL} fill={true}/></div>
            <div className="flex flex-col items-center w-full gap-y-2">
                <PictureInput control={control} setPhotoURL={setPhotoURL}/>
                <p className="text-xs text-gray-400">or</p>
                <button disabled className="w-full flex justify-center items-center gap-x-4 px-2 py-2 border-gray-400 bg-gray-300 border-2 rounded-sm">Random Icon <FontAwesomeIcon icon={faIcons} /></button>
            </div>
        </div>
        <label className="font-bold text-sm mt-4" for="weeklyGoal">Materials to Recycle</label>
        <p className="text-xs">You can change your selection in the settings tab later.</p>
        <Controller
             name="recycleCategories"
             control={control}
             defaultValue={[]}
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
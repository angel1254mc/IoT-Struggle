import { Loader, Select } from '@mantine/core'
import React, { useEffect, useRef, useState } from 'react'
import { auth, db } from '../../../firebaseAdmin';
import { collection, getDocs } from '@firebase/firestore';
import { Controller } from 'react-hook-form';
import FriendBox from '@/components/FriendBox';

const AddFriendsInput = ({innerRef, register, control}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState([])

  useEffect(() => {
    // Get all user objects to search by name
    getUsers();
  }, [])

  const getUsers = async () => {
    const querySnap = await getDocs(collection(db, "Users"));
    let users = [];
    querySnap.forEach((doc) => {
      let data = doc.data();
      if (doc.id != auth.currentUser.uid)
      users.push({
        label: data.displayName ?? "Null",
        value: doc.id,
        photoURL: data.photoURL,
      });
    })
    setOptions(users);
    setIsLoading(false);
  }
  return (
    <div ref={innerRef} className="fade-in ax-w-5xl w-full h-full mb-4 justify-center flex flex-col gap-y-1 ">
        <div className="flex text-gray-700 flex-col mt-4 p-4 px-5 pb-8  mx-4 border-gray-300 border-[1px] rounded-md shadow-lg bg-white">
            <h1 className="text-4xl pr-2 font-bold text-lightgreen">
                Add some friends if you&apos;d like!
            </h1>
            <Controller
             name="friends"
             defaultValue={[]}
             control={control}
             render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <FriendBox
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                name={name}
                ref={ref}
                options={options}
                limit={5}
                searchable
                nothingFoundMessage={options.length > 0 ? "No matching users found!" : "No users found!"}
                rightSection={isLoading ? <Loader size={16}/> : <></>}
              />
            )}
            />
        </div>
    </div>
  )
}

export default AddFriendsInput
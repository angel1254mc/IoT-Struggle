import { useState } from 'react'
import { Combobox } from '@headlessui/react'
import Image from 'next/image';



function FriendBox({
  value,
  onChange,
  options,
  onBlur,
  error,
  ref,
}) {

  const [query, setQuery] = useState('');

  const  removeElement = (user) => {
    let newValue = [...value];
    let index = newValue.findIndex(el => el.value === user.value);
    if (index != -1)
    newValue.splice(index, 1);
    onChange(newValue);
  }
  const filteredUsers =
    query === ''
      ? options.slice(0,5)
      : options.filter((user) => {
          return user.label.toLowerCase().includes(query.toLowerCase())
        }).slice(0, 5);
  
  return (
    <Combobox ref={ref} by={"value"} multiple value={value} onChange={onChange}>
      <div className="relative">
      <Combobox.Input
        className="w-full px-2 mt-4 py-1 text-base border-[1px] border-gray-400"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
      />
      <Combobox.Options className="w-full mt-1 border-gray-300 border-[2px] rounded-md bg-white absolute">
        {filteredUsers.map((user) => (
          <Combobox.Option className="w-full cursor-pointer transition-all duration-75 hover:bg-gray-200 text-base px-2 py-2 border-gray-400 flex gap-x-4 items-center" key={user.value} value={user}>
                <div className=" rounded-full overflow-hidden"><Image src={user.photoURL} height={40} width={40} className="w-6 h-6"/></div>{user.label}
          </Combobox.Option>
        ))}
        {query.length > 0 && filteredUsers.length == 0 && (
          <div className="w-full transition-all duration-75 text-base px-2 py-2 border-gray-400 flex gap-x-4 items-center justify-center">
            {options.length == 0 ? "No Users Available!" : "No matching users found!"}
          </div>
        )}
      </Combobox.Options>

      </div>

      <div className="h-96 overflow-auto max-h-96 w-full mt-2 border-gray-300 rounded-md">
      {value.length > 0 && (
          value.map((user, index) => (
            <div key={user.value} onClick={() => removeElement(user)} className={`${index == 0 ? "border-y-[1px]" : "border-b-[1px] "} w-full text-base cursor-pointer transition-all duration-75 hover:bg-gray-100 border-gray-300 py-2 px-2 items-center flex gap-x-4`}>
              <div className="rounded-full overflow-hidden"><Image src={user.photoURL} height={40} width={40} className="w-8 h-8"/></div>
              {user.label}
            </div>
          ))
      )
      }
      </div>
    </Combobox>
  )
}

export default FriendBox;
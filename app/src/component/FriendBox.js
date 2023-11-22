import { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { generateFakeUserData } from '@/utils/fake';

const userData = generateFakeUserData(20)

function FriendBox({ data, ...other}) {

  const [value, setValue] = useState([]);
  const [query, setQuery] = useState('')  
  const filteredUsers =
    query === ''
      ? userData.slice(0,5)
      : userData.filter((user) => {
          return user.label.toLowerCase().includes(query.toLowerCase())
        }).slice(0, 5);
  
  return (
    <Combobox multiple value={value} onChange={setValue}>
        {value.length > 0 && (
        <ul>
          {value.map((person) => (
            <li key={person.value}>{person.label}</li>
          ))}
        </ul>
      )}
      <Combobox.Input
        onChange={(event) => setQuery(event.target.value)}
      />
      <Combobox.Options >
        {filteredUsers.map((user) => (
          <Combobox.Option key={user.value} value={user}>
            {user.label}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  )
}

export default FriendBox;
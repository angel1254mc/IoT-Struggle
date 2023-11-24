// Function to generate a random alphanumeric string for user IDs
function generateRandomUserID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
}

// Function to generate fake user data
function generateFakeUserData(numUsers) {
  const fakeUserData = [];

  for (let i = 0; i < numUsers; i++) {
    const displayName = `User ${i + 1}`;
    const userID = generateRandomUserID(8); // You can adjust the length as needed

    fakeUserData.push({
      label: displayName,
      value: userID,
    });
  }

  return fakeUserData;
}


export {generateFakeUserData}

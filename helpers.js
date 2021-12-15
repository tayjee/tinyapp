//Function that generates a random alphanumeric string combination.
function generateRandomString(length) {
  //Array to hold all the alphanumeric values (including both lower and upper case).
  const alphaNumeric = [
    'A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e',
    'F', 'f', 'G', 'g', 'H', 'h', 'I', 'i', 'J', 'j',
    'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o',
    'P', 'p', 'Q', 'q', 'R', 'r', 'S', 's', 'T', 't',
    'U', 'u', 'V', 'v', 'W', 'w', 'X', 'x', 'Y', 'y',
    'Z', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    //Empty array to push the random string into
  const array = [];
  //Loop with the Math.random function to determine the alphaNumeric index to be pushed into the combined string
  for (let i = 0; i < length; i++) {
    array.push(alphaNumeric[Math.round(Math.random() * 62)]);
  }
  //Joins all the seperate characters into a singular random alphanumeric string.
  return array.join('');
}

//Function to check if any of the emails in the users object match the inputted email.
function matchingEmail(email, users) {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}
//Function similar to matchingEmail but returns a different output.
function getUserByEmail(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
}
//Function that returns the URLs where the ID is equal to the currently logged-in user.
function urlsForUser(id, database) {
  const object = {};
  for (const key in database) {
    if (database[key]["userID"] === id) {
      object[key] = database[key];
    }
  }
  return object;
};

module.exports = {generateRandomString, matchingEmail, getUserByEmail, urlsForUser }
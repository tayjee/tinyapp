const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

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
function matchingEmail(email) {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}
//Function similar to matchingEmail but returns a different output.
function loginCheck(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
}
//Function that returns the URLs where the ID is equal to the currently logged-in user.
function urlsForUser(id) {
  const object = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      object[key] = urlDatabase[key];
    }
  }
  return object;
};

const urlDatabase = {
  "b6UTxQ": {
      longURL: "https://www.tsn.ca",
      userID: "test1234"
  },
  "Zw54dW": {
    longURL: "https://github.com",
    userID: "test4321"
  },
  "i3BoGr": {
      longURL: "https://www.google.ca",
      userID: "test1234"
  }
};

const users = {
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  let filteredURL = urlsForUser(userID);
  const templateVars = { urls: filteredURL, user: users[userID] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  if(userID === undefined) {
    res.redirect('/login');
  } else {
    let short = generateRandomString(6);
    const { longURL } = req.body;
    urlDatabase[short] = {longURL, userID};
    res.redirect(`/urls/${short}`);
  }
});

app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  if(userID === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res.send("400 Bad Request");
  } else if (matchingEmail(email)) {
    res.send('400 Email Already Exists');
  } else {
    const id = generateRandomString(8);
    users[id] = {id, email, hashedPassword};
    let userID = users[id].id
    req.body.user_id = userID;
    res.redirect('/urls');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL].longURL;
  if (redirectURL != undefined) {
    res.redirect(redirectURL);
  } else {
    res.send("404 Error Page Not Found");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let userID = req.session.user_id;

  if (urlDatabase[shortURL].userID !== String(userID)) {
    res.send("URL does not belong to you.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  let userID = req.session.user_id;

  if (urlDatabase[shortURL].userID !== String(userID)) {
    res.send("URL does not belong to you.");
  }

  let newLongURL = Object.values(req.body)[0];
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = loginCheck(email).hashedPassword
  const compareSync = bcrypt.compareSync(password, hashedPassword);
  const login = loginCheck(email);
  const id = login.id

  if (!login || compareSync === false) {
    res.send("Incorrect Username or Password");
    return;
  }

  req.session.user_id = login.id
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  const id = req.body.user_id;
  req.session = null;
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
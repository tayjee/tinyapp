const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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

function matchingEmail(email) {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

function loginCheck(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Vn2b3s": "http://www.google.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "test1234": {
    id: "test1234",
    email: "test@test.com",
    password: "test"
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  if(userID === undefined) {
    res.redirect('/login');
  } else {
    let short = generateRandomString(6);
    urlDatabase[short] = req.body.longURL;
    res.redirect(`/urls/${short}`);
  }
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { user: users[userID] };

  if(userID === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { user: users[userID] };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.send("400 Bad Request");
  } else if (matchingEmail(email)) {
    res.send('400 Email Already Exists');
  } else {
    let userID = req.cookies_id;
    const id = generateRandomString(8);
    users[id] = {id, email, password};
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let userID = req.cookies.user_id;
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL != undefined) {
    res.redirect(longURL);
  } else {
    res.send("404 Error Page Not Found");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  let newLongURL = Object.values(req.body)[0];
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/login", (req, res) => {
  let userID = req.cookies.user_id;
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const login = loginCheck(email);
  /*
  console.log(`email = ${email}`);
  console.log(`password = ${password}`);
  console.log (`login = ${login}`);
  console.log(`login.password = ${login.password}`); 
  */

  if (!login || login.password !== password) {
    res.send("Incorrect Username or Password");
    return;
  }
  const id = login.id
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
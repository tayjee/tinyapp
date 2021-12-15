const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const {generateRandomString, matchingEmail, getUserByEmail, urlsForUser } = require('./helpers.js');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

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
  "abcdefg" : {
    id: 'abcdefg',
    email: 'test@test.com',
    password: 'test' 
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const database = urlDatabase;
  let filteredURL = urlsForUser(userID, database);
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
  } else if (matchingEmail(email, users)) {
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
  const hashedPassword = getUserByEmail(email, users).hashedPassword
  const compareSync = bcrypt.compareSync(password, hashedPassword);
  const login = getUserByEmail(email, users);
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
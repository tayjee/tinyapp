//Neccessities
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {generateRandomString, matchingEmail, getUserByEmail, urlsForUser} = require('./helpers.js');

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//Object to hold the longURL associated with a shortURL and also the user who created the shortened URL.
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

//Object to hold information on the users (id, email, password).
const users = {
  "abcdefg" : {
    id: 'abcdefg',
    email: 'test@test.com',
    password: 'test'
  }
};

//Function to check if currently logged in user is the same as the user who created the URL
const currentUser = (shortURL, currentID) => {
  if (urlDatabase[shortURL].userID === currentID) {
    return true;
  }
  return false;
};


//Routes
app.get("/", (req, res) => {
  res.redirect('/login');
});

//Main page for users to see the shortened URLs that they created.
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const database = urlDatabase;
  let filteredURL = urlsForUser(userID, database);
  const templateVars = { urls: filteredURL, user: users[userID] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  if (userID === undefined) {
    res.redirect('/login');
  } else {
    let short = generateRandomString(6);
    const { longURL } = req.body;
    urlDatabase[short] = {longURL, userID};
    res.redirect(`/urls/${short}`);
  }
});

//Page for user to create a new shortened URL.
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  if (userID === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

//Registration page
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
    res.send("You must enter both an email and password!");
  } else if (matchingEmail(email, users)) {
    res.send('Email Already Exists!');
  } else {
    const id = generateRandomString(8);
    users[id] = {id, email, hashedPassword};
    let userID = users[id].id;
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send("This shortened URL does not exist!");
  }
  const longURL = urlDatabase[shortURL].longURL;

  if (!currentUser(shortURL, userID)) {
    res.send("You do not own this URL!");
  } else if (currentUser(shortURL, userID)) {
    const templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      user: users[userID]
    };
    res.render('urls_show', templateVars);
  }
});

//If user paths to this destination they get redirected to the long URL.
app.get("/u/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.send("This shortened URL does not exist!");
  }

  if (!currentUser(shortURL, userID)) {
    res.send("You do not own this URL!");
  }

  let short = urlDatabase[shortURL];

  if (!short) {
    res.send("404 Error Page Not Found");
  } else {
    let redirectURL = short.longURL;
    res.redirect(redirectURL);
  }
});

//Function that allows users to delete shortened URL entries that they created.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let userID = req.session.user_id;

  if (urlDatabase[shortURL].userID !== String(userID)) {
    res.send("URL does not belong to you.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Page that allows user to edit the destination of their short URL.
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

//Page that shows the url database in json format.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Login page
app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const login = getUserByEmail(email, users);

  if (!login) {
    res.status(403).send("User does not exist!");
    return;
  }

  const hashedPassword = getUserByEmail(email, users).hashedPassword;
  const compareSync = bcrypt.compareSync(password, hashedPassword);

  if (!login || compareSync === false) {
    res.send("Incorrect Username or Password");
    return;
  } else {
    req.session.user_id = login.id;
    res.redirect('/urls');
  }
});

//Clears cookies and session on logout.
app.post('/logout', (req, res) => {
  req.session = null;
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
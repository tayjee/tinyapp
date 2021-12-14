const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Vn2b3s": "http://www.google.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString(6)
  urlDatabase[short] = req.body.longURL
  res.redirect(`/urls/${short}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(8);
  users[id] = {id, email, password};
  /*let userID = generateRandomString(8);
  console.log(userID);
  users[userID]["user id"] = userID
  users[userID]["email"] = email
  users[userID]["password"] = password
  console.log(users); */
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
 if (longURL != undefined) {
  res.redirect(longURL);
 } else {
  res.send("404 Error Page Not Found")
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
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8000;

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser
} = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["hXlF4ON92Ej4kH_nLmzkqI_Zki0"],
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    createdDate: "",
    visitCount: 0,
    uniqueVisits: 0,
    visitors: {}
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
    createdDate: "",
    visitCount: 0,
    uniqueVisits: 0,
    visitors: {}
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!users[userID]) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!users[userID]) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
  }
  const database = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: database,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!users[userID]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (users[userID]) {
    return res.redirect("/urls");
  }
  res.render("register", { user: null });
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (users[userID]) {
    return res.redirect("/urls");
  }
  res.render("login", { user: null });
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;

  if (!urlDatabase[id]) {
    return res.status(404).render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
  }
  if (!users[userID]) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
  }
  if (urlDatabase[id].userID !== userID) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: null
    });
  }
  const templateVars = {
    id,
    user: users[userID],
    longURL: urlDatabase[id].longURL,
    createdDate: urlDatabase[id].createdDate,
    visitCount: urlDatabase[id].visitCount,
    uniqueVisits: urlDatabase[id].uniqueVisits,
    visitors: urlDatabase[id].visitors
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]?.longURL;
  if (!longURL) {
    return res.status(404).send("URL not found");
  }

  req.session.views = (req.session.views || 0) + 1;
  urlDatabase[id].visitCount = req.session.views;

  const visitorID = req.session.visitorID || generateRandomString();
  req.session.visitorID = visitorID;

  if (!urlDatabase[id].visitors[visitorID]) {
    urlDatabase[id].visitors[visitorID] = {
      timestamp: new Date().toUTCString(),
    };
    urlDatabase[id].uniqueVisits = (urlDatabase[id].uniqueVisits || 0) + 1;
  }

  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userID = req.session.userID;

  if (!users[userID]) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
  }

  const longURL = req.body.longURL;
  const id = generateRandomString();

  urlDatabase[id] = {
    longURL,
    userID,
    createdDate: new Date().toUTCString(),
    visitCount: 0,
    uniqueVisits: 0,
    visitors: {}
  };

  res.redirect(`/urls/${id}`);
});

app.put("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;

  if (!urlDatabase[id]) {
    return res.status(404).render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
  }
  if (!users[userID] || urlDatabase[id].userID !== userID) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: "/login"
    });
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.delete("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;

  if (!urlDatabase[id]) {
    return res.status(404).render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
  }
  if (!users[userID] || urlDatabase[id].userID !== userID) {
    return res.status(403).render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: "/login"
    });
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render("errorPage", {
      status: 400,
      message: "Please enter valid Email Address and Password",
      redirectLink: "/register"
    });
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).render("errorPage", {
      status: 400,
      message: "Account already exists with this email",
      redirectLink: "/register"
    });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, hashedPassword };
  req.session.userID = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(401).render("errorPage", {
      status: 401,
      message: "Invalid email or password.",
      redirectLink: "/login"
    });
  }
  req.session.userID = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).render("errorPage", {
    status: 404,
    message: "Page Not Found",
    redirectLink: "/login"
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
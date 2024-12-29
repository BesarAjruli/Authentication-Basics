/////// app.js
require("dotenv").config();

const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index", { user: req.user }));
app.get("/sign-up", (req, res) => res.render("signUp-form"));
app.post("/sign-up", async (req, res, next) => {
  try {
    pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      req.body.password,
    ]);
    res.redirect("/");
  } catch (error) {
    return next(error);
  }
});
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

passport.use(
  new LocalStrategy(async (usernmae, password, done) => {
    const { rows } = await db.query("SELECT * users WHERE username = $1", [
      usernmae,
    ]);
    const user = rows[0];

    try {
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.passport !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  return done(nul, user.is);
});
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

app.listen(3000, () => console.log("app listening on port 3000!"));

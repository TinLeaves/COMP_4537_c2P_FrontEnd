require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const port = 3000;
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// app.use("/views", express.static(path.join(__dirname, "views")));
// app.use("/js", express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const bcrypt = require("bcrypt");

app.set("trust proxy", 1);
app.use(
  cors({
    origin: [process.env.SITE_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ███████╗ ███████╗ ███████╗ ███████╗ ██╗  ██████╗  ███╗   ██╗ ███████╗
// ██╔════╝ ██╔════╝ ██╔════╝ ██╔════╝ ██║ ██╔═══██╗ ████╗  ██║ ██╔════╝
// ███████╗ █████╗   ███████╗ ███████╗ ██║ ██║   ██║ ██╔██╗ ██║ ███████╗
// ╚════██║ ██╔══╝   ╚════██║ ╚════██║ ██║ ██║   ██║ ██║╚██╗██║ ╚════██║
// ███████║ ███████╗ ███████║ ███████║ ██║ ╚██████╔╝ ██║ ╚████║ ███████║

const isProduction = process.env.NODE_ENV === "production";
const mongodb_url = process.env.MONGODB_URL;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongoStore = MongoStore.create({
  mongoUrl: mongodb_url,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: isProduction === "true",
      maxAge: 60 * 60 * 1000,
    },
  })
);

/**
 * Helper: sets current session identifer level
 *
 * @param {string} identifer
 */
function setAuthLevel(identifer, req) {
  if (identifer === process.env.ADMIN_IDENTIFIER) {
    req.session.userLevel = "admin";
  } else if (identifer === process.env.USER_IDENTIFIER) {
    req.session.userLevel = "user";
  }
}

/**
 * Middleware: checks if user level is admin
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function checkAdmin(req, res, next) {
  if (req.session.userLevel === "admin") {
    return next();
  } else {
    return res.redirect("/401");
  }
}

/**
 * Middleware: checks if user logged in
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const checkLoggedIn = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  } else {
    return res.redirect("/401");
  }
};

// ██╗  ██╗  ██████╗  ███╗   ███╗ ███████╗         ██╗
// ██║  ██║ ██╔═══██╗ ████╗ ████║ ██╔════╝        ██╔╝
// ███████║ ██║   ██║ ██╔████╔██║ █████╗         ██╔╝
// ██╔══██║ ██║   ██║ ██║╚██╔╝██║ ██╔══╝        ██╔╝
// ██║  ██║ ╚██████╔╝ ██║ ╚═╝ ██║ ███████╗     ██╔╝
// ╚═╝  ╚═╝  ╚═════╝  ╚═╝     ╚═╝ ╚══════╝     ╚═╝

app.get("/home", (req, res) => {
  if (!req.session.authToken || !req.session.userLevel) {
    return res.redirect("/login");
  }
  console.log("/home: current session level:", req.session.userLevel);

  res.render("home", {
    userEmail: req.session.email,
    userLevel: req.session.userLevel,
  });
});

app.get("/", (req, res) => {
  if (req.session.authToken) {
    return res.redirect("/home");
  }
  res.redirect("/login");
});

//   ██████╗  ███████╗  ██████╗  ██╗ ███████╗ ████████╗ ███████╗ ██████╗
//   ██╔══██╗ ██╔════╝ ██╔════╝  ██║ ██╔════╝ ╚══██╔══╝ ██╔════╝ ██╔══██╗
//   ██████╔╝ █████╗   ██║  ███╗ ██║ ███████╗    ██║    █████╗   ██████╔╝
//   ██╔══██╗ ██╔══╝   ██║   ██║ ██║ ╚════██║    ██║    ██╔══╝   ██╔══██╗
//   ██║  ██║ ███████╗ ╚██████╔╝ ██║ ███████║    ██║    ███████╗ ██║  ██║
//   ╚═╝  ╚═╝ ╚══════╝  ╚═════╝  ╚═╝ ╚══════╝    ╚═╝    ╚══════╝ ╚═╝  ╚═╝

app.get("/register", (req, res) => {
  res.render("register", { errorMessage: null }); // Render 'register.ejs' with no error by default
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log("email:", email);
  console.log("password:", password);

  if (!email || !password) {
    return res.render("register", {
      errorMessage: "Both fields are required.",
    });
  }

  try {
    // Registration request
    const registerResponse = await axios.post(
      "https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/register/",
      { email, password }, // Send the data as JSON
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Changed to JSON for better compatibility with API
        },
      }
    );

    const { success, message, userId, jwtToken, identifier } =
      registerResponse.data;

    if (success) {
      console.log("Registration successful:", message);

      // Automatically log in after successful registration
      const loginResponse = await axios.post(
        "https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/login/",
        { email, password },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const {
        success: loginSuccess,
        message: loginMessage,
        jwtToken: loginToken,
        userId: loginUserId,
        identifier: loginIdentifier,
      } = loginResponse.data;

      if (loginSuccess) {
        console.log("Login successful:", loginMessage);
        req.session.authToken = loginToken;
        req.session.userId = loginUserId;
        req.session.email = email;
        setAuthLevel(loginIdentifier, req);
        console.log("current session level:", req.session.userLevel);

        // Redirect based on user level
        if (req.session.userLevel === "admin") {
          return res.redirect("/admin");
        } else if (req.session.userLevel === "user") {
          return res.redirect("/home");
        } else {
          return res.status(401).send({ error: "Invalid user level." });
        }
      } else {
        return res.render("register", {
          errorMessage: "Login after registration failed.",
        });
      }
    } else {
      return res.render("register", {
        errorMessage: registerResponse.data.error || "Registration failed.",
      });
    }
  } catch (error) {
    console.error(
      "Error during registration:",
      error.response?.data?.error || error.message
    );
    return res.render("register", {
      errorMessage:
        error.response?.data?.error || "An error occurred. Please try again.",
    });
  }
});

// ██╗       ██████╗   ██████╗  ██╗ ███╗   ██╗
// ██║      ██╔═══██╗ ██╔════╝  ██║ ████╗  ██║
// ██║      ██║   ██║ ██║  ███╗ ██║ ██╔██╗ ██║
// ██║      ██║   ██║ ██║   ██║ ██║ ██║╚██╗██║
// ███████╗ ╚██████╔╝ ╚██████╔╝ ██║ ██║ ╚████║
// ╚══════╝  ╚═════╝   ╚═════╝  ╚═╝ ╚═╝  ╚═══╝

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null }); // Render 'login.ejs' with no error by default
});

/**
 * 
 * 
 * Server response object:
 *  "success": boolean
    "message": string
    "userId": integer
    "jwtToken": string
    "identifier": string
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("email:", email);
  console.log("password:", password);
  if (!email || !password) {
    return res
      .status(400)
      .send({ error: "Both email and password are required." });
  }

  try {
    const response = await axios.post(
      "https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/login/",
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { success, message, userId, jwtToken, identifier } = response.data;

    if (success) {
      console.log("is success:", success);
      console.log("Login successful:", message);
      req.session.authToken = jwtToken;
      req.session.userId = userId;
      req.session.email = email;
      req.session.authenticated = true;
      setAuthLevel(identifier, req);
      console.log("current session level:", req.session.userLevel);
      console.log("Redirecting...");
      if (req.session.userLevel === "admin") {
        return res.redirect("/admin");
      } else if (req.session.userLevel === "user") {
        return res.redirect("/home");
      } else {
        return res.status(401).send({ error: "Invalid user level." });
      }
    } else {
      res.render("login", { errorMessage: "Invalid email or password." });
    }
  } catch (error) {
    console.error(
      "Error during login:",
      error.response.data.error,
      "\n Status code:",
      error.response.status
    );
    res.render("login", { errorMessage: error.response.data.error });
  }
});

//  █████╗  ██╗     ███████╗ ███╗   ██╗ ██████╗  ██████╗   ██████╗  ██╗ ███╗   ██╗ ████████╗ ███████╗
// ██╔══██╗ ██║     ██╔════╝ ████╗  ██║ ██╔══██╗ ██╔══██╗ ██╔═══██╗ ██║ ████╗  ██║ ╚══██╔══╝ ██╔════╝
// ███████║ ██║     █████╗   ██╔██╗ ██║ ██║  ██║ ██████╔╝ ██║   ██║ ██║ ██╔██╗ ██║    ██║    ███████╗
// ██╔══██║ ██║     ██╔══╝   ██║╚██╗██║ ██║  ██║ ██╔═══╝  ██║   ██║ ██║ ██║╚██╗██║    ██║    ╚════██║
// ██║  ██║ ██║     ███████╗ ██║ ╚████║ ██████╔╝ ██║      ╚██████╔╝ ██║ ██║ ╚████║    ██║    ███████║
// ╚═╝  ╚═╝ ╚═╝     ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═╝       ╚═════╝  ╚═╝ ╚═╝  ╚═══╝    ╚═╝    ╚══════╝

app.get("/ai", checkLoggedIn, async (req, res) => {
  try {
    const response = await axios.get(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/`,
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    res.render("ai", { pageNames: response?.data?.pages });
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.render("401"); // change to 404
    return;
  }
});

app.post("/createPage", async (req, res) => {
  const { pageName, description } = req.body;

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/`,
      {
        name: pageName,
        description: description,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.post("/createContext", async (req, res) => {
  const { pageName, context } = req.body;

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/${pageName}/`,
      {
        text: context,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error);
    return res.status(500).send({ error: error });
  }
});

app.post("/askBot", async (req, res) => {
  const { pageName, question } = req.body;
  let answers = "";

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/${pageName}/ask/`,
      {
        question,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error?.response?.data?.error);
    return res.status(500).send({ error: error?.response?.data?.error });
  }
});

app.get("/aiEdit", checkLoggedIn, async (req, res) => {
  try {
    const response = await axios.get(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/`,
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    res.render("aiEdit", { pageNames: response?.data?.pages });
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.render("401"); // change to 404
  }
});

app.patch("/editPage", async (req, res) => {
  const { pageName, newPageName, description } = req.body;
  try {
    const response = await axios.patch(
      // `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/`,
      `http://127.0.0.1:8000/api/v1/bot/page/`,
      {
        name: pageName,
        new_name: newPageName,
        description: description,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.delete("/deletePage", async (req, res) => {
  const { pageName } = req.body;

  try {
    const response = await axios.delete(
      // `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/page/`,
      `http://127.0.0.1:8000/api/v1/bot/page/`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
        data: {
          name: pageName,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.post("/getPageContext", async (req, res) => {
  const { pageName } = req.body;

  try {
    const response = await axios.get(
      // `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${pageName}/`,
      `http://127.0.0.1:8000/api/v1/bot/page/${pageName}/`,
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.patch("/editContext", async (req, res) => {
  const { pageName, id, text } = req.body;
  try {
    const response = await axios.patch(
      // `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${pageName}/`,
      `http://127.0.0.1:8000/api/v1/bot/page/${pageName}/`,
      {
        id: id,
        text: text,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.delete("/deleteContext", async (req, res) => {
  const { pageName, id } = req.body;

  try {
    const response = await axios.delete(
      // `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${pageName}/`,
      `http://127.0.0.1:8000/api/v1/bot/page/${pageName}/`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
        data: {
          id: id,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

//  █████╗  ██████╗  ███╗   ███╗ ██╗ ███╗   ██╗
// ██╔══██╗ ██╔══██╗ ████╗ ████║ ██║ ████╗  ██║
// ███████║ ██║  ██║ ██╔████╔██║ ██║ ██╔██╗ ██║
// ██╔══██║ ██║  ██║ ██║╚██╔╝██║ ██║ ██║╚██╗██║
// ██║  ██║ ██████╔╝ ██║ ╚═╝ ██║ ██║ ██║ ╚████║
// ╚═╝  ╚═╝ ╚═════╝  ╚═╝     ╚═╝ ╚═╝ ╚═╝  ╚═══╝
app.get("/admin", checkAdmin, async (req, res) => {
  console.log("/admin: current session level:", req.session.userLevel);
  const apiCallToGetStatsAllUsers = await callGetAllUsersStats(req);

  const users = apiCallToGetStatsAllUsers.userStats;

  res.render("admin", { users: users, userLevel: req.session.userLevel });
});

/**
 * Helper: calls the server API to get all users' stats. Only admin-level users can access this endpoint.
 *
 * @param {*} req
 * @returns response object:
 * ```
 * {
 *   "userStats": [
 *     {
 *       "user_id": integer,
 *       "user__email": string,
 *       "token_count": integer,
 *       "request_count": integer,
 *     }, ...
 *   ]
 * }
 * ```
 */
async function callGetAllUsersStats(req) {
  try {
    const response = await axios.get(
      "https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/userStats/",
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    // console.log("callGetAllUsersStats(): response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("callGetAllUsersStats(): Error during fetch:", error);
    return { error: error };
  }
}

// ██████╗  ██████╗   ██████╗  ████████╗ ███████╗  ██████╗ ████████╗ ███████╗ ██████╗
// ██╔══██╗ ██╔══██╗ ██╔═══██╗ ╚══██╔══╝ ██╔════╝ ██╔════╝ ╚══██╔══╝ ██╔════╝ ██╔══██╗
// ██████╔╝ ██████╔╝ ██║   ██║    ██║    █████╗   ██║         ██║    █████╗   ██║  ██║
// ██╔═══╝  ██╔══██╗ ██║   ██║    ██║    ██╔══╝   ██║         ██║    ██╔══╝   ██║  ██║
// ██║      ██║  ██║ ╚██████╔╝    ██║    ███████╗ ╚██████╗    ██║    ███████╗ ██████╔╝
// ╚═╝      ╚═╝  ╚═╝  ╚═════╝     ╚═╝    ╚══════╝  ╚═════╝    ╚═╝    ╚══════╝ ╚═════╝

/**
 * API endpoint to get user stats and render the user page.
 */
app.get("/user", async (req, res) => {
  console.log("/user: current session level:", req.session.userLevel);
  // res.sendFile(path.join(__dirname, "views", "user.html"));
  const results = await callGetUserStats(req.session.userId, req);
  const user = {
    userId: results.user_id,
    email: results.user__email,
    apiCallsRemaining: results.token_count,
    apiCallsUsed: results.request_count,
  };

  res.render("user", { user: user });
});

/**
 * API call to get all users' stats. Only admin-level users can access this endpoint.
 */
app.get("/getAllUsersStats", checkAdmin, async (req, res) => {
  try {
    const response = await axios.get(
      "https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/userStats/",
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    const results = response.data;
    const users = results.userStats;
    console.log("/getAllUsersStats: users object:", users);

    // res.send(data);
    res.send(users);
  } catch (error) {
    console.error("Error during fetch:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
});

// API call to get user stats
app.get("/getUserStats", async (req, res) => {
  try {
    const response = await axios.get(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/stats/${req.session.userId}/`,
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    const data = response.data;
    console.log("data:", data);
    res.send(data);
  } catch (error) {
    console.error("Error during fetch:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
});

/**
 * Helper: calls the server API to get the specified user's stats.
 *
 * The server will only return the stats of the user making the request, except for admin-level users which can get the stats of any user.
 *
 * @param {integer} userId
 * @param {*} req an Express request object
 * @returns response object:
 * ```
 * {
 *   "user_id": integer,
 *   "user__email": string,
 *   "token_count": integer,
 *   "request_count": integer,
 * }
 * ```
 */
async function callGetUserStats(userId, req) {
  try {
    const response = await axios.get(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/stats/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );
    console.log("callGetUserStats(): response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("callGetUserStats(): Error during fetch:", error);
    return { error: error };
  }
}

//  ██╗       ██████╗   ██████╗   ██████╗  ██╗   ██╗ ████████╗
//  ██║      ██╔═══██╗ ██╔════╝  ██╔═══██╗ ██║   ██║ ╚══██╔══╝
//  ██║      ██║   ██║ ██║  ███╗ ██║   ██║ ██║   ██║    ██║
//  ██║      ██║   ██║ ██║   ██║ ██║   ██║ ██║   ██║    ██║
//  ███████╗ ╚██████╔╝ ╚██████╔╝ ╚██████╔╝ ╚██████╔╝    ██║
//  ╚══════╝  ╚═════╝   ╚═════╝   ╚═════╝   ╚═════╝     ╚═╝

app.post("/logout", (req, res) => {
  console.log("Logging out...");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out, try again later.");
    }
    res.redirect("/login"); // Redirect to login page after successful logout
  });
});

//  ██╗  ██╗   ██████╗    ██╗
//  ██║  ██║  ██╔═████╗  ███║
//  ███████║  ██║██╔██║  ╚██║
//  ╚════██║  ████╔╝██║   ██║
//       ██║  ╚██████╔╝   ██║
//       ╚═╝   ╚═════╝    ╚═╝

app.get("/401", (req, res) => {
  res.status(401).render("401");
});

app.get("/*", (req, res) => {
  console.log("404 Error - Page Not Found");
  res.status(404).render("404");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;

require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();
const port = 3000;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const cookieParser = require("cookie-parser");

app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const bcrypt = require("bcrypt");

// ███████╗ ███████╗ ███████╗ ███████╗ ██╗  ██████╗  ███╗   ██╗ ███████╗
// ██╔════╝ ██╔════╝ ██╔════╝ ██╔════╝ ██║ ██╔═══██╗ ████╗  ██║ ██╔════╝
// ███████╗ █████╗   ███████╗ ███████╗ ██║ ██║   ██║ ██╔██╗ ██║ ███████╗
// ╚════██║ ██╔══╝   ╚════██║ ╚════██║ ██║ ██║   ██║ ██║╚██╗██║ ╚════██║
// ███████║ ███████╗ ███████║ ███████║ ██║ ╚██████╔╝ ██║ ╚████║ ███████║

app.use(
  session({
    secret: node_session_secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // @TODO: set to true if using https
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

// ██╗  ██╗  ██████╗  ███╗   ███╗ ███████╗         ██╗
// ██║  ██║ ██╔═══██╗ ████╗ ████║ ██╔════╝        ██╔╝
// ███████║ ██║   ██║ ██╔████╔██║ █████╗         ██╔╝
// ██╔══██║ ██║   ██║ ██║╚██╔╝██║ ██╔══╝        ██╔╝
// ██║  ██║ ╚██████╔╝ ██║ ╚═╝ ██║ ███████╗     ██╔╝
// ╚═╝  ╚═╝  ╚═════╝  ╚═╝     ╚═╝ ╚══════╝     ╚═╝

app.get("/home", (req, res) => {
  if (!req.session.authToken || !req.session.userLevel) {
    return res.redirect("/login"); // If no valid session, redirect to login
  }
  console.log("current session level:", req.session.userLevel);
  res.sendFile(path.join(__dirname, "views", "home.html"));
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
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register", async (req, res) => {
  // TODO
});

// ██╗       ██████╗   ██████╗  ██╗ ███╗   ██╗
// ██║      ██╔═══██╗ ██╔════╝  ██║ ████╗  ██║
// ██║      ██║   ██║ ██║  ███╗ ██║ ██╔██╗ ██║
// ██║      ██║   ██║ ██║   ██║ ██║ ██║╚██╗██║
// ███████╗ ╚██████╔╝ ╚██████╔╝ ██║ ██║ ╚████║
// ╚══════╝  ╚═════╝   ╚═════╝  ╚═╝ ╚═╝  ╚═══╝

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

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
      return res.status(401).send({ error: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
});

//  █████╗  ██╗     ███████╗ ███╗   ██╗ ██████╗  ██████╗   ██████╗  ██╗ ███╗   ██╗ ████████╗ ███████╗
// ██╔══██╗ ██║     ██╔════╝ ████╗  ██║ ██╔══██╗ ██╔══██╗ ██╔═══██╗ ██║ ████╗  ██║ ╚══██╔══╝ ██╔════╝
// ███████║ ██║     █████╗   ██╔██╗ ██║ ██║  ██║ ██████╔╝ ██║   ██║ ██║ ██╔██╗ ██║    ██║    ███████╗
// ██╔══██║ ██║     ██╔══╝   ██║╚██╗██║ ██║  ██║ ██╔═══╝  ██║   ██║ ██║ ██║╚██╗██║    ██║    ╚════██║
// ██║  ██║ ██║     ███████╗ ██║ ╚████║ ██████╔╝ ██║      ╚██████╔╝ ██║ ██║ ╚████║    ██║    ███████║
// ╚═╝  ╚═╝ ╚═╝     ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═╝       ╚═════╝  ╚═╝ ╚═╝  ╚═══╝    ╚═╝    ╚══════╝

app.get("/ai", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "ai.html"));
});

app.post("/createPage", async (req, res) => {
  const { pageName } = req.body;

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${req.session.userId}/page/`,
      {
        name: pageName,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.session.authToken}`,
        },
      }
    );

    return res.redirect("/ai");
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.post("/createContext", async (req, res) => {
  const { contextPageName, context } = req.body;

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${req.session.userId}/page/${contextPageName}/`,
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
    return res.redirect("/ai");
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

app.post("/askBot", async (req, res) => {
  const { questionPageName, question } = req.body;
  let answers = "";

  try {
    const response = await axios.post(
      `https://comp4537-c2p-api-server-1.onrender.com/api/v1/bot/${req.session.userId}/ask/${questionPageName}/`,
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

    response.data.response.forEach((answer) => {
      answers += `
        <p>${answer}</p>
        <br />
      `;
    });
    console.log("answers:", answers);

    const htmlPage = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <link rel="stylesheet" href="/styles/style.css" />
      </head>

      <body>
        <div id="home-content">
          <h1>COMP4537 - C2P - AI-Powered Notebook</h1>
          <p>Welcome to the AI page</p>
          <main>
            <h3>Create a Page</h3>
            <form action="/createPage" method="POST">
              <label for="pageName"
                >Enter the page name for your context collection?</label
              >
              <br />
              <input
                type="text"
                name="pageName"
                placeholder="Enter the Page name"
                required
              />
              <br />
              <button type="submit">Create</button>
            </form>

            <h3>Upload context to a page</h3>
            <form action="/createContext" method="POST">
              <label for="contextPageName"
                >Enter the page name for this context:</label
              >
              <br />
              <input
                type="text"
                name="contextPageName"
                placeholder="Enter the Page name"
                required
              />
              <br />
              <br />
              <label for="context">Enter the context:</label>
              <br />
              <textarea
                type="text"
                name="context"
                placeholder="Enter the context"
                required
              ></textarea>
              <br />
              <button type="submit">Upload</button>
            </form>

            <h3>Let's ask some question to our AI on your context</h3>
            <form action="/askBot" method="POST">
              <label for="questionPageName"
                >Enter the page name for your context:</label
              >
              <br />
              <input
                type="text"
                name="questionPageName"
                placeholder="Enter the Page name"
                required
              />
              <br />
              <br />
              <label for="question">Enter the question:</label>
              <br />
              <input
                type="text"
                name="question"
                placeholder="Enter the question"
                required
              />
              <br />
              <button type="submit">Ask</button>
            </form>
            ${answers}
          </main>
          <br>
          <form action="/logout" method="POST">
            <button type="submit">Logout</button>
          </form>
        </div>

        <script src="/js/utils.js"></script>
      </body>
    </html>
    `;
    return res.send(htmlPage);
  } catch (error) {
    console.error("Error during fetch:", error.response.data.error);
    return res.status(500).send({ error: error.response.data.error });
  }
});

// ██████╗  ██████╗   ██████╗  ████████╗ ███████╗  ██████╗ ████████╗ ███████╗ ██████╗
// ██╔══██╗ ██╔══██╗ ██╔═══██╗ ╚══██╔══╝ ██╔════╝ ██╔════╝ ╚══██╔══╝ ██╔════╝ ██╔══██╗
// ██████╔╝ ██████╔╝ ██║   ██║    ██║    █████╗   ██║         ██║    █████╗   ██║  ██║
// ██╔═══╝  ██╔══██╗ ██║   ██║    ██║    ██╔══╝   ██║         ██║    ██╔══╝   ██║  ██║
// ██║      ██║  ██║ ╚██████╔╝    ██║    ███████╗ ╚██████╗    ██║    ███████╗ ██████╔╝
// ╚═╝      ╚═╝  ╚═╝  ╚═════╝     ╚═╝    ╚══════╝  ╚═════╝    ╚═╝    ╚══════╝ ╚═════╝

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
    const data = response.data;

    res.send(data);
  } catch (error) {
    console.error("Error during fetch:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
});

app.get("/user", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "user.html"));
});

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

//  █████╗  ██████╗  ███╗   ███╗ ██╗ ███╗   ██╗
// ██╔══██╗ ██╔══██╗ ████╗ ████║ ██║ ████╗  ██║
// ███████║ ██║  ██║ ██╔████╔██║ ██║ ██╔██╗ ██║
// ██╔══██║ ██║  ██║ ██║╚██╔╝██║ ██║ ██║╚██╗██║
// ██║  ██║ ██████╔╝ ██║ ╚═╝ ██║ ██║ ██║ ╚████║
// ╚═╝  ╚═╝ ╚═════╝  ╚═╝     ╚═╝ ╚═╝ ╚═╝  ╚═══╝
app.get("/admin", checkAdmin, (req, res) => {
  console.log("current session level:", req.session.userLevel);
  const users = [];
  // res.sendFile(path.join(__dirname, "views", "admin.html"));
  res.render("admin", { users: users, userLevel: req.session.userLevel });
});
                                     


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
  res.sendFile(path.join(__dirname, "views", "401.html"));
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;

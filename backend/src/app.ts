import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import session from "express-session";

import path from "path";
import addresRouter from "./router/addres.route";
import rolesRoute from "./router/roles.route";
import signinRoute from "./router/signin.route";
import subscribeRouter from "./router/subscribe.route";
import usersRoute from "./router/users.route";
import chatPersonalRoute from "./router/chat.route";
import messageChatRoute from "./router/message.route";
const app: Application = express();

// 1️⃣ CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  })
);

// 2️⃣ Preflight
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 3️⃣ Body parser
app.use(express.json()); // untuk JSON
app.use(express.urlencoded({ extended: true })); // untuk x-www-form-urlencoded

// 4️⃣ Static folder
app.use("/images", express.static(path.join(__dirname, "/images")));

// 5️⃣ Session
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // localhost
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// 6️⃣ Routes
app.use("/api/users", usersRoute);
app.use("/api/address", addresRouter);
app.use("/api/roles", rolesRoute);
app.use("/api/signin", signinRoute);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/chatpersonal", chatPersonalRoute);
app.use("/api/message", messageChatRoute);

export default app;

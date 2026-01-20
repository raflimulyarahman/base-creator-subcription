import cors from "cors";
import express, { Application } from "express";
import session from "express-session";

import path from "path";
import addresRouter from "./router/addres.route";
import chatPersonalRoute from "./router/chat.route";
import groupChatRoute from "./router/grouchat.route";
import messageChatRoute from "./router/message.route";
import rolesRoute from "./router/roles.route";
import signinRoute from "./router/signin.route";
import subscribeRouter from "./router/subscribe.route";
import usersRoute from "./router/users.route";
const app: Application = express();

// 1️⃣ CORS
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // menerima semua origin
    credentials: true, // wajib untuk cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  }),
);
// 3️⃣ Body parser
app.use(express.json()); // untuk JSON
app.use(express.urlencoded({ extended: true })); // untuk x-www-form-urlencoded

// 4️⃣ Static folder
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use("/imagesGroup", express.static(path.join(__dirname, "/imagesGroup")));
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
  }),
);

app.use("/api/users", usersRoute);
app.use("/api/address", addresRouter);
app.use("/api/roles", rolesRoute);
app.use("/api/signin", signinRoute);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/chatpersonal", chatPersonalRoute);
app.use("/api/message", messageChatRoute);
app.use("/api/group", groupChatRoute);

export default app;

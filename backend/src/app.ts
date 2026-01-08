import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import session from "express-session";

import addresRouter from "./router/addres.route";
import rolesRoute from "./router/roles.route";
import signinRoute from "./router/signin.route";
import subscribeRouter from "./router/subscribe.route";
import usersRoute from "./router/users.route";

const app: Application = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true kalau HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  })
);

app.use("/api/users", usersRoute);
app.use("/api/address", addresRouter);
app.use("/api/roles", rolesRoute);
app.use("/api/signin", signinRoute);
app.use("/api/subscribe", subscribeRouter);
export default app;

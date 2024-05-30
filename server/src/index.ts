import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
// import { startStandaloneServer } from "@apollo/server/standalone";
// import { readFileSync } from "fs";
// import gql from "graphql-tag";
import cookieParser from "cookie-parser";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { AppDataSource } from "./data-source";
// import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

(async () => {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.post("/refresh_token", async (req, res) => {
    // console.log(req.cookies);
    const token = req.cookies.jid;

    if (!token) {
      console.log(`token failed........`);
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;

    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(`verification failed........`);
      console.error(err);
      return res.send({ ok: false, accessToken: "" });
    }

    //valid token found
    //now we send back new accessToken
    const user = await User.findOne({ where: { id: payload.userId } });
    console.log(`User id is : ${payload.userId}`);
    //const user = await User.findOne({ id: payload.userId });    -- this also.

    if (!user) {
      console.log("User not found");
      return res.send({ ok: false, accessToken: "" });
    }
    // Even creating new Refresh Token and sent to res.cookie
    sendRefreshToken(res, createRefreshToken(user));
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });
  //Adding graphQL Schema
  // const typeDefs = gql(
  //   readFileSync("schema.graphql", {
  //     encoding: "utf-8",
  //   })
  // );

  // const resolvers = {
  //   Query: {
  //     hello: () => {
  //       return "HELLLLLLLLLLLLO";
  //     },
  //   },
  // };

  await AppDataSource.initialize();

  // console.log(process.env.ACCESS_TOKEN_SECRET);
  // console.log(process.env.REFRESH_TOKEN_SECRET);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [UserResolver] }),
  });

  // await startStandaloneServer(apolloServer, {
  //   context: async ({ req, res }) => ({ req, res }),
  // });

  // app.use("/graphql", expressMiddleware(apolloServer));
  await apolloServer.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  app.listen(5000, () => {
    console.log(`Express server started...`);
  });
})();

// BoilerPlate added by typeORM
// AppDataSource.initialize()
//   .then(async () => {
//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await AppDataSource.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await AppDataSource.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log(
//       "Here you can setup and run express / fastify / any other framework."
//     );
//   })
//   .catch((error) => console.log(error));

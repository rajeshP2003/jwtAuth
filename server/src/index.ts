/* eslint-disable */
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { readFileSync } from "fs";
// import gql from "graphql-tag";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";

(async () => {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());

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

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [UserResolver] }),
  });

  await startStandaloneServer(apolloServer);

  app.use("/graphql", expressMiddleware(apolloServer));

  app.get("/", (_req, res) => res.send("Hello"));

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

import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  //authorization token = bearer dbnhabfghabgbfqnfhjakljn

  if (!authorization) {
    throw new Error("User is not authenticated");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    if (!payload) {
      console.log(`Payload is false `);
    }

    const user = await User.findOne({ where: { id: Number(payload.userId) } });

    if (!user) {
      throw new Error(`User not found `);
    }

    if (user.tokenVersion != payload.tokenVersion) {
      throw new Error(`Token Version mismatch..`);
    }
    context.payload = payload;
  } catch (err) {
    console.log(err);
    throw new Error("User is not authenticated Wrong Token");
  }
  return next();
};

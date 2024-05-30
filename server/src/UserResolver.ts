import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "./entity/User";
import { compare, hash } from "bcryptjs";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "HIIIIIII";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(
    @Ctx()
    ctx: MyContext
  ) {
    return `User with id ${ctx.payload?.userId} is authenticated`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Could not find the email");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("bad password");
    }

    //login is sucessful.. now we generate tokens

    //refresh Token - jid - generic cookie id
    const refToken: any = createRefreshToken(user);
    sendRefreshToken(res, refToken);
    // res.cookie("jid", refToken, { httpOnly: true });
    console.log(refToken);

    //accessToken
    return {
      accessToken: createAccessToken(user),
    };
  }
}

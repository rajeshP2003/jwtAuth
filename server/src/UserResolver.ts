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

  @Mutation(() => String)
  async deleteUser(
    @Arg("email") email: string,
    @Arg("id", { nullable: true }) id: number
  ) {
    let user: any = null;
    console.log(`id is ${id}`);
    if (!id) {
      user = await User.findOne({ where: { id, email } });
    } else {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      throw new Error("Incorrect Credentials. User Not Found.");
    }

    await User.remove(user);

    return `User - ${email} is Deleted`;
  }

  @Mutation(() => Boolean)
  async emptyUsers() {
    User.clear();
    return `User table is empty`;
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
    console.log(`RefreshToken - ${refToken}`);

    //accessToken
    return {
      accessToken: createAccessToken(user),
    };
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  async logout(@Ctx() ctx: MyContext) {
    const user = await User.findOne({
      where: { id: Number(ctx.payload!.userId) },
    });
    if (!user) {
      throw new Error(`User is not logged in `);
    }
    await User.update(ctx.payload!.userId, {
      tokenVersion: () => "tokenVersion + 1",
    });

    return `User is logged out.. `;
  }
}

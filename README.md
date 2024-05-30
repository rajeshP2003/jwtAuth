# jwtAuth

A Full Stack Project integrating the Authentication using JWT.

- We are going to store the access token in memory. The more secure way of doing it.
- In a typical JWT-based authentication system, it's common practice to issue new access tokens while the old ones remain valid until they expire. This ensures a smoother user experience by minimizing the need for frequent re-authentications.
  - So, multiple tokens exist for a particular USER.

Technologies Used:-

1. Node.js
2. TypeORM
3. PostgreSQL
4. GraphQL
5. Apollo
6. React

Backend:-

1. Setup a GraphQL Server using the typeORM and the TypeGraphQL

   - npm i graphql apollo-server-graphql express typeorm pg typescript
   - And their types.

2. Mutations and Queries [To Register the User ]

   - Hashing Library[bcryptjs] used to store hashed password in database.
   - type-graphQL annotations for Query, Mutation, ObjectType, Resolver.

3. Access Token and Refresh Token

   - jsonwebtoken[npm library] to generate token for us.
   - Sharing req,res,payload using the context
   - Storing the refreshToken in Response Cookies
   - Secret key for the token stored in local .env file used dotenv npm-library.
   - Authentication for specific Routes[bye]
   - Regeneration upon Expiration of Access Tokens. Used cookie-parser npm-library

4. Revoking the Refresh Tokens

Frontend:-

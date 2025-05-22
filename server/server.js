import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./graphql/index.js";
import { connectDB } from "./config/db.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = 4000;

connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(express.json());
app.use(cors());

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const apiKey = req.headers["x-api-key"];
      // console.log("API KEY RECEIVED:", apiKey);

      if (!apiKey || apiKey !== process.env.API_KEY) {
        throw new Error("Invalid or missing API key");
      }

      return {};
    },
  })
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/graphql`);
});

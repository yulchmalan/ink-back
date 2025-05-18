import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./graphql/index.js";
import { connectDB } from "./config/db.js";
import cors from "cors";

dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}/graphql`);
});

import { FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";
import { v4 as genId } from "uuid";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(fastifyCors, {
    origin: "http://localhost:3000",
    methods: ["GET"],
  });

  fastify.get("/playerId", async (req, res) => {
    const playerId = genId();
    res.send({ playerId });
  });

  // fastify.register(fastifyWebsocket);
  // fastify.register(async function (fastify) {
  //   fastify.get(
  //     "/chat",
  //     { websocket: true },
  //     (connection /* SocketStream */, req /* FastifyRequest */) => {
  //       connection.socket.on("message", (message) => {
  //         // message.toString() === 'hi from client'
  //         connection.socket.send(`hi from server ${message}`);
  //       });
  //     }
  //   );
  // });

  // fastify.get("/", async function (request, reply) {
  //   return {};
  // });
};

export default root;

import { FastifyPluginAsync } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";

const game: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(fastifyCors, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  });

  fastify.post<{ Body: { playerId: string } }>("/create", async (req, res) => {
    const { playerId } = req.body;
    const roomId = generateRoomId();
    const gameRoom = createGameRoom(roomId, playerId);
    res.send({ roomId, gameRoom });
  });

  fastify.post<{ Body: { playerId: string; roomId: string } }>(
    "/join",
    async (req, res) => {
      // const payload = req.body as string;
      // console.log("$$$$$$$$ body", req.body);

      const { playerId, roomId } = req.body;
      const currentGameRoom = findGameRoomById(roomId);

      if (currentGameRoom) {
        // Before adding player check if it is already in current game
        // A player cannot play with oneself
        if (findPlayerInRoom(roomId, playerId)) {
          return res.forbidden("You cannot play with yourself");
        }

        if (currentGameRoom.players.length === 1) {
          gameRooms[roomId].players.push({ id: playerId, role: "O" });
          return res.send({ playerId, roomId, gameRooms });
        }

        return res.forbidden("This room already have two players");
      }
      return res.notFound(`Game room number ${roomId} doesn't exist`);
    }
  );

  fastify.register(fastifyWebsocket);

  fastify.register(async function (fastify) {
    fastify.addHook("preValidation", async (request, reply) => {
      // If game exist and playerId exists in the room
      const { roomId } = request.params as { roomId: string };
      const { playerId } = request.query as {
        playerId: string;
      };
      // console.log(request.params, request.query);
      // console.log("$$preValidation", roomId, playerId);

      if (!findPlayerInRoom(roomId, playerId)) {
        reply.code(401).send("not authenticated");
      }
    });

    fastify.get<{
      Params: { roomId: string };
      Querystring: { playerId: string };
    }>("/:roomId", { websocket: true }, (connection, request) => {
      const socket = connection.socket;

      const { roomId } = request.params;
      // const { playerId } = request.query as {
      //   playerId: string;
      // };

      const game = gameRooms[roomId];
      const players = game.players;

      console.log("Game Room", gameRooms);
      socket.send(JSON.stringify(players));

      socket.on("message", (message) => {
        connection.socket.send(JSON.stringify({ message: "hi from server" }));
      });

      // console.log("#### play", roomId, playerId);
      socket.on("close", () => {
        // console.log("connection closed");
        // socket.send("this is closed");
      });
    });
  });
};

export default game;

interface GameRoom {
  players: Player[];
  board: Array<string | null>;
  currentPlayer: string;
}

interface Player {
  id: string;
  name?: string;
  role: "X" | "O";
}

const gameRooms: { [key: string]: GameRoom } = {};
// const players: { [key: string]: Player } = {};

// Generate a unique room ID
function generateRoomId() {
  let roomId = "";
  do {
    roomId = Math.random().toString().slice(2, 6);
  } while (findGameRoomById(roomId));
  return roomId;
}

// Check if a game room exists with the given ID
function findGameRoomById(roomId: string): GameRoom | null {
  return gameRooms[roomId];
}

function findPlayerInRoom(roomId: string, playerId: string): boolean {
  const room = findGameRoomById(roomId);
  let player = null;

  if (room) {
    player = room.players.find((player) => player.id === playerId);
  }

  if (player) return true;
  return false;
}

// Create a new game room with the given ID
function createGameRoom(roomId: string, playerId: string): GameRoom {
  let currentGame = gameRooms[roomId];
  if (!currentGame) {
    currentGame = {
      players: [],
      board: Array(9).fill(null),
      currentPlayer: "X",
    };
  }
  currentGame.players.push({ id: playerId, role: "X" });
  gameRooms[roomId] = currentGame;
  return currentGame;
}

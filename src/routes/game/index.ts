import { FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";

const game: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(fastifyCors, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  });

  fastify.post("/", async (req, res) => {
    const playerId = req.body as string;
    const roomId = generateRoomId();
    createGameRoom(roomId, playerId);
    res.send({ roomId });
  });
};

export default game;

interface GameRoom {
  id?: string;
  players?: Player[];
  board: Array<string | null>;
  currentPlayer: string;
}

interface Player {
  id: string;
  role: string;
}

// const gameRooms: GameRoom | null = null;

const gameRooms: { [key: string]: GameRoom } = {};

// Generate a unique room ID
function generateRoomId() {
  let roomId = "";
  do {
    roomId = Math.random().toString().slice(2, 6);
  } while (gameRoomExists(roomId));
  return roomId;
}

// Check if a game room exists with the given ID
function gameRoomExists(roomId: string) {
  if (gameRooms) {
    return Object.hasOwn(gameRooms, roomId);
  }
}

// Create a new game room with the given ID
function createGameRoom(roomId: string, playerId: string) {
  if (!gameRooms[roomId]) {
    gameRooms[roomId] = {
      players: [{ id: playerId, role: "creator" }],
      board: Array(9).fill(null),
      currentPlayer: "X",
    };
  }
}

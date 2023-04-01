import { FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";

const game: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(fastifyCors, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  });

  fastify.post("/create", async (req, res) => {
    const playerId = req.body as string;
    const roomId = generateRoomId();
    createGameRoom(roomId, playerId);
    res.send({ roomId });
  });

  fastify.post("/join", async (req, res) => {
    const payload = req.body as string;

    const { playerId, roomId } = JSON.parse(payload);

    if (!gameRoomExists(roomId))
      return res.notFound(`Game room number ${roomId} doesn't exist`);

    // TODO: only two players should be allowed
    gameRooms[roomId].players.playerTwo = playerId;
    // console.log("$$$$", gameRooms[roomId]);
    return res.send({ playerId, roomId });
  });
};

export default game;

interface GameRoom {
  id?: string;
  players: Player;
  board: Array<string | null>;
  currentPlayer: string;
}

interface Player {
  playerOne: string;
  playerTwo: string | null;
}

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
  if (Object.hasOwn(gameRooms, roomId)) {
    return gameRooms[roomId];
  }
  return false;
}

// Create a new game room with the given ID
function createGameRoom(roomId: string, playerId: string) {
  if (!gameRooms[roomId]) {
    gameRooms[roomId] = {
      players: { playerOne: playerId, playerTwo: null },
      board: Array(9).fill(null),
      currentPlayer: "X",
    };
  }
}

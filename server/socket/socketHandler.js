const rooms = require("../rooms");
const generateRoomCode = require("../utils/generateRoomCode");
const getRandomWords = require("../utils/getRandomWords");

function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("create_room", ({ hostName, settings }) => {
            if (!hostName) return;

            const roomId = generateRoomCode();

            const hostPlayer = {
                id: socket.id,
                playerName: hostName,
                isHost: true
            };

            rooms[roomId] = {
                id: roomId,
                settings: {
                    maxPlayers: settings?.maxPlayers || 8,
                    rounds: settings?.rounds || 3,
                    drawTime: settings?.drawTime || 60,
                },
                players: [hostPlayer] // The host is the first player in the list
            };

            socket.join(roomId);

            io.to(roomId).emit("player_joined", {
                roomId: roomId,
                player: hostPlayer,
                players: rooms[roomId].players
            });

            console.log(`Room ${roomId} created successfully by host: ${hostName}`);
        });

        socket.on("join_room", ({ roomId, playerName }) => {
            const targetRoomId = roomId?.toUpperCase();
            const room = rooms[targetRoomId];

            if (!room){
                console.log("oops");
                return;
            } 

            // Is the room full?
            if (room.players.length >= room.settings.maxPlayers) {
                socket.emit("error_message", "Room is full.");
                return;
            }

            const guestPlayer = {
                id: socket.id,
                playerName: playerName,
                isHost: false
            };

            // Add to the room's list of players
            room.players.push(guestPlayer);

            socket.join(targetRoomId);

            // Broadcast the 'player_joined' event to EVERYONE inside this room channel
            io.to(targetRoomId).emit("player_joined", {
                roomId: targetRoomId,
                player: guestPlayer,
                players: room.players
            });

            console.log(`Player ${playerName} successfully joined room: ${targetRoomId}`);
        });

        socket.on("disconnect", () => {
            for (const roomId in rooms) {
                const room = rooms[roomId];
                const playerIndex = room.players.findIndex(p => p.id === socket.id);

                if (playerIndex !== -1) {
                    // Remove player from the array
                    room.players.splice(playerIndex, 1);

                    io.to(roomId).emit("player_left", {
                        playerId: socket.id,
                        players: room.players
                    });

                    if (room.players.length === 0) {
                        delete rooms[roomId];
                    }
                    break;
                }
            }
        });

        socket.on("start_game", ({ roomId }) => {
            
            const targetRoomId = roomId?.toUpperCase();
            const room = rooms[targetRoomId];

            if (!room) return;

    
            const requestingPlayer = room.players.find(p => p.id === socket.id);
            if (!requestingPlayer || !requestingPlayer.isHost) {
                socket.emit("error_message", "Only the host can start the game.");
                return;
            }

            io.to(targetRoomId).emit("game_started");
            
            console.log(`Game successfully started in room: ${targetRoomId}`);
        });
    });
}

module.exports = socketHandler;
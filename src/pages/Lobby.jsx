import { useLocation } from "react-router-dom";

function Lobby() {

    const location = useLocation();

    const room = location.state;

    return (
        <div className="p-8">

            <h1 className="text-4xl font-bold mb-4">
                Lobby
            </h1>

            <h2 className="mb-6">
                Room: {room?.id}
            </h2>

            <div className="space-y-3">

                {room?.players?.map(
                    (player)=>(
                        <div
                            key={player.id}
                            className="bg-white shadow p-4 rounded"
                        >
                            {player.username}
                        </div>
                    )
                )}

            </div>

        </div>
    );
}

export default Lobby;
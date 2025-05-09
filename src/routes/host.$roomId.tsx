import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/host/$roomId")({
  component: RouteComponent,
});

type Player = {
  id: number;
  name: string;
  roomId: number;
  playerstatus: boolean;
};

function RouteComponent() {
  const { roomId } = Route.useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const hostName = localStorage.getItem('playerName') || '';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/api/players/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        setPlayers(data.players);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Set up polling to refresh player list every 5 seconds
    const intervalId = setInterval(fetchPlayers, 5000);

    

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [roomId]);

  const startGame = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.5.70:3001';
      const response = await fetch(`${apiUrl}/api/game/start/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: hostName, // Assuming hostId is stored as the host's name
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start game');
      }
      
      // setGameStarted(true);
      // // Navigate host to game screen
      // navigate({ to: "/game/host/$roomId", params: { roomId } });
      
    } catch (error) {
      console.error('Error starting game:', error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Host Room</h1>
      <p className="text-lg mb-2">Room ID: {roomId}</p>
      <p className="text-lg mb-2">Room Code: {localStorage.getItem("roomCode ")}</p>
      <p className="text-lg mb-2">Host Name: {localStorage.getItem("name")}</p>

      <Card className="w-full max-w-md p-4">
        <h2 className="text-xl font-semibold mb-2 text-center">Waiting Room</h2>
        {loading && players.length === 0 ? (
          <p className="text-center py-4">Loading players...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : players.length === 0 ? (
          <p className="text-center py-4">No players have joined yet</p>
        ) : (
          <Table>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="text-center">{player.name}</TableCell>
                  <TableCell className="text-center">
                    {player.playerstatus === null ||
                    player.playerstatus === false
                      ? "Not Ready"
                      : "Ready"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <button
        onClick={() => {
          localStorage.removeItem("name");
          window.location.href = "/";
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Return to Menu
      </button>
      <Button
          onClick={startGame}
          disabled={isLoading || players.length < 1} // Disable if no players
          className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg mt-6 hover:bg-green-600"
        >
          {isLoading ? "Starting..." : "Start Game"}
        </Button>
    </div>
  );
}

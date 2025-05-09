import { createFileRoute, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { createContext, useState, useContext, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SquareSquare,
  HandMetal,
  BellRing,
  SmilePlus,
  Music4,
} from "lucide-react";

export const Route = createFileRoute("/players/$roomId")({
  component: RouteComponent,
});

type Player = {
  id: number;
  name: string;
  roomId: number;
  playerstatus: boolean;
};

type Host = {
  name: string;
  roomId: number;
  };

function RouteComponent() {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("playerName") || ""
  );
  const [playerColor, setPlayerColor] = useState("");
  const [playerSound, setPlayerSound] = useState("");
  const [isReadyset, setIsReadyset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const { roomId } = useParams({ from: "/players/$roomId" });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
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

  const setReadyStatus = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/api/players/${roomId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playerName,
          playerstatus: true,
          gameState: "Pending Start",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set ready status");
      }

      const data = await response.json();
      console.log("Set ready status success:", data);
      return data;
    } catch (error) {
      console.error("Error setting status:", error);
      // Handle error (show message to user, etc.)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="p-4 text-bold font-pixelify">Hello {playerName}</h1>
      <Card className="p-4 mb-4">
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
        <Select onValueChange={setPlayerColor}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Button Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Red">
              Red <SquareSquare className="text-red-500" />
            </SelectItem>
            <SelectItem value="Blue">
              Blue
              <SquareSquare className="text-blue-500" />
            </SelectItem>
            <SelectItem value="Green">
              Green
              <SquareSquare className=" text-green-500" />
            </SelectItem>
            <SelectItem value="Yellow">
              Yellow
              <SquareSquare className="text-yellow-500" />
            </SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setPlayerSound}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Player Sound" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Horn">
              Horn <Music4 className="text-red-500" />
            </SelectItem>
            <SelectItem value="Bell">
              Bell
              <BellRing className="text-blue-500" />
            </SelectItem>
            <SelectItem value="Laugh">
              Laugh
              <SmilePlus className=" text-green-500" />
            </SelectItem>
            <SelectItem value="Ron">
              Ron
              <HandMetal className="text-yellow-500" />
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={setReadyStatus}
          className={`${isReadyset ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white`}
        >
          {isReadyset ? "Ready Waitng Host" : "Not Ready"}
        </Button>
      </Card>
      {/* Add your player list rendering logic here */}
    </div>
  );
}

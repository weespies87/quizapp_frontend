import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

//zod for form validation

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNameSet, setIsNameSet] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    localStorage.setItem('playerName', newName);
  };

  const handleRoomCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(event.target.value);
    console.log(roomCode);
    // add logic to check if the room code is valid
  };

  const handleSetName = () => {
    if (name.trim()) {
      setIsNameSet(true);
      localStorage.setItem('playerName', name);
      // You can also add any other logic needed when name is set
      console.log(`Name set to: ${name}`);
    } else {
      setError("Please enter a name first");
    }
  };

  const createRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/createroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Room created successfully:", data);

      // Check for roomId or other identifier in the response
      if (data.roomId) {
        const hostName = `${data.roomId}-${name}`;
        setHostName(hostName);
        localStorage.setItem('hostName', hostName);
        navigate({ to: "/host/$roomId", params: { roomId: data.roomId } });
      } else if (data.roomcode) {
        // If backend returns roomcode instead of roomId
        navigate({ to: "/host/$roomId", params: { roomId: data.roomcode } });
      } else {
        console.error("No room identifier in response:", data);
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    // Validate inputs first
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/joinroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, roomCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Join room success:", data);

      if (data.roomId) {
        navigate({ to: `/players/$roomId`, params: { roomId: data.roomId } });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join room";
      setError(errorMessage);
      toast(`Error joining room: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container flex flex-col justify-center items-center h-svh bg-gray-100">
      <div
        style={{
          fontFamily: "Pixelify Sans",
          fontSize: "2rem",
        }}
      >
        <h2 className="p-4 text-bold font-pixelify">Start Your Quiz</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 w-auto mx-auto justify-center items-center">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            className="input input-bordered max-w-sm"
          />
          <Button
            onClick={handleSetName}
            type="button"
            className={`${isNameSet ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white`}
          >
            {isNameSet ? "Ready" : "Set"}
          </Button>
        </div>
        <Input
          value={roomCode}
          onChange={handleRoomCodeChange}
          placeholder="Room Code"
          className="input input-bordered max-w-sm"
        />
        <Button onClick={handleJoinRoom} className="btn btn-secondary max-w-sm">
          Join Room
        </Button>
        <Button
          onClick={createRoom}
          className="btn btn-primary max-w-sm"
          disabled={isLoading}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
}

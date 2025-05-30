import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import gsap from "gsap";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [name, setName] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [animationFailed, setAnimationFailed] = useState<boolean>(false);

  // Refs for GSAP animation
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Animation Effect - Simplified and faster
  useEffect(() => {
    console.log("Animation effect running");

    // Check if GSAP is available
    if (typeof gsap === "undefined") {
      console.error("GSAP is not available");
      setAnimationFailed(true);
      return;
    }

    // Skip if refs aren't available
    if (!titleRef.current || !containerRef.current) {
      console.error("Refs not available for animation");
      setAnimationFailed(true);
      return;
    }

    try {
      // Get the title element
      const title = titleRef.current as HTMLHeadingElement;

      console.log("Element found:", title.textContent);

      // Get the text content
      const text = title.textContent || "Start Your Quiz";
      const chars = text.split("");

      // Clear and rebuild the title with spans for each character
      title.innerHTML = "";
      title.style.visibility = "visible";

      setTimeout(() => {
        if (title && title.style.visibility !== "visible") {
          title.style.visibility = "visible";
        }
      }, 1000);

      chars.forEach((char) => {
        const span = document.createElement("span");
        span.className = "quiz-title-letter";
        span.textContent = char === " " ? "\u00A0" : char; // Use non-breaking space for spaces
        title.appendChild(span);
      });

      const letters =
        document.querySelectorAll<HTMLSpanElement>(".quiz-title-letter");
      console.log("Letters found:", letters.length);

      if (letters.length === 0) {
        throw new Error("No letters found for animation");
      }

      // Animation timeline
      const tl = gsap.timeline();

      // TODO All letters should start visable but dont
      gsap.set(letters, {
        scale: 0,
        opacity: 0,
        display: "inline-block",
      });

      letters.forEach((letter, index) => {
        // the draw time on letters
        const delay = 0.01 + index * 0.02;

        tl.to(letter, {
          duration: 0.15,
          scale: 1.2,
          opacity: 1,
          ease: "back.out(2)",
          delay: delay,
        });

        tl.to(
          letter,
          {
            duration: 0.1,
            scale: 1,
            ease: "power1.out",
          },
          "-=0.05"
        );
      });

      const styleSheet = document.createElement("style");
      document.head.appendChild(styleSheet);

      const styleRules = [`.quiz-title-letter { display: inline-block; }`];

      const sheet = styleSheet.sheet;
      if (sheet) {
        styleRules.forEach((rule) => {
          sheet.insertRule(rule, sheet.cssRules.length);
        });
      } else {
        styleSheet.textContent = styleRules.join("\n");
      }

      // Cleanup function
      return () => {
        if (document.head.contains(styleSheet)) {
          document.head.removeChild(styleSheet);
        }
      };
    } catch (error) {
      console.error("Animation error:", error);
      setAnimationFailed(true);

      // Make sure title is visible even if animation fails
      if (titleRef.current) {
        titleRef.current.style.visibility = "visible";
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Rest of your component code...
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    localStorage.setItem("playerName", newName);
  };

  const handleRoomCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(event.target.value);
    console.log(roomCode);
  };

  const handleSetName = () => {
    if (name.trim()) {
      setIsNameSet(true);
      localStorage.setItem("playerName", name);
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
        localStorage.setItem("hostName", hostName);
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
        ref={containerRef}
        className="relative p-4 z-10"
        style={{
          fontFamily: "Pixelify Sans",
          fontSize: "2rem",
        }}
      >
        <h2
          ref={titleRef}
          className="p-4 text-bold font-pixelify"
          style={{
            visibility: animationFailed ? "visible" : "hidden",
            textShadow: "2px 2px 0px rgba(0, 0, 0, 0.1)",
          }}
        >
          Start Your Quiz
        </h2>
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

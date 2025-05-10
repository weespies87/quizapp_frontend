import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
// Make sure GSAP is imported correctly
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

  // GSAP Animation Effect
  useEffect(() => {
    // Log to verify the effect is running
    console.log("Animation effect running");
    
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      console.error("GSAP is not available. Make sure to install it with: npm install gsap");
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
      // Get the title element - explicitly type them
      const title = titleRef.current as HTMLHeadingElement;
      const container = containerRef.current as HTMLDivElement;
      
      console.log("Element found:", title.textContent);
      
      // Get the text content
      const text = title.textContent || "Start Your Quiz";
      const chars = text.split('');
      
      // Clear and rebuild the title with spans for each character
      title.innerHTML = '';
      title.style.visibility = 'visible';
      
      // Force visible even if animation fails
      setTimeout(() => {
        if (title && title.style.visibility !== 'visible') {
          title.style.visibility = 'visible';
        }
      }, 1000);
      
      chars.forEach(char => {
        const span = document.createElement('span');
        span.className = 'quiz-title-letter';
        span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
        title.appendChild(span);
      });
      
      const letters = document.querySelectorAll<HTMLSpanElement>('.quiz-title-letter');
      console.log("Letters found:", letters.length);
      
      if (letters.length === 0) {
        throw new Error("No letters found for animation");
      }
      
      // Create a timeline for the 16-bit style animation
      const tl = gsap.timeline();
      
      // Initial setup - scale all letters to 0 and set initial state
      gsap.set(letters, { 
        scale: 0,
        opacity: 0,
        display: 'inline-block',
        color: '#000'
      });
      
      // First stage: Scanline effect
      tl.to(container, {
        duration: 0.8,
        background: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
        backgroundSize: '100% 4px',
        ease: 'power1.inOut'
      });
      
      // Second stage: Letters appear with pixelated randomization
      letters.forEach((letter, index) => {
        // Add slight random delay for each letter
        const delay = 0.05 + index * 0.12;
        
        // Pixel-like intro
        tl.to(letter, {
          duration: 0.2,
          scale: 1.4,
          opacity: 1,
          ease: 'steps(1)',
          filter: 'blur(4px)',
          delay: delay
        });
        
        // Glitchy effect - random position jitter
        tl.to(letter, {
          duration: 0.1,
          x: '+=5',
          y: '-=3',
          rotation: gsap.utils.random(-5, 5),
          color: '#00f',
          ease: 'steps(2)',
          onComplete: function() {
            // Add CRT-like flicker randomly
            if (Math.random() > 0.7) {
              gsap.to(letter, {
                duration: 0.05,
                opacity: 0.7,
                repeat: 1,
                yoyo: true
              });
            }
          }
        });
        
        // Settle into final position
        tl.to(letter, {
          duration: 0.3,
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          color: '#000',
          filter: 'blur(0px)',
          ease: 'elastic.out(1.2, 0.5)'
        });
      });
      
      // Final effect: Add a subtle pixel noise overlay that fades out
      const noiseEffect = document.createElement('div');
      noiseEffect.className = 'noise-effect';
      container.appendChild(noiseEffect);
      
      gsap.set(noiseEffect, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAA30lEQVRoge3aMQqDQBBA0RG1sYqNYOMFvIQH8v7WaRPbLZYEXZgZ/zcLKcJjYBeMMcYYY4wxJjCWb+u+vufyLKeUrvP5Uk4553yd5+PnnstZvlvvM/enbvo3dty3WwhhvW+9Xp5TSmmez7f3G2O8rSMTBRERRESw9eplrtdraZrGGGOMMcYYY4z5f7ZOE601/2CtteMPaRsRBRERRESw9eplrtdraZrGGGOMMcYYY4z5f7ZOE601/2CtteMPaRsRBRERRESw9eplrtdraZrGGGOMMcYYY4z5f7ZOE601/2AAAAAAAPiSN+7vgQGSwdLJAAAAAElFTkSuQmCC)',
        opacity: 0.3,
        zIndex: 1,
        pointerEvents: 'none'
      });
      
      tl.to(noiseEffect, {
        duration: 1,
        opacity: 0,
        ease: 'power2.out'
      });
      
      // Add a CRT power-on effect
      tl.fromTo(container, {
        boxShadow: '0 0 20px rgba(100, 200, 255, 0.8)'
      }, {
        duration: 0.5,
        boxShadow: '0 0 0px rgba(100, 200, 255, 0)',
        ease: 'power2.out'
      }, '-=1');
      
      // Add style for letter elements - using insertRule for better browser compatibility
      const styleSheet = document.createElement('style');
      document.head.appendChild(styleSheet);
      
      const styleRules = [
        `.quiz-title-letter { display: inline-block; filter: blur(0px); }`,
        `.quiz-container { position: relative; }`,
        `.noise-effect { pointer-events: none; }`
      ];
      
      // Insert rules into the stylesheet
      const sheet = styleSheet.sheet;
      if (sheet) {
        styleRules.forEach(rule => {
          sheet.insertRule(rule, sheet.cssRules.length);
        });
      } else {
        // Fallback if insertRule is not available
        styleSheet.textContent = styleRules.join('\n');
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
        titleRef.current.style.visibility = 'visible';
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Rest of your component code...
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    localStorage.setItem('playerName', newName);
  };

  const handleRoomCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(event.target.value);
    console.log(roomCode);
  };

  const handleSetName = () => {
    if (name.trim()) {
      setIsNameSet(true);
      localStorage.setItem('playerName', name);
      console.log(`Name set to: ${name}`);
    } else {
      setError("Please enter a name first");
    }
  };

  const createRoom = async () => {
    // Your existing code...
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
    // Your existing code...
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
        className="quiz-container relative p-4 z-10" 
        style={{
          fontFamily: "Pixelify Sans",
          fontSize: "2rem",
        }}
      >
        <h2 
          ref={titleRef} 
          className="p-4 text-bold font-pixelify"
          style={{ 
            visibility: animationFailed ? 'visible' : 'hidden',
            // Add some text shadow to make it pop
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
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
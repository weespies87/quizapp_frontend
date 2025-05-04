import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [name, setName] = useState('');

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  return (
    <div className="home-container flex flex-col justify-center items-center h-svh bg-gray-100">
      <h2 className='p-4 text-bold font-pixelify'>Welcome to Quiz Game</h2>
      <div className="grid grid-cols-1 gap-4 w-auto mx-auto justify-center items-center">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input placeholder='Enter your name' className="input input-bordered max-w-sm" />
        <Button type="submit">Set</Button>
        </div>
        <Input placeholder='Room Code' className="input input-bordered max-w-sm" />
        <Button className="btn btn-secondary max-w-sm"><Link to="/playersScreen" className="btn btn-secondary">Join Room</Link></Button>

        <Button className="btn btn-primary max-w-sm"><Link to="/createRoom" className="btn btn-primary">Create New Room</Link></Button>
      </div>
      </div>
  );
}
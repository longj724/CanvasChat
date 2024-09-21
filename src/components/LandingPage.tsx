// External Dependencies
import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

// Relative Dependencies
import { Sidebar } from './sidebar/sidebar';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

const LandingPage = () => {
  return (
    <div className={inter.className}>
      <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center flex flex-col w-full z-[25]">
        <h1 className="text-[50px] text-center ">CanvasChat</h1>
        <h2 className="text-[30px]">One Interface For All Your AI Messages</h2>
      </div>

      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[25] w-[45%] h-[45%]">
        <div className="relative pt-[63.39%]">
          <iframe
            src="https://player.vimeo.com/video/1011509717?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
            title="CanvasChatDemo"
          ></iframe>
        </div>
        <script src="https://player.vimeo.com/api/player.js"></script>
      </div>

      <div className="absolute gap-2 top-[85%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center justify-center flex flex-row w-2/5 z-[25]">
        <SignInButton mode="modal">
          <Button className="w-4/5 bg-white" variant={'outline'}>
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-4/5">Sign Up - Bring your own Keys</Button>
        </SignUpButton>
      </div>

      <Sidebar />
      <ReactFlow panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false}>
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default LandingPage;

'use client';

// External Dependencies
import { useCallback, useState } from 'react';
import { PanelsTopLeft } from 'lucide-react';

// Relative Dependencies
import { cn } from '@/lib/utils';
import { Menu } from '@/components/sidebar/menu';
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  return (
    <aside
      className={cn(
        'bg-gray-100 z-10 fixed top-0 left-0 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
        sidebarOpen === false ? 'w-[65px]' : 'w-60'
      )}
    >
      <SidebarToggle isOpen={sidebarOpen} setIsOpen={toggleSidebar} />
      <div
        className={cn(
          sidebarOpen && 'px-3',
          'relative h-full flex flex-col py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 overflow-hidden items-center'
        )}
      >
        <h1
          className={cn(
            'transition-transform ease-in-out duration-300 mb-1',
            sidebarOpen === false ? 'translate-x-1' : 'translate-x-0'
          )}
        >
          <div className="flex items-center">
            <PanelsTopLeft
              className={cn('w-6 h-6 mr-1', !sidebarOpen && 'mr-0')}
            />
            <h1
              className={cn(
                'font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                sidebarOpen === false
                  ? '-translate-x-96 opacity-0 hidden'
                  : 'translate-x-0 opacity-100'
              )}
            >
              FlowChat
            </h1>
          </div>
        </h1>
        <Menu isOpen={sidebarOpen} />
      </div>
    </aside>
  );
}

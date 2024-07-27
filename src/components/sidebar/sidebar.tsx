'use client';

// External Dependencies
import { useState } from 'react';

// Relative Dependencies
import { cn } from '@/lib/utils';
import { Menu } from '@/components/sidebar/menu';
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <aside
      className={cn(
        'bg-gray-100 z-10 fixed top-0 left-0 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
        sidebarOpen === false ? 'w-[65px]' : 'w-60'
      )}
    >
      <SidebarToggle isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Menu isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </aside>
  );
}

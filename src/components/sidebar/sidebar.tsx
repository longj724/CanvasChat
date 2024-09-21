'use client';

// External Dependencies
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Relative Dependencies
import { cn } from '@/lib/utils';
import { Menu } from '@/components/sidebar/menu';
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setSidebarOpen(true);
    }
  }, [user]);

  return (
    <aside
      className={cn(
        'bg-gray-100 z-10 fixed top-0 left-0 h-screen transition-[width] ease-in-out duration-300',
        sidebarOpen ? 'w-60' : 'w-[65px]'
      )}
    >
      <SidebarToggle isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Menu isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </aside>
  );
}

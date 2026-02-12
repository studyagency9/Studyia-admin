import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-[280px] min-h-screen transition-all duration-300"
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}

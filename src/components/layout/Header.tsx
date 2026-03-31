'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Search, Bell, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function Header() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Logo */}
        <div className="md:hidden flex-shrink-0 flex items-center mr-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <TrendingUp size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">AgriOx</span>
          </Link>
        </div>

        {/* Desktop Search / Top Nav */}
        <div className="hidden md:flex flex-1 items-center gap-4 max-w-md">
           <div className="relative w-full">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={16} className="text-muted-foreground" />
             </div>
             <input 
               type="text" 
               className="block w-full pl-10 pr-3 py-1.5 border border-border rounded-md leading-5 bg-secondary/50 placeholder-muted-foreground focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
               placeholder="Search Platform... (Cmd+K)" 
             />
           </div>
        </div>

        {/* User Profile & Global Controls */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-full">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          </button>

          {profile && (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-foreground leading-none">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{profile.role}</p>
              </div>
              
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent border border-border flex items-center justify-center text-primary font-semibold cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                
                {/* Simple Dropdown on hover */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-md shadow-lg opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all p-1">
                  <Link href={`/${profile.role}/dashboard`} className="flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-secondary transition-colors text-foreground">
                    <User size={16} className="text-muted-foreground" />
                    <span>Profile Settings</span>
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

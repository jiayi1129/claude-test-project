"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BookOpen, CreditCard, Dumbbell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    label: "Schedule",
    href: "/schedule",
    icon: Calendar,
  },
  {
    label: "My Bookings",
    href: "/bookings",
    icon: BookOpen,
  },
  {
    label: "Membership",
    href: "/membership",
    icon: CreditCard,
  },
];

interface MemberNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function MemberNav({ user }: MemberNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/schedule" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FitBook</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  {user.name && (
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

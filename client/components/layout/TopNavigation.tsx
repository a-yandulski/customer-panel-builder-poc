import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/NotificationCenter";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Services", href: "/services" },
  { label: "Billing", href: "/billing" },
  { label: "Support", href: "/support" },
  { label: "Account", href: "/account" },
];

export default function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg hidden sm:block">
                DomainHost
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-gray-700 hover:text-primary transition-colors duration-200 font-semibold ${
                  location.pathname === item.href ? "text-primary" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <NotificationCenter />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="hidden sm:block text-gray-700 font-medium">
                    John Doe
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <MobileNavigation
                  onItemClick={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

interface MobileNavigationProps {
  onItemClick: () => void;
}

function MobileNavigation({ onItemClick }: MobileNavigationProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-semibold text-gray-900 text-xl">
            DomainHost
          </span>
        </div>
      </div>

      {/* Mobile Navigation Items */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={`flex items-center px-4 py-4 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg transition-all duration-200 font-semibold min-h-[44px] ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
              onClick={onItemClick}
            >
              Register Domain
            </button>
            <button
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
              onClick={onItemClick}
            >
              Create Ticket
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">John Doe</div>
            <div className="text-sm text-gray-500">john@example.com</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center h-12 text-red-600 border-red-200 hover:bg-red-50 font-semibold"
          onClick={onItemClick}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass-header sticky top-0 z-50 w-full transition-all duration-300">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:inline-block text-white">Med Simplifier</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-slate-100 hover:bg-white/10">Scanner</Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:text-slate-100 hover:bg-white/10">Dashboard</Button>
              </Link>
              <Link to="/quiz">
                <Button variant="ghost" className="text-white hover:text-slate-100 hover:bg-white/10">Literacy Assessor</Button>
              </Link>
              <div className="h-4 w-px bg-slate-400/50 mx-2"></div>
              <span className="text-sm font-medium text-white mr-2">Hello, {user.username}</span>
              <Button onClick={handleLogout} variant="outline" size="sm" className="border-white text-white hover:bg-white/20 bg-white/10">Logout</Button>
            </>
          ) : (
            <>
              <div className="h-4 w-px bg-slate-400/50 mx-2"></div>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-slate-100 hover:bg-white/10">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white border-0">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full">Scanner</Link>
              </DropdownMenuItem>
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/quiz" className="w-full">Literacy Assessor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive w-full">
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="w-full">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register" className="w-full">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

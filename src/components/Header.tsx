import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Upload, MessageSquare, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-primary mb-4 sm:mb-0">
          <BookOpen className="mr-2" size={24} />
          <span>Bookshelf</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost">
              <BookOpen className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          
          {session ? (
            <>
              <Link to="/favorites">
                <Button variant="ghost">
                  <Heart className="mr-2 h-4 w-4" /> Favorites
                </Button>
              </Link>
              
              <Link to="/upload">
                <Button variant="ghost">
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="ghost">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact
                </Button>
              </Link>
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/contact">
                <Button variant="ghost">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact
                </Button>
              </Link>
              
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

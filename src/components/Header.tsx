
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Heart, 
  Upload, 
  MessageSquare, 
  LogOut, 
  LogIn,
  User
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: session, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Set up auth state listener
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!session?.user?.email) return "U";
    return session.user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-primary mb-4 sm:mb-0">
          <BookOpen className="mr-2" size={24} />
          <span>Bookshelf</span>
        </Link>
        
        <nav className="flex items-center space-x-1 md:space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Home
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="mr-2 h-4 w-4" /> Contact
            </Button>
          </Link>
          
          {session ? (
            <>
              <Link to="/favorites">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Heart className="mr-2 h-4 w-4" /> Favorites
                </Button>
              </Link>
              
              <Link to="/upload">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    {session.user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

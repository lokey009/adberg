import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-300 mb-6">Oops! The page you're looking for doesn't exist</p>
        <Button 
          asChild
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-6 py-3 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-primary/25"
        >
          <a href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

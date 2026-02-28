import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
// Use the logo from public folder
const logo = '/logo.png';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      {/* Logo Header */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
        </Link>
      </div>

      {/* 404 Content */}
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-8 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-gold font-semibold hover:bg-gold/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

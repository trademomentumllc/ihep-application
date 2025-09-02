import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function NotFound() {
  const [location, setLocation] = useLocation();
  
  // Log the 404 error for monitoring
  useEffect(() => {
    console.warn(`404 Page Not Found: ${location}`);
  }, [location]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6 pb-4">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            We couldn't find the page you were looking for. The page may have been moved, deleted, or is temporarily unavailable.
          </p>
          
          <div className="mt-6 border-t pt-4">
            <h2 className="font-medium text-gray-700 mb-2">You might try:</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Double-checking the URL</li>
              <li>Navigating back to the dashboard</li>
              <li>Using the navigation menu to find what you need</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setLocation("/")}
          >
            <Home className="h-4 w-4" /> Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

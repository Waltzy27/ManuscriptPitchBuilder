import { useLocation } from "wouter";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    </div>
  );
}

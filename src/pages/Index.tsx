import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { session, signOut, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session || !profile) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {session.user.email}
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          You are now logged in.
        </p>
        <p className="text-lg text-gray-500 mb-8">Your role is: <span className="font-semibold">{profile.role}</span></p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/profile">Go to Profile</Link>
          </Button>
          {(profile.role === 'vendor' || profile.role === 'admin') && (
            <Button asChild variant="outline">
              <Link to="/vendor/dashboard">Vendor Dashboard</Link>
            </Button>
          )}
          <Button onClick={signOut}>Logout</Button>
        </div>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VendorDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Vendor Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">
          This is a protected area for vendors.
        </p>
        <Button asChild>
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default VendorDashboard;
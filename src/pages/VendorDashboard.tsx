import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VendorDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Vendor Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">
          Manage your business operations from here.
        </p>
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/vendor/products">Manage Products</Link>
          </Button>
          <Button asChild size="lg" className="w-full" variant="outline" disabled>
            <Link to="/vendor/orders">View Orders (Coming Soon)</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default VendorDashboard;
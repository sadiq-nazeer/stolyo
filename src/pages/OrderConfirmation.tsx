import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const OrderConfirmation = () => {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto py-20 flex justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl pt-4">
            Thank you for your order!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your order has been placed successfully. You can view your order
            details in your account.
          </p>
          <p className="text-sm">
            <strong>Order ID:</strong> {orderId}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild>
              <Link to="/marketplace">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/my-orders">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
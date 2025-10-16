import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

const Checkout = () => {
  const { cartItems, cartTotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      showError("You must be logged in to place an order.");
      navigate("/login");
      return;
    }
    setIsProcessing(true);

    try {
      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_order_from_cart",
      );

      if (orderError) throw orderError;

      navigate(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      showError(error.details || error.message || "Failed to place order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (itemCount === 0 && !isProcessing) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button onClick={() => navigate("/")} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.products.image_url || "/placeholder.svg"}
                  alt={item.products.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <p className="font-medium">{item.products.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.products.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Confirm Purchase</CardTitle>
            <CardDescription>
              Please review your order before placing it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isProcessing ? "Placing Order..." : "Place Order"}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              <Lock className="mr-1 h-3 w-3" /> Your order is secure
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
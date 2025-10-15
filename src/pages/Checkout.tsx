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
import { showError, showSuccess } from "@/utils/toast";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

const Checkout = () => {
  const { cartItems, cartTotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "summary" | "processing" | "confirmed"
  >("summary");

  const handlePlaceOrder = async () => {
    if (!user) {
      showError("You must be logged in to place an order.");
      navigate("/login");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentStep("processing");

    try {
      // Step 1: Invoke the edge function to create a payment intent
      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke("create-payment-intent", {
          method: "POST",
        });

      if (paymentError) throw new Error(paymentError.message);

      // In a real app, you'd use the client_secret with a library like Stripe.js
      // to confirm the payment on the client side. We'll simulate it here.
      console.log("Received client secret:", paymentData.client_secret);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate payment processing

      setPaymentStep("confirmed");
      showSuccess("Payment successful!");

      // Step 2: Create the order in the database
      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_order_from_cart",
      );

      if (orderError) throw orderError;

      navigate(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      showError(error.details || error.message || "Failed to place order.");
      setPaymentStep("summary");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (itemCount === 0 && !isProcessingPayment) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button onClick={() => navigate("/marketplace")} className="mt-4">
          Go to Marketplace
        </Button>
      </div>
    );
  }

  const getButtonText = () => {
    switch (paymentStep) {
      case "processing":
        return "Processing Payment...";
      case "confirmed":
        return "Finalizing Order...";
      default:
        return "Place Order";
    }
  };

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
              Please review your order before payment.
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
              disabled={isProcessingPayment}
            >
              {isProcessingPayment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {getButtonText()}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              <Lock className="mr-1 h-3 w-3" /> Secure SSL Encrypted Payment
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
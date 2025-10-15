import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft } from "lucide-react";

type OrderItem = {
  product_name: string;
  quantity: number;
  price: number;
};

type Customer = {
  email: string;
  first_name: string | null;
  last_name: string | null;
};

type InvoiceData = {
  order_id: string;
  order_created_at: string;
  order_status: string;
  total_amount: number;
  customer: Customer;
  order_items: OrderItem[];
};

const Invoice = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !authLoading &&
      (!profile || (profile.role !== "vendor" && profile.role !== "admin"))
    ) {
      showError("You don't have permission to view this page.");
      navigate("/vendor/orders");
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!orderId || !profile) return;
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_vendor_order_details", {
          p_order_id: orderId,
        });
        if (error) throw error;
        setInvoice(data);
      } catch (error: any) {
        showError(error.message);
        navigate("/vendor/orders");
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchInvoiceData();
    }
  }, [orderId, profile, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading || !invoice) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const customerName =
    `${invoice.customer.first_name || ""} ${
      invoice.customer.last_name || ""
    }`.trim();

  return (
    <div className="bg-gray-50 py-10 print:bg-white">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button variant="outline" asChild>
            <Link to="/vendor/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
        <Card className="shadow-lg print:shadow-none print:border-none">
          <CardHeader className="bg-gray-100 print:bg-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Invoice</h1>
                <p className="text-muted-foreground">
                  Order #{invoice.order_id.substring(0, 8)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-1">Bill To:</h3>
                <p>{customerName || "N/A"}</p>
                <p className="text-muted-foreground">
                  {invoice.customer.email}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(invoice.order_created_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {invoice.order_status}
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.order_items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-6" />
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${invoice.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground p-6">
            Thank you for your business!
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Invoice;
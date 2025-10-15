import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VendorOrder } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const OrderManagement = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        navigate("/login");
      } else if (profile.role !== "vendor" && profile.role !== "admin") {
        showError("You don't have permission to access this page.");
        navigate("/");
      }
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!profile || (profile.role !== "vendor" && profile.role !== "admin"))
        return;
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_vendor_orders");

        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [profile, authLoading]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "shipped":
        return "default";
      case "delivered":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (authLoading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="font-mono text-sm">
                    {order.order_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.customer_email}</TableCell>
                  <TableCell>
                    {new Date(order.order_created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.order_status)}>
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <p>
                <strong>Customer:</strong> {selectedOrder.customer_email}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.order_created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.order_status}
              </p>
              <p>
                <strong>Order Total:</strong> $
                {selectedOrder.total_amount.toFixed(2)}
              </p>

              <h4 className="font-semibold mt-4">Items in this order:</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.order_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
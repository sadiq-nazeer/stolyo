import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNewOrderItem = useCallback(
    async (payload: any) => {
      const newOrderItem = payload.new;
      if (!profile || !newOrderItem.product_id) return;

      const { data: product, error } = await supabase
        .from("products")
        .select("vendor_id, name")
        .eq("id", newOrderItem.product_id)
        .single();

      if (error || !product) {
        console.error("Error fetching product for notification:", error);
        return;
      }

      if (product.vendor_id === profile.id) {
        const message = `You have a new order for "${product.name}"!`;
        const newNotification: Notification = {
          id: newOrderItem.id,
          message,
          created_at: new Date().toISOString(),
          read: false,
          link: "/vendor/orders",
        };

        setNotifications((prev) => [newNotification, ...prev]);
        toast.info(message, {
          icon: <Bell className="h-4 w-4" />,
        });
      }
    },
    [profile],
  );

  useEffect(() => {
    if (profile && (profile.role === "vendor" || profile.role === "admin")) {
      const channel = supabase
        .channel("public:order_items")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "order_items" },
          handleNewOrderItem,
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, handleNewOrderItem]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
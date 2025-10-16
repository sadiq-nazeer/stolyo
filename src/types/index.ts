export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
  category_id: string | null;
  categories?: { name: string } | null;
};

export type VendorOrder = {
  order_id: string;
  order_created_at: string;
  order_status: string;
  total_amount: number;
  customer_email: string;
  order_items: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
};

export type CartItem = {
  id: string;
  quantity: number;
  products: Product;
};
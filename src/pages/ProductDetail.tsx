import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { UserProfile } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("id", productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        if (productData) {
          const { data: vendorData, error: vendorError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", productData.vendor_id)
            .single();

          if (vendorError) {
            console.error("Could not fetch vendor for product", vendorError);
          } else {
            setVendor(vendorData);
          }
        }
      } catch (error: any) {
        showError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Listen for real-time updates to this specific product
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-updates-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          setProduct(payload.new as Product);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
  };

  const vendorName = vendor
    ? `${vendor.first_name || ""} ${vendor.last_name || ""}`.trim()
    : "Unknown Vendor";

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-gray-100 rounded-lg flex items-center justify-center">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full max-h-[500px]"
          />
        </div>
        <div className="space-y-4">
          {product.categories?.name && (
            <Badge variant="secondary">{product.categories.name}</Badge>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            Sold by{" "}
            <Link
              to={`/store/${product.vendor_id}`}
              className="hover:underline text-primary"
            >
              {vendorName}
            </Link>
          </p>
          <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <p
            className={`text-lg font-medium ${
              product.stock_quantity === 0 ? "text-destructive" : ""
            }`}
          >
            {product.stock_quantity > 10
              ? "In Stock"
              : product.stock_quantity > 0
              ? `Only ${product.stock_quantity} left!`
              : "Out of Stock"}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock_quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setQuantity(Math.min(quantity + 1, product.stock_quantity))
                }
                disabled={product.stock_quantity === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-grow"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock_quantity === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAdding
                ? "Adding..."
                : product.stock_quantity === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
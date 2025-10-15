import { Product } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.id);
    setIsAdding(false);
  };

  const vendorName = product.profiles
    ? `${product.profiles.first_name || ""} ${
        product.profiles.last_name || ""
      }`.trim()
    : "Unknown Vendor";

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <div>
          <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Sold by {vendorName}</p>
        </div>
        {product.categories?.name && (
          <Badge variant="secondary">{product.categories.name}</Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
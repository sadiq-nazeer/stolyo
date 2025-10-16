import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
import { UserProfile } from "@/contexts/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Store = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    const fetchVendorAndProducts = async () => {
      if (!vendorId) return;
      try {
        setLoading(true);

        // Fetch vendor info
        const { data: vendorData, error: vendorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", vendorId)
          .single();

        if (vendorError) throw vendorError;
        setVendor(vendorData);

        // Fetch categories for this vendor
        const { data: categoriesData, error: categoriesError } =
          await supabase
            .from("categories")
            .select("id, name")
            .in(
              "id",
              (
                await supabase
                  .from("products")
                  .select("category_id")
                  .eq("vendor_id", vendorId)
              ).data?.map((p) => p.category_id) || [],
            );
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch products
        let query = supabase
          .from("products")
          .select("*, categories(name)")
          .eq("vendor_id", vendorId);

        if (debouncedSearchTerm) {
          query = query.ilike("name", `%${debouncedSearchTerm}%`);
        }
        if (selectedCategory !== "all") {
          query = query.eq("category_id", selectedCategory);
        }

        const { data: productsData, error: productsError } = await query.order(
          "created_at",
          { ascending: false },
        );
        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorAndProducts();
  }, [vendorId, debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    if (!vendorId) return;
    const channel = supabase
      .channel(`store-updates-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const updatedProduct = payload.new as Product;
          setProducts((currentProducts) =>
            currentProducts.map((p) =>
              p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const vendorName =
    vendor?.first_name || vendor?.last_name
      ? `${vendor.first_name || ""} ${vendor.last_name || ""}`.trim()
      : "Vendor Store";

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={vendor?.avatar_url} />
          <AvatarFallback>
            {vendor?.first_name?.[0]}
            {vendor?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{vendorName}</h1>
          <p className="text-muted-foreground">
            Browse all products from this vendor.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search in this store..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              vendorName={vendorName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">
            This vendor hasn't added any products yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Store;
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
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

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");
        if (error) throw error;
        setCategories(data || []);
      } catch (error: any) {
        showError("Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on search and filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("products")
          .select("*, categories(name), profiles(first_name, last_name)");

        if (debouncedSearchTerm) {
          query = query.ilike("name", `%${debouncedSearchTerm}%`);
        }

        if (selectedCategory !== "all") {
          query = query.eq("category_id", selectedCategory);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchTerm, selectedCategory]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search for products..."
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
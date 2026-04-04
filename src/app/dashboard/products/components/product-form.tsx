/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, ProductInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  minStockThreshold: number;
  status: "ACTIVE" | "INACTIVE";
  description?: string | null;
}

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: {
      status: "ACTIVE",
      stock: 0,
      minStockThreshold: 10,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([...categories, newCat]);
        setValue("categoryId", newCat.id);
        setShowNewCategoryInput(false);
        setNewCategoryName("");
      }
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const onSubmit: SubmitHandler<ProductInput> = async (data) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      onSuccess();
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="flex gap-3 p-3 bg-red-100 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <Input {...register("name")} placeholder="e.g., Laptop" disabled={isSubmitting} />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <Input {...register("sku")} placeholder="e.g., SKU-001" disabled={isSubmitting} />
              {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex gap-2">
                {!showNewCategoryInput ? (
                  <>
                    <Select onValueChange={(val) => setValue("categoryId", val)}>
                      <SelectTrigger disabled={isSubmitting || isLoadingCategories}>
                        <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select Category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setShowNewCategoryInput(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      placeholder="New category name" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button type="button" onClick={handleCreateCategory}>Add</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowNewCategoryInput(false)}>Cancel</Button>
                  </div>
                )}
              </div>
              {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                {...register("price")}
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Initial Stock</label>
              <Input
                {...register("stock")}
                type="number"
                placeholder="0"
                disabled={isSubmitting}
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min. Stock Threshold</label>
              <Input
                {...register("minStockThreshold")}
                type="number"
                placeholder="10"
                disabled={isSubmitting}
              />
              {errors.minStockThreshold && <p className="text-red-600 text-sm mt-1">{errors.minStockThreshold.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                {...register("description")}
                placeholder="Product description (optional)"
                disabled={isSubmitting}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
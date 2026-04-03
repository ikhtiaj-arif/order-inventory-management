"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().nonnegative("Stock cannot be negative"),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
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
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <Input
                {...register("name")}
                placeholder="e.g., Laptop"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <Input
                {...register("sku")}
                placeholder="e.g., SKU-001"
                disabled={isSubmitting}
              />
              {errors.sku && (
                <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Initial Stock
              </label>
              <Input
                {...register("stock", { valueAsNumber: true })}
                type="number"
                placeholder="0"
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                {...register("description")}
                placeholder="Product description (optional)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

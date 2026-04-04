/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { AlertCircle, Loader2, X } from "lucide-react";
import useSWR from "swr";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data: productsData } = useSWR("/api/products?limit=100", fetcher);
  const products = productsData?.products || [];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema) as any,
    defaultValues: {
      customerName: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: OrderFormData) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const orderItems = data.items.map((item) => {
        const product = products.find((p: any) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product ? Number(product.price) : 0,
        };
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: data.customerName, items: orderItems }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
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
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          {submitError && (
            <div className="flex gap-3 p-3 bg-red-100 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <Input
              {...register("customerName")}
              placeholder="e.g., John Doe"
              disabled={isSubmitting}
            />
            {errors.customerName && (
              <p className="text-red-600 text-sm mt-1">{errors.customerName.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Order Items</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1">Product</label>
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field: f }) => (
                      <Select onValueChange={f.onChange} value={f.value} disabled={isSubmitting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} — ${Number(product.price).toFixed(2)} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.items?.[index]?.productId && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.items[index]?.productId?.message}
                    </p>
                  )}
                </div>

                <div className="w-24">
                  <label className="block text-xs text-muted-foreground mb-1">Qty</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    disabled={isSubmitting}
                    {...register(`items.${index}.quantity`)}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ productId: "", quantity: 1 })}
            disabled={isSubmitting}
          >
            + Add Item
          </Button>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Order"}
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

import { z } from "zod";

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const SignupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Category Schemas
export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
});

// Product Schemas
export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  categoryId: z.string().min(1, "Category is required"),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  minStockThreshold: z.coerce
    .number()
    .int()
    .min(1, "Min stock threshold must be at least 1"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// Order Schemas
export const OrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(255),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// Restock Queue Schemas
export const RestockQueueSchema = z.object({
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export const UpdateRestockSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

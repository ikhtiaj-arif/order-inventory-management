"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { logout } from "@/app/actions/auth";
import ProductForm from "./product-form";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductsClient() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/products?page=${page}&limit=10`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleLogout = async () => {
    await logout();
  };

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{ name: "Admin", role: "ADMIN" }}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Products</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your product inventory
                </p>
              </div>
              <Button onClick={() => setShowForm(!showForm)} size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {showForm && (
              <ProductForm
                onSuccess={() => {
                  setShowForm(false);
                  mutate();
                }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800">
                      Failed to load products. Please try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Product List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product: Product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-mono text-sm">
                                {product.sku}
                              </TableCell>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    product.stock < 10
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {product.stock}
                                </span>
                              </TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <span
                                  className={`text-sm ${
                                    product.isActive
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {pagination.pages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {pagination.page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => setPage(Math.max(1, page - 1))}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPage(page + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

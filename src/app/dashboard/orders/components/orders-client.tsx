"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import OrderForm from "./order-form";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: any[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, mutate } = useSWR(
    `/api/orders?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleLogout = async () => {
    await logout();
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{ name: "User", role: "USER" }}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Orders</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track your orders
                </p>
              </div>
              <Button onClick={() => setShowForm(!showForm)} size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                New Order
              </Button>
            </div>

            {showForm && (
              <OrderForm
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
                      Failed to load orders. Please try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order List</CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order: Order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell>{order.items.length} item(s)</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    order.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">
                                ${order.totalAmount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
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

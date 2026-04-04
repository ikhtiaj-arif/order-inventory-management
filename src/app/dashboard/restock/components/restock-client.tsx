"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { logout } from "@/app/actions/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RestockItem {
  id: string;
  productId: string;
  product: { id: string; name: string; stock: number };
  currentStock: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PRIORITY_COLORS = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

export default function RestockClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [approveQty, setApproveQty] = useState<Record<string, number>>({});

  const { data, isLoading, error, mutate } = useSWR(
    "/api/restock",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10000 }
  );

  // For the add-to-restock form
  const { data: productsData } = useSWR("/api/products?limit=100", fetcher);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  const handleLogout = async () => {
    await logout();
  };

  const restockQueues: RestockItem[] = data?.restockQueues || [];

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const qty = approveQty[id] ?? 10;
      const response = await fetch("/api/restock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "APPROVE", quantity: qty }),
      });
      if (response.ok) mutate();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch("/api/restock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "REJECT" }),
      });
      if (response.ok) mutate();
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddToQueue = async () => {
    if (!selectedProductId) return;
    const product = productsData?.products?.find((p: any) => p.id === selectedProductId);
    await fetch("/api/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        currentStock: product?.stock ?? 0,
        priority: selectedPriority,
      }),
    });
    setShowAddForm(false);
    setSelectedProductId("");
    mutate();
  };

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
                <h1 className="text-3xl font-bold text-foreground">Restock Queue</h1>
                <p className="text-muted-foreground mt-1">
                  Review and process restock requests
                </p>
              </div>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add to Queue
              </Button>
            </div>

            {/* Add to Queue Form */}
            {showAddForm && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>Add Product to Restock Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Product</label>
                      <Select onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(productsData?.products || []).map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-40">
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <Select onValueChange={(v) => setSelectedPriority(v as any)} defaultValue="MEDIUM">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddToQueue} disabled={!selectedProductId}>
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800">
                      Failed to load restock queue. Please try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Pending Restock Items</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading restock queue...</p>
                  </div>
                ) : restockQueues.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No items in the restock queue
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Restock Qty</TableHead>
                          <TableHead>Added On</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restockQueues.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product.name}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.currentStock < 10
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.currentStock}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}
                              >
                                {item.priority}
                              </span>
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                min="1"
                                defaultValue={10}
                                className="w-20 border rounded px-2 py-1 text-sm"
                                onChange={(e) =>
                                  setApproveQty((prev) => ({
                                    ...prev,
                                    [item.id]: parseInt(e.target.value) || 10,
                                  }))
                                }
                              />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={processingId === item.id}
                                  onClick={() => handleApprove(item.id)}
                                  className="gap-1"
                                >
                                  {processingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingId === item.id}
                                  onClick={() => handleReject(item.id)}
                                  className="gap-1"
                                >
                                  {processingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

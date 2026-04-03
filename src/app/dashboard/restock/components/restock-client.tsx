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
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { logout } from "@/app/actions/auth";

interface RestockItem {
  id: string;
  productId: string;
  product: { name: string; stock: number };
  requestedQuantity: number;
  status: string;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RestockClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR(
    "/api/restock?status=PENDING",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 5000 }
  );

  const handleLogout = async () => {
    await logout();
  };

  const restockQueues = data?.restockQueues || [];

  const handleApprove = async (id: string, quantity: number) => {
    setProcessingId(id);
    try {
      const response = await fetch("/api/restock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "APPROVE", quantity }),
      });

      if (response.ok) {
        mutate();
      }
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

      if (response.ok) {
        mutate();
      }
    } finally {
      setProcessingId(null);
    }
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Restock Queue</h1>
              <p className="text-muted-foreground mt-1">
                Review and approve restock requests
              </p>
            </div>

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
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading requests...</p>
                  </div>
                ) : restockQueues.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No pending restock requests
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Requested Qty</TableHead>
                          <TableHead>Requested Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restockQueues.map((item: RestockItem) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product.name}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.product.stock < 10
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.product.stock}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono">
                              {item.requestedQuantity} units
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
                                  onClick={() =>
                                    handleApprove(item.id, item.requestedQuantity)
                                  }
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

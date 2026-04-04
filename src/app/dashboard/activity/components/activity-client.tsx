/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { logout } from "@/app/actions/auth";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
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
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  createdAt: string;
  user: { name: string | null; email: string };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getActionColor = (action: string) => {
  if (action.includes("CREATE")) return "bg-green-100 text-green-800";
  if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
  if (action.includes("DELETE")) return "bg-red-100 text-red-800";
  if (action.includes("APPROVE")) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
};

export default function ActivityClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useSWR("/api/activity", fetcher, {
    revalidateOnFocus: false,
  });

  const handleLogout = async () => {
    await logout();
  };

  const logs: ActivityLog[] = data?.logs || [];

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const details =
      typeof log.details === "object" && log.details !== null
        ? JSON.stringify(log.details)
        : String(log.details ?? "");
    return (
      log.action.toLowerCase().includes(term) ||
      details.toLowerCase().includes(term) ||
      (log.user.name ?? "").toLowerCase().includes(term)
    );
  });

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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
              <p className="text-muted-foreground mt-1">
                Track all system activities and changes
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 text-sm">Failed to load activity logs.</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading activity logs...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No activities found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}
                              >
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{log.entityType}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">
                              {typeof log.details === "object" && log.details !== null
                                ? (log.details as any).message ?? JSON.stringify(log.details)
                                : String(log.details ?? "—")}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p className="font-medium">{log.user.name ?? "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{log.user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
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

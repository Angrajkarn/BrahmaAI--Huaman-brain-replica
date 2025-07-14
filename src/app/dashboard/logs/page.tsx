"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { QueryLog } from "@/types";
import { CheckCircle, AlertTriangle, Search, Filter, FileDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for logs
const mockLogs: QueryLog[] = [
  { id: "log1", userId: "user1", timestamp: new Date(Date.now() - 300000), query: "What are the latest advancements in AI?", response: "Recent advancements include LLMs, generative models...", isError: false },
  { id: "log2", userId: "user2", timestamp: new Date(Date.now() - 600000), query: "Summarize this document: [doc_id]", response: "Summary of document...", isError: false },
  { id: "log3", userId: "user1", timestamp: new Date(Date.now() - 900000), query: "Translate 'hello world' to Spanish.", response: "Hola Mundo", isError: false },
  { id: "log4", userId: "user3", timestamp: new Date(Date.now() - 1200000), query: "Analyze this image: [img_url]", response: "Error: Image analysis service unavailable.", isError: true, errorMessage: "Service unavailable" },
  { id: "log5", userId: "user1", timestamp: new Date(Date.now() - 1500000), query: "What is the capital of France?", response: "Paris", isError: false },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<QueryLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "error">("all");

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = log.query.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (log.response && log.response.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            log.userId.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterStatus === "all") return matchesSearch;
      if (filterStatus === "success") return matchesSearch && !log.isError;
      if (filterStatus === "error") return matchesSearch && log.isError;
      return false;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Query Logs</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Monitor user queries, AI responses, and system performance.
        </p>
      </header>

      <Card className="glassmorphism-card">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="gradient-text">Interaction History</CardTitle>
            <CardDescription>Detailed logs of all queries and responses.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Input 
                type="text"
                placeholder="Search logs (query, response, user ID)..."
                className="pl-10 bg-card/80 border-slate-700 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700/50">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "all"}
                  onCheckedChange={() => setFilterStatus("all")}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "success"}
                  onCheckedChange={() => setFilterStatus("success")}
                >
                  Success
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "error"}
                  onCheckedChange={() => setFilterStatus("error")}
                >
                  Error
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700/50">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Response / Error</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-800/50">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.userId}</TableCell>
                    <TableCell className="max-w-xs truncate" title={log.query}>{log.query}</TableCell>
                    <TableCell className={`max-w-xs truncate ${log.isError ? 'text-red-400' : ''}`} title={log.isError ? log.errorMessage : log.response}>
                      {log.isError ? log.errorMessage : log.response}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={log.isError ? "destructive" : "default"} className="bg-opacity-30">
                        {log.isError ? <AlertTriangle className="mr-1 h-3.5 w-3.5" /> : <CheckCircle className="mr-1 h-3.5 w-3.5" />}
                        {log.isError ? "Error" : "Success"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

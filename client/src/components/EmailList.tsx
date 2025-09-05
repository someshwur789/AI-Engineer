import { useState } from "react";
import { useEmails } from "@/hooks/useEmails";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Email } from "@shared/schema";

interface EmailListProps {
  selectedEmailId?: string;
  onEmailSelect: (email: Email) => void;
}

export default function EmailList({ selectedEmailId, onEmailSelect }: EmailListProps) {
  const { data: emails, isLoading, error } = useEmails();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="w-2/3 flex flex-col border-r border-border">
        <div className="p-4 border-b border-border bg-card">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
          <div className="flex space-x-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-2/3 flex flex-col border-r border-border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive">Failed to load emails</p>
            <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredEmails = emails?.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "urgent" && email.priority === "urgent") ||
      (statusFilter === "pending" && email.status === "pending") ||
      (statusFilter === "resolved" && email.status === "resolved");

    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    urgent: emails?.filter(e => e.priority === "urgent").length || 0,
    pending: emails?.filter(e => e.status === "pending").length || 0,
    resolved: emails?.filter(e => e.status === "resolved").length || 0,
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-700";
      case "negative": return "bg-red-100 text-red-700";
      case "neutral": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700";
      case "normal": return "bg-green-100 text-green-700";
      case "low": return "bg-gray-100 text-gray-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="w-2/3 flex flex-col border-r border-border">
      {/* Filters and Search */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <Input
              type="search"
              placeholder="Search emails..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-emails"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "urgent" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("urgent")}
              data-testid="button-filter-urgent"
            >
              Urgent
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              data-testid="button-filter-pending"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("resolved")}
              data-testid="button-filter-resolved"
            >
              Resolved
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span data-testid="text-urgent-count">{stats.urgent} Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span data-testid="text-pending-count">{stats.pending} Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span data-testid="text-resolved-count">{stats.resolved} Resolved</span>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search terms" : "No emails match the selected filters"}
              </p>
            </div>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "border-b border-border hover:bg-accent/50 cursor-pointer transition-colors",
                selectedEmailId === email.id && "bg-accent",
                email.priority === "urgent" && "border-l-4 border-l-red-500"
              )}
              onClick={() => onEmailSelect(email)}
              data-testid={`card-email-${email.id}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      email.sentiment === "positive" ? "bg-green-100 text-green-700" :
                      email.sentiment === "negative" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {getInitials(email.sender)}
                    </div>
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-sender-${email.id}`}>{email.sender}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-timestamp-${email.id}`}>
                        {getTimeAgo(email.receivedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(email.priority || "normal")}>
                      {email.priority || "normal"}
                    </Badge>
                    <Badge className={getSentimentColor(email.sentiment || "neutral")}>
                      {email.sentiment || "neutral"}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-1" data-testid={`text-subject-${email.id}`}>
                  {email.subject}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-preview-${email.id}`}>
                  {email.body.substring(0, 120)}...
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span data-testid={`text-category-${email.id}`}>📁 {email.category || "General"}</span>
                    <span data-testid={`text-status-${email.id}`}>⚡ {email.status || "pending"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700">AI Ready</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

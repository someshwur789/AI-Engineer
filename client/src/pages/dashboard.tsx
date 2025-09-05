import { useState } from "react";
import { useRefreshEmails } from "@/hooks/useEmails";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import EmailList from "@/components/EmailList";
import EmailDetails from "@/components/EmailDetails";
import type { Email } from "@shared/schema";

export default function Dashboard() {
  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();
  const refreshEmails = useRefreshEmails();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await refreshEmails.mutateAsync();
      toast({
        title: "Emails refreshed",
        description: "Email data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh emails. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Support Email Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Manage and respond to customer emails with AI assistance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span data-testid="text-sync-status">Ready</span>
              </div>
              
              {/* Manual Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={refreshEmails.isPending}
                data-testid="button-refresh-emails"
              >
                {refreshEmails.isPending ? "Refreshing..." : "Refresh Emails"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <EmailList
            selectedEmailId={selectedEmail?.id}
            onEmailSelect={setSelectedEmail}
          />
          <EmailDetails email={selectedEmail} />
        </div>
      </div>
    </div>
  );
}

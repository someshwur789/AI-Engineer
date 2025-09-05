import { useState } from "react";
import React from "react";
import { useEmail, useUpdateEmailStatus, useUpdateResponse, useSendResponse } from "@/hooks/useEmails";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Email } from "@shared/schema";

interface EmailDetailsProps {
  email?: Email;
}

export default function EmailDetails({ email }: EmailDetailsProps) {
  const { data: emailData, isLoading } = useEmail(email?.id || "");
  const updateEmailStatus = useUpdateEmailStatus();
  const updateResponse = useUpdateResponse();
  const sendResponse = useSendResponse();
  const { toast } = useToast();
  
  const [responseContent, setResponseContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const emailDetails = emailData?.email || email;
  const aiResponse = emailData?.aiResponse;

  // Update response content when AI response loads
  React.useEffect(() => {
    if (aiResponse?.content && !isEditing) {
      setResponseContent(aiResponse.content);
    }
  }, [aiResponse?.content, isEditing]);

  if (!email) {
    return (
      <div className="w-1/3 flex flex-col bg-card">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Select an email</p>
            <p className="text-sm text-muted-foreground mt-1">Choose an email from the list to view details</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-1/3 flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-b border-border">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

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

  const handleSaveResponse = async () => {
    if (!aiResponse?.id) return;
    
    try {
      await updateResponse.mutateAsync({
        id: aiResponse.id,
        updates: { content: responseContent, status: 'edited' }
      });
      setIsEditing(false);
      toast({
        title: "Response saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendResponse = async () => {
    if (!aiResponse?.id || !emailDetails?.id) return;
    
    try {
      await sendResponse.mutateAsync(aiResponse.id);
      await updateEmailStatus.mutateAsync({
        id: emailDetails.id,
        status: 'resolved'
      });
      toast({
        title: "Response sent",
        description: "Email response has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const extractedInfo = emailDetails?.extractedInfo as any;

  return (
    <div className="w-1/3 flex flex-col bg-card">
      {/* Email Details Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Email Details</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateEmailStatus.mutate({ id: emailDetails?.id || '', status: 'resolved' })}
              title="Mark as Resolved"
              data-testid="button-resolve-email"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Email Metadata */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">From:</span>
            <span className="text-sm font-medium" data-testid="text-email-sender">{emailDetails?.sender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subject:</span>
            <span className="text-sm font-medium" data-testid="text-email-subject">{emailDetails?.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Received:</span>
            <span className="text-sm" data-testid="text-email-received">
              {new Date(emailDetails?.receivedDate || new Date()).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <Badge className={getPriorityColor(emailDetails?.priority || "normal")} data-testid="badge-email-priority">
              {emailDetails?.priority || "normal"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Sentiment:</span>
            <Badge className={getSentimentColor(emailDetails?.sentiment || "neutral")} data-testid="badge-email-sentiment">
              {emailDetails?.sentiment || "neutral"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-4 border-b border-border">
        <h4 className="font-medium text-sm mb-2">Original Message</h4>
        <div className="p-3 bg-muted rounded-lg text-sm" data-testid="text-email-body">
          <p>{emailDetails?.body}</p>
        </div>
      </div>

      {/* Extracted Information */}
      {extractedInfo && (
        <div className="p-4 border-b border-border">
          <h4 className="font-medium text-sm mb-3">Extracted Information</h4>
          <div className="space-y-2 text-sm">
            {extractedInfo.keyPoints?.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                <div>
                  <strong>Key Points:</strong>
                  <ul className="ml-2 mt-1">
                    {extractedInfo.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground">• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {emailDetails?.category && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>Category:</strong> {emailDetails?.category}</span>
              </div>
            )}
            {extractedInfo.requirements?.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></span>
                <div>
                  <strong>Requirements:</strong>
                  <ul className="ml-2 mt-1">
                    {extractedInfo.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground">• {req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Response Section */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">AI Generated Response</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-response"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
        
        {/* AI Response Draft */}
        <div className="flex-1 mb-4">
          <Textarea
            className="w-full h-32 text-sm resize-none"
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="AI response will appear here..."
            readOnly={!isEditing}
            data-testid="textarea-ai-response"
          />
        </div>
        
        {/* Response Actions */}
        <div className="flex space-x-2">
          {isEditing ? (
            <Button
              onClick={handleSaveResponse}
              disabled={updateResponse.isPending}
              className="flex-1"
              data-testid="button-save-response"
            >
              {updateResponse.isPending ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSendResponse}
                disabled={sendResponse.isPending || !responseContent.trim()}
                className="flex-1"
                data-testid="button-send-response"
              >
                {sendResponse.isPending ? "Sending..." : "Send Response"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                data-testid="button-save-draft"
              >
                Edit Draft
              </Button>
            </>
          )}
        </div>
        
        {/* Response Quality Score */}
        {aiResponse?.qualityScore && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-800">Response Quality Score</span>
              <span className="text-green-700 font-semibold" data-testid="text-quality-score">
                {aiResponse.qualityScore}/100
              </span>
            </div>
            <div className="mt-1 text-xs text-green-600">
              ✓ Empathetic tone • ✓ Professional language • ✓ Action items included
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

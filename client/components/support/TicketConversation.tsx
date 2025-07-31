import React, { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Download,
  X,
  Upload,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Settings,
  RefreshCw,
  AlertCircle,
  Image,
  FileText,
  Copy,
  ExternalLink,
  Tag,
  Calendar,
  Loader2
} from "lucide-react";
import { useTicketDetails, useFileUpload, useTicketUpdates, type Ticket, type TicketMessage } from "@/hooks/useSupport";
import { toast } from "@/hooks/use-toast";

interface TicketConversationProps {
  ticketId: string | null;
  onBack?: () => void;
  onTicketUpdate?: (ticket: Ticket) => void;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open", description: "Ticket is open and needs attention" },
  { value: "in_progress", label: "In Progress", description: "Being worked on by support team" },
  { value: "waiting", label: "Waiting", description: "Waiting for customer response" },
  { value: "solved", label: "Solved", description: "Issue has been resolved" },
];

export default function TicketConversation({ 
  ticketId, 
  onBack,
  onTicketUpdate 
}: TicketConversationProps) {
  const { ticket, loading, error, replyToTicket, updateTicketStatus, refetch } = useTicketDetails(ticketId);
  const { validateFiles, formatFileSize, downloadAttachment } = useFileUpload();
  const { notifications } = useTicketUpdates(ticketId);
  
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "waiting":
        return "bg-orange-100 text-orange-800";
      case "solved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <MessageCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "waiting":
        return <AlertTriangle className="h-4 w-4" />;
      case "solved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-700";
      case "normal":
        return "bg-blue-100 text-blue-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (attachment: any) => {
    if (attachment.type?.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const allFiles = [...replyAttachments, ...newFiles];

    const errors = validateFiles(allFiles);
    if (errors.length > 0) {
      toast({
        title: "File Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setReplyAttachments(allFiles);
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsReplying(true);

    try {
      await replyToTicket({
        message: replyMessage.trim(),
        attachments: replyAttachments.length > 0 ? replyAttachments : undefined,
      });

      setReplyMessage("");
      setReplyAttachments([]);

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully",
      });
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || !ticket) return;

    try {
      await updateTicketStatus(newStatus);
      setShowStatusDialog(false);
      setNewStatus("");
      
      onTicketUpdate?.({ ...ticket, status: newStatus as any });

      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const copyTicketId = () => {
    if (ticket) {
      navigator.clipboard.writeText(ticket.id);
      toast({
        title: "Copied!",
        description: "Ticket ID copied to clipboard",
      });
    }
  };

  if (!ticketId) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Ticket</h3>
          <p className="text-gray-600">Choose a ticket from the list to view the conversation.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading ticket conversation...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !ticket) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Ticket not found"}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6 space-x-3">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-600">Ticket {ticket.id}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyTicketId}
                className="p-1"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <span className="text-gray-400">•</span>
              <p className="text-gray-600">Created {formatDate(ticket.created)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(ticket.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(ticket.status)}
              <span>{ticket.status.replace('_', ' ')}</span>
            </div>
          </Badge>
          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
            {ticket.priority} priority
          </Badge>
          {ticket.status !== "solved" && (
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Ticket Status</DialogTitle>
                  <DialogDescription>
                    Change the status of this support ticket
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div>
                            <div className="font-medium">{status.label}</div>
                            <div className="text-xs text-gray-500">{status.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStatusChange} disabled={!newStatus}>
                      Update Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Ticket Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <div className="flex items-center space-x-1 mt-1">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm capitalize">{ticket.category}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Priority</Label>
              <p className="text-sm mt-1 capitalize">{ticket.priority}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Assigned Agent</Label>
              <div className="flex items-center space-x-1 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{ticket.assignedAgent || "Unassigned"}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatDate(ticket.updated)}</span>
              </div>
            </div>
          </div>
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            {ticket.messages?.length || 0} messages in this conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages?.map((message: TicketMessage) => (
            <div
              key={message.id}
              className={`flex ${message.authorType === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-lg space-y-3 ${
                  message.authorType === "customer"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.authorType === "customer"
                        ? "bg-white/20"
                        : "bg-gray-300"
                    }`}
                  >
                    <User className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-semibold">{message.author}</span>
                  <span
                    className={`text-xs ${
                      message.authorType === "customer"
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}
                  >
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Attachments:</p>
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 bg-black/10 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          {getFileIcon(attachment)}
                          <div>
                            <p className="text-xs font-medium">{attachment.name}</p>
                            <p className="text-xs opacity-80">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadAttachment(attachment.id, attachment.name)}
                          className="text-current hover:bg-black/10"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Reply Form */}
      {ticket.status !== "solved" && (
        <Card>
          <CardHeader>
            <CardTitle>Reply to Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply-message">Your Reply</Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={4}
                disabled={isReplying}
              />
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-300 hover:border-primary/50"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className={`h-6 w-6 mx-auto mb-2 ${isDragOver ? 'text-primary' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 mb-2">
                {isDragOver ? "Drop files here" : "Drop files here or click to upload"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
                disabled={isReplying}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReplying}
              >
                Choose Files
              </Button>
            </div>

            {/* Attachment Preview */}
            {replyAttachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="space-y-2">
                  {replyAttachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-500">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        disabled={isReplying}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleReply}
              disabled={isReplying || !replyMessage.trim()}
              className="w-full"
            >
              {isReplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reply...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <Alert key={notification.id} className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {notification.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

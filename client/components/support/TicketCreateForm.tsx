import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Paperclip,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import {
  useTickets,
  useFileUpload,
  type CreateTicketData,
} from "@/hooks/useSupport";
import { toast } from "@/hooks/use-toast";

interface TicketCreateFormProps {
  onTicketCreated?: (ticket: any) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: "billing", label: "Billing & Payments" },
  { value: "technical", label: "Technical Support" },
  { value: "domain", label: "Domain Management" },
  { value: "hosting", label: "Web Hosting" },
  { value: "general", label: "General Inquiry" },
];

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    description: "General questions, minor issues",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Standard support requests",
  },
  {
    value: "high",
    label: "High",
    description: "Important issues affecting operations",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Critical issues requiring immediate attention",
  },
];

export default function TicketCreateForm({
  onTicketCreated,
  onCancel,
}: TicketCreateFormProps) {
  const { createTicket } = useTickets();
  const { validateFiles, formatFileSize } = useFileUpload();

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "",
    priority: "normal",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [submitProgress, setSubmitProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateForm = useCallback(() => {
    const errors: Record<string, string[]> = {};

    if (!formData.subject.trim()) {
      errors.subject = ["Subject is required"];
    } else if (formData.subject.length < 3) {
      errors.subject = ["Subject must be at least 3 characters"];
    } else if (formData.subject.length > 200) {
      errors.subject = ["Subject must be less than 200 characters"];
    }

    if (!formData.message.trim()) {
      errors.message = ["Message is required"];
    } else if (formData.message.length < 10) {
      errors.message = ["Message must be at least 10 characters"];
    } else if (formData.message.length > 5000) {
      errors.message = ["Message must be less than 5000 characters"];
    }

    if (!formData.category) {
      errors.category = ["Please select a category"];
    }

    if (!formData.priority) {
      errors.priority = ["Please select a priority"];
    }

    // Validate attachments
    if (attachments.length > 0) {
      const fileErrors = validateFiles(attachments);
      if (fileErrors.length > 0) {
        errors.attachments = fileErrors;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, attachments, validateFiles]);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors],
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files);
      const allFiles = [...attachments, ...newFiles];

      // Validate combined file list
      const errors = validateFiles(allFiles);
      if (errors.length > 0) {
        setValidationErrors((prev) => ({ ...prev, attachments: errors }));
        return;
      }

      setAttachments(allFiles);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.attachments;
        return newErrors;
      });
    },
    [attachments, validateFiles],
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.attachments;
      return newErrors;
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors below and try again",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      setSubmitProgress(0);

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setSubmitProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const ticketData: CreateTicketData = {
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category,
          priority: formData.priority,
          attachments: attachments.length > 0 ? attachments : undefined,
        };

        const newTicket = await createTicket(ticketData);

        clearInterval(progressInterval);
        setSubmitProgress(100);

        // Reset form
        setFormData({
          subject: "",
          message: "",
          category: "",
          priority: "normal",
        });
        setAttachments([]);
        setValidationErrors({});

        onTicketCreated?.(newTicket);

        toast({
          title: "Ticket Created",
          description: `Your support ticket ${newTicket.id} has been created successfully`,
        });
      } catch (error) {
        console.error("Error creating ticket:", error);
      } finally {
        setIsSubmitting(false);
        setSubmitProgress(0);
      }
    },
    [formData, attachments, validateForm, createTicket, onTicketCreated],
  );

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getRemainingCharacters = (field: "subject" | "message") => {
    const maxLength = field === "subject" ? 200 : 5000;
    const currentLength = formData[field].length;
    return maxLength - currentLength;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Create Support Ticket
        </CardTitle>
        <CardDescription>
          Describe your issue and we'll help you resolve it as quickly as
          possible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger
                  className={validationErrors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-sm text-red-600">
                  {validationErrors.category[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority *
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger
                  className={validationErrors.priority ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div>
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-xs text-gray-500">
                          {priority.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.priority && (
                <p className="text-sm text-red-600">
                  {validationErrors.priority[0]}
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject *
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief description of your issue"
              className={validationErrors.subject ? "border-red-500" : ""}
              maxLength={200}
            />
            <div className="flex justify-between">
              {validationErrors.subject ? (
                <p className="text-sm text-red-600">
                  {validationErrors.subject[0]}
                </p>
              ) : (
                <div />
              )}
              <p
                className={`text-xs ${getRemainingCharacters("subject") < 20 ? "text-orange-600" : "text-gray-500"}`}
              >
                {getRemainingCharacters("subject")} characters remaining
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Please provide detailed information about your issue, including any error messages and steps you've already tried."
              rows={6}
              className={validationErrors.message ? "border-red-500" : ""}
              maxLength={5000}
            />
            <div className="flex justify-between">
              {validationErrors.message ? (
                <p className="text-sm text-red-600">
                  {validationErrors.message[0]}
                </p>
              ) : (
                <div />
              )}
              <p
                className={`text-xs ${getRemainingCharacters("message") < 100 ? "text-orange-600" : "text-gray-500"}`}
              >
                {getRemainingCharacters("message")} characters remaining
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Attachments (Optional)
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : validationErrors.attachments
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-primary/50"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload
                className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? "text-primary" : "text-gray-400"}`}
              />
              <p className="text-sm text-gray-600 mb-2">
                {isDragOver
                  ? "Drop files here"
                  : "Drop files here or click to upload"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Maximum 5 files, 5MB each. Supported: Images, PDF, DOC, XLS,
                TXT, CSV
              </p>
            </div>

            {validationErrors.attachments && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.attachments.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attached Files</Label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500">{getFileIcon(file)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Progress */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">
                  Creating ticket...
                </span>
              </div>
              <Progress value={submitProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting || Object.keys(validationErrors).length > 0
              }
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

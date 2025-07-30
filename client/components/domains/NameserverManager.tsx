import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Server,
  Loader2,
} from "lucide-react";
import { nameserverSchema, type NameserverFormData } from "./DomainValidation";
import { toast } from "@/hooks/use-toast";

interface NameserverManagerProps {
  domainId: string;
  domainName: string;
  initialNameservers: string[];
  onUpdate: (nameservers: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function NameserverManager({
  domainId,
  domainName,
  initialNameservers,
  onUpdate,
  disabled = false,
}: NameserverManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<NameserverFormData>({
    resolver: zodResolver(nameserverSchema),
    defaultValues: {
      nameservers:
        initialNameservers.length > 0 ? initialNameservers : ["", ""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nameservers",
  });

  const watchedNameservers = watch("nameservers");

  // Reset form when initial nameservers change
  useEffect(() => {
    reset({
      nameservers:
        initialNameservers.length > 0 ? initialNameservers : ["", ""],
    });
  }, [initialNameservers, reset]);

  const onSubmit = async (data: NameserverFormData) => {
    const filteredNameservers = data.nameservers.filter(
      (ns) => ns.trim() !== "",
    );

    if (filteredNameservers.length < 2) {
      toast({
        title: "Validation Error",
        description: "At least 2 nameservers are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate(filteredNameservers);
      setIsEditing(false);
      setShowConfirmDialog(false);
      toast({
        title: "Success",
        description: "Nameservers updated successfully",
      });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({
      nameservers:
        initialNameservers.length > 0 ? initialNameservers : ["", ""],
    });
    setIsEditing(false);
  };

  const addNameserver = () => {
    if (fields.length < 5) {
      append("");
    }
  };

  const removeNameserver = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const handleSaveClick = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="mr-2 h-4 w-4" />
              Nameservers
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={disabled}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveClick}
                    disabled={isSubmitting || !isDirty}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Nameserver {index + 1}
                  </Label>
                  {isEditing && fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNameserver(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  {...control.register(`nameservers.${index}`)}
                  placeholder={`ns${index + 1}.${domainName}`}
                  disabled={!isEditing || isSubmitting}
                  className={
                    errors.nameservers?.[index] ? "border-red-500" : ""
                  }
                />
                {errors.nameservers?.[index] && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.nameservers[index]?.message}
                  </div>
                )}
              </div>
            ))}

            {errors.nameservers &&
              typeof errors.nameservers.message === "string" && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {errors.nameservers.message}
                </div>
              )}

            {isEditing && (
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNameserver}
                  disabled={fields.length >= 5 || isSubmitting}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Nameserver
                </Button>
                <div className="text-sm text-gray-500">
                  {fields.length}/5 nameservers
                </div>
              </div>
            )}
          </form>

          {!isEditing && (
            <div className="space-y-3">
              {initialNameservers.map((ns, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Nameserver {index + 1}
                    </span>
                  </div>
                  <code className="text-sm font-mono text-gray-900">{ns}</code>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Nameserver Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the nameservers for {domainName}?
              This change may affect your website's availability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Current nameservers:
              </h4>
              <div className="space-y-1">
                {initialNameservers.map((ns, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded"
                  >
                    {ns}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                New nameservers:
              </h4>
              <div className="space-y-1">
                {watchedNameservers
                  .filter((ns) => ns.trim() !== "")
                  .map((ns, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono text-gray-900 bg-blue-50 p-2 rounded"
                    >
                      {ns}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

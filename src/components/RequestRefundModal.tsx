import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRequestRefund } from "@/hooks/useTransactions";

const refundSchema = z.object({
  reason: z.string().min(10, "Please provide a reason (at least 10 characters)"),
});

type RefundForm = z.infer<typeof refundSchema>;

interface RequestRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionAmount: number;
  currency: string;
}

export default function RequestRefundModal({
  open,
  onOpenChange,
  transactionId,
  transactionAmount,
  currency,
}: RequestRefundModalProps) {
  const requestRefundMutation = useRequestRefund();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefundForm>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleSubmit = async (data: RefundForm) => {
    setIsSubmitting(true);
    try {
      await requestRefundMutation.mutateAsync({
        transaction_id: transactionId,
        reason: data.reason,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for this transaction. Our team will review your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs">{transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {currency} {transactionAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund *</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder="Please explain why you are requesting a refund..."
              rows={4}
              className="resize-none"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || requestRefundMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || requestRefundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

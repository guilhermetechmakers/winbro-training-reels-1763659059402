import { useState } from "react";
import { Loader2, Trash2, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdatePaymentMethod, useDeletePaymentMethod } from "@/hooks/useTransactions";
import { usePaymentMethods } from "@/hooks/useCheckout";
import type { PaymentMethod } from "@/types";

interface EditPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPaymentMethodModal({
  open,
  onOpenChange,
}: EditPaymentMethodModalProps) {
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSetDefault = async (methodId: string) => {
    try {
      await updatePaymentMethodMutation.mutateAsync({
        methodId,
        data: { is_default: true },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    setDeletingId(methodId);
    try {
      await deletePaymentMethodMutation.mutateAsync(methodId);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
          <DialogDescription>
            Manage your saved payment methods. Set a default or remove unused cards.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method: PaymentMethod) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {method.card.brand.toUpperCase()} •••• {method.card.last4}
                      </span>
                      {method.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card.exp_month.toString().padStart(2, "0")}/{method.card.exp_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={updatePaymentMethodMutation.isPending}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    disabled={deletingId === method.id || deletePaymentMethodMutation.isPending}
                  >
                    {deletingId === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No payment methods saved</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

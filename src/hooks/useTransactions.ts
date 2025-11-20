import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as transactionsApi from "@/api/transactions";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  list: (params?: { start_date?: string; end_date?: string; status?: string; page?: number; limit?: number }) =>
    [...transactionKeys.all, "list", params] as const,
  billingContacts: () => [...transactionKeys.all, "billing-contacts"] as const,
  paymentMethods: () => [...transactionKeys.all, "payment-methods"] as const,
};

// Get transactions
export const useTransactions = (params?: {
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsApi.getTransactions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Download invoice
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (transactionId: string) => transactionsApi.downloadInvoice(transactionId),
    onSuccess: (blob, transactionId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download invoice");
    },
  });
};

// Request refund
export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { transaction_id: string; reason: string }) =>
      transactionsApi.requestRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success("Refund request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit refund request");
    },
  });
};

// Get billing contacts
export const useBillingContacts = () => {
  return useQuery({
    queryKey: transactionKeys.billingContacts(),
    queryFn: transactionsApi.getBillingContacts,
  });
};

// Update billing contact
export const useUpdateBillingContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { contact_name: string; email: string; phone?: string }) =>
      transactionsApi.updateBillingContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.billingContacts() });
      toast.success("Billing contact updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update billing contact");
    },
  });
};

// Update payment method
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ methodId, data }: { methodId: string; data: { is_default?: boolean } }) =>
      transactionsApi.updatePaymentMethod(methodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.paymentMethods() });
      toast.success("Payment method updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment method");
    },
  });
};

// Delete payment method
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodId: string) => transactionsApi.deletePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.paymentMethods() });
      toast.success("Payment method deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment method");
    },
  });
};

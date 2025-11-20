import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as checkoutApi from "@/api/checkout";
import type { BillingDetails } from "@/types";

// Query keys
export const checkoutKeys = {
  all: ["checkout"] as const,
  plans: () => [...checkoutKeys.all, "plans"] as const,
  promoCode: (code: string) => [...checkoutKeys.all, "promo-code", code] as const,
  invoicePreview: (params: { plan_id: string; promo_code?: string }) => 
    [...checkoutKeys.all, "invoice-preview", params] as const,
  billingDetails: () => [...checkoutKeys.all, "billing-details"] as const,
  paymentMethods: () => [...checkoutKeys.all, "payment-methods"] as const,
};

// Get available plans
export const usePlans = () => {
  return useQuery({
    queryKey: checkoutKeys.plans(),
    queryFn: checkoutApi.getPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Validate promo code
export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: (code: string) => checkoutApi.validatePromoCode(code),
    onError: (error: Error) => {
      toast.error(error.message || "Invalid promo code");
    },
  });
};

// Get invoice preview
export const useInvoicePreview = (params: {
  plan_id: string;
  promo_code?: string;
  billing_country?: string;
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: checkoutKeys.invoicePreview(params),
    queryFn: () => checkoutApi.getInvoicePreview(params),
    enabled: enabled && !!params.plan_id,
  });
};

// Get billing details
export const useBillingDetails = () => {
  return useQuery({
    queryKey: checkoutKeys.billingDetails(),
    queryFn: checkoutApi.getBillingDetails,
  });
};

// Save billing details
export const useSaveBillingDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<BillingDetails, "id" | "created_at" | "updated_at">) =>
      checkoutApi.saveBillingDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.billingDetails() });
      toast.success("Billing details saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save billing details");
    },
  });
};

// Get payment methods
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: checkoutKeys.paymentMethods(),
    queryFn: checkoutApi.getPaymentMethods,
  });
};

// Process payment
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      plan_id: string;
      billing_details: Omit<BillingDetails, "id" | "user_id" | "created_at" | "updated_at">;
      payment_method_id?: string;
      payment_token?: string;
      promo_code?: string;
      terms_accepted: boolean;
    }) => checkoutApi.processPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.all });
      toast.success("Payment processed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment processing failed");
    },
  });
};

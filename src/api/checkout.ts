import { api } from "@/lib/api";
import type { Plan, PromoCode, InvoicePreview, BillingDetails, Transaction, PaymentMethod } from "@/types";

// Get available subscription plans
export const getPlans = async (): Promise<Plan[]> => {
  return api.get<Plan[]>("/plans");
};

// Validate promo code
export const validatePromoCode = async (code: string): Promise<PromoCode> => {
  return api.post<PromoCode>("/promo-codes/validate", { code });
};

// Get invoice preview
export const getInvoicePreview = async (data: {
  plan_id: string;
  promo_code?: string;
  billing_country?: string;
}): Promise<InvoicePreview> => {
  return api.post<InvoicePreview>("/checkout/invoice-preview", data);
};

// Get saved billing details
export const getBillingDetails = async (): Promise<BillingDetails | null> => {
  return api.get<BillingDetails | null>("/billing/details");
};

// Save billing details
export const saveBillingDetails = async (data: Omit<BillingDetails, "id" | "created_at" | "updated_at">): Promise<BillingDetails> => {
  return api.post<BillingDetails>("/billing/details", data);
};

// Get saved payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return api.get<PaymentMethod[]>("/payment/methods");
};

// Process payment and create subscription
export const processPayment = async (data: {
  plan_id: string;
  billing_details: Omit<BillingDetails, "id" | "user_id" | "created_at" | "updated_at">;
  payment_method_id?: string;
  payment_token?: string; // For new card
  promo_code?: string;
  terms_accepted: boolean;
}): Promise<Transaction> => {
  return api.post<Transaction>("/checkout/process", data);
};

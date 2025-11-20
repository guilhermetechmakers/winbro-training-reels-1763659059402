import { api } from "@/lib/api";
import type { TransactionWithDetails, Refund, BillingContact, PaymentMethod } from "@/types";

// Get transactions with optional filters
export const getTransactions = async (params?: {
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ transactions: TransactionWithDetails[]; total: number; page: number; limit: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  return api.get<{ transactions: TransactionWithDetails[]; total: number; page: number; limit: number }>(
    `/transactions${queryString ? `?${queryString}` : ""}`
  );
};

// Download invoice PDF
export const downloadInvoice = async (transactionId: string): Promise<Blob> => {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/transactions/${transactionId}/invoice`;
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download invoice: ${response.status}`);
  }

  return response.blob();
};

// Request refund
export const requestRefund = async (data: {
  transaction_id: string;
  reason: string;
}): Promise<Refund> => {
  return api.post<Refund>("/transactions/refund", data);
};

// Get billing contacts
export const getBillingContacts = async (): Promise<BillingContact[]> => {
  return api.get<BillingContact[]>("/billing/contacts");
};

// Update billing contact
export const updateBillingContact = async (data: {
  contact_name: string;
  email: string;
  phone?: string;
}): Promise<BillingContact> => {
  return api.put<BillingContact>("/billing/contacts", data);
};

// Update payment method
export const updatePaymentMethod = async (methodId: string, data: {
  is_default?: boolean;
}): Promise<PaymentMethod> => {
  return api.patch<PaymentMethod>(`/payment/methods/${methodId}`, data);
};

// Delete payment method
export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  await api.delete(`/payment/methods/${methodId}`);
};

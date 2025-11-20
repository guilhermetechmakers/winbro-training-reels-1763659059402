import { useState } from "react";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  CreditCard,
  Building2,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useTransactions,
  useDownloadInvoice,
  useBillingContacts,
} from "@/hooks/useTransactions";
import { usePaymentMethods } from "@/hooks/useCheckout";
import RequestRefundModal from "@/components/RequestRefundModal";
import EditPaymentMethodModal from "@/components/EditPaymentMethodModal";
import type { TransactionWithDetails } from "@/types";

type SortField = "date" | "amount" | "status";
type SortDirection = "asc" | "desc";

export default function TransactionHistory() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);

  const limit = 10;

  // Queries
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit,
  });

  const { data: billingContacts, isLoading: billingContactsLoading } = useBillingContacts();
  const { data: paymentMethods } = usePaymentMethods();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Sorting
  const sortedTransactions = transactionsData?.transactions
    ? [...transactionsData.transactions].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "date":
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case "amount":
            comparison = a.amount - b.amount;
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : [];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDownloadInvoice = (transactionId: string) => {
    downloadInvoiceMutation.mutate(transactionId);
  };

  const handleRequestRefund = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setRefundModalOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const totalPages = transactionsData ? Math.ceil(transactionsData.total / limit) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-2">
          View your invoices and payment history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filters</CardTitle>
                </div>
                {(startDate || endDate || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {transactionsData
                  ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, transactionsData.total)} of ${transactionsData.total} transactions`
                  : "Loading transactions..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-12 w-32" />
                    </div>
                  ))}
                </div>
              ) : sortedTransactions.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4">
                            <button
                              onClick={() => handleSort("date")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors text-muted-foreground"
                            >
                              Date
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </th>
                          <th className="text-left py-3 px-4">
                            <button
                              onClick={() => handleSort("status")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors text-muted-foreground"
                            >
                              Status
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </th>
                          <th className="text-left py-3 px-4">Plan</th>
                          <th className="text-left py-3 px-4">
                            <button
                              onClick={() => handleSort("amount")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors text-muted-foreground"
                            >
                              Amount
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </th>
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(transaction.created_at), "hh:mm a")}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium">
                                {transaction.plan_name || "N/A"}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium">
                                {transaction.currency} {transaction.amount.toFixed(2)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {transaction.invoice_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(transaction.id)}
                                    disabled={downloadInvoiceMutation.isPending}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                {transaction.status === "completed" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRequestRefund(transaction)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {sortedTransactions.map((transaction) => (
                      <Card key={transaction.id} className="card-hover">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">
                                  {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.created_at), "hh:mm a")}
                                </div>
                              </div>
                              <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-medium">
                                  {transaction.plan_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-medium">
                                  {transaction.currency} {transaction.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              {transaction.invoice_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(transaction.id)}
                                  disabled={downloadInvoiceMutation.isPending}
                                  className="flex-1"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              )}
                              {transaction.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRequestRefund(transaction)}
                                  className="flex-1"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Refund
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No transactions found</p>
                  <p className="text-sm mt-2">
                    {startDate || endDate || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Your transaction history will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Billing Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>Billing Contacts</CardTitle>
                </div>
              </div>
              <CardDescription>Manage your billing contact information</CardDescription>
            </CardHeader>
            <CardContent>
              {billingContactsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : billingContacts && billingContacts.length > 0 ? (
                <div className="space-y-3">
                  {billingContacts.map((contact) => (
                    <div key={contact.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{contact.contact_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{contact.email}</div>
                      {contact.phone && (
                        <div className="text-xs text-muted-foreground">{contact.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Building2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No billing contacts</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle>Payment Methods</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPaymentMethodModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.slice(0, 3).map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {method.card.brand.toUpperCase()} •••• {method.card.last4}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expires {method.card.exp_month.toString().padStart(2, "0")}/{method.card.exp_year}
                          </div>
                        </div>
                      </div>
                      {method.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                  {paymentMethods.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setPaymentMethodModalOpen(true)}
                    >
                      View All ({paymentMethods.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No payment methods</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Need help with your transactions?
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="/dashboard/help">Contact Support</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {selectedTransaction && (
        <RequestRefundModal
          open={refundModalOpen}
          onOpenChange={setRefundModalOpen}
          transactionId={selectedTransaction.id}
          transactionAmount={selectedTransaction.amount}
          currency={selectedTransaction.currency}
        />
      )}

      <EditPaymentMethodModal
        open={paymentMethodModalOpen}
        onOpenChange={setPaymentMethodModalOpen}
      />
    </div>
  );
}

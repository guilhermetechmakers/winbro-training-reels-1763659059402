import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { usePlans, useValidatePromoCode, useInvoicePreview, useBillingDetails, useSaveBillingDetails, usePaymentMethods, useProcessPayment } from "@/hooks/useCheckout";
import type { Plan } from "@/types";

// Form validation schemas
const billingSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  tax_id: z.string().optional(),
});

const paymentSchema = z.object({
  payment_method_id: z.string().optional(),
  card_number: z.string().optional(),
  card_expiry: z.string().optional(),
  card_cvc: z.string().optional(),
  card_name: z.string().optional(),
}).refine((data) => {
  // Either payment_method_id or all card fields must be provided
  if (data.payment_method_id) return true;
  return !!(data.card_number && data.card_expiry && data.card_cvc && data.card_name);
}, {
  message: "Please select a saved payment method or enter card details",
  path: ["payment_method_id"],
});

type BillingForm = z.infer<typeof billingSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

type CheckoutStep = "plan" | "billing" | "payment" | "review" | "success";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIdParam = searchParams.get("plan_id");

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Queries
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: savedBilling } = useBillingDetails();
  const { data: paymentMethods } = usePaymentMethods();
  
  const { data: invoicePreview, isLoading: invoiceLoading } = useInvoicePreview(
    {
      plan_id: selectedPlan?.id || "",
      promo_code: validatedPromo?.code,
      billing_country: savedBilling?.billing_address.country,
    },
    !!selectedPlan?.id
  );

  // Mutations
  const validatePromoMutation = useValidatePromoCode();
  const saveBillingMutation = useSaveBillingDetails();
  const processPaymentMutation = useProcessPayment();

  // Billing form
  const billingForm = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: savedBilling ? {
      company_name: savedBilling.company_name,
      address_line1: savedBilling.billing_address.line1,
      address_line2: savedBilling.billing_address.line2,
      city: savedBilling.billing_address.city,
      state: savedBilling.billing_address.state,
      postal_code: savedBilling.billing_address.postal_code,
      country: savedBilling.billing_address.country,
      tax_id: savedBilling.tax_id,
    } : undefined,
  });

  // Payment form
  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  });

  // Auto-select plan from URL param
  useEffect(() => {
    if (plans && planIdParam && !selectedPlan) {
      const plan = plans.find((p) => p.id === planIdParam);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep("billing");
      }
    }
  }, [plans, planIdParam, selectedPlan]);

  // Load saved billing details into form
  useEffect(() => {
    if (savedBilling && currentStep === "billing") {
      billingForm.reset({
        company_name: savedBilling.company_name,
        address_line1: savedBilling.billing_address.line1,
        address_line2: savedBilling.billing_address.line2,
        city: savedBilling.billing_address.city,
        state: savedBilling.billing_address.state,
        postal_code: savedBilling.billing_address.postal_code,
        country: savedBilling.billing_address.country,
        tax_id: savedBilling.tax_id,
      });
    }
  }, [savedBilling, currentStep, billingForm]);

  const handlePromoCodeValidate = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      const result = await validatePromoMutation.mutateAsync(promoCode.trim().toUpperCase());
      const discount = result.discount_type === "percentage"
        ? (selectedPlan?.price || 0) * (result.discount_value / 100)
        : result.discount_value;
      
      setValidatedPromo({ code: result.code, discount });
      toast.success("Promo code applied successfully");
    } catch (error) {
      setValidatedPromo(null);
    }
  };

  const handleBillingSubmit = async (data: BillingForm) => {
    try {
      await saveBillingMutation.mutateAsync({
        user_id: "", // Will be set by backend
        company_name: data.company_name,
        billing_address: {
          line1: data.address_line1,
          line2: data.address_line2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        },
        tax_id: data.tax_id,
      });
      setCurrentStep("payment");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePaymentSubmit = async (data: PaymentForm) => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    const billingData = billingForm.getValues();

    try {
      const transaction = await processPaymentMutation.mutateAsync({
        plan_id: selectedPlan.id,
        billing_details: {
          company_name: billingData.company_name,
          billing_address: {
            line1: billingData.address_line1,
            line2: billingData.address_line2,
            city: billingData.city,
            state: billingData.state,
            postal_code: billingData.postal_code,
            country: billingData.country,
          },
          tax_id: billingData.tax_id,
        },
        payment_method_id: data.payment_method_id || undefined,
        payment_token: data.payment_method_id ? undefined : "token_placeholder", // In real app, get from Stripe
        promo_code: validatedPromo?.code,
        terms_accepted: termsAccepted,
      });

      setTransactionId(transaction.id);
      setCurrentStep("success");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const progressSteps = [
    { id: "plan", label: "Select Plan" },
    { id: "billing", label: "Billing Details" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];

  const currentStepIndex = progressSteps.findIndex((s) => s.id === currentStep);

  if (currentStep === "success" && transactionId) {
    return <SuccessScreen transactionId={transactionId} plan={selectedPlan!} />;
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your subscription purchase
          </p>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        index <= currentStepIndex
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        index <= currentStepIndex
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            {currentStep === "plan" && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle>Select Subscription Plan</CardTitle>
                  <CardDescription>
                    Choose the plan that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans?.map((plan) => (
                        <Card
                          key={plan.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${
                            selectedPlan?.id === plan.id
                              ? "ring-2 ring-primary border-primary"
                              : ""
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              {selectedPlan?.id === plan.id && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <span className="text-3xl font-bold">
                                  ${plan.price}
                                </span>
                                <span className="text-muted-foreground">
                                  /{plan.interval}
                                </span>
                              </div>
                              <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {selectedPlan && (
                    <div className="mt-6">
                      <Button
                        className="w-full"
                        onClick={() => setCurrentStep("billing")}
                      >
                        Continue to Billing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Billing Details */}
            {currentStep === "billing" && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>Billing Details</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your company billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={billingForm.handleSubmit(handleBillingSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        {...billingForm.register("company_name")}
                        placeholder="Acme Corporation"
                      />
                      {billingForm.formState.errors.company_name && (
                        <p className="text-sm text-destructive">
                          {billingForm.formState.errors.company_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        {...billingForm.register("address_line1")}
                        placeholder="123 Main Street"
                      />
                      {billingForm.formState.errors.address_line1 && (
                        <p className="text-sm text-destructive">
                          {billingForm.formState.errors.address_line1.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        {...billingForm.register("address_line2")}
                        placeholder="Suite 100 (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...billingForm.register("city")}
                          placeholder="New York"
                        />
                        {billingForm.formState.errors.city && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province *</Label>
                        <Input
                          id="state"
                          {...billingForm.register("state")}
                          placeholder="NY"
                        />
                        {billingForm.formState.errors.state && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code *</Label>
                        <Input
                          id="postal_code"
                          {...billingForm.register("postal_code")}
                          placeholder="10001"
                        />
                        {billingForm.formState.errors.postal_code && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.postal_code.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={billingForm.watch("country")}
                          onValueChange={(value) =>
                            billingForm.setValue("country", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                          </SelectContent>
                        </Select>
                        {billingForm.formState.errors.country && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID (Optional)</Label>
                      <Input
                        id="tax_id"
                        {...billingForm.register("tax_id")}
                        placeholder="EIN or VAT number"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("plan")}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={saveBillingMutation.isPending}
                      >
                        {saveBillingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            {currentStep === "payment" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Promo Code */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <CardTitle>Promo Code</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        disabled={!!validatedPromo || validatePromoMutation.isPending}
                      />
                      {validatedPromo ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPromoCode("");
                            setValidatedPromo(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePromoCodeValidate}
                          disabled={!promoCode.trim() || validatePromoMutation.isPending}
                        >
                          {validatePromoMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      )}
                    </div>
                    {validatedPromo && (
                      <p className="mt-2 text-sm text-primary">
                        Promo code applied: ${validatedPromo.discount.toFixed(2)} discount
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Form */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Payment Method</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                      className="space-y-4"
                    >
                      {paymentMethods && paymentMethods.length > 0 && (
                        <div className="space-y-2">
                          <Label>Saved Payment Methods</Label>
                          <Select
                            value={paymentForm.watch("payment_method_id")}
                            onValueChange={(value) => {
                              paymentForm.setValue("payment_method_id", value);
                              paymentForm.setValue("card_number", "");
                              paymentForm.setValue("card_expiry", "");
                              paymentForm.setValue("card_cvc", "");
                              paymentForm.setValue("card_name", "");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select saved payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  {method.card.brand.toUpperCase()} •••• {method.card.last4} (Expires {method.card.exp_month}/{method.card.exp_year})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {(!paymentForm.watch("payment_method_id") || paymentMethods?.length === 0) && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <Label>Card Number *</Label>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              {...paymentForm.register("card_number")}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Date *</Label>
                              <Input
                                placeholder="MM/YY"
                                {...paymentForm.register("card_expiry")}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CVC *</Label>
                              <Input
                                placeholder="123"
                                type="password"
                                {...paymentForm.register("card_cvc")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Cardholder Name *</Label>
                            <Input
                              placeholder="John Doe"
                              {...paymentForm.register("card_name")}
                            />
                          </div>
                        </>
                      )}

                      <div className="flex items-start gap-2 pt-4">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) =>
                            setTermsAccepted(checked === true)
                          }
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm font-normal cursor-pointer"
                        >
                          I agree to the{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep("billing")}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            !termsAccepted ||
                            processPaymentMutation.isPending ||
                            !selectedPlan
                          }
                          className="flex-1"
                        >
                          {processPaymentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Complete Purchase
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Plan Summary & Invoice Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Plan Summary */}
              {selectedPlan && (
                <Card className="animate-fade-in-up">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selectedPlan.name}</span>
                        <span className="font-bold">
                          ${selectedPlan.price}/{selectedPlan.interval}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan.description}
                      </p>
                    </div>

                    <Separator />

                    {/* Invoice Preview */}
                    {invoicePreview && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${invoicePreview.subtotal.toFixed(2)}</span>
                        </div>
                        {validatedPromo && invoicePreview.discount > 0 && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>Discount</span>
                            <span>-${invoicePreview.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {invoicePreview.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>${invoicePreview.tax.toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>
                            {invoicePreview.currency}
                            {invoicePreview.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {invoiceLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Support Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Need help? Contact our support team
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/help">Get Support</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Screen Component
function SuccessScreen({ transactionId, plan }: { transactionId: string; plan: Plan }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl animate-scale-in">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your subscription has been activated successfully
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${plan.price}/{plan.interval}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/transactions")}>
                View Transaction History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export default function EmailVerificationPage() {
  const [status] = useState<"pending" | "success" | "error">("pending");
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // TODO: Implement resend logic
    setTimeout(() => {
      setResending(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          {status === "pending" && (
            <>
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl">Verify your email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#22C55E]" />
              <CardTitle className="text-2xl">Email verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now access your dashboard.
              </CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="text-2xl">Verification failed</CardTitle>
              <CardDescription>
                The verification link is invalid or has expired. Please request a new one.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "pending" && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
              <Button asChild className="w-full">
                <Link to="/dashboard">Continue to Dashboard</Link>
              </Button>
            </>
          )}
          {status === "success" && (
            <Button asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
          {status === "error" && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Request new verification email"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

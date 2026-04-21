import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/Button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useResendVerification, useVerifyEmail } from "@/features/auth/hooks";

type Status = "idle" | "pending" | "success" | "error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const prefilledEmail = params.get("email") ?? "";

  const [status, setStatus] = useState<Status>(token ? "pending" : "idle");
  const [email, setEmail] = useState(prefilledEmail);

  const { verifyEmail } = useVerifyEmail();
  const { resend, isLoading: resendLoading } = useResendVerification();

  const didRun = useRef(false);
  useEffect(() => {
    if (!token || didRun.current) return;
    didRun.current = true;
    void (async () => {
      const result = await verifyEmail(token);
      setStatus(result.success ? "success" : "error");
    })();
  }, [token, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;
    await resend(email);
  };

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2 text-left">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary">
          {status === "success" ? "Email verified" : "Verify your email"}
        </h2>
        <p className="text-muted-foreground">
          {status === "success"
            ? "Your email is confirmed. You can now sign in to the RNEC Portal."
            : status === "pending"
            ? "Confirming your email…"
            : status === "error"
            ? "We couldn't verify that link. It may have expired or already been used."
            : "Check your inbox for a confirmation link. If it hasn't arrived, enter your email below to resend it."}
        </p>
      </header>

      {status === "success" ? (
        <Button route="/auth/login" primary className="w-full rounded-md">
          Go to sign in
        </Button>
      ) : (
        <div className="space-y-5">
          <label className="block space-y-2 text-[13px] text-foreground">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.rw"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button
            type="submit"
            primary
            className="w-full rounded-md"
            isLoading={resendLoading}
            disabled={resendLoading || !email}
            onClick={(e) => {
              e.preventDefault();
              void handleResend();
            }}
          >
            Resend verification email
          </Button>
          <p className="text-center text-[13px]">
            <Link
              to="/auth/login"
              className="font-normal text-primary hover:underline underline-offset-2"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useForgotPassword } from "@/features/auth/hooks";

const schema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const formId = useId();
  const [submitted, setSubmitted] = useState(false);
  const { requestReset, isLoading } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await requestReset({ email: data.email });
    if (result.success) setSubmitted(true);
  });

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2 text-left">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary">
          Reset your password
        </h2>
        <p className="text-muted-foreground">
          Enter the email you registered with and we&apos;ll send you a reset
          link.
        </p>
      </header>

      {submitted ? (
        <div className="space-y-4 rounded-md border border-border bg-muted/40 p-4 text-sm">
          <p>
            If an account exists for that email, a password reset link is on its
            way. The link expires in 60 minutes.
          </p>
          <Link
            to="/auth/login"
            className="inline-block text-primary hover:underline underline-offset-2"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form className="w-full space-y-6" onSubmit={onSubmit} noValidate>
          <fieldset className="flex flex-col gap-5 border-0 p-0" disabled={isLoading}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  required
                  label="Email address"
                  {...field}
                  id={`${formId}-email`}
                  type="email"
                  autoComplete="email"
                  placeholder="you@institution.rw"
                  errorMessage={errors.email?.message}
                />
              )}
            />
          </fieldset>

          <Button
            type="submit"
            className="w-full rounded-md"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Send reset link
          </Button>

          <p className="text-center text-[13px]">
            <Link
              to="/auth/login"
              className="font-normal text-primary hover:underline underline-offset-2"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

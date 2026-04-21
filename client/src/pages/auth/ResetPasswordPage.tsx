import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useResetPassword } from "@/features/auth/hooks";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const formId = useId();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, isLoading } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!token) return;
    await resetPassword({ token, password: data.password });
  });

  if (!token) {
    return (
      <AuthLayout>
        <header className="mb-8 space-y-2 text-left">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            Invalid reset link
          </h2>
          <p className="text-muted-foreground">
            This password reset link is missing a token. Please request a new one.
          </p>
        </header>
        <Link
          to="/auth/forgot-password"
          className="text-primary hover:underline underline-offset-2"
        >
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2 text-left">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary">
          Choose a new password
        </h2>
        <p className="text-muted-foreground">
          Pick something you haven&apos;t used on this portal before.
        </p>
      </header>

      <form className="w-full space-y-6" onSubmit={onSubmit} noValidate>
        <fieldset className="flex flex-col gap-5 border-0 p-0" disabled={isLoading}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                required
                {...field}
                id={`${formId}-password`}
                label="New password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                suffixIcon={showPassword ? faEyeSlash : faEye}
                suffixIconHandler={(e) => {
                  e.preventDefault();
                  setShowPassword((s) => !s);
                }}
                placeholder="At least 8 characters, upper, lower, digit"
                errorMessage={errors.password?.message}
                className="pr-11"
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                required
                {...field}
                id={`${formId}-confirm`}
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                errorMessage={errors.confirmPassword?.message}
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
          Update password
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
    </AuthLayout>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useLogin } from "@/features/auth/hooks";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Enter your password")
    .min(6, "Use at least 6 characters"),
  keepSignedIn: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const linkTextClass =
  "font-normal text-[13px] normal-case tracking-normal text-primary hover:underline underline-offset-2 hover:text-primary/80";

export function LoginPage() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const keepId = `${formId}-keep`;

  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await login({
      email: data.email,
      password: data.password,
      keepSignedIn: data.keepSignedIn,
    });
  });

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2 text-left">
        <h2 className="heading-auth">
          Welcome back
        </h2>
        <p className="text-muted-foreground">
          Sign in to your researcher account
        </p>
      </header>

      <form className="w-full space-y-6" onSubmit={onSubmit} noValidate>
        <fieldset
          className="flex flex-col gap-5 border-0 p-0"
          disabled={isLoading}
        >
          <legend className="sr-only">Sign-in credentials</legend>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                required
                label="Email address"
                errorMessage={errors.email?.message}
                {...field}
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder="you@institution.rw"
                aria-describedby={errors.email ? `${emailId}-error` : undefined}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={passwordId}
                label="Password"
                required
                type={showPassword ? "text" : "password"}
                suffixIconHandler={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                suffixIcon={showPassword ? faEyeSlash : faEye}
                autoComplete="current-password"
                placeholder="********"
                errorMessage={errors.password?.message}
                aria-describedby={
                  errors.password ? `${passwordId}-error` : undefined
                }
                className="pr-11"
              />
            )}
          />

          <ul className="flex items-center gap-2 justify-between">
            <Controller
              name="keepSignedIn"
              control={control}
              render={({ field: { value, onChange, onBlur, name, ref } }) => (
                <Input
                  label="Keep me signed in for 30 days"
                  ref={ref}
                  id={keepId}
                  name={name}
                  type="checkbox"
                  checked={value}
                  onBlur={onBlur}
                  onChange={(e) => onChange(e.target.checked)}
                  className="size-3 rounded border-input accent-primary"
                />
              )}
            />
            <Link
              to="/auth/forgot-password"
              className="text-[12px] text-primary hover:underline underline-offset-2 hover:text-primary"
            >
              Forgot password?
            </Link>
          </ul>
        </fieldset>

        <Button
          type="submit"
          className="w-full rounded-md"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign in to RNEC Portal
        </Button>

        <header className="text-center text-[13px]">
          New researcher?{" "}
          <Link to="/auth/register" className={cn(linkTextClass)}>
            Create an account
          </Link>
        </header>
      </form>
    </AuthLayout>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useRegister } from "@/features/auth/hooks";

const registerSchema = z.object({
  firstName: z.string().min(1, "Enter your first name").max(100),
  surname: z.string().min(1, "Enter your surname").max(100),
  email: z
    .string()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  institutionalAffiliation: z.string().max(255).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/\d/, "Include a digit"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      email: "",
      institutionalAffiliation: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await registerUser({
      firstName: data.firstName,
      surname: data.surname,
      email: data.email,
      password: data.password,
      institutionalAffiliation: data.institutionalAffiliation || undefined,
    });
  });

  return (
    <AuthLayout>
      <header className="mb-8 space-y-2 text-left">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary">
          Create your account
        </h2>
        <p className="text-muted-foreground">
          Register as an applicant to submit research protocols.
        </p>
      </header>

      <form className="w-full space-y-5" onSubmit={onSubmit} noValidate>
        <fieldset className="flex flex-col gap-4 border-0 p-0" disabled={isLoading}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  required
                  label="First name"
                  {...field}
                  id={`${formId}-first`}
                  autoComplete="given-name"
                  placeholder="Amina"
                  errorMessage={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="surname"
              control={control}
              render={({ field }) => (
                <Input
                  required
                  label="Surname"
                  {...field}
                  id={`${formId}-last`}
                  autoComplete="family-name"
                  placeholder="Uwase"
                  errorMessage={errors.surname?.message}
                />
              )}
            />
          </div>

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

          <Controller
            name="institutionalAffiliation"
            control={control}
            render={({ field }) => (
              <Input
                label="Institution (optional)"
                {...field}
                id={`${formId}-inst`}
                autoComplete="organization"
                placeholder="University of Rwanda"
                errorMessage={errors.institutionalAffiliation?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                required
                {...field}
                id={`${formId}-password`}
                label="Password"
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
        </fieldset>

        <Button
          type="submit"
          className="w-full rounded-md"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create account
        </Button>

        <p className="text-center text-[13px]">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-normal text-[12px] text-primary hover:underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

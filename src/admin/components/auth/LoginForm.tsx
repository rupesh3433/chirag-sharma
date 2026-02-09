import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@shared/components/ui/button";
import { Label } from "@shared/components/ui/label";
import { Input } from "@shared/components/ui/input";
import { useAuth } from "@/admin/hooks/useAuth";

/* =======================
   Schema
======================= */

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/* =======================
   Component
======================= */

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Signing in...");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /* =======================
     Submit
  ======================= */

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoadingMessage("Signing in...");

    const timers = [
      setTimeout(() => setLoadingMessage("Connecting to server..."), 5000),
      setTimeout(() => setLoadingMessage("Verifying credentials..."), 15000),
      setTimeout(() => setLoadingMessage("Almost there..."), 30000),
      setTimeout(
        () => setLoadingMessage("Please wait, server is responding..."),
        45000
      ),
    ];

    try {
      await login(data.email, data.password);

      timers.forEach(clearTimeout);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      timers.forEach(clearTimeout);

      toast({
        title: "Login failed",
        description:
          error?.message ||
          error?.response?.data?.message ||
          "Invalid email or password. Please try again.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("Signing in...");
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-rose mb-4">
            <Sparkles className="h-8 w-8 text-white stroke-white" />
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            JinniChirag
          </h1>
          <p className="text-muted-foreground mt-2">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card-hover p-8 animate-slide-up border border-border/50">
          <h2 className="font-display text-xl font-semibold text-center mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                disabled={isLoading}
                className="h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  disabled={isLoading}
                  className="h-11 pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-2 space-y-2 bg-muted/50 rounded-lg px-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse font-medium">
                    {loadingMessage}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This may take up to a minute. Please don't close this page.
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 gradient-primary shadow-rose text-white [&_svg]:text-white [&_svg]:stroke-white hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-foreground hover:text-destructive hover:underline transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 JinniChirag Makeup Artist
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

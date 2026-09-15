import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import { requestPasswordReset } from "../api/authApi";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-7">
        <h1 className="text-2xl font-bold text-foreground sm:text-[26px] md:text-3xl">
          Forgot Password?
        </h1>
        <p className="mt-2 text-xs text-muted sm:text-sm md:text-base">
          Enter your registered admin email address and we'll send you a link to reset your password.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="rounded-lg bg-success/10 p-4 text-center border border-success/20">
            <p className="text-sm font-semibold text-success">Reset link sent successfully.</p>
            <p className="mt-2 text-xs text-success/80">Please check your email to reset your password.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {error && (
            <div className="text-center text-xs font-medium text-danger">{error}</div>
          )}
          
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold text-foreground sm:text-sm">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail size={18} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted sm:left-4 sm:h-5 sm:w-5" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-12 sm:pl-11 sm:pr-4 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:h-12 sm:text-sm disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted hover:text-foreground sm:text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgetPassword;

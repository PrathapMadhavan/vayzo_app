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

  const inputBase =
    "h-10 w-full rounded-lg border border-border bg-background text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <AuthLayout>
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-foreground">Forgot Password?</h1>
        <p className="mt-1 text-xs text-muted">
          Enter your registered admin email and we'll send a reset link.
        </p>
      </div>

      {success ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-success/20 bg-success/8 p-4 text-center">
            <p className="text-sm font-semibold text-success">Reset link sent successfully.</p>
            <p className="mt-1 text-xs text-success/80">Please check your email to reset your password.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-center text-xs font-medium text-danger">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-foreground">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail
                size={15}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="email"
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputBase} pl-9 pr-3`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgetPassword;
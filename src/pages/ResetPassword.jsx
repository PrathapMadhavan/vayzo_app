import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import { resetPassword } from "../api/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token") || "mock-token";

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      alert("Password reset successfully! Please login with your new password.");
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center sm:mb-7">
        <h1 className="text-2xl font-bold text-foreground sm:text-[26px] md:text-3xl">
          Reset Password
        </h1>
        <p className="mt-2 text-xs text-muted sm:text-sm md:text-base">
          Enter your new secure password
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="text-center text-xs font-medium text-danger">{error}</div>
        )}

        <div>
          <label htmlFor="newPassword" className="mb-2 block text-xs font-semibold text-foreground sm:text-sm">
            New Password
          </label>
          <div className="relative">
            <LockKeyhole size={18} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted sm:left-4 sm:h-5 sm:w-5" />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-11 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-12 sm:pl-11 sm:pr-12 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted transition hover:text-primary sm:right-3"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold text-foreground sm:text-sm">
            Confirm Password
          </label>
          <div className="relative">
            <LockKeyhole size={18} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted sm:left-4 sm:h-5 sm:w-5" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-11 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-12 sm:pl-11 sm:pr-12 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted transition hover:text-primary sm:right-3"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover sm:h-12 sm:text-sm disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

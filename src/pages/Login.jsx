import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import { login } from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On mount: restore remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("vayzo_remember_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        // Remember Me logic
        if (rememberMe) {
          localStorage.setItem("vayzo_remember_email", email);
        } else {
          localStorage.removeItem("vayzo_remember_email");
        }
        localStorage.setItem("vayzo_admin_logged_in", "true");
        localStorage.setItem("vayzo_admin_token", response.data?.accessToken || response.token || "vayzo_admin_mock_token");
        localStorage.setItem("vayzo_admin_user", JSON.stringify(response.data?.user || response.user || {}));
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "h-10 w-full rounded-lg border border-border bg-background text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-foreground">Welcome Back!</h1>
        <p className="mt-1 text-xs text-muted">
          Sign in to your VAYZO admin account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger/8 px-3 py-2 text-center text-xs font-medium text-danger border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Email Address
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
              autoComplete="username"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputBase} pl-9 pr-3`}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={15}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputBase} pl-9 pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Forgot Password — muted default, primary when email entered */}
          <div className="mt-1.5 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgetpassword")}
              className={`text-[11px] font-semibold transition hover:underline ${
                email ? "text-primary" : "text-muted"
              }`}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border accent-primary"
            />
            Remember me
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* OTP Button — muted by default (border/text muted), no blue until active */}
        <button
          type="button"
          onClick={() => navigate("/otp")}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
        >
          <ShieldCheck size={15} />
          Login with OTP
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;

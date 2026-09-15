import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Phone, ArrowLeft } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import { requestLoginOtp, verifyLoginOtp } from "../api/authApi";

const OtpVerification = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Mobile, 2 = Verify
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      await requestLoginOtp(mobileNumber);
      setStep(2);
      setTimer(30);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyLoginOtp(mobileNumber, otp);

      // Successful Login
      localStorage.setItem("vayzo_admin_logged_in", "true");
      localStorage.setItem("vayzo_admin_token", res.data.accessToken);
      localStorage.setItem("vayzo_admin_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      setTimer(30);
      await requestLoginOtp(mobileNumber);
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  const inputBase =
    "h-10 w-full rounded-lg border border-border bg-background text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <AuthLayout>
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-foreground">Login with OTP</h1>
        <p className="mt-1 text-xs text-muted">
          {step === 1
            ? "Enter your registered admin mobile number"
            : `OTP sent to ${mobileNumber}. Enter it below.`}
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-center text-xs font-medium text-danger">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <div>
            <label
              htmlFor="mobile"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Mobile Number
            </label>
            <div className="relative">
              <Phone
                size={15}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                required
                className={`${inputBase} pl-9 pr-3`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || mobileNumber.length < 10}
            className="h-10 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Enter OTP
            </label>
            <div className="relative">
              <ShieldCheck
                size={15}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className={`${inputBase} pl-9 pr-3 tracking-[0.3em]`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="h-10 w-full rounded-lg bg-primary text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-muted">Resend OTP in {timer}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Change Mobile Number
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default OtpVerification;

import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const DEMO_VALID_ACCOUNT = { email: "analyst@gmail.com", password: "Secure123" };
const DEMO_UNACTIVATED_ACCOUNT = { email: "pending@gmail.com", password: "Secure123" };

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const isValidEmailFormat = (value) => /^[^\s@]+@gmail\.com$/i.test(value.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmailFormat(trimmedEmail)) {
      setNotification({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    if (password.length < 8) {
      setNotification({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    if (trimmedEmail === DEMO_UNACTIVATED_ACCOUNT.email && password === DEMO_UNACTIVATED_ACCOUNT.password) {
      setNotification({
        type: "warning",
        message: "Your account is not activated yet. Please check your email for the activation link.",
      });
      return;
    }

    if (trimmedEmail !== DEMO_VALID_ACCOUNT.email || password !== DEMO_VALID_ACCOUNT.password) {
      setNotification({ type: "error", message: "Incorrect email or password. Please try again." });
      return;
    }

    localStorage.setItem("sentrix_user", trimmedEmail);
    setNotification({ type: "success", message: "Login successful. Redirecting..." });
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center mb-8 z-10">
        <img src={logo} alt="SentriX logo" className="w-16 h-16 mb-3" />
        <span className="text-3xl font-bold">
          Sentri<span className="text-emerald-400">X</span>
        </span>
      </div>

      {notification && (
        <div
          className={`z-20 w-full max-w-sm mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : notification.type === "warning"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="z-10 w-full max-w-sm bg-[#0c1220] border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold mb-6 text-center">Welcome</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <div className="flex items-center bg-[#070b16] border border-white/10 rounded-lg px-3">
              <Mail size={16} className="text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none px-2 py-2.5 text-sm placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <div className="flex items-center bg-[#070b16] border border-white/10 rounded-lg px-3">
              <Lock size={16} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none px-2 py-2.5 text-sm placeholder:text-gray-600"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-600 mt-8 z-10">© 2026 SentriX. All rights reserved.</p>
    </div>
  );
}
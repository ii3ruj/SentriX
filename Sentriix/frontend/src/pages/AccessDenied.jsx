import { X, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center mb-8 z-10">
        <img src={logo} alt="SentriX logo" className="w-16 h-16 mb-3" />
        <span className="text-3xl font-bold">
          Sentri<span className="text-emerald-400">X</span>
        </span>
        <p className="text-gray-400 text-sm mt-2 text-center">
          AI-Powered Threat Investigation &amp; Incident Response Platform
        </p>
      </div>

      <div className="z-10 relative w-full max-w-sm bg-[#0c1220] border border-emerald-500/20 rounded-2xl p-8 shadow-2xl text-center">
        <button onClick={() => navigate("/login")} className="absolute top-4 left-4 text-gray-500 hover:text-gray-300" aria-label="Close">
          <X size={18} />
        </button>

        <div className="flex justify-center mb-4">
          <ShieldX size={56} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold mb-4">Access Denied</h1>
        <p className="text-sm text-gray-400 mb-2">
          You are not authorized to access this system. This platform is restricted to the Cybersecurity Department.
        </p>
        <p className="text-sm text-gray-400">
          If you believe this is a mistake, please contact your system administrator.
        </p>
      </div>

      <p className="text-xs text-gray-600 mt-8 z-10">© 2026 SentriX. All rights reserved.</p>
    </div>
  );
}
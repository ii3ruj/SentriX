import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Siren,
  Sparkles,
  Gauge,
  ListChecks,
  Archive,
  Users,
  ChevronDown,
  LogOut,
} from "lucide-react";

import logo from "../assets/logo.png";

export default function Sidebar() {
  const navigate = useNavigate();

  const [recommendationsOpen, setRecommendationsOpen] =
    useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Incidents",
      path: "/incidents",
      icon: Siren,
    },

    {
      label: "AI Analysis",
      path: "/ai-analysis",
      icon: Sparkles,
    },

    {
      label: "CRSI Assessment",
      path: "/crsi-assessment",
      icon: Gauge,
    },

    {
      label: "Archive",
      path: "/archive",
      icon: Archive,
    },

    {
      label: "Team Connection",
      path: "/team-connection",
      icon: Users,
    },
  ];

  const handleLogout = () => {
    // كان يحذف مفتاحاً غير المستخدم في الحماية، فتبقى الجلسة فعّالة بعد الخروج
    localStorage.removeItem("token");
    localStorage.removeItem("sentrix_user");
    navigate("/login");
  };

  const navClass = ({ isActive }) => {
    return `
      flex items-center gap-3
      px-4 py-3
      rounded-xl
      text-sm
      transition-all
      duration-200
      ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-gray-300 hover:text-white hover:bg-white/[0.03]"
      }
    `;
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0a101d] border-r border-white/10 flex flex-col shrink-0">

      {/* LOGO */}

      <div className="px-5 py-6 border-b border-white/10">

        <div className="flex items-center gap-3">

          <img
            src={logo}
            alt="SentriX"
            className="w-10 h-10 object-contain"
          />

          <div>

            <h1 className="text-xl font-bold text-white">

              Sentri
              <span className="text-emerald-400">
                X
              </span>

            </h1>

            <p className="text-[10px] text-gray-500 mt-1">

              AI-Powered Threat Investigation
              <br />
              & Incident Response Platform

            </p>

          </div>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="flex-1 px-3 py-5">

        <div className="space-y-1">

          {/* MAIN ITEMS */}

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={navClass}
              >

                <Icon
                  size={20}
                  strokeWidth={1.8}
                />

                <span>
                  {item.label}
                </span>

              </NavLink>
            );

          })}


          {/* RECOMMENDATIONS */}

          <div>

            <button
              onClick={() =>
                setRecommendationsOpen(
                  (prev) => !prev
                )
              }
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.03] transition"
            >

              <div className="flex items-center gap-3">

                <ListChecks
                  size={20}
                  strokeWidth={1.8}
                />

                <span>
                  Recommendations
                </span>

              </div>


              <ChevronDown
                size={16}
                className={`transition-transform ${
                  recommendationsOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>


            {/* DROPDOWN */}

            {recommendationsOpen && (

              <div className="ml-8 mt-1 space-y-1">

                {/* AI Risk Score */}

                <NavLink
                  to="/recommendations"
                  className={({ isActive }) => `
                    block px-3 py-2 rounded-lg text-xs transition
                    ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-gray-500 hover:text-gray-300"
                    }
                  `}
                >

                  AI Risk Score

                </NavLink>


                {/* CRSI Recommendations */}

                <NavLink
                  to="/crsi-recommendations"
                  className={({ isActive }) => `
                    block px-3 py-2 rounded-lg text-xs transition
                    ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-gray-500 hover:text-gray-300"
                    }
                  `}
                >

                  CRSI Recommendations

                </NavLink>

              </div>

            )}

          </div>

        </div>

      </nav>


      {/* LOGOUT */}

      <div className="p-4 border-t border-white/10">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition"
        >

          <LogOut size={19} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

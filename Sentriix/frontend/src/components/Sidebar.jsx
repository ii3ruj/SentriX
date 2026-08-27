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
  Menu,
  X,
} from "lucide-react";

import logo from "../assets/logo.png";


export default function Sidebar() {

  const navigate = useNavigate();

  const [
    recommendationsOpen,
    setRecommendationsOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  /* =========================================================
     NAVIGATION ITEMS
  ========================================================= */

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


  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {

    localStorage.removeItem(
      "sentrix_user"
    );

    setMobileOpen(false);

    navigate("/login");
  };


  /* =========================================================
     NAVIGATION STYLE
  ========================================================= */

  const navClass = ({
    isActive,
  }) => {

    return `
      flex
      items-center
      gap-3

      w-full

      px-4
      py-3

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


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      {/* =====================================================
          MOBILE TOP BAR
          Mobile + Tablet only
      ===================================================== */}

      <header
        className="
          sentrix-mobile-bar

          lg:hidden
        "
      >

        {/* MENU */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="
            sentrix-mobile-menu-button
          "
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >

          <Menu
            size={23}
          />

        </button>


        {/* BRAND */}

        <div
          className="
            sentrix-mobile-brand
          "
        >

          <img
            src={logo}
            alt="SentriX"
            className="
              sentrix-mobile-logo
            "
          />

          <span
            className="
              text-lg
              font-bold
              text-white
            "
          >
            Sentri
            <span
              className="
                text-emerald-400
              "
            >
              X
            </span>
          </span>

        </div>


        {/* BALANCER */}

        <div
          className="
            w-10
            h-10
          "
        />

      </header>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (

        <button
          type="button"
          aria-label="Close navigation menu"
          className="
            sentrix-mobile-overlay
          "
          onClick={
            closeMobileSidebar
          }
        />

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          sentrix-sidebar

          flex
          flex-col
          shrink-0

          ${
            mobileOpen
              ? "mobile-open"
              : ""
          }
        `}
      >

        {/* ===================================================
            LOGO HEADER
        =================================================== */}

        <div
          className="
            px-5
            py-6

            border-b
            border-white/10

            shrink-0
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* LOGO */}

            <img
              src={logo}
              alt="SentriX"
              className="
                w-10
                h-10

                object-contain

                shrink-0
              "
            />


            {/* TITLE */}

            <div
              className="
                min-w-0
                flex-1
              "
            >

              <h1
                className="
                  text-xl
                  font-bold
                  text-white

                  leading-tight
                "
              >

                Sentri

                <span
                  className="
                    text-emerald-400
                  "
                >
                  X
                </span>

              </h1>


              <p
                className="
                  text-[10px]
                  text-gray-500

                  mt-1

                  leading-relaxed
                "
              >

                AI-Powered Threat Investigation
                <br />

                &amp; Incident Response Platform

              </p>

            </div>


            {/* MOBILE CLOSE */}

            <button
              type="button"
              onClick={
                closeMobileSidebar
              }
              className="
                sentrix-mobile-close
              "
              aria-label="Close navigation menu"
            >

              <X
                size={20}
              />

            </button>

          </div>

        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="
            flex-1

            px-3
            py-5

            overflow-y-auto
            overflow-x-hidden

            min-h-0
          "
        >

          <div
            className="
              space-y-1
            "
          >

            {/* =================================================
                MAIN ITEMS
            ================================================= */}

            {navItems.map(
              (item) => {

                const Icon =
                  item.icon;

                return (

                  <NavLink
                    key={
                      item.path
                    }

                    to={
                      item.path
                    }

                    onClick={
                      closeMobileSidebar
                    }

                    className={
                      navClass
                    }
                  >

                    <Icon
                      size={20}
                      strokeWidth={1.8}

                      className="
                        shrink-0
                      "
                    />

                    <span
                      className="
                        truncate
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                  </NavLink>

                );
              }
            )}


            {/* =================================================
                RECOMMENDATIONS
            ================================================= */}

            <div>

              <button
                type="button"

                onClick={() =>
                  setRecommendationsOpen(
                    (prev) =>
                      !prev
                  )
                }

                className="
                  w-full

                  flex
                  items-center
                  justify-between
                  gap-3

                  px-4
                  py-3

                  rounded-xl

                  text-sm
                  text-gray-300

                  hover:text-white
                  hover:bg-white/[0.03]

                  transition
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3

                    min-w-0
                  "
                >

                  <ListChecks
                    size={20}
                    strokeWidth={1.8}

                    className="
                      shrink-0
                    "
                  />

                  <span
                    className="
                      truncate
                    "
                  >
                    Recommendations
                  </span>

                </div>


                <ChevronDown
                  size={16}

                  className={`
                    shrink-0

                    transition-transform
                    duration-200

                    ${
                      recommendationsOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />

              </button>


              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {recommendationsOpen && (

                <div
                  className="
                    ml-8
                    mt-1

                    space-y-1

                    border-l
                    border-white/10

                    pl-2
                  "
                >

                  <NavLink
                    to="/recommendations"

                    onClick={
                      closeMobileSidebar
                    }

                    className={({
                      isActive,
                    }) => `
                      block

                      px-3
                      py-2

                      rounded-lg

                      text-xs

                      transition

                      ${
                        isActive
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                      }
                    `}
                  >

                    AI Risk Score

                  </NavLink>


                  <NavLink
                    to="/crsi-recommendations"

                    onClick={
                      closeMobileSidebar
                    }

                    className={({
                      isActive,
                    }) => `
                      block

                      px-3
                      py-2

                      rounded-lg

                      text-xs

                      transition

                      ${
                        isActive
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
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


        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div
          className="
            p-4

            border-t
            border-white/10

            shrink-0
          "
        >

          <button
            type="button"

            onClick={
              handleLogout
            }

            className="
              w-full

              flex
              items-center
              gap-3

              px-4
              py-3

              rounded-xl

              text-sm
              text-gray-400

              hover:text-red-400
              hover:bg-red-500/5

              transition
            "
          >

            <LogOut
              size={19}

              className="
                shrink-0
              "
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

    </>
  );
}
import { Link, NavLink } from "react-router-dom";
import { navigationItems } from "../../constants/navigation";
import vayzoLogo from "../../assets/logo/Vayzo_logo.png";
import { useEffect, useState } from "react";
import { PanelLeftClose, X } from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 bg-foreground",
          "flex h-screen shrink-0 flex-col",
          "transition-transform duration-500 ease-in-out lg:transition-[width,transform] lg:duration-300",
          "lg:sticky lg:top-0 lg:translate-x-0",
          isCollapsed ? "w-16" : "w-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div
          className={[
            "flex h-20 shrink-0 items-center ",
            isCollapsed ? "justify-center" : "gap-1",
          ].join(" ")}
        >
          <Link to="/dashboard" onClick={onClose}>
            <img
              src={vayzoLogo}
              alt="Vayzo"
              className={[
                "h-auto transition-all duration-300",
                isCollapsed ? "w-30" : "w-50 ",
              ].join(" ")}
            />
          </Link>

          {/* Mobile Close */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md  text-white/60  hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X size={25} strokeWidth={1.8} />
            </button>
          )}
        </div>
        {/* Navigation */}
        <nav
          className={[
            "min-h-0 flex-1 py-3 overflow-y-auto",
            isCollapsed ? "scrollbar-none" : "sidebar-scroll",
          ].join(" ")}
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  "mb-1 flex h-9 w-full items-center rounded-md",
                  "text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center" : "",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <span
                style={{
                  marginLeft: isCollapsed ? "0px" : "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {item.icon && (
                  <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
                )}

                <span
                  className={[
                    "overflow-hidden whitespace-nowrap transition-all duration-200",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Collapsed View - Desktop */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "hidden h-12 shrink-0 items-center border-t border-white/10",
            "text-sm text-white/60 hover:text-white lg:flex",
            isCollapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <span
            style={{
              marginLeft: isCollapsed ? "0px" : "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <PanelLeftClose
              size={18}
              strokeWidth={1.8}
              className={[
                "shrink-0 transition-transform duration-300",
                isCollapsed ? "rotate-180" : "",
              ].join(" ")}
            />

            {!isCollapsed && (
              <span className="whitespace-nowrap">Collapsed View</span>
            )}
          </span>
        </button>
      </aside>
    </>
  );
}



export default Sidebar;

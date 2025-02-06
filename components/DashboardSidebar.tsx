import React, { useState } from "react";
import { BarChart2, FileText, ChevronRight, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  role: string;
  phoneNumber: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, phoneNumber }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: BarChart2, label: "Overview", href: "/dashboard" },
    { icon: FileText, label: "Reports", href: "/reports" },
    // { icon: Users, label: "Teams", href: "/teams" },
    // { icon: Activity, label: "Analytics", href: "/analytics" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed h-auto inset-0 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative lg:flex flex-col w-72 bg-white dark:bg-neutral-900 border-r border-gray-300 dark:border-neutral-800 min-h-screen z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-neutral-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Main Menu
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${
                  isActive(item.href)
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.href)
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span>{item.label}</span>
                <ChevronRight
                  className={`w-4 h-4 ml-auto transition-all ${
                    isActive(item.href)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-300 dark:border-neutral-800">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                Admin User
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {phoneNumber}
              </p>
            </div>
          </button>
        </div>
      </aside>

      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 p-3 rounded-full bg-green-500 text-white shadow-lg z-40"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default Sidebar;

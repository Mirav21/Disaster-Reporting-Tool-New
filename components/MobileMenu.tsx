import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}: MobileMenuProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const signOut = async () => {
    const session = localStorage.getItem("token");
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/logout`,
      { token: session }
    );
    if (response.status === 200) {
      localStorage.clear();
    }
    router.push("/auth/signin");
  };

  const themes = [
    { name: "light", icon: Sun, label: "Light Mode" },
    { name: "dark", icon: Moon, label: "Dark Mode" },
    { name: "system", icon: Monitor, label: "System Mode" },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />

      {/* Menu content */}
      <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-zinc-900 p-6 shadow-xl">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col space-y-4">
            {/* Navigation Links */}
            {(() => {
              const username = localStorage.getItem("username")?.toLowerCase();
              return username === "admin" || username === "moderator" ? (
                <Link
                  href="/dashboard"
                  className="text-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  onClick={onClose}
                >
                  Dashboard
                </Link>
              ) : null;
            })()}
            <Link
              href="/submit-report"
              className="text-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              onClick={onClose}
            >
              Submit Report
            </Link>
            <Link
              href="/track-report"
              className="text-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              onClick={onClose}
            >
              Track Report
            </Link>
            <Link
              href="/howitworks"
              className="text-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              onClick={onClose}
            >
              How It Works
            </Link>

            {/* Theme Options */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-md font-medium text-zinc-900 dark:text-white mb-3">
                Theme
              </p>
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <button
                    key={themeOption.name}
                    onClick={() => onThemeChange(themeOption.name)}
                    className={`flex items-center w-full px-2 py-2 text-md rounded-lg transition-colors ${
                      theme === themeOption.name
                        ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {themeOption.label}
                  </button>
                );
              })}
            </div>

            {/* Authentication */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {localStorage.getItem("token") ? (
                <button
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                  className="text-md text-left w-full px-2 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  onClick={onClose}
                >
                  Login / SignUp
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

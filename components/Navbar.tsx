"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import axios from "axios";
import { useRouter } from "next/navigation";
import DhruvaImage from "./DhruvaImage";

import { Sun, Moon, Monitor } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

interface CustomJwtPayload {
  exp: number;
  sub: string;
  role: string;
}

const ThemeSwitcher = ({ currentTheme, onThemeChange }: ThemeSwitcherProps) => {
  const themes = [
    { name: "light", icon: Sun },
    { name: "dark", icon: Moon },
    { name: "system", icon: Monitor },
  ];

  const currentThemeData = themes.find((theme) => theme.name === currentTheme);

  const getNextTheme = () => {
    const currentIndex = themes.findIndex(
      (theme) => theme.name === currentTheme
    );
    return themes[(currentIndex + 1) % themes.length].name;
  };

  return (
    currentThemeData && (
      <button
        onClick={() => onThemeChange(getNextTheme())}
        className="relative p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-white/20"
        title={`${
          currentThemeData.name.charAt(0).toUpperCase() +
          currentThemeData.name.slice(1)
        } mode`}
      >
        <currentThemeData.icon className="w-5 h-5" />
      </button>
    )
  );
};

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<string>("system");
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // This ensures that the code runs only on the client side after hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        if (decodedToken) {
          const role = decodedToken.role.toLowerCase();
          setRole(role);
        }
      } else {
        setRole(null);
      }
    };

    const intervalId = setInterval(getRole, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (savedTheme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!isClient) return;

    // Save theme to localStorage whenever it changes
    localStorage.setItem("theme", theme);

    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isClient]);

  // Handle system theme changes
  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        if (mediaQuery.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, isClient]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (decodedToken) {
        const role = decodedToken.role.toLowerCase();
        setRole(role);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  useEffect(() => {
    const checkSession = () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        if (storedToken && storedToken !== session) {
          setSession(storedToken);
          setIsAuthenticated(true);
        } else if (!storedToken && session !== null) {
          setSession(null);
        }
      }
    };

    checkSession();

    window.addEventListener("storage", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
    };
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setSession(token);
      setIsAuthenticated(true);
    }
  }, [session, isAuthenticated]);

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/logout`,
        { token: session }
      );
      if (response.status === 200) {
        const Theme = localStorage.getItem("theme");
        localStorage.clear();
        localStorage.setItem("theme", Theme as string);
        setSession(null);
        setIsMobileMenuOpen(false);
        setIsAuthenticated(false);
        router.push("/auth/signin");
      }
    } catch (error) {
      console.log("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isTokenExpired = (accessToken: string) => {
    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error(error);
      return true;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      if (session) {
        if (isTokenExpired(session)) {
          await signOut();
        }
      }
    };

    const intervalId = setInterval(checkToken, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full border-b border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center">
                  <DhruvaImage />
                </div>
                <span className="hidden md:block lg:block md:text-2xl lg:text-2xl font-semibold text-zinc-900 dark:text-white">
                  DhruvaSetu
                </span>
              </Link>
            </div>
            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/submit-report"
                className="text-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Submit Report
              </Link>
              <Link
                href="/track-report"
                className="text-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Track Report
              </Link>
              <Link
                href="/howitworks"
                className="text-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </div>
            <div className="flex items-center space-x-4 md:space-x-4 lg:space-x-4">
              <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-4">
                {isClient && (
                  <div className="flex items-center space-x-3 md:space-x-1 lg:space-x-1">
                    {role === null ? (
                      <>
                        <Link
                          href="/auth/signin"
                          className="h-10 rounded-full flex items-center text-lg justify-center hover:text-gray-400 transition-colors"
                          title="Login"
                        >
                          Login
                        </Link>
                        <span className="hidden md:block lg:block text-3xl text-gray-500">
                          /
                        </span>{" "}
                        {/* Slash separator */}
                        <Link
                          href="/auth/signup"
                          className="h-10 rounded-full hidden md:flex lg:flex items-center text-lg justify-center hover:text-gray-400 transition-colors"
                          title="Sign Up"
                        >
                          Sign Up
                        </Link>
                      </>
                    ) : (
                      <span>Welcome!</span>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Switcher */}
              <div className="block">
                {isClient && (
                  <ThemeSwitcher
                    currentTheme={theme}
                    onThemeChange={handleThemeChange}
                  />
                )}
              </div>

              {/* Profile Button and Dropdown */}
              {role && (
                <div
                  ref={profileRef}
                  className="md:relative lg:relative hidden md:block"
                >
                  <button
                    onClick={handleProfileToggle}
                    className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Profile"
                  >
                    <svg
                      className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-zinc-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      {!localStorage.getItem("token") ? (
                        <>
                          <Link
                            href="/auth/signin"
                            className="block px-4 py-2 text-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            Login
                          </Link>
                          <Link
                            href="/auth/signup"
                            className="block px-4 py-2 text-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            Sign Up
                          </Link>
                        </>
                      ) : (
                        <>
                          {(() => {
                            return role === "admin" || role === "moderator" ? (
                              <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                Dashboard
                              </Link>
                            ) : null;
                          })()}
                          {(() => {
                            return role === "vendor" ? (
                              <Link
                                href="/vendor"
                                className="block px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                Dashboard
                              </Link>
                            ) : null;
                          })()}
                          <button
                            onClick={signOut}
                            disabled={isSigningOut}
                            className="block w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed items-center space-x-2"
                          >
                            <span className="flex items-center justify-between w-full">
                              <span>
                                {isSigningOut ? "Signing Out..." : "Sign Out"}
                              </span>
                              {isSigningOut && (
                                <div className="w-4 h-4 border-2 border-zinc-400 dark:bg-zinc-400 border-t-transparent rounded-full animate-spin ml-2" />
                              )}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                onClick={handleMenuToggle}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </>
  );
}

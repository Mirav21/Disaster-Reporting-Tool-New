"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        if (storedToken && storedToken !== session) {
          setSession(storedToken);
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
      const decodedToken = jwtDecode(token);
      if (decodedToken?.sub) {
        localStorage.setItem("username", decodedToken.sub);
      }
    }
  }, []);

  const signOut = async () => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/logout`,
      { token: session }
    );
    if (response.status === 200) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setSession(null);
    }
    setIsProfileOpen(false);
    router.push("/auth/signin");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full border-b border-white/5 bg-black/90 backdrop-blur-xl z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">
                  Crisis Connect
                </span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {session ? (
                <>
                  <Link
                    href="/submit-report"
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Submit Report
                  </Link>
                  <Link
                    href="/track-report"
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Track Report
                  </Link>
                  <Link
                    href="/weather-report"
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Live Weather
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Login/SignUp
                </Link>
              )}
              <Link
                href="/howitworks"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </div>

            {/* Emergency Button */}
            <div className="flex items-center space-x-4">
              <button className="group flex h-11 items-center gap-2 rounded-full bg-red-500/10 pl-4 pr-5 text-sm font-medium text-red-500 ring-1 ring-inset ring-red-500/20 transition-all hover:bg-red-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Emergency: 911
              </button>

              {/* Profile Button and Dropdown */}
              <div
                ref={profileRef}
                className="md:relative lg:relative hidden md:block"
              >
                <button
                  onClick={handleProfileToggle}
                  className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-zinc-400"
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
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-zinc-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {!session ? (
                      <>
                        <Link
                          href="/auth/signin"
                          className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
                        >
                          Sign Up
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/users/user-profile"
                          className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={signOut}
                          className="block w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-zinc-400 hover:text-white"
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
      />
    </>
  );
}

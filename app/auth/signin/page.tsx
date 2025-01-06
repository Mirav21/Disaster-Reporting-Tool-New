"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Shield, Users, Clock } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  sub: string;
  role: string;
}

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      const decodeToken = jwtDecode<CustomJwtPayload>(accessToken);
      const username = decodeToken?.sub;
      if (
        username === "admin" ||
        username === "moderator" ||
        username === "MODERATOR" ||
        username === "ADMIN"
      ) {
        router.push("/dashboard");
      } else if (username === "VENDOR" || username === "vendor") {
        router.push("/vendor");
      } else {
        router.push("/");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/login`,
        {
          username,
          password,
        }
      );
      console.log("response", response);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        setAccessToken(response.data.token);
        const token = response.data.token;
        if (token) {
          const decodedToken = jwtDecode(token);
          if (decodedToken?.sub) {
            localStorage.setItem("username", decodedToken.sub);
          }
        }

        if (localStorage.getItem("username")?.toLowerCase() === "admin") {
          router.push("/dashboard");
        } else if (
          localStorage.getItem("username")?.toLowerCase() === "moderator"
        ) {
          router.push("/dashboard");
        } else if (
          localStorage.getItem("username")?.toLowerCase() === "vendor"
        ) {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
      setError(
        "You are not authorized to access this platform or Invalid Username or Password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen -mt-16 overflow-hidden">
      {/* Left side - Information Section */}
      <div className="lg:w-1/2 bg-green-600 text-white p-8 flex-col justify-center hidden lg:flex">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Dhruva Setu</h1>
            <p className="text-lg text-green-100 mb-8">
              Join our community to access personalized resources and guidance
              tailored to your needs.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Personalized Insights</h3>
                <p className="text-green-100 text-sm">
                  Receive tailored recommendations based on your profile and
                  interests.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Secure Platform</h3>
                <p className="text-green-100 text-sm">
                  Enjoy a safe and secure environment for all your activities.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Community Engagement</h3>
                <p className="text-green-100 text-sm">
                  Connect with like-minded individuals and grow together.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">24/7 Accessibility</h3>
                <p className="text-green-100 text-sm">
                  Access the platform anytime, anywhere with reliable support.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-sm text-green-200 mt-8">
          © 2024 Our Platform
        </footer>
      </div>

      {/* Right side - Form Section */}
      <div className="flex flex-col justify-center lg:w-1/2 bg-black/90 h-screen sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-bold text-green-600 mb-2">
            Welcome Back
          </h1>
          <h2 className="text-center text-sm text-green-600">
            Sign in to access your account
          </h2>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="p-6 rounded-xl shadow-lg border border-green-500">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-green-500 mb-1"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-500 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-black hover:text-black/80 transition-all duration-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-neutral-400">
                Don&apos;t have an account?
              </span>{" "}
              <Link
                href="/auth/signup"
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

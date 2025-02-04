"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  sub: string;
  role: string;
}

export default function SignIn() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // const [role, setRole] = useState<string | null>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      console.log("Decoded Token:", decodedToken);
      if (decodedToken) {
        const role = decodedToken.role.toLowerCase();
        console.log("User Role:", role);

        if (role === "moderator") {
          router.push("/dashboard");
        } else if (role === "vendor") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    const formattedPhoneNumber = `+91${phoneNumber}`;
    console.log(formattedPhoneNumber);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/login`,
        {
          phoneNumber: formattedPhoneNumber,
        }
      );
      if (response.status === 200) {
        const token = response.data.token;
        console.log("Token before decoding:", token);
        localStorage.setItem("token", token);
        setAccessToken(token);

        setTimeout(() => {
          console.log(
            "Checking token after setting:",
            localStorage.getItem("token")
          );
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          console.log("Decoded Token:", decodedToken);
          if (decodedToken) {
            const role = decodedToken.role.toLowerCase();
            console.log("Redirecting to:", role);
            if (role === "admin" || role === "moderator") {
              router.push("/dashboard");
            } else if (role === "vendor") {
              router.push("/vendor");
            } else {
              router.push("/");
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      setError("Invalid phone number or unauthorized access.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[92.5vh] bg-white dark:bg-black/90 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-xl transform transition-all">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-500 tracking-tight">
              Welcome to DhruvaSetu
            </h1>
            <h2 className="text-base text-green-600/80 dark:text-green-500/80">
              Sign in with your phone number
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-base font-medium text-green-700 dark:text-green-400">
                Phone Number
              </label>
              <div className="flex items-center border-2 border-green-400 dark:border-green-600 rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="px-4 py-3 bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-100 font-medium text-base border-r-2 border-green-400 dark:border-green-600">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent text-green-900 dark:text-green-100 text-base focus:outline-none placeholder-green-500/60 dark:placeholder-green-400/60 w-full"
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-base font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

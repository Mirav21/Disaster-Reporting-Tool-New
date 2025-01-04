"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Shield, Users, Clock, AlertCircle } from "lucide-react";
import { LocationInput } from "@/components/submit-report/LocationInput";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  role: string;
}

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      try {
        const decodeToken = jwtDecode<CustomJwtPayload>(accessToken);
        const role = decodeToken.role;

        if (role === "USER") {
          router.push("/");
        } else if (role === "ADMIN") {
          router.push("/dashboard");
        } else if (role === "MODERATOR") {
          router.push("/moderator-dashboard");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        setAccessToken(null);
      }
    }
  }, [accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/register`,
        formData
      );

      if (response.status === 200) {
        router.push("/auth/signin");
      } else {
        setError("Failed to create account");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Something went wrong");
      } else {
        setError("Failed to sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex top-0 min-h-screen -mt-16 overflow-hidden">
      {/* Left side - Information Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-600 text-white p-8 flex-col justify-center">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              Disaster Management Platform
            </h1>
            <p className="text-lg text-green-100 mb-8">
              Join our platform to contribute to disaster preparedness and
              response efforts
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Early Warning Systems</h3>
                <p className="text-green-100 text-sm">
                  Get real-time alerts about potential disasters in your area
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Resource Management</h3>
                <p className="text-green-100 text-sm">
                  Track and manage emergency resources efficiently
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">Community Coordination</h3>
                <p className="text-green-100 text-sm">
                  Connect with local response teams effectively
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 mt-1 text-green-200" />
              <div>
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-green-100 text-sm">
                  Access round-the-clock emergency response coordination
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-sm text-green-200 mt-8">
          © 2024 Disaster Management Platform
        </footer>
      </div>

      {/* Right side - Form Section */}
      <div className="lg:w-1/2 w-full mt-28 p-8 lg:p-12 bg-black/90 flex justify-center items-cente">
        <form className="w-full max-w-2xl space-y-6" onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Create Account
            </h2>
            <p className="text-green-500/90">
              Join our emergency response network
            </p>
          </div>

          {/* Two-column layout for form fields */}
          <div>
            <label className="block text-sm font-medium text-green-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone field */}
            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Location input - full width */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-500 mb-1">
              Location
            </label>
            <LocationInput
              value={formData.location}
              onChange={(location) =>
                setFormData((prev) => ({ ...prev, location }))
              }
              onCoordinatesChange={(lat, lng) =>
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }))
              }
            />
          </div>

          {/* Password fields - two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg bg-green-100 border border-green-400 px-4 py-3 text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-200 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-200 border border-red-400 rounded-lg p-3 text-red-500 text-sm">
              <AlertCircle className="inline-block mr-2 h-4 w-4" /> {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-4 rounded-lg text-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-8"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

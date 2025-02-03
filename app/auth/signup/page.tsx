"use client";
import React, { useEffect, useState } from "react";
import { LocationInput } from "@/components/submit-report/LocationInput";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Phone,
  MapPin,
  User,
  ArrowLeft,
  Shield,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import OTPInput from "../../../components/OtpInput";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SignUp = () => {
  const [otp, setOtp] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    phoneNumber: "",
  });

  const router = useRouter();

  useEffect(() => {
    setOtp(Array(6).fill(""));
    setStep(1);
  }, []);

  const handlePhoneSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }

      const formattedPhoneNumber = `+91${phoneNumber}`;
      const encodedPhoneNumber = encodeURIComponent(formattedPhoneNumber);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/sendOtp?phoneNumber=${encodedPhoneNumber}`
      );

      if (response.status === 200) {
        toast.success("OTP sent successfully");
        setStep(2);
      } else {
        setError(
          response.data.message || "Failed to send OTP. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  interface FormData {
    phoneNumber: string;
    [key: string]: any;
  }

  const handleOtpVerify = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const otpValue = otp.join("");
      if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
        setError("Please enter a valid 6-digit OTP");
        return;
      }

      const formattedPhoneNumber = `+91${phoneNumber}`;
      const encodedPhoneNumber = encodeURIComponent(formattedPhoneNumber);
      const response = await axios.post<{ status: number }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/verifyOtp?phoneNumber=${encodedPhoneNumber}&otp=${otpValue}`
      );

      if (response.status === 200) {
        setFormData((prev) => ({ ...prev, phoneNumber }));
        toast.success("OTP verified successfully");
        setStep(3);
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.username.trim()) {
        setError("Username is required");
        return;
      }

      if (!formData.location.trim()) {
        setError("Location is required");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/register`,
        formData
      );

      if (response.status === 200) {
        toast.success("Registration successful");
        router.push("/");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }

  const FeatureCard = ({
    icon: Icon,
    title,
    description,
  }: FeatureCardProps) => (
    <div className="transform hover:translate-x-1 transition-transform duration-200">
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/90 dark:bg-black/90 border border-green-100 dark:border-green-900/50 hover:border-green-500">
        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-green-400">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-black dark:to-black/95 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-5 gap-4 md:gap-8">
        {/* Left side - Features */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-center space-y-4 p-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
              Welcome to DhruvaSetu
            </h1>
            <div className="h-1 w-16 bg-green-500 rounded-full"></div>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Join India's trusted platform for disaster reporting and safety.
            </p>
          </div>

          <div className="space-y-3">
            <FeatureCard
              icon={Bell}
              title="Real-time Alerts"
              description="Instant emergency notifications"
            />
            <FeatureCard
              icon={Users}
              title="Community Network"
              description="Connect with local safety members"
            />
            <FeatureCard
              icon={Shield}
              title="Verified Reports"
              description="Community-verified incidents"
            />
          </div>
        </div>

        {/* Right side - Form */}
        <Card className="md:col-span-3 w-full bg-white/95 dark:bg-black/90 shadow-lg border-0">
          <CardHeader className="space-y-2 p-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 text-center">
              {step === 1
                ? "Get Started"
                : step === 2
                ? "Verify Number"
                : "Complete Profile"}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {step === 1
                ? "Join our safety-conscious community"
                : step === 2
                ? "Enter the verification code"
                : "Set up your profile"}
            </p>
          </CardHeader>

          <CardContent className="p-4">
            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Phone Number
                  </label>
                  <div className="flex rounded-lg border-2 border-green-400 dark:border-green-500/50 overflow-hidden">
                    <span className="px-3 py-2.5 bg-green-50 dark:bg-green-500/20 text-green-800 dark:text-green-400 text-sm font-medium border-r-2 border-green-400 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-base focus:outline-none"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 rounded-lg flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter verification code sent to
                  </p>
                  <p className="text-base font-medium text-gray-800 dark:text-green-400">
                    +91 {phoneNumber}
                  </p>
                </div>

                <OTPInput
                  otp={otp}
                  setOtp={setOtp}
                  isLoading={isLoading}
                  onSubmit={handleOtpVerify}
                />

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2.5 px-4 text-sm text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Number</span>
                </button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-green-400 dark:border-green-500/50 bg-transparent text-base focus:outline-none"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-green-400 dark:border-green-500/50 bg-transparent text-base focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 rounded-lg flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;

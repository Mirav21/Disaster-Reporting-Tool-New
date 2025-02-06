// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { LocationInput } from "@/components/submit-report/LocationInput";
// // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   AlertCircle,
//   Phone,
//   MapPin,
//   User,
//   ArrowLeft,
//   Shield,
//   Users,
//   Bell,
//   ChevronRight,
//   CheckCircle2,
// } from "lucide-react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// const SignUp = () => {
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [phoneNumber, setPhoneNumber] = useState<string>("");
//   const [error, setError] = useState<string>("");
//   const [step, setStep] = useState<number>(1);
//   const [formData, setFormData] = useState({
//     username: "",
//     location: "",
//     latitude: null as number | null,
//     longitude: null as number | null,
//     phoneNumber: "",
//   });
//   const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
//   otpRefs.current = Array(6).fill(null);

//   const [isMobile, setIsMobile] = useState<boolean>(false);

//   // Hydration-safe mobile check
//   useEffect(() => {
//     const checkMobile = (): void => {
//       setIsMobile(window.innerWidth < 640);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const router = useRouter();

//   useEffect(() => {
//     setOtp(Array(6).fill(""));
//     setStep(1);
//   }, []);

//   const handlePhoneSubmit = async (e: { preventDefault: () => void }) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
//         setError("Please enter a valid 10-digit phone number");
//         return;
//       }

//       const formattedPhoneNumber = `+91${phoneNumber}`;
//       const encodedPhoneNumber = encodeURIComponent(formattedPhoneNumber);
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/sendOtp?phoneNumber=${encodedPhoneNumber}`
//       );
//       console.log(response);

//       if (response.status === 200) {
//         toast.success("OTP sent successfully");
//         setStep(2);
//       } else {
//         setError(response.data || "Failed to send OTP. Please try again.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("An error occurred. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // interface FormData {
//   //   phoneNumber: string;
//   //   [key: string]: any;
//   // }

//   const handleOtpVerify = async (
//     e: React.MouseEvent<HTMLButtonElement>
//   ): Promise<void> => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const otpValue = otp.join("");
//       if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
//         setError("Please enter a valid 6-digit OTP");
//         return;
//       }

//       const formattedPhoneNumber = `+91${phoneNumber}`;
//       const encodedPhoneNumber = encodeURIComponent(formattedPhoneNumber);
//       const response = await axios.post<{ status: number }>(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/verifyOtp?phoneNumber=${encodedPhoneNumber}&otp=${otpValue}`
//       );

//       if (response.status === 200) {
//         setFormData((prev) => ({ ...prev, phoneNumber }));
//         toast.success("OTP verified successfully");
//         setStep(3);
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Invalid OTP. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOtpChange = (index: number, value: string): void => {
//     if (!/^\d*$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Auto-focus next input
//     if (value !== "" && index < 5) {
//       otpRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (
//     index: number,
//     e: React.KeyboardEvent<HTMLInputElement>
//   ): void => {
//     if (e.key === "Backspace") {
//       if (otp[index] === "" && index > 0) {
//         const newOtp = [...otp];
//         newOtp[index - 1] = "";
//         setOtp(newOtp);
//         otpRefs.current[index - 1]?.focus();
//       }
//     } else if (e.key === "ArrowLeft" && index > 0) {
//       otpRefs.current[index - 1]?.focus();
//     } else if (e.key === "ArrowRight" && index < 5) {
//       otpRefs.current[index + 1]?.focus();
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
//     e.preventDefault();
//     const pastedData = e.clipboardData
//       .getData("text")
//       .slice(0, 6)
//       .replace(/\D/g, "");

//     const newOtp = [...otp];
//     pastedData.split("").forEach((char, index) => {
//       if (index < 6) newOtp[index] = char;
//     });
//     setOtp(newOtp);

//     if (newOtp[5]) {
//       otpRefs.current[5]?.focus();
//     }
//   };

//   const handleFinalSubmit = async (e: { preventDefault: () => void }) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       if (!formData.username.trim()) {
//         setError("Username is required");
//         return;
//       }

//       if (!formData.location.trim()) {
//         setError("Location is required");
//         return;
//       }

//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/register`,
//         formData
//       );

//       if (response.status === 200) {
//         toast.success("Registration successful");
//         router.push("/");
//       }
//     } catch (err) {
//       console.error(err)
//       setError("Registration failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const StepIndicator = ({ currentStep }: { currentStep: number }) => (
//     <div className="flex justify-center space-x-2 mb-6">
//       {[1, 2, 3].map((stepNum) => (
//         <div
//           key={stepNum}
//           className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
//             currentStep === stepNum
//               ? "bg-green-600 dark:bg-green-400"
//               : "bg-gray-200 dark:bg-gray-700"
//           }`}
//         />
//       ))}
//     </div>
//   );

//   const BackgroundPattern = () => (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-100/50 dark:bg-green-900/10 rounded-full blur-3xl"></div>
//       <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-100/50 dark:bg-green-900/10 rounded-full blur-3xl"></div>
//     </div>
//   );

//   // interface FeatureCardProps {
//   //   icon: React.ComponentType<{ className?: string }>;
//   //   title: string;
//   //   description: string;
//   // }

//   // const FeatureCard = ({
//   //   icon: Icon,
//   //   title,
//   //   description,
//   // }: FeatureCardProps) => (
//   //   <div className="transform hover:translate-x-1 transition-transform duration-200">
//   //     <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/90 dark:bg-black/90 border border-green-100 dark:border-green-900/50 hover:border-green-500">
//   //       <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/20 flex items-center justify-center">
//   //         <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
//   //       </div>
//   //       <div className="flex-1 min-w-0">
//   //         <h3 className="text-sm font-semibold text-gray-800 dark:text-green-400">
//   //           {title}
//   //         </h3>
//   //         <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
//   //           {description}
//   //         </p>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );

//   return (
//     <div className="relative min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 overflow-hidden">
//       <BackgroundPattern />

//       <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-5 gap-8 bg-white dark:bg-black/90 rounded-2xl shadow-2xl overflow-hidden">
//         {/* Left side - Features */}
//         <div className="hidden md:flex md:col-span-2 bg-green-600 text-white p-8 justify-center flex-col space-y-6">
//           <div>
//             <h1 className="text-4xl font-bold mb-4">DhruvaSetu</h1>
//             <p className="text-xl font-light opacity-90">
//               Your comprehensive safety companion
//             </p>
//           </div>

//           <div className="space-y-4">
//             {[
//               {
//                 icon: Bell,
//                 title: "Instant Alerts",
//                 desc: "Real-time emergency notifications",
//               },
//               {
//                 icon: Users,
//                 title: "Community Network",
//                 desc: "Connect with local safety members",
//               },
//               {
//                 icon: Shield,
//                 title: "Verified Reports",
//                 desc: "Community-validated incident tracking",
//               },
//             ].map(({ icon: Icon, title, desc }, index) => (
//               <div
//                 key={index}
//                 className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all"
//               >
//                 <div className="bg-white/20 p-3 rounded-xl">
//                   <Icon className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-base">{title}</h3>
//                   <p className="text-sm opacity-70">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right side - Form */}
//         <div className="md:col-span-3 flex items-center justify-center p-8">
//           <div className="w-full max-w-md">
//             <StepIndicator currentStep={step} />

//             <div className="text-center mb-6">
//               <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
//                 {step === 1
//                   ? "Welcome"
//                   : step === 2
//                   ? "Verify Number"
//                   : "Complete Profile"}
//               </h2>
//               <p className="text-gray-600 dark:text-gray-300">
//                 {step === 1
//                   ? "Let's get you started with DhruvaSetu"
//                   : step === 2
//                   ? "Enter the 6-digit code sent to your phone"
//                   : "Almost there! Tell us a bit more about you"}
//               </p>
//             </div>

//             {step === 1 && (
//               <form onSubmit={handlePhoneSubmit} className="space-y-6">
//                 <div>
//                   <label className="block text-gray-700 dark:text-gray-200 mb-2">
//                     Phone Number
//                   </label>
//                   <div className="flex rounded-lg border-2 border-green-500/30 overflow-hidden">
//                     <span className="px-4 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center">
//                       <Phone className="w-5 h-5 mr-2" />
//                       +91
//                     </span>
//                     <input
//                       type="tel"
//                       value={phoneNumber}
//                       onChange={(e) => setPhoneNumber(e.target.value)}
//                       className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 dark:text-white"
//                       placeholder="Enter 10-digit mobile number"
//                       maxLength={10}
//                     />
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2"
//                 >
//                   {isLoading ? (
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <>
//                       <span>Continue</span>
//                       <ChevronRight className="w-5 h-5" />
//                     </>
//                   )}
//                 </button>
//               </form>
//             )}

//             {step === 2 && (
//               <div className="space-y-6">
//                 <div className="text-center mb-6">
//                   <div className="mx-auto w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/20 flex items-center justify-center mb-4">
//                     <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
//                   </div>
//                   <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
//                     Verify Your Number
//                   </h2>
//                   <p className="text-gray-600 dark:text-gray-300">
//                     Enter the 6-digit code sent to
//                     <span className="font-semibold text-green-600 ml-1">
//                       +91 {phoneNumber}
//                     </span>
//                   </p>
//                 </div>

//                 <div
//                   className="flex justify-center gap-3"
//                   onPaste={handlePaste}
//                 >
//                   {otp.map((digit, index) => (
//                     <input
//                       key={index}
//                       ref={(el) => {
//                         otpRefs.current[index] = el;
//                       }}
//                       type={isMobile ? "number" : "text"}
//                       inputMode="numeric"
//                       maxLength={1}
//                       value={digit}
//                       onChange={(e) => handleOtpChange(index, e.target.value)}
//                       onKeyDown={(e) => handleKeyDown(index, e)}
//                       className="w-12 h-16 text-center text-2xl font-semibold
//                         border-2 border-green-400/50 dark:border-green-500/30 rounded-xl
//                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
//                         focus:outline-none focus:ring-2 focus:ring-green-500
//                         transition-all duration-200 shadow-sm
//                         disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={isLoading}
//                       autoComplete="one-time-code"
//                     />
//                   ))}
//                 </div>

//                 <div className="space-y-4">
//                   <button
//                     onClick={handleOtpVerify}
//                     disabled={isLoading || otp.join("").length !== 6}
//                     className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600
//                       text-white rounded-lg hover:opacity-90 transition-all
//                       disabled:opacity-50 shadow-lg flex items-center justify-center"
//                   >
//                     {isLoading ? (
//                       <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     ) : (
//                       "Verify OTP"
//                     )}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="w-full py-3 text-green-600 dark:text-green-400
//                       border border-green-200 dark:border-green-500/30
//                       rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10
//                       flex items-center justify-center space-x-2"
//                   >
//                     <ArrowLeft className="w-5 h-5" />
//                     <span>Change Number</span>
//                   </button>
//                 </div>
//               </div>
//             )}

//             {step === 3 && (
//               <div className="space-y-6">
//                 {/* <div className="text-center mb-6">
//                   <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
//                     Complete Your Profile
//                   </h2>
//                   <p className="text-gray-600 dark:text-gray-300">
//                     Just a few more details to get you started
//                   </p>
//                 </div> */}

//                 <form onSubmit={handleFinalSubmit} className="space-y-6">
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200 mb-2">
//                         Username
//                       </label>
//                       <div className="relative">
//                         <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
//                         <input
//                           type="text"
//                           value={formData.username}
//                           onChange={(e) =>
//                             setFormData((prev) => ({
//                               ...prev,
//                               username: e.target.value,
//                             }))
//                           }
//                           className="w-full pl-12 pr-4 py-3.5 rounded-lg
//                             border-2 border-green-500/30 bg-transparent
//                             focus:outline-none focus:border-green-500
//                             text-gray-800 dark:text-white"
//                           placeholder="Choose a unique username"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200 mb-2">
//                         Location
//                       </label>
//                       <div className="relative">
//                         <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
//                         <LocationInput
//                           value={formData.location}
//                           onChange={(location) =>
//                             setFormData((prev) => ({ ...prev, location }))
//                           }
//                           onCoordinatesChange={(lat, lng) =>
//                             setFormData((prev) => ({
//                               ...prev,
//                               latitude: lat,
//                               longitude: lng,
//                             }))
//                           }
//                           className="w-full pl-12 pr-4 py-3.5 rounded-lg
//                             border-2 border-green-500/30 bg-transparent
//                             focus:outline-none focus:border-green-500
//                             text-gray-800 dark:text-white"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600
//                       text-white rounded-lg hover:opacity-90 transition-all
//                       disabled:opacity-50 shadow-lg flex items-center justify-center space-x-2"
//                   >
//                     {isLoading ? (
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     ) : (
//                       <>
//                         <span>Complete Registration</span>
//                         <CheckCircle2 className="w-5 h-5" />
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             )}

//             {error && (
//               <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center space-x-3 text-red-700 dark:text-red-400">
//                 <AlertCircle className="w-6 h-6 flex-shrink-0" />
//                 <p className="text-sm flex-1">{error}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;

"use client";
import React, { useEffect, useRef, useState } from "react";
import { LocationInput } from "@/components/submit-report/LocationInput";

import {
  AlertCircle,
  Phone,
  MapPin,
  User,
  Shield,
  Users,
  Bell,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import OTPInput from "@/components/OtpInput";

interface CustomJwtPayload {
  sub: string;
  role: string;
}

export default function SignUp() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    username: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    phoneNumber: "",
  });
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  otpRefs.current = Array(6).fill(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      if (decodedToken) {
        const role = decodedToken.role.toLowerCase();

        if (role === "moderator") {
          router.push("/dashboard");
        } else if (role === "admin") {
          router.push("/vendor");
        } else if (role === "vendor") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    }
  }, [accessToken]);

  // Hydration-safe mobile check
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
      console.log(response);

      if (response.status === 200) {
        toast.success("OTP sent successfully");
        setStep(2);
      } else {
        setError(response.data || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error(err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (phoneNumber: string) => {
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
        localStorage.setItem("token", token);
        setAccessToken(token);

        setTimeout(() => {
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
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
        await handleSignIn(phoneNumber);
        // router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex justify-center space-x-2 mb-6">
      {[1, 2, 3].map((stepNum) => (
        <div
          key={stepNum}
          className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
            currentStep === stepNum
              ? "bg-green-600 dark:bg-green-400"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );

  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-100/50 dark:bg-green-900/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-100/50 dark:bg-green-900/10 rounded-full blur-3xl"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-5 gap-8 bg-white dark:bg-black/90 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Features */}
        <div className="hidden md:flex md:col-span-2 bg-green-600 text-white p-8 justify-center flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">DhruvaSetu</h1>
            <p className="text-xl font-light opacity-90">
              Your comprehensive safety companion
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Bell,
                title: "Instant Alerts",
                desc: "Real-time emergency notifications",
              },
              {
                icon: Users,
                title: "Community Network",
                desc: "Connect with local safety members",
              },
              {
                icon: Shield,
                title: "Verified Reports",
                desc: "Community-validated incident tracking",
              },
            ].map(({ icon: Icon, title, desc }, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all"
              >
                <div className="bg-white/20 p-3 rounded-xl">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="text-sm opacity-70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="md:col-span-3 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <StepIndicator currentStep={step} />

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {step === 1
                  ? "Welcome"
                  : step === 2
                  ? "Verify Number"
                  : "Complete Profile"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {step === 1
                  ? "Let's get you started with DhruvaSetu"
                  : step === 2
                  ? "Enter the 6-digit code sent to your phone"
                  : "Almost there! Tell us a bit more about you"}
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <div className="flex rounded-lg border-2 border-green-500/30 overflow-hidden">
                    <span className="px-4 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 dark:text-white"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <OTPInput
                otp={otp}
                setOtp={setOtp}
                isLoading={isLoading}
                onSubmit={handleOtpVerify}
              />
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Just a few more details to get you started
              </p>
            </div> */}

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg 
                        border-2 border-green-500/30 bg-transparent 
                        focus:outline-none focus:border-green-500 
                        text-gray-800 dark:text-white"
                          placeholder="Choose a unique username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
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
                          className="w-full pl-12 pr-4 py-3.5 rounded-lg 
                            border-2 border-green-500/30 bg-transparent 
                            focus:outline-none focus:border-green-500 
                            text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 
                      text-white rounded-lg hover:opacity-90 transition-all 
                      disabled:opacity-50 shadow-lg flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center space-x-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm flex-1">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

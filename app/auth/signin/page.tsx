// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// // import Link from "next/link";
// import { jwtDecode } from "jwt-decode";

// interface CustomJwtPayload {
//   sub: string;
//   role: string;
//   id: string;
// }

// export default function SignIn() {
//   const router = useRouter();
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [isBiometricLoading, setIsBiometricLoading] = useState(false);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedToken = localStorage.getItem("token");
//       setAccessToken(storedToken);
//     }
//   }, []);

//   // useEffect(() => {
//   //   if (accessToken) {
//   //     const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
//   //     if (decodedToken) {
//   //       const role = decodedToken.role.toLowerCase();
//   //       if (role === "moderator") {
//   //         router.push("/dashboard");
//   //       } else if (role === "vendor") {
//   //         router.push("/vendor");
//   //       } else {
//   //         router.push("/");
//   //       }
//   //     }
//   //   }
//   // }, [accessToken]);

//   // 📌 Function to handle phone-based login
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     const phoneRegex = /^\d{10}$/;
//     if (!phoneRegex.test(phoneNumber)) {
//       setError("Please enter a valid 10-digit phone number");
//       setIsLoading(false);
//       return;
//     }

//     const formattedPhoneNumber = `+91${phoneNumber}`;

//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/login`,
//         { phoneNumber: formattedPhoneNumber }
//       );

//       if (response.status === 200) {
//         const token = response.data.token;
//         console.log(token);
//         localStorage.setItem("token", token);
//         setAccessToken(token);

//         // Proceed to biometric authentication after successful phone login
//         await handleBiometricLogin(token);
//       }
//     } catch (error) {
//       console.error(error);
//       setError("Invalid phone number or unauthorized access.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 📌 Function to handle biometric login
//   const handleBiometricLogin = async (token: string) => {
//     setIsBiometricLoading(true);
//     setError("");

//     try {
//       const imageBase64 = await captureImageFromWebcam();
//       if (!imageBase64) {
//         setError("Failed to capture image.");
//         setIsBiometricLoading(false);
//         return;
//       }

//       const decodedToken = jwtDecode<CustomJwtPayload>(token);
//       console.log(decodedToken);

//       const response = await axios.post(`/api/face-login`, {
//         userId: decodedToken.id,
//         image: imageBase64,
//       });

//       if (response.status === 200 && response.data.success) {
//         router.push("/dashboard"); // Redirect after successful face authentication
//       } else {
//         setError("Face authentication failed.");
//       }
//     } catch (error) {
//       console.error(error);
//       setError("Biometric authentication failed.");
//     } finally {
//       setIsBiometricLoading(false);
//     }
//   };

//   // 📌 Function to capture an image from the webcam
//   const captureImageFromWebcam = async (): Promise<string | null> => {
//     return new Promise((resolve, reject) => {
//       navigator.mediaDevices
//         .getUserMedia({ video: true })
//         .then((stream) => {
//           const video = document.createElement("video");
//           video.srcObject = stream;
//           video.play();

//           setTimeout(() => {
//             const canvas = document.createElement("canvas");
//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;
//             const context = canvas.getContext("2d");
//             if (context) {
//               context.drawImage(video, 0, 0, canvas.width, canvas.height);
//               const imageBase64 = canvas.toDataURL("image/jpeg");
//               resolve(imageBase64);
//             } else {
//               reject(null);
//             }
//             stream.getTracks().forEach((track) => track.stop()); // Stop the video stream
//           }, 1000); // Wait for 1 second to capture a clear image
//         })
//         .catch(() => reject(null));
//     });
//   };

//   return (
//     <div className="flex justify-center items-center min-h-[92.5vh] bg-white dark:bg-black/90 px-4">
//       <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-xl transform transition-all">
//         {/* Header Section */}
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="text-center space-y-2">
//             <h1 className="text-3xl font-bold text-green-600 dark:text-green-500 tracking-tight">
//               Welcome to DhruvaSetu
//             </h1>
//             <h2 className="text-base text-green-600/80 dark:text-green-500/80">
//               Sign in with your phone number or biometrics
//             </h2>
//           </div>
//         </div>

//         {/* Form Section */}
//         <div className="p-6">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div className="space-y-2">
//               <label className="block text-base font-medium text-green-700 dark:text-green-400">
//                 Phone Number
//               </label>
//               <div className="flex items-center border-2 border-green-400 dark:border-green-600 rounded-lg overflow-hidden">
//                 <span className="px-4 py-3 bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-100 font-medium border-r-2">
//                   🇮🇳 +91
//                 </span>
//                 <input
//                   type="tel"
//                   required
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   className="flex-1 px-4 py-3 bg-transparent text-green-900 dark:text-green-100 placeholder-green-500/60 dark:placeholder-green-400/60 w-full"
//                   placeholder="Enter your 10-digit phone number"
//                   maxLength={10}
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
//                 <p className="text-red-600 dark:text-red-400 text-sm text-center">
//                   {error}
//                 </p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg"
//             >
//               {isLoading ? "Loading..." : "Sign in"}
//             </button>

//             <button
//               type="button"
//               onClick={() => accessToken && handleBiometricLogin(accessToken)}
//               disabled={isBiometricLoading}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg mt-4"
//             >
//               {isBiometricLoading ? "Verifying..." : "Face Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { Phone, ArrowRight, Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (accessToken) {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      if (decodedToken) {
        const role = decodedToken.role.toLowerCase();
        if (role === "moderator" || role === "admin") {
          router.push("/dashboard");
        } else if (role === "vendor") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setAccessToken(storedToken);
    }
  }, []);

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

        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        if (decodedToken) {
          const role = decodedToken.role.toLowerCase();
          if (role === "admin" || role === "moderator") {
            router.push("/dashboard");
          } else if (role === "vendor") {
            router.push("/vendor");
          } else {
            router.push("/");
          }
        }
      }
    } catch (error) {
      console.error(error);
      setError("Invalid phone number or unauthorized access.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-black">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 relative">
          {/* Logo/Brand Section */}
          <div className="text-center space-y-6">
            <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <div className="w-16 h-16 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                DhruvaSetu
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                India`&apos;`s Trusted Crowdsourcing Platform
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="mt-8 bg-white dark:bg-black/90 py-8 px-4 shadow-xl rounded-xl sm:px-10 ring-1 ring-black dark:ring-white/40">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">
                      🇮🇳 +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-20 pr-4 py-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:focus:ring-green-500 rounded-lg bg-white dark:bg-gray-900 transition-all duration-200"
                    placeholder="Enter your phone number"
                    maxLength={10}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue with Phone
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-white">
                    New to DhruvaSetu?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

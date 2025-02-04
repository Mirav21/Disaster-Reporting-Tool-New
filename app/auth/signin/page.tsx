"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  sub: string;
  role: string;
  id: string;
}

export default function SignIn() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setAccessToken(storedToken);
    }
  }, []);

  // useEffect(() => {
  //   if (accessToken) {
  //     const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
  //     if (decodedToken) {
  //       const role = decodedToken.role.toLowerCase();
  //       if (role === "moderator") {
  //         router.push("/dashboard");
  //       } else if (role === "vendor") {
  //         router.push("/vendor");
  //       } else {
  //         router.push("/");
  //       }
  //     }
  //   }
  // }, [accessToken]);

  // 📌 Function to handle phone-based login
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
        { phoneNumber: formattedPhoneNumber }
      );

      if (response.status === 200) {
        const token = response.data.token;
        console.log(token);
        localStorage.setItem("token", token);
        setAccessToken(token);

        // Proceed to biometric authentication after successful phone login
        await handleBiometricLogin(token);
      }
    } catch (error) {
      console.error(error);
      setError("Invalid phone number or unauthorized access.");
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Function to handle biometric login
  const handleBiometricLogin = async (token: string) => {
    setIsBiometricLoading(true);
    setError("");

    try {
      const imageBase64 = await captureImageFromWebcam();
      if (!imageBase64) {
        setError("Failed to capture image.");
        setIsBiometricLoading(false);
        return;
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      console.log(decodedToken);

      const response = await axios.post(`/api/face-login`, {
        userId: decodedToken.id,
        image: imageBase64,
      });

      if (response.status === 200 && response.data.success) {
        router.push("/dashboard"); // Redirect after successful face authentication
      } else {
        setError("Face authentication failed.");
      }
    } catch (error) {
      console.error(error);
      setError("Biometric authentication failed.");
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // 📌 Function to capture an image from the webcam
  const captureImageFromWebcam = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          setTimeout(() => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageBase64 = canvas.toDataURL("image/jpeg");
              resolve(imageBase64);
            } else {
              reject(null);
            }
            stream.getTracks().forEach((track) => track.stop()); // Stop the video stream
          }, 1000); // Wait for 1 second to capture a clear image
        })
        .catch(() => reject(null));
    });
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
              Sign in with your phone number or biometrics
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
              <div className="flex items-center border-2 border-green-400 dark:border-green-600 rounded-lg overflow-hidden">
                <span className="px-4 py-3 bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-100 font-medium border-r-2">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent text-green-900 dark:text-green-100 placeholder-green-500/60 dark:placeholder-green-400/60 w-full"
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              {isLoading ? "Loading..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => accessToken && handleBiometricLogin(accessToken)}
              disabled={isBiometricLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg mt-4"
            >
              {isBiometricLoading ? "Verifying..." : "Face Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

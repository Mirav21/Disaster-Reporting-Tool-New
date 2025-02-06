import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({
  otp,
  setOtp,
  isLoading,
  onSubmit,
}) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  otpRefs.current = Array(6).fill(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Verify Your Number
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit verification code
          </p>
        </div>
        <div className="flex justify-center gap-2 sm:gap-3 px-2 sm:px-0">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="w-10 h-12 sm:w-14 sm:h-16 border-2 border-green-400 dark:border-green-500 rounded-xl"
              />
            ))}
        </div>
      </div>
    );
  }

  const handleOtpChange = (index: number, value: string): void => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, "");

    // If the input is empty, just update the current field
    if (cleanValue === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Create a new OTP array
    const newOtp = [...otp];
    // Only update the current field with the last digit entered
    newOtp[index] = cleanValue.slice(-1);
    setOtp(newOtp);
    // Move to next field if not the last field
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .replace(/\D/g, "");

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    if (newOtp[5]) {
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Verify Your Number
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit verification code
        </p>
      </div>

      <div
        className="flex justify-center gap-2 sm:gap-3 px-2 sm:px-0"
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            type={isMobile ? "number" : "text"}
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 sm:w-14 sm:h-16 text-center text-lg sm:text-xl font-semibold 
            border-2 border-green-400 dark:border-green-500 rounded-xl 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 
            transition-all duration-200 shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || otp.join("").length !== 6}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 
          hover:from-green-700 hover:to-emerald-700 dark:from-green-500 
          dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 
          text-white font-medium rounded-xl transition-all duration-200 
          disabled:opacity-50 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          "Verify OTP"
        )}
      </button>
    </div>
  );
};

export default OTPInput;

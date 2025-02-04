"use client";

import { useState, useCallback } from "react";
import { LocationInput } from "./LocationInput";
import crypto from "crypto";
import toast from "react-hot-toast";
import axios from "axios";

const REPORT_TYPES = [
  "Earthquake",
  "Hurricane",
  "Flood",
  "Wildfire",
  "Tornado",
  "Tsunami",
  "Landslide",
] as const;

type ReportType = "NonEmergency" | "LowPriority" | "Emergency" | "Critical";

interface ReportData {
  reportId: string;
  severity: ReportType;
  disasterType: string;
  contactInfo: string;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
}

interface ReportFormProps {
  onComplete: (data: ReportData) => void;
}

export function ReportForm({ onComplete }: ReportFormProps) {
  const [formData, setFormData] = useState({
    incidentType: "" as ReportType,
    specificType: "",
    location: "",
    description: "",
    title: "",
    contactInfo: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLocationToImage = (
    base64Image: string,
    location: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx?.drawImage(img, 0, 0);

        // Set text styling
        if (ctx) {
          // Adjust font size based on image width
          const fontSize = Math.max(20, Math.floor(img.width * 0.06));
          ctx.font = `bold ${fontSize}px Arial`;

          // Set text color to red
          ctx.fillStyle = "red";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;

          // Position text at the bottom of the image
          const padding = 15;
          const textX = padding;
          const textY = canvas.height - padding;

          // Create a semi-transparent dark background for better readability
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          const textMetrics = ctx.measureText(location);
          ctx.fillRect(
            0,
            canvas.height - fontSize - 2 * padding,
            textMetrics.width + 2 * padding,
            fontSize + 2 * padding
          );

          // Draw text outline
          ctx.strokeText(location, textX, textY);

          // Draw text in red
          ctx.fillStyle = "red";
          ctx.fillText(location, textX, textY);
        }

        // Convert canvas back to base64
        resolve(canvas.toDataURL());
      };

      img.onerror = reject;
      img.src = base64Image;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();
      console.log(data);

      if (data.title && data.description && data.reportType) {
        // Modify image with location if available
        let finalImage = base64 as string;
        if (formData.location) {
          try {
            finalImage = await addLocationToImage(
              base64 as string,
              formData.location
            );
          } catch (overlayError) {
            console.error("Error adding location to image", overlayError);
            // Fall back to original image if overlay fails
            finalImage = base64 as string;
          }
        }

        setFormData((prev) => ({
          ...prev,
          title: data.title,
          // description: data.description,
          specificType: data.reportType,
        }));
        setImage(finalImage);
      } else if (data.error) {
        toast.error("Please upload an image of a disaster scenario", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#FF6B6B",
            color: "white",
            border: "1px solid #FF4757",
            padding: "16px",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#FF4757",
            secondary: "white",
          },
        });
        setImage(null);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateReportId = useCallback(() => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const combinedString = `${timestamp}-${randomBytes}`;
    return crypto
      .createHash("sha256")
      .update(combinedString)
      .digest("hex")
      .slice(0, 16);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reportData = {
        reportId: generateReportId(),
        severity: formData.incidentType,
        disasterType: formData.specificType,
        contactInfo: formData.contactInfo,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        imageUrl: image,
      };

      console.log(reportData);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated. Token missing.");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/submit`,
        reportData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      if (response.status !== 201) {
        throw new Error(response.data.error || "Failed to submit report");
      }
      const data = response.data;
      onComplete(data);
    } catch (error) {
      toast.error(
        "Report not Submited! Please Try Again and check for missing Fields"
      );
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Emergency Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, incidentType: "Emergency" }))
          }
          className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
            formData.incidentType === "Emergency"
              ? "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-700 shadow-lg shadow-red-500/20 dark:shadow-red-900/30"
              : "bg-white dark:bg-red-900/20 border-gray-200 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500/50 dark:hover:border-red-700/50"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-8 h-8 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium text-red-500 dark:text-red-400">
              Emergency
            </span>
            <span className="text-xs text-gray-600 dark:text-white">
              Immediate Response Required
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, incidentType: "NonEmergency" }))
          }
          className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
            formData.incidentType === "NonEmergency"
              ? "bg-orange-100 dark:bg-orange-900/30 border-orange-500 dark:border-orange-700 shadow-lg shadow-orange-500/20 dark:shadow-orange-900/30"
              : "bg-white dark:bg-orange-900/20 border-gray-200 dark:border-orange-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500/50 dark:hover:border-orange-700/50"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-8 h-8 text-orange-500 dark:text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-orange-500 dark:text-orange-400">
              Non-Emergency
            </span>
            <span className="text-xs text-gray-600 dark:text-white">
              General Report
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, incidentType: "LowPriority" }))
          }
          className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
            formData.incidentType === "LowPriority"
              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30"
              : "bg-white dark:bg-blue-900/20 border-gray-200 dark:border-blue-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500/50 dark:hover:border-blue-700/50"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-8 h-8 text-blue-500 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-blue-500 dark:text-blue-400">
              Low Priority
            </span>
            <span className="text-xs text-gray-600 dark:text-white">
              Additional Information
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, incidentType: "Critical" }))
          }
          className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
            formData.incidentType === "Critical"
              ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-700 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/30"
              : "bg-white dark:bg-purple-900/20 border-gray-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500/50 dark:hover:border-purple-700/50"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-8 h-8 text-purple-500 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-purple-500 dark:text-purple-400">
              Critical
            </span>
            <span className="text-xs text-gray-600 dark:text-white">
              Urgent Attention
            </span>
          </div>
        </button>
      </div>

      {/* Image Upload */}
      <div className="relative group">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl 
                   hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200
                   cursor-pointer text-center bg-white dark:bg-gray-900"
        >
          {image ? (
            <div className="space-y-4">
              <div className="w-full h-48 relative rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop an image here or click to upload
              </p>
            </div>
          )}
        </label>
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <svg
                className="animate-spin h-5 w-5 text-sky-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sky-500 font-medium">
                Analyzing image...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Incident Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Incident Type
          </label>
          <select
            value={formData.specificType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, specificType: e.target.value }))
            }
            className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                     text-gray-900 dark:text-gray-100 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          >
            <option value="">Select type</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <LocationInput
            value={formData.location}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, location: value }))
            }
            onCoordinatesChange={(lat, lng) =>
              setCoordinates({
                latitude: lat,
                longitude: lng,
              })
            }
            className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                     text-gray-900 dark:text-gray-100 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Number
          </label>
          <input
            type="text"
            value={formData.contactInfo}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setFormData((prev) => ({ ...prev, contactInfo: value }));
              }
            }}
            className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                    text-gray-900 dark:text-gray-100 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
          {formData.contactInfo &&
            (formData.contactInfo.length < 10 ||
              formData.contactInfo.length >= 11) && (
              <p className="text-red-500 text-xs mt-1">
                Contact number must be exactly 10 digits.
              </p>
            )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Report Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                    text-gray-900 dark:text-gray-100 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full min-h-24 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                    text-gray-900 dark:text-gray-100 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-br from-green-600 to-green-700 
                 px-4 py-3.5 text-sm font-medium text-white shadow-lg
                 transition-all duration-200 hover:from-blue-600 hover:to-blue-700
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Report</span>
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </div>
      </button>
    </form>
  );
}

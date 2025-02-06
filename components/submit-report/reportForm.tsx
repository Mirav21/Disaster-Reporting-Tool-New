// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { LocationInput } from "./LocationInput";
// import crypto from "crypto";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// const REPORT_TYPES = [
//   "Earthquake",
//   "Hurricane",
//   "Flood",
//   "Wildfire",
//   "Tornado",
//   "Tsunami",
//   "Landslide",
// ] as const;

// type ReportType = "NonEmergency" | "LowPriority" | "Emergency" | "Critical";

// interface ReportData {
//   reportId: string;
//   severity: ReportType;
//   disasterType: string;
//   contactInfo: string;
//   title: string;
//   description: string;
//   location: string;
//   latitude: number | null;
//   longitude: number | null;
//   imageUrl: string | null;
// }

// interface ReportFormProps {
//   onComplete: (data: ReportData) => void;
// }

// interface CustomJwtPayload {
//   sub: string;
//   role: string;
//   phoneNumber: string;
// }

// export function ReportForm({ onComplete }: ReportFormProps) {
//   const [formData, setFormData] = useState({
//     incidentType: "" as ReportType,
//     specificType: "",
//     location: "",
//     description: "",
//     title: "",
//     contactInfo: "",
//   });
//   const [image, setImage] = useState<string | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [showFields, setShowFields] = useState(false);
//   const [coordinates, setCoordinates] = useState<{
//     latitude: number | null;
//     longitude: number | null;
//   }>({
//     latitude: null,
//     longitude: null,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [question, setQuestion] = useState<string | null>(null);
//   const [showDescriptionModal, setShowDescriptionModal] = useState(false);
//   const [tempDescription, setTempDescription] = useState("");
//   const [showQuestionDialog, setShowQuestionDialog] = useState(false);

//   // Function to handle description confirmation
//   const handleKeepDescription = () => {
//     setFormData((prev) => ({ ...prev, description: tempDescription }));
//     setShowDescriptionModal(false);
//   };

//   // Function to handle description discard
//   const handleDiscardDescription = () => {
//     setFormData((prev) => ({ ...prev, description: "" }));
//     setShowDescriptionModal(false);
//   };

//   // Assume this gets called when AI generates the description
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const decodedToken = jwtDecode<CustomJwtPayload>(token);
//       console.log("Decoded Token:", decodedToken);
//       if (decodedToken) {
//         console.log("User Phone:", decodedToken.phoneNumber);
//         formData.contactInfo = decodedToken.phoneNumber;
//       }
//     }
//   }, []);

//   const addLocationToImage = (
//     base64Image: string,
//     location: string
//   ): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");

//         // Set canvas dimensions to match the image
//         canvas.width = img.width;
//         canvas.height = img.height;

//         // Draw the original image
//         ctx?.drawImage(img, 0, 0);

//         // Set text styling
//         if (ctx) {
//           // Calculate a more reasonable font size (3% of image width instead of 6%)
//           const fontSize = Math.min(
//             Math.max(12, Math.floor(img.width * 0.03)),
//             24 // Cap maximum font size at 24px
//           );

//           ctx.font = `${fontSize}px Arial`; // Removed 'bold' for better readability

//           // Adjust padding based on image size
//           const padding = Math.max(8, Math.floor(img.width * 0.01));

//           // Position text at the bottom of the image
//           const textX = padding;
//           const textY = canvas.height - padding;

//           // Measure text for background
//           const textMetrics = ctx.measureText(location);
//           const textHeight = fontSize;
//           const backgroundHeight = textHeight + padding * 1.5;

//           // Create a semi-transparent dark background
//           ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
//           ctx.fillRect(
//             0,
//             canvas.height - backgroundHeight,
//             textMetrics.width + padding * 2,
//             backgroundHeight
//           );

//           // Draw text in white with a thin black outline for better contrast
//           ctx.lineWidth = Math.max(1, fontSize * 0.1);
//           ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
//           ctx.strokeText(location, textX, textY - padding * 0.5);

//           // Draw text in white instead of red for better readability
//           ctx.fillStyle = "white";
//           ctx.fillText(location, textX, textY - padding * 0.5);
//         }

//         // Convert canvas back to base64
//         resolve(canvas.toDataURL());
//       };

//       img.onerror = reject;
//       img.src = base64Image;
//     });
//   };

//   const isLocationValid =
//     formData.location && coordinates.latitude && coordinates.longitude;

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsAnalyzing(true);
//     try {
//       const base64 = await new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(file);
//       });

//       const response = await fetch("/api/analyze-image", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ image: base64 }),
//       });

//       const data = await response.json();
//       const analyzedImage = await addLocationToImage(
//         base64 as string,
//         formData.location
//       );
//       setImage(analyzedImage);
//       setTempDescription(data.description);
//       setQuestion(data.question);
//       setShowQuestionDialog(true);

//       if (data.title && data.description && data.reportType) {
//         setFormData((prev) => ({
//           ...prev,
//           title: data.title,
//           description: data.description,
//           specificType: data.reportType,
//         }));
//       }
//     } catch (error) {
//       console.error("Error analyzing image:", error);
//       toast.error("Failed to analyze image");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const generateReportId = useCallback(() => {
//     const timestamp = Date.now().toString();
//     const randomBytes = crypto.randomBytes(16).toString("hex");
//     const combinedString = `${timestamp}-${randomBytes}`;
//     return crypto
//       .createHash("sha256")
//       .update(combinedString)
//       .digest("hex")
//       .slice(0, 16);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const reportData = {
//         reportId: generateReportId(),
//         severity: formData.incidentType,
//         disasterType: formData.specificType,
//         contactInfo: formData.contactInfo,
//         title: formData.title,
//         description: formData.description,
//         location: formData.location,
//         latitude: coordinates.latitude,
//         longitude: coordinates.longitude,
//         imageUrl: image,
//       };

//       console.log(reportData);

//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("User not authenticated. Token missing.");
//       }

//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/submit`,
//         reportData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(response);

//       if (response.status !== 201) {
//         throw new Error(response.data.error || "Failed to submit report");
//       }
//       const data = response.data;
//       onComplete(data);
//     } catch (error) {
//       toast.error(
//         "Report not Submited! Please Try Again and check for missing Fields"
//       );
//       console.error("Error submitting report:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleQuestionResponse = (isYes: boolean) => {
//     setShowQuestionDialog(false);
//     if (isYes) {
//       setShowFields(true);
//       setShowDescriptionModal(true);
//     } else {
//       setImage(null);
//       setFormData((prev) => ({
//         ...prev,
//         description: "",
//         title: "",
//         specificType: "",
//       }));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-8">
//       {/* Location Input - Always shown first */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//           Location *
//         </label>
//         <LocationInput
//           value={formData.location}
//           onChange={(value) => {
//             console.log("Location Value:", value);
//             setFormData((prev) => ({ ...prev, location: value }));
//           }}
//           onCoordinatesChange={(lat, lng) =>
//             setCoordinates({ latitude: lat, longitude: lng })
//           }
//           className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
//                  text-gray-900 dark:text-gray-100 transition-colors duration-200
//                  focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//         />
//       </div>

//       {/* Severity Selection - Shown after location is valid */}
//       {isLocationValid && formData.contactInfo && (
//         <div className="grid grid-cols-2 gap-4">
//           <button
//             type="button"
//             onClick={() =>
//               setFormData((prev) => ({ ...prev, incidentType: "Emergency" }))
//             }
//             className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
//               formData.incidentType === "Emergency"
//                 ? "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-700 shadow-lg shadow-red-500/20 dark:shadow-red-900/30"
//                 : "bg-white dark:bg-red-900/20 border-gray-200 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500/50 dark:hover:border-red-700/50"
//             }`}
//           >
//             <div className="flex flex-col items-center space-y-2">
//               <svg
//                 className="w-8 h-8 text-red-500 dark:text-red-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//               <span className="font-medium text-red-500 dark:text-red-400">
//                 Emergency
//               </span>
//               <span className="text-xs text-gray-600 dark:text-white">
//                 Immediate Response Required
//               </span>
//             </div>
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               setFormData((prev) => ({ ...prev, incidentType: "NonEmergency" }))
//             }
//             className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
//               formData.incidentType === "NonEmergency"
//                 ? "bg-orange-100 dark:bg-orange-900/30 border-orange-500 dark:border-orange-700 shadow-lg shadow-orange-500/20 dark:shadow-orange-900/30"
//                 : "bg-white dark:bg-orange-900/20 border-gray-200 dark:border-orange-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500/50 dark:hover:border-orange-700/50"
//             }`}
//           >
//             <div className="flex flex-col items-center space-y-2">
//               <svg
//                 className="w-8 h-8 text-orange-500 dark:text-orange-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="font-medium text-orange-500 dark:text-orange-400">
//                 Non-Emergency
//               </span>
//               <span className="text-xs text-gray-600 dark:text-white">
//                 General Report
//               </span>
//             </div>
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               setFormData((prev) => ({ ...prev, incidentType: "LowPriority" }))
//             }
//             className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
//               formData.incidentType === "LowPriority"
//                 ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30"
//                 : "bg-white dark:bg-blue-900/20 border-gray-200 dark:border-blue-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500/50 dark:hover:border-blue-700/50"
//             }`}
//           >
//             <div className="flex flex-col items-center space-y-2">
//               <svg
//                 className="w-8 h-8 text-blue-500 dark:text-blue-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="font-medium text-blue-500 dark:text-blue-400">
//                 Low Priority
//               </span>
//               <span className="text-xs text-gray-600 dark:text-white">
//                 Additional Information
//               </span>
//             </div>
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               setFormData((prev) => ({ ...prev, incidentType: "Critical" }))
//             }
//             className={`p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
//               formData.incidentType === "Critical"
//                 ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-700 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/30"
//                 : "bg-white dark:bg-purple-900/20 border-gray-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500/50 dark:hover:border-purple-700/50"
//             }`}
//           >
//             <div className="flex flex-col items-center space-y-2">
//               <svg
//                 className="w-8 h-8 text-purple-500 dark:text-purple-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="font-medium text-purple-500 dark:text-purple-400">
//                 Critical
//               </span>
//               <span className="text-xs text-gray-600 dark:text-white">
//                 Urgent Attention
//               </span>
//             </div>
//           </button>
//         </div>
//       )}

//       {/* Image Upload - Shown after severity is selected */}
//       {formData.incidentType && (
//         <div className="relative group">
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             className="hidden"
//             id="image-upload"
//           />
//           <label
//             htmlFor="image-upload"
//             className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl
//                    hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200
//                    cursor-pointer text-center bg-white dark:bg-gray-900"
//           >
//             {image ? (
//               <div className="space-y-4">
//                 <div className="w-full h-64 relative rounded-lg overflow-hidden">
//                   <img
//                     src={image}
//                     alt="Preview"
//                     className="w-full h-full object-fit"
//                   />
//                 </div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Click to change image
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <svg
//                   className="mx-auto h-12 w-12 text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                   />
//                 </svg>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Upload disaster scene image
//                 </p>
//               </div>
//             )}
//           </label>
//           {isAnalyzing && (
//             <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
//               <div className="flex items-center space-x-3">
//                 <svg
//                   className="animate-spin h-5 w-5 text-sky-500"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   />
//                 </svg>
//                 <span className="text-sky-500 font-medium">
//                   Analyzing image...
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Additional Fields - Only shown after image upload */}
//       <>
//         {image && (
//           <div className="space-y-6">
//             {question && (
//               <AlertDialog
//                 open={showQuestionDialog}
//                 onOpenChange={setShowQuestionDialog}
//               >
//                 <AlertDialogContent className="max-w-md">
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>Confirm Image</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       <div className="mt-4">
//                         <p className="text-gray-700 dark:text-gray-300">
//                           {question}
//                         </p>
//                       </div>
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter className="space-x-4">
//                     <AlertDialogCancel
//                       onClick={() => handleQuestionResponse(false)}
//                     >
//                       No
//                     </AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => handleQuestionResponse(true)}
//                     >
//                       Yes
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             )}

//             {showFields && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Incident Type
//                   </label>
//                   <select
//                     value={formData.specificType}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         specificType: e.target.value,
//                       }))
//                     }
//                     className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
//                          text-gray-900 dark:text-gray-100 transition-colors duration-200
//                          focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//                     required
//                   >
//                     <option value="">Select type</option>
//                     {REPORT_TYPES.map((type) => (
//                       <option key={type} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Report Title
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         title: e.target.value,
//                       }))
//                     }
//                     className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
//                         text-gray-900 dark:text-gray-100 transition-colors duration-200
//                         focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         description: e.target.value,
//                       }))
//                     }
//                     rows={4}
//                     className="w-full min-h-24 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
//                         text-gray-900 dark:text-gray-100 transition-colors duration-200
//                         focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//                     required
//                     placeholder="Please provide detailed information about the incident..."
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Contact Number (Auto-filled)
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.contactInfo}
//                     readOnly
//                     className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3.5
//                         text-gray-900 dark:text-gray-100 cursor-not-allowed"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={
//                     isSubmitting ||
//                     !formData.specificType ||
//                     !formData.title ||
//                     !formData.description
//                   }
//                   className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-br from-green-600 to-green-700
//                        px-4 py-3.5 text-sm font-medium text-white shadow-lg
//                        transition-all duration-200 hover:from-blue-600 hover:to-blue-700
//                        disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div className="relative flex items-center justify-center gap-2">
//                     {isSubmitting ? (
//                       <>
//                         <svg
//                           className="animate-spin h-4 w-4"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           />
//                         </svg>
//                         <span>Submitting...</span>
//                       </>
//                     ) : (
//                       <>
//                         <span>Submit Report</span>
//                         <svg
//                           className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M14 5l7 7m0 0l-7 7m7-7H3"
//                           />
//                         </svg>
//                       </>
//                     )}
//                   </div>
//                 </button>
//               </>
//             )}
//           </div>
//         )}
//         <AlertDialog
//           open={showQuestionDialog}
//           onOpenChange={setShowQuestionDialog}
//         >
//           <AlertDialogContent className="max-w-md">
//             <AlertDialogHeader>
//               <AlertDialogTitle>Confirm Image</AlertDialogTitle>
//               <AlertDialogDescription>
//                 <div className="mt-4">
//                   <p className="text-gray-700 dark:text-gray-300">{question}</p>
//                 </div>
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter className="space-x-4">
//               <AlertDialogCancel onClick={() => handleQuestionResponse(false)}>
//                 No
//               </AlertDialogCancel>
//               <AlertDialogAction onClick={() => handleQuestionResponse(true)}>
//                 Yes
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>

//         {/* Description Preview Modal */}
//         <AlertDialog
//           open={showDescriptionModal}
//           onOpenChange={setShowDescriptionModal}
//         >
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Auto-Generated Description</AlertDialogTitle>
//               <AlertDialogDescription className="max-h-[60vh] overflow-y-auto">
//                 <div className="space-y-4">
//                   <p className="text-sm text-gray-700 dark:text-gray-300">
//                     {tempDescription}
//                   </p>
//                   <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                     Would you like to keep this description?
//                   </p>
//                 </div>
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel onClick={handleDiscardDescription}>
//                 Discard
//               </AlertDialogCancel>
//               <AlertDialogAction onClick={handleKeepDescription}>
//                 Keep Description
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </>
//     </form>
//   );
// }

import { useState, useCallback, useEffect, useRef } from "react";
import { LocationInput } from "./LocationInput";
import crypto from "crypto";
import toast from "react-hot-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface CustomJwtPayload {
  sub: string;
  role: string;
  phoneNumber: string;
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
  const [showFields, setShowFields] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Assume this gets called when AI generates the description
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (decodedToken) {
        formData.contactInfo = decodedToken.phoneNumber;
      }
    }
  }, [formData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [formData]);

  // Function to handle description confirmation
  const handleKeepDescription = () => {
    setFormData((prev) => ({ ...prev, description: tempDescription }));
    setShowDescriptionModal(false);
  };

  // Function to handle description discard
  const handleDiscardDescription = () => {
    setFormData((prev) => ({ ...prev, description: "" }));
    setShowDescriptionModal(false);
  };

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
          // Calculate a more reasonable font size (3% of image width instead of 6%)
          const fontSize = Math.min(
            Math.max(12, Math.floor(img.width * 0.03)),
            24 // Cap maximum font size at 24px
          );

          ctx.font = `${fontSize}px Arial`; // Removed 'bold' for better readability

          // Adjust padding based on image size
          const padding = Math.max(8, Math.floor(img.width * 0.01));

          // Position text at the bottom of the image
          const textX = padding;
          const textY = canvas.height - padding;

          // Measure text for background
          const textMetrics = ctx.measureText(location);
          const textHeight = fontSize;
          const backgroundHeight = textHeight + padding * 1.5;

          // Create a semi-transparent dark background
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(
            0,
            canvas.height - backgroundHeight,
            textMetrics.width + padding * 2,
            backgroundHeight
          );

          // Draw text in white with a thin black outline for better contrast
          ctx.lineWidth = Math.max(1, fontSize * 0.1);
          ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
          ctx.strokeText(location, textX, textY - padding * 0.5);

          // Draw text in white instead of red for better readability
          ctx.fillStyle = "white";
          ctx.fillText(location, textX, textY - padding * 0.5);
        }

        // Convert canvas back to base64
        resolve(canvas.toDataURL());
      };

      img.onerror = reject;
      img.src = base64Image;
    });
  };

  const isLocationValid =
    formData.location && coordinates.latitude && coordinates.longitude;

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

      if (data.error) {
        toast.error(data.error);
        setIsAnalyzing(false);
        return;
      }

      const analyzedImage = await addLocationToImage(
        base64 as string,
        formData.location
      );
      setImage(analyzedImage);
      setTempDescription(data.description);
      setQuestion(data.question);
      setShowQuestionDialog(true);

      if (data.title && data.description && data.reportType) {
        setFormData((prev) => ({
          ...prev,
          title: data.title,
          description: data.description,
          specificType: data.reportType,
        }));
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleQuestionResponse = (isYes: boolean) => {
    setShowQuestionDialog(false);
    if (isYes) {
      setShowFields(true);
      setShowDescriptionModal(true);
    } else {
      setImage(null);
      setFormData((prev) => ({
        ...prev,
        description: "",
        title: "",
        specificType: "",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location Input - Always shown first */}
      <div className="text-left">
        {" "}
        {/* Added text-left container */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
          Contact Number (Auto-filled)
        </label>
        <input
          type="text"
          value={formData.contactInfo}
          readOnly
          className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3.5
    text-gray-900 dark:text-gray-100 cursor-not-allowed"
        />
      </div>

      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location *
        </label>
        <LocationInput
          value={formData.location}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, location: value }));
          }}
          onCoordinatesChange={(lat, lng) =>
            setCoordinates({ latitude: lat, longitude: lng })
          }
          className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                 text-gray-900 dark:text-gray-100 transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
      {isLocationValid && formData.contactInfo && (
        <>
          {/* Add instruction text for both mobile and desktop */}
          <p className="mb-4 text-lg text-black bg-green-400 rounded-sm font-medium text-center">
            Please select the severity level of the incident below ↓
          </p>

          {/* Dropdown for mobile - keeping it simple */}
          <div className="md:hidden w-full">
            <select
              value={formData.incidentType || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  incidentType: e.target.value as ReportType,
                }))
              }
              className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white"
            >
              <option value="">Select Severity Type</option>
              <option value="Emergency">
                Emergency (Earthquake, Tsunami, Flood...)
              </option>
              <option value="NonEmergency">
                Non-Emergency (Drought, Heatwave...)
              </option>
              <option value="LowPriority">
                Low Priority (Light Rain, Wind...)
              </option>
              <option value="Critical">
                Critical (Cyclone, Thunderstorm...)
              </option>
            </select>
          </div>

          {/* Enhanced grid for larger screens */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {/* Emergency Button - Unchanged */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, incidentType: "Emergency" }))
              }
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                formData.incidentType === "Emergency"
                  ? "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-700 shadow-lg shadow-red-500/20 dark:shadow-red-900/30"
                  : "bg-white dark:bg-red-900/20 border-gray-200 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500/50 dark:hover:border-red-700/50"
              }`}
            >
              {formData.incidentType === "Emergency" && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
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
                </div>
                <span className="font-medium text-red-500 dark:text-red-400 text-lg">
                  Emergency
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Immediate Response Required
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  (Earthquake, Tsunami, Flood, Tornado, Wildfire...)
                </span>
              </div>
            </button>

            {/* Non-Emergency Button - Unchanged */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  incidentType: "NonEmergency",
                }))
              }
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                formData.incidentType === "NonEmergency"
                  ? "bg-orange-100 dark:bg-orange-900/30 border-orange-500 dark:border-orange-700 shadow-lg shadow-orange-500/20 dark:shadow-orange-900/30"
                  : "bg-white dark:bg-orange-900/20 border-gray-200 dark:border-orange-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500/50 dark:hover:border-orange-700/50"
              }`}
            >
              {formData.incidentType === "NonEmergency" && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full">
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
                </div>
                <span className="font-medium text-orange-500 dark:text-orange-400 text-lg">
                  Non-Emergency
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Moderate Urgency
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  (Drought, Heatwave, Heavy Rain...)
                </span>
              </div>
            </button>

            {/* Low Priority Button - Updated */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  incidentType: "LowPriority",
                }))
              }
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                formData.incidentType === "LowPriority"
                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30"
                  : "bg-white dark:bg-blue-900/20 border-gray-200 dark:border-blue-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500/50 dark:hover:border-blue-700/50"
              }`}
            >
              {formData.incidentType === "LowPriority" && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
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
                </div>
                <span className="font-medium text-blue-500 dark:text-blue-400 text-lg">
                  Low Priority
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Routine Monitoring
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  (Light Rain, Heavy Wind...)
                </span>
              </div>
            </button>

            {/* Critical Button - Updated */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, incidentType: "Critical" }))
              }
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                formData.incidentType === "Critical"
                  ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-700 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/30"
                  : "bg-white dark:bg-purple-900/20 border-gray-200 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500/50 dark:hover:border-purple-700/50"
              }`}
            >
              {formData.incidentType === "Critical" && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
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
                </div>
                <span className="font-medium text-purple-500 dark:text-purple-400 text-lg">
                  Critical
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Urgent Action Required
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  (Cyclone, Thunderstorm, Landslide, Pandemic...)
                </span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Image Upload - Shown after severity is selected */}
      {formData.incidentType && (
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
                <div className="w-full h-64 relative rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-fit"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                  Upload disaster scene image
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sky-500 font-medium">
                  Analyzing image...
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Fields - Only shown after image upload */}
      <>
        {image && (
          <div className="space-y-6">
            {showFields && (
              <>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Incident Type
                  </label>
                  <input
                    value={formData.specificType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specificType: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                         text-gray-900 dark:text-gray-100 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                    disabled
                  ></input>
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                        text-gray-900 dark:text-gray-100 transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                    disabled
                  />
                </div>

                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full min-h-24 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3.5
                        text-gray-900 dark:text-gray-100 transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                    placeholder="Please provide detailed information about the incident..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.specificType ||
                    !formData.title ||
                    !formData.description
                  }
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
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
              </>
            )}
          </div>
        )}
        <AlertDialog
          open={showQuestionDialog}
          onOpenChange={setShowQuestionDialog}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Image</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300">{question}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="space-x-4">
              <AlertDialogCancel onClick={() => handleQuestionResponse(false)}>
                No
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleQuestionResponse(true)}>
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Description Preview Modal */}
        <AlertDialog
          open={showDescriptionModal}
          onOpenChange={setShowDescriptionModal}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Auto-Generated Description</AlertDialogTitle>
              <AlertDialogDescription className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {tempDescription}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Would you like to keep this description?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardDescription}>
                Discard
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleKeepDescription}>
                Keep Description
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
      <div ref={bottomRef} />
    </form>
  );
}

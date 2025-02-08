// "use client";

// import { useState } from "react";
// import { Search, Loader, MapPin } from "lucide-react";
// import dynamic from "next/dynamic";
// import { Marker } from "react-map-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
// import Image from "next/image";

// const Map = dynamic(() => import("react-map-gl"), {
//   ssr: false,
// });

// interface ReportDetails {
//   longitude: number;
//   latitude: number;
//   id: string;
//   reportId: string;
//   description: string;
//   disasterType: string;
//   severity: string;
//   status: string;
//   location: string;
//   contactInfo: string;
//   imageUrl: string | null;
//   createdAt: string;
//   teamAssign: {
//     teamName: string;
//     team_id: string;
//     status: string;
//   } | null;
//   title: string | null;
//   reviewReport: {
//     id: string;
//     affectedPeople: string;
//     approved: boolean;
//     casualties: string;
//     detailedDescription: string;
//     numberOfPeopleRescued: string | null;
//     evacuationCentres: string;
//   };
// }

// export function ReportTracker() {
//   const [reportId, setReportId] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [reportDetails, setReportDetails] = useState<ReportDetails | null>(
//     null
//   );

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setReportDetails(null);
//     setLoading(true);

//     if (!reportId.trim()) {
//       setError("Please enter a report ID");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch reports");
//       }

//       const data = await response.json();

//       const matchedReport = data.find(
//         (report: ReportDetails) =>
//           report.reportId === reportId || report.id === reportId
//       );

//       if (!matchedReport) {
//         setError("Report not found. Please check the ID and try again.");
//         setLoading(false);
//         return;
//       }

//       if (matchedReport.location) {
//         // If location is coordinates (like "23.235789, 72.663040")
//         if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(matchedReport.location)) {
//           const [latitude, longitude] = matchedReport.location
//             .split(",")
//             .map(parseFloat);
//           matchedReport.latitude = latitude;
//           matchedReport.longitude = longitude;
//         }
//         // If location is an address and Mapbox token is available
//         else if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
//           try {
//             const geocodeResponse = await fetch(
//               `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//                 matchedReport.location
//               )}.json?access_token=${
//                 process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
//               }`
//             );

//             if (geocodeResponse.ok) {
//               const geocodeData = await geocodeResponse.json();
//               if (geocodeData.features && geocodeData.features.length > 0) {
//                 const [longitude, latitude] = geocodeData.features[0].center;
//                 matchedReport.longitude = longitude;
//                 matchedReport.latitude = latitude;
//               }
//             }
//           } catch (geocodeError) {
//             console.error("Geocoding failed", geocodeError);
//           }
//         }
//       }

//       setReportDetails(matchedReport);
//     } catch (error) {
//       console.error("Error fetching report", error);
//       setError("Unable to fetch reports. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   function getStatusColor(status: string): string {
//     if (!status) return "text-gray-300 dark:text-gray-400";

//     const colors: { [key: string]: string } = {
//       PENDING: "text-yellow-500 dark:text-yellow-400",
//       IN_PROGRESS: "text-blue-500 dark:text-blue-400",
//       COMPLETED: "text-green-500 dark:text-green-400",
//       REJECTED: "text-red-500 dark:text-red-400",
//     };
//     return (
//       colors[status.toUpperCase() as keyof typeof colors] ||
//       "text-gray-300 dark:text-gray-400"
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* Header Section */}
//       <div className="text-center mb-8">
//         <div className="inline-flex h-9 items-center mt-10 gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-900/20 px-4 text-sm text-emerald-600 dark:text-emerald-400">
//           <Search className="w-4 h-4" />
//           Track Your Report Status
//         </div>
//         <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
//           Track Your Report
//           <span className="block bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
//             Stay Informed
//           </span>
//         </h1>
//         <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
//           Enter your report ID to check the current status and updates
//         </p>
//       </div>

//       {/* Dynamic Layout Container */}
//       <div className="flex justify-center">
//         <div
//           className={`transition-all duration-300 ease-in-out ${
//             reportDetails
//               ? "w-full grid md:grid-cols-2 gap-8"
//               : "max-w-lg w-full"
//           }`}
//         >
//           {/* Form Section */}
//           <div
//             className={`bg-white dark:bg-gray-900 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full transition-all duration-300 shadow-lg ${
//               reportDetails ? "" : "mx-auto"
//             }`}
//           >
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="relative">
//                 <label
//                   htmlFor="reportId"
//                   className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
//                 >
//                   Report ID
//                 </label>
//                 <input
//                   type="text"
//                   id="reportId"
//                   value={reportId}
//                   onChange={(e) => setReportId(e.target.value)}
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl
//                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
//                          focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
//                   placeholder="Enter your report ID"
//                   disabled={loading}
//                 />
//               </div>

//               {error && (
//                 <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
//                   <svg
//                     className="h-5 w-5 flex-shrink-0"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                   {error}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-emerald-500 to-green-600
//                        text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700
//                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
//                        flex items-center justify-center space-x-2 shadow-lg"
//               >
//                 {loading ? (
//                   <Loader className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <Search className="w-5 h-5" />
//                 )}
//                 <span>{loading ? "Searching..." : "Track Report"}</span>
//               </button>
//             </form>
//           </div>

//           {/* Results Section */}
//           <div
//             className={`transition-all duration-300 ${
//               reportDetails
//                 ? "opacity-100 translate-x-0"
//                 : "opacity-0 translate-x-8 absolute"
//             }`}
//           >
//             {reportDetails && (
//               <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 h-full shadow-lg">
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
//                   <div className="h-2 w-2 rounded-full bg-emerald-500" />
//                   Report Details
//                 </h2>

//                 <div className="grid gap-4">
//                   <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Status
//                     </span>
//                     <span
//                       className={`font-medium ${getStatusColor(
//                         reportDetails.status
//                       )} px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700`}
//                     >
//                       {reportDetails.status}
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Assigned Team
//                     </span>
//                     <span className="text-gray-900 dark:text-white font-mono">
//                       {reportDetails?.teamAssign?.teamName ||
//                         "No team assigned"}
//                     </span>
//                   </div>

//                   <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1.5">
//                     <span className="text-gray-600 dark:text-gray-400 text-sm">
//                       Image
//                     </span>
//                     {reportDetails.imageUrl ? (
//                       <div className="mt-2">
//                         <Image
//                           src={reportDetails.imageUrl}
//                           alt="Report"
//                           className="rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
//                           width={500}
//                           height={300}
//                           layout="responsive"
//                         />
//                       </div>
//                     ) : (
//                       <p className="text-gray-900 dark:text-white text-sm">
//                         No image available for this report.
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Report ID
//                     </span>
//                     <span className="text-gray-900 dark:text-white font-mono">
//                       {reportDetails.reportId || reportDetails.id}
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Submitted On
//                     </span>
//                     <span className="text-gray-900 dark:text-white">
//                       {new Date(reportDetails.createdAt).toLocaleDateString(
//                         undefined,
//                         {
//                           year: "numeric",
//                           month: "long",
//                           day: "numeric",
//                         }
//                       )}
//                     </span>
//                   </div>

//                   <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1.5">
//                     <span className="text-gray-600 dark:text-gray-400 text-sm">
//                       Title
//                     </span>
//                     <span className="text-gray-900 dark:text-white block font-medium">
//                       {reportDetails.title}
//                     </span>
//                   </div>

//                   <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1.5">
//                     <span className="text-gray-600 dark:text-gray-400 text-sm">
//                       Location
//                     </span>
//                     <span className="text-gray-900 dark:text-white block font-medium">
//                       {reportDetails.location}
//                     </span>
//                   </div>

//                   {reportDetails?.location && (
//                     <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1.5">
//                       <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
//                         <MapPin className="w-4 h-4" /> Location Map
//                       </span>
//                       <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
//                         {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? (
//                           <div className="w-full h-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4">
//                             Mapbox token is not configured. Please set
//                             NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
//                           </div>
//                         ) : reportDetails.latitude &&
//                           reportDetails.longitude ? (
//                           <Map
//                             initialViewState={{
//                               latitude: reportDetails.latitude,
//                               longitude: reportDetails.longitude,
//                               zoom: 14,
//                             }}
//                             style={{ width: "100%", height: "100%" }}
//                             mapStyle="mapbox://styles/mapbox/dark-v11"
//                             mapboxAccessToken={
//                               process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
//                             }
//                           >
//                             <Marker
//                               longitude={reportDetails.longitude}
//                               latitude={reportDetails.latitude}
//                             >
//                               <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
//                             </Marker>
//                           </Map>
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4">
//                             Unable to resolve location coordinates
//                           </div>
//                         )}
//                       </div>
//                       <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
//                         {reportDetails.location}
//                       </p>
//                     </div>
//                   )}

//                   <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1.5">
//                     <span className="text-gray-600 dark:text-gray-400 text-sm">
//                       Description
//                     </span>
//                     <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
//                       {reportDetails.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useMemo, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  AlertTriangle,
  MoreVertical,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Map = dynamic(() => import("react-map-gl"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  ),
});
const Marker = dynamic(() => import("react-map-gl").then((mod) => mod.Marker), {
  ssr: false,
});

type StatusType = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "ALL";
type TimeRangeType = "today" | "week" | "month" | "all";
type SortField = "createdAt" | "severity" | "status" | "title";
type SortDirection = "asc" | "desc";

interface Report {
  id: string;
  reportId: string;
  title: string;
  status: Exclude<StatusType, "ALL">;
  createdAt: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  disasterType: string;
  severity: string;
  imageUrl: string | null;
}

interface Filters {
  status: StatusType;
  timeRange: TimeRangeType;
  search: string;
}

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface CustomJwtPayload {
  sub: string;
  id: string;
  phoneNumber: string;
}
const MobileReportRow = ({
  report,
  statusColors,
  onExpand,
}: {
  report: Report;
  statusColors: Record<Exclude<StatusType, "ALL">, string>;
  severityColors: Record<string, string>;
  onExpand: () => void;
}) => {
  return (
    <div className="md:hidden bg-white dark:bg-black/90 border-b">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={onExpand}
      >
        <div className="flex-1 pr-4">
          <div className="font-medium text-lg mb-1 truncate">
            {report.title}
          </div>
          <Badge className={`${statusColors[report.status]} text-md`}>
            {report.status.replace("_", " ")}
          </Badge>
        </div>
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </div>
    </div>
  );
};

const ReportDetails = ({
  report,
  severityColors,
}: {
  report: Report;
  statusColors: Record<Exclude<StatusType, "ALL">, string>;
  severityColors: Record<string, string>;
}) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-lg text-gray-500">Severity</label>
          <div
            className={
              severityColors[report.severity as keyof typeof severityColors]
            }
          >
            {report.severity}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-lg text-gray-500">Report ID</label>
          <div className="font-mono text-lg break-words">{report.reportId}</div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-lg text-gray-500">Description</label>
        <p className="text-lg md:text-base text-gray-900 dark:text-gray-100">
          {report.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-lg text-gray-500">Location</label>
          <div className="h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
            <Map
              initialViewState={{
                latitude: report.latitude,
                longitude: report.longitude,
                zoom: 13,
              }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
              <Marker longitude={report.longitude} latitude={report.latitude}>
                <div className="bg-red-500 w-4 h-4 rounded-full border-2 border-white" />
              </Marker>
            </Map>
          </div>
          <p className="text-lg text-gray-600 flex items-center">
            <MapPin className="inline h-4 w-4 mr-1" />
            {report.location}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-lg text-gray-500">Evidence</label>
          {report.imageUrl ? (
            <div className="h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={report.imageUrl}
                alt="Report Evidence"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
                No image available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors = {
    PENDING:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30",
    IN_PROGRESS:
      "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30",
    COMPLETED:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30",
    REJECTED:
      "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200 border border-red-200 dark:border-red-500/30",
  };

  return colors[status as keyof typeof colors] || colors.PENDING;
};

const DesktopReportRow = ({
  report,
  statusColors,
  severityColors,
  expandedReportId,
  setExpandedReportId,
}: {
  report: Report;
  statusColors: Record<Exclude<StatusType, "ALL">, string>;
  severityColors: Record<string, string>;
  expandedReportId: string | null;
  setExpandedReportId: (id: string | null) => void;
  SortIcon: React.ComponentType<{ field: SortField }>;
  handleSort: (field: SortField) => void;
}) => {
  return (
    <React.Fragment key={report.id}>
      <TableRow
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hidden md:table-row"
        onClick={() =>
          setExpandedReportId(expandedReportId === report.id ? null : report.id)
        }
      >
        <TableCell>
          {expandedReportId === report.id ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium text-lg">{report.title}</TableCell>
        <TableCell className="text-lg flex flex-row items-center gap-2 mt-4">
          <Activity className={`w-4 h-4 ${getStatusColor(report.status)}`} />
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              report.status
            )} dark:bg-slate-700 whitespace-nowrap`}
          >
            {report.status}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`${
              severityColors[report.severity as keyof typeof severityColors]
            } text-lg`}
          >
            {report.severity}
          </span>
        </TableCell>
        <TableCell className="text-lg">
          {new Date(report.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-lg">{report.location}</span>
          </div>
        </TableCell>
      </TableRow>
      {expandedReportId === report.id && (
        <TableRow className="hidden md:table-row">
          <TableCell colSpan={6} className="p-0">
            <ReportDetails
              report={report}
              statusColors={statusColors}
              severityColors={severityColors}
            />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

export default function EnhancedReports() {
  // Add client-side only state
  const [isMounted, setIsMounted] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [mobileExpandedReportId, setMobileExpandedReportId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    timeRange: "all",
    search: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
  });
  const [reports, setReport] = useState<Report[]>([]);

  // const token = localStorage?.getItem("token") || "";
  // const decodedToken = jwtDecode<CustomJwtPayload>(token || "");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (decodedToken) {
        handleReports(decodedToken.id);
      }
    }
  }, []);

  const statusColors: Record<Exclude<StatusType, "ALL">, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-700 text-sm dark:text-yellow-400",
    IN_PROGRESS: "bg-blue-500/10 text-blue-700 text-sm dark:text-blue-400",
    COMPLETED: "bg-green-500/10 text-green-700 text-sm dark:text-green-400",
    REJECTED: "bg-red-500/10 text-red-700 text-sm dark:text-red-400",
  };

  const severityColors = {
    Emergency: "text-red-600 dark:text-red-400",
    NonEmergency: "text-orange-600 dark:text-orange-400",
    LowPriority: "text-blue-600 dark:text-blue-400",
    Critical: "text-purple-600 dark:text-purple-400",
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedReports = useMemo(() => {
    if (!isMounted) return reports; // Return unfiltered reports during SSR

    const filtered = reports.filter((report) => {
      const matchesStatus =
        filters.status === "ALL" || report.status === filters.status;
      const matchesSearch =
        !filters.search ||
        report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.search.toLowerCase());

      let matchesTime = true;
      const reportDate = new Date(report.createdAt);
      const now = new Date();

      switch (filters.timeRange) {
        case "today":
          matchesTime = reportDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesTime = reportDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesTime = reportDate >= monthAgo;
          break;
      }
      return matchesStatus && matchesSearch && matchesTime;
    });

    return filtered.sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      switch (sortConfig.field) {
        case "createdAt":
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            direction
          );
        case "severity":
          return a.severity.localeCompare(b.severity) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        case "title":
          return a.title.localeCompare(b.title) * direction;
        default:
          return 0;
      }
    });
  }, [reports, filters, sortConfig, isMounted]);

  const handleReports = async (userId: string) => {
    const token = localStorage.getItem("token");
    console.log(userId);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/fetchAllReportOfUsers/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    setReport(data);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field)
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };
  if (!isMounted) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-black/50">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Your All Reports
            </h1>
            <p className="text-lg md:text-base text-gray-600 dark:text-gray-400 mt-2">
              Here you can track all your reports and their status
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="md:hidden"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Badge
              variant="outline"
              className="px-5 md:px-3 py-3 text-sm md:text-lg lg:text-lg"
            >
              Total Reports: {filteredAndSortedReports.length}
            </Badge>
          </div>
        </div>
        <Card
          className={`md:block ${
            isFilterVisible ? "block" : "hidden"
          } dark:bg-black/90`}
        >
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value: StatusType) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.timeRange}
                onValueChange={(value: TimeRangeType) =>
                  setFilters((prev) => ({ ...prev, timeRange: value }))
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="min-w-[800px] hidden md:block dark:bg-black/90">
              <Table>
                <TableHeader>{/* ... existing table header ... */}</TableHeader>
                <TableBody>
                  {filteredAndSortedReports.map((report) => (
                    <DesktopReportRow
                      key={report.id}
                      report={report}
                      statusColors={statusColors}
                      severityColors={severityColors}
                      expandedReportId={expandedReportId}
                      setExpandedReportId={setExpandedReportId}
                      SortIcon={SortIcon}
                      handleSort={handleSort}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden">
              {filteredAndSortedReports.map((report) => (
                <React.Fragment key={report.id}>
                  <MobileReportRow
                    report={report}
                    statusColors={statusColors}
                    severityColors={severityColors}
                    onExpand={() =>
                      setMobileExpandedReportId(
                        mobileExpandedReportId === report.id ? null : report.id
                      )
                    }
                  />
                  {mobileExpandedReportId === report.id && (
                    <div className="md:hidden p-4 bg-gray-50 dark:bg-gray-800/50">
                      <ReportDetails
                        report={report}
                        statusColors={statusColors}
                        severityColors={severityColors}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

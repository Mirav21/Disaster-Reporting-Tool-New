// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Award,
//   Clock,
//   MapPin,
//   User,
//   Users,
//   FileText,
//   Check,
//   XCircle,
//   RefreshCw,
//   Search,
//   MoreHorizontal,
//   Bell,
//   LogOut,
//   ChevronRight,
//   AlertTriangle,
//   AlertCircle,
//   UserCheck,
//   Building,
// } from "lucide-react";
// import Link from "next/link";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { jwtDecode } from "jwt-decode";
// // import { jwtDecode } from "jwt-decode";

// // Define the new interface based on the API response
// interface DisasterReport {
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

// interface Team {
//   team_id: string;
//   teamName: string;
//   status: string;
// }

// interface CustomJwtPayload {
//   sub: string;
//   role: string;
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [reports, setReports] = useState<DisasterReport[]>([]);
//   const [filter, setFilter] = useState<string>("ALL");
//   const [typeFilter, setTypeFilter] = useState<string>("ALL");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(
//     null
//   );
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showSOSModal, setShowSOSModal] = useState(false);
//   const [sosRadius, setSOSRadius] = useState(5);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const [sosMessage] = useState(textareaRef.current?.value || "");

//   const [isSendingAlert, setIsSendingAlert] = useState(false);
//   const [reload, setReload] = useState(false);

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   useEffect(() => {
//     fetchReports();
//     setReload(false);
//   }, [reload]);

//   useEffect(() => {
//     setAccessToken(localStorage.getItem("token") || "");
//     if (accessToken) {
//       const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
//       if (decodedToken) {
//         const Role = decodedToken.role.toLowerCase();
//         setRole(Role);
//       }
//     }
//   }, [accessToken]);

//   const formatDate = (dateString: string): string => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "Invalid Date";
//     }
//   };

//   const [teams, setTeams] = useState<Team[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState("");

//   useEffect(() => {
//     fetchTeams();
//   }, []);

//   const fetchTeams = () => {
//     const token = localStorage.getItem("token");
//     axios
//       .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team_assign/getAllTeams`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         const availableTeams = response.data.filter(
//           (team: Team) => team.status !== "BUSY"
//         );
//         setTeams(availableTeams);
//       })
//       .catch((error) => console.error("Error fetching teams:", error));
//   };

//   interface AssignTeamResponse {
//     reportId: string;
//     teamId: string;
//   }

//   const handleAssignTeam = async (reportId: string): Promise<void> => {
//     const token = localStorage.getItem("token");

//     if (!selectedTeam) {
//       toast.error("Please select a team to assign.");
//       return;
//     }

//     console.log("Assigning team:", selectedTeam, "to report:", reportId);

//     try {
//       await axios.put<AssignTeamResponse>(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/assign-team`,
//         {
//           reportId,
//           teamId: selectedTeam,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setSelectedReport(null);
//       toast.success("Team assigned successfully");
//       fetchReports();
//     } catch (error) {
//       console.error("Error assigning team:", error);
//       toast.error("Failed to assign team");
//     }
//   };

//   const signOut = async () => {
//     const token = localStorage.getItem("token");

//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/logout`,
//       { token: token }
//     );

//     if (response.status === 200) {
//       const Theme = localStorage.getItem("theme");
//       localStorage.clear();
//       localStorage.setItem("theme", Theme as string);
//       setIsSidebarOpen(false);
//     }
//     router.push("/auth/signin");
//   };

//   const fetchReports = async () => {
//     const token = localStorage.getItem("token");
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const data: DisasterReport[] = response.data;

//       // Define the sort order
//       const statusOrder = ["PENDING", "IN_PROGRESS", "COMPLETED"];

//       // Sort the data based on status
//       const sortedData = data.sort((a, b) => {
//         const statusA = statusOrder.indexOf(a.status);
//         const statusB = statusOrder.indexOf(b.status);

//         if (statusA !== statusB) {
//           return statusA - statusB;
//         }

//         return (
//           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         );
//       });

//       setReports(sortedData);
//     } catch (error) {
//       console.error("Error fetching reports:", error);
//       setReports([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateReportStatus = async (reportId: string, newStatus: string) => {
//     const token = localStorage.getItem("token");
//     console.log(token);
//     console.log("Updating report status:", reportId, newStatus);
//     try {
//       const endpoint =
//         newStatus === "COMPLETED"
//           ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/completed/${reportId}`
//           : `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/review/${reportId}`;

//       await axios.put(
//         endpoint,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//         {}
//       );
//       setReload(true);
//       setSelectedReport(null);
//     } catch (error) {
//       console.error("Error updating report:", error);
//     }
//   };

//   const filteredReports = reports.filter((report) => {
//     const statusMatch = filter === "ALL" || report.status === filter;
//     const typeMatch =
//       typeFilter === "ALL" || report.disasterType === typeFilter;
//     const searchMatch =
//       report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       report.location.toLowerCase().includes(searchTerm.toLowerCase());
//     return statusMatch && typeMatch && searchMatch;
//   });

//   const getStatusIcon = (status: string) => {
//     const icons = {
//       PENDING: <Clock className="text-amber-400" />,
//       IN_PROGRESS: <RefreshCw className="text-blue-400 animate-spin" />,
//       RESOLVED: <Check className="text-emerald-400" />,
//       DISMISSED: <XCircle className="text-neutral-400" />,
//     };
//     return icons[status as keyof typeof icons] || icons.PENDING;
//   };

//   const getStatusColor = (status: string) => {
//     const colors = {
//       PENDING:
//         "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30",
//       IN_PROGRESS:
//         "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30",
//       COMPLETED:
//         "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30",
//       DISMISSED:
//         "bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-200 border border-gray-200 dark:border-neutral-500/30",
//     };

//     return colors[status as keyof typeof colors] || colors.PENDING;
//   };

//   const sendSOSAlert = async () => {
//     if (!selectedReport) return;

//     setIsSendingAlert(true);
//     try {
//       const response = await fetch("/api/reports/sos-alert", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           reportId: selectedReport.id,
//           radius: sosRadius,
//           message: sosMessage,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setShowSOSModal(false);
//       }
//     } catch (error) {
//       console.error("Error sending SOS alert:", error);
//     } finally {
//       setIsSendingAlert(false);
//     }
//   };

//   const SOSAlertSection = () => (
//     <div className="bg-red-500/10 dark:bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20 dark:border-red-500/20 bg-red-100 border-red-300">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <AlertTriangle className="w-4 h-4 dark:text-red-400 text-red-600" />
//           <h4 className="dark:text-red-400 text-red-600 text-sm">
//             Emergency Alert
//           </h4>
//         </div>
//         <button
//           onClick={() => setShowSOSModal(true)}
//           className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
//         >
//           <Bell className="w-4 h-4" />
//           Send SOS Alert
//         </button>
//       </div>
//       <p className="text-neutral-600 dark:text-neutral-400 text-sm">
//         Send emergency alerts to all users in the affected area.
//       </p>
//     </div>
//   );

//   const SOSAlertModal = () =>
//     showSOSModal && (
//       <div className="fixed inset-0 bg-gray-800/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
//         <div className="w-full max-w-md p-6 space-y-4 rounded-xl border bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
//               Send Emergency Alert
//             </h3>
//             <button
//               onClick={() => setShowSOSModal(false)}
//               className="p-2 rounded-lg text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-gray-800 transition-colors"
//             >
//               <XCircle className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">
//                 Alert Radius (km)
//               </label>
//               <input
//                 type="number"
//                 value={sosRadius}
//                 onChange={(e) => setSOSRadius(Number(e.target.value))}
//                 min="1"
//                 max="50"
//                 className="w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">
//                 Alert Message
//               </label>
//               <textarea
//                 ref={textareaRef}
//                 placeholder="Enter emergency alert message..."
//                 className="w-full h-32 px-4 py-2 rounded-lg border resize-none bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white"
//               />
//             </div>

//             <div className="p-4 rounded-lg border bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20">
//               <p className="text-sm text-red-600 dark:text-red-400">
//                 ⚠️ This will send an emergency alert to all users within{" "}
//                 {sosRadius}km of the incident location.
//               </p>
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={() => setShowSOSModal(false)}
//                 className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-800 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={sendSOSAlert}
//                 disabled={isSendingAlert}
//                 className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
//               >
//                 {isSendingAlert ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 animate-spin" />
//                     Sending...
//                   </>
//                 ) : (
//                   <>
//                     <Bell className="w-4 h-4" />
//                     Send Alert
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   //

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen dark:bg-black bg-gray-100">
//         <div className="flex flex-col items-center gap-4">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 dark:border-neutral-800 border-gray-300 border-t-blue-500"></div>
//           <p className="dark:text-neutral-400 text-gray-600">
//             Loading reports...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 text-white flex-1 flex-col md:flex-row lg:flex-row">
//       {/* Mobile Header */}
//       <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
//         <div className="p-2 hover:bg-neutral-800 rounded-lg"></div>
//         <h1 className="text-xl font-bold text-white bg-clip-text">
//           Admin Panel
//         </h1>
//         <div className="w-6" /> {/* Spacer for alignment */}
//       </div>

//       <div className="flex">
//         {/* Overlay */}
//         {isSidebarOpen && (
//           <div
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//             onClick={() => setIsSidebarOpen(false)}
//           />
//         )}

//         <aside
//           className={`
//     ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
//     md:translate-x-0
//     fixed md:relative
//     inset-y-0 left-0
//     w-64 bg-gray-100 dark:bg-neutral-900/50 backdrop-blur-md
//     border-r border-gray-200 dark:border-neutral-800
//     flex flex-col
//     z-30
//     transition-transform duration-200 ease-in-out
//   `}
//         >
//           <div className="hidden lg:block p-6 border-b border-gray-200 dark:border-neutral-800">
//             <h1 className="text-2xl font-bold text-black dark:text-white bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text">
//               Admin Panel
//             </h1>
//           </div>

//           <nav className="flex-grow">
//             <div className="px-4 py-2 text-xs font-medium text-black dark:text-neutral-400 uppercase tracking-wider">
//               Main Menu
//             </div>
//             <ul className="space-y-1">
//               <li>
//                 <Link
//                   href="/dashboard"
//                   className="px-4 py-3 mx-2 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-400/10 cursor-pointer flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-colors group"
//                 >
//                   <FileText className="w-5 h-5" />
//                   Reports
//                   <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </Link>
//               </li>
//             </ul>
//           </nav>

//           <div className="p-4 border-t border-gray-200 dark:border-neutral-800 mt-auto">
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-400 dark:hover:bg-neutral-800 transition-colors group"
//               >
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
//                   <User className="w-5 h-5 text-white" />
//                 </div>
//                 <div className="flex-grow text-left">
//                   <p className="text-sm text-black dark:text-white font-medium truncate">
//                     Admin / Moderator
//                   </p>
//                   <p className="text-xs text-black dark:text-neutral-400">
//                     {localStorage.getItem("username")}
//                   </p>
//                 </div>
//                 <MoreHorizontal className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
//               </button>

//               {showUserMenu && (
//                 <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-xl">
//                   <button
//                     onClick={() => signOut()}
//                     className="w-full flex items-center gap-2 px-4 py-3 text-black dark:text-neutral-400 hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors rounded-lg"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Sign Out
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 p-4 lg:p-8 bg-white dark:bg-neutral-950">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Header */}
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//               <div>
//                 <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-neutral-50">
//                   Reports Dashboard
//                 </h1>
//                 <p className="text-gray-600 dark:text-neutral-400">
//                   Manage and track all reported incidents
//                 </p>
//               </div>
//             </div>
//             {/* Search and Filters */}
//             <div className="flex flex-col lg:flex-row gap-4">
//               <div className="flex-grow relative">
//                 <input
//                   type="text"
//                   placeholder="Search reports..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
//                 />
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
//               </div>
//             </div>
//             {/* Pending Reports Section */}
//             <div className="flex justify-center items-center">
//               <h1 className="text-gray-900 dark:text-neutral-100 text-xl lg:text-2xl">
//                 Pending Reports
//               </h1>
//             </div>
//             {/* Reports Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
//               {filteredReports.filter((report) => report.reviewReport == null)
//                 .length > 0 ? (
//                 filteredReports.map((report) =>
//                   report.reviewReport == null ? (
//                     <div
//                       key={report.id}
//                       onClick={() => setSelectedReport(report)}
//                       className={`group bg-white dark:bg-neutral-900 rounded-xl p-4 lg:p-6 border ${
//                         selectedReport?.id === report.id
//                           ? "border-blue-500/50 ring-1 ring-blue-500/30"
//                           : "border-gray-200 border-[2px] dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
//                       } transition-all cursor-pointer hover:transform hover:scale-[1.01] hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-neutral-900/50`}
//                     >
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                           {getStatusIcon(report.status)}
//                           <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-neutral-100 flex-grow truncate">
//                             {report.disasterType} - {report.reportId}
//                           </h2>
//                           <span
//                             className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
//                               report.status
//                             )}`}
//                           >
//                             {report.status}
//                           </span>
//                         </div>

//                         <p className="text-gray-600 dark:text-neutral-400 text-sm line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-neutral-300 transition-colors">
//                           {report.description}
//                         </p>

//                         <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm text-gray-500 dark:text-neutral-500">
//                           <div className="flex items-center gap-2">
//                             <User className="w-4 h-4" />
//                             <span>{report.contactInfo || "Anonymous"}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Clock className="w-4 h-4" />
//                             <span>{formatDate(report.createdAt)}</span>
//                           </div>
//                           {report.location && (
//                             <div className="flex items-center gap-2">
//                               <MapPin className="w-4 h-4" />
//                               <span className="truncate">
//                                 {report.location}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ) : null
//                 )
//               ) : (
//                 <div className="flex items-center justify-center col-span-1 lg:col-span-2 h-10">
//                   <h4 className="text-gray-500 dark:text-neutral-500 text-md">
//                     No pending reports
//                   </h4>
//                 </div>
//               )}
//             </div>

//             {role === "admin" && (
//               <>
//                 <div className="flex justify-center items-center">
//                   <h1 className="text-gray-900 dark:text-neutral-100 text-2xl mt-20">
//                     Reviewed Reports
//                   </h1>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {filteredReports.filter((report) => report.reviewReport)
//                     .length > 0 ? (
//                     filteredReports.map(
//                       (report) =>
//                         report.reviewReport && (
//                           <div
//                             key={report.id}
//                             onClick={() => setSelectedReport(report)}
//                             className={`group bg-white dark:bg-neutral-900 rounded-xl p-6 border ${
//                               selectedReport?.id === report.id
//                                 ? "border-blue-500/50 ring-1 ring-blue-500/30"
//                                 : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
//                             } transition-all cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-xl`}
//                           >
//                             <div className="space-y-4">
//                               <div className="flex items-center gap-3">
//                                 {getStatusIcon(report.status)}
//                                 <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 flex-grow truncate">
//                                   {report.disasterType} - {report.reportId}
//                                 </h2>
//                                 <span
//                                   className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
//                                     "COMPLETED"
//                                   )}`}
//                                 >
//                                   Reviewed
//                                 </span>
//                                 <span
//                                   className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
//                                     report.status
//                                   )}`}
//                                 >
//                                   {report.status}
//                                 </span>
//                               </div>

//                               <p className="text-gray-600 dark:text-neutral-400 text-sm line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-neutral-300 transition-colors">
//                                 {report.description}
//                               </p>

//                               <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-400">
//                                 <div className="flex items-center gap-2">
//                                   <User className="w-4 h-4" />
//                                   <span>
//                                     {report.contactInfo || "Anonymous"}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <Clock className="w-4 h-4" />
//                                   <span>{formatDate(report.createdAt)}</span>
//                                 </div>
//                                 {report.location && (
//                                   <div className="flex items-center gap-2">
//                                     <MapPin className="w-4 h-4" />
//                                     <span>{report.location}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         )
//                     )
//                   ) : (
//                     <div className="flex items-center justify-center col-span-2 h-10">
//                       <h4 className="text-gray-500 dark:text-neutral-400 text-md">
//                         No reports have been reviewed.
//                       </h4>
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Empty State */}
//             {filteredReports.length === 0 && (
//               <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
//                 <FileText className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-neutral-500" />
//                 <p className="text-lg text-gray-600 dark:text-neutral-400">
//                   No reports found matching the selected filters.
//                 </p>
//                 <button
//                   onClick={() => {
//                     setFilter("ALL");
//                     setTypeFilter("ALL");
//                     setSearchTerm("");
//                   }}
//                   className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}

//             {/* Report Details Sidebar */}
//             {selectedReport && (
//               <div className="fixed inset-y-0 right-0 w-full lg:w-[480px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-neutral-800 shadow-2xl z-[60] overflow-y-auto">
//                 <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 p-4 lg:p-6 flex justify-between items-center">
//                   <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
//                     Report Details
//                   </h2>
//                   <button
//                     onClick={() => setSelectedReport(null)}
//                     className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white transition-colors"
//                   >
//                     <XCircle className="w-6 h-6" />
//                   </button>
//                 </div>

//                 {/* Report Details Content */}
//                 <div className="p-4 lg:p-6 space-y-6 backdrop-blur-sm">
//                   <div className="space-y-4">
//                     <div className="flex justify-between items-start">
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-[0]">
//                         {selectedReport.disasterType}
//                       </h3>
//                       <div
//                         className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-2 z-[0] ${getStatusColor(
//                           selectedReport.status
//                         )}`}
//                       >
//                         {getStatusIcon(selectedReport.status)}
//                         {selectedReport.status.replace("_", " ")}
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                       <h4 className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
//                         Description
//                       </h4>
//                       <p className="text-gray-900 dark:text-white">
//                         {selectedReport.description}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Award className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
//                           <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
//                             Type
//                           </h4>
//                         </div>
//                         <p className="text-gray-900 dark:text-white">
//                           {selectedReport.disasterType.replace("_", " ")}
//                         </p>
//                       </div>

//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <MapPin className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
//                           <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
//                             Location
//                           </h4>
//                         </div>
//                         <p className="text-gray-900 dark:text-white">
//                           {selectedReport.location || "N/A"}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Additional sections with similar theming */}
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Clock className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
//                           <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
//                             Created At
//                           </h4>
//                         </div>
//                         <p className="text-gray-900 dark:text-white">
//                           {new Date(
//                             selectedReport.createdAt
//                           ).toLocaleDateString()}{" "}
//                           {new Date(
//                             selectedReport.createdAt
//                           ).toLocaleTimeString()}
//                         </p>
//                       </div>
//                     </div>

//                     {selectedReport.imageUrl && (
//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <h4 className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
//                           Attached Image
//                         </h4>
//                         <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700">
//                           <img
//                             src={selectedReport.imageUrl}
//                             alt="Report Attachment"
//                             className="w-full h-auto object-cover transition-transform hover:scale-105"
//                           />
//                         </div>
//                       </div>
//                     )}

//                     <SOSAlertSection />

//                     {/* Team Assignment Section */}
//                     {selectedReport.status === "IN_PROGRESS" &&
//                     !selectedReport.reviewReport &&
//                     !selectedReport.teamAssign ? (
//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <User className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
//                           <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
//                             Assigned Team
//                           </h4>
//                         </div>
//                         <div className="space-y-2">
//                           {teams.length > 0 ? (
//                             <>
//                               <select
//                                 value={selectedTeam}
//                                 onChange={(e) =>
//                                   setSelectedTeam(e.target.value)
//                                 }
//                                 className="w-full bg-white dark:bg-neutral-700 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-600 rounded-lg px-4 py-2"
//                               >
//                                 <option value="">Select a team</option>
//                                 {teams.map((team) => (
//                                   <option
//                                     key={team.team_id}
//                                     value={team.team_id}
//                                   >
//                                     {team.teamName}
//                                   </option>
//                                 ))}
//                               </select>
//                               <button
//                                 onClick={() =>
//                                   handleAssignTeam(selectedReport.id)
//                                 }
//                                 className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
//                               >
//                                 Assign Team
//                               </button>
//                             </>
//                           ) : (
//                             <p className="text-gray-500 dark:text-neutral-400 text-sm">
//                               No team available
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <User className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
//                           <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
//                             Assigned Team
//                           </h4>
//                         </div>
//                         <p className="text-gray-900 dark:text-white">
//                           {selectedReport.teamAssign?.teamName ||
//                             "No Team Assigned"}
//                         </p>
//                       </div>
//                     )}

//                     {/* Review Section */}
//                     {selectedReport.reviewReport && (
//                       <>
//                         <div className="flex justify-between items-center text-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-b border-gray-200 dark:border-neutral-800 -mx-6 p-6">
//                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                             Review Section
//                           </h2>
//                         </div>

//                         <div className="backdrop-blur-md py-3">
//                           <div className="space-y-5">
//                             {/* Stats Grid */}
//                             <div className="grid grid-cols-2 gap-4">
//                               <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
//                                 <CardContent className="p-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <Users className="w-4 h-4 text-blue-400" />
//                                     <span className="text-gray-500 dark:text-neutral-400 text-sm">
//                                       Affected People
//                                     </span>
//                                   </div>
//                                   <p className="text-xl font-bold text-green-500">
//                                     {selectedReport.reviewReport.affectedPeople}
//                                   </p>
//                                 </CardContent>
//                               </Card>

//                               <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
//                                 <CardContent className="p-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <AlertCircle className="w-4 h-4 text-red-400" />
//                                     <span className="text-neutral-400 dark:text-neutral-400 text-sm">
//                                       Casualties
//                                     </span>
//                                   </div>
//                                   <p className="text-xl font-bold text-green-500">
//                                     {selectedReport.reviewReport.casualties}
//                                   </p>
//                                 </CardContent>
//                               </Card>

//                               <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
//                                 <CardContent className="p-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <UserCheck className="w-4 h-4 text-green-400" />
//                                     <span className="text-neutral-400 dark:text-neutral-400 text-sm">
//                                       People Rescued
//                                     </span>
//                                   </div>
//                                   <p className="text-xl font-bold text-green-500">
//                                     {selectedReport.reviewReport
//                                       .numberOfPeopleRescued || "0"}
//                                   </p>
//                                 </CardContent>
//                               </Card>

//                               <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
//                                 <CardContent className="p-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <Building className="w-4 h-4 text-purple-400" />
//                                     <span className="text-neutral-400 dark:text-neutral-400 text-sm">
//                                       Evacuation Centers
//                                     </span>
//                                   </div>
//                                   <p className="text-xl font-bold text-green-500">
//                                     {
//                                       selectedReport.reviewReport
//                                         .evacuationCentres
//                                     }
//                                   </p>
//                                 </CardContent>
//                               </Card>
//                             </div>

//                             {/* Detailed Description */}
//                             <Alert className="bg-neutral-800/30 border-neutral-700">
//                               <AlertDescription className="text-neutral-200">
//                                 {
//                                   selectedReport.reviewReport
//                                     .detailedDescription
//                                 }
//                               </AlertDescription>
//                             </Alert>
//                           </div>
//                         </div>
//                       </>
//                     )}

//                     <div className="sticky bottom-0 border-t p-5 -m-6 dark:bg-neutral-900/95 bg-white/95 backdrop-blur-xl dark:border-neutral-800 border-neutral-200">
//                       <div className="flex gap-3 w-full">
//                         <div className="flex-2">
//                           {selectedReport.reviewReport &&
//                             selectedReport.status === "IN_PROGRESS" && (
//                               <button
//                                 value="COMPLETED"
//                                 onClick={() =>
//                                   updateReportStatus(
//                                     selectedReport.id,
//                                     "COMPLETED"
//                                   )
//                                 }
//                                 className="w-full appearance-none dark:hover:bg-neutral-700 hover:bg-neutral-100
//                        dark:bg-neutral-800 bg-neutral-50
//                        dark:border-neutral-700 border-neutral-200
//                        dark:text-white text-neutral-900
//                        rounded-lg px-4 py-2
//                        focus:ring-2 focus:ring-blue-500/20
//                        transition-all border"
//                               >
//                                 Mark as COMPLETED
//                               </button>
//                             )}

//                           {selectedReport.reviewReport === null &&
//                             selectedReport.status === "PENDING" &&
//                             ["admin", "moderator"].includes(
//                               (role?.toLowerCase() as "admin" | "moderator") ||
//                                 "guest"
//                             ) && (
//                               <button
//                                 value="IN_PROGRESS"
//                                 onClick={() =>
//                                   updateReportStatus(
//                                     selectedReport.id,
//                                     "IN_PROGRESS"
//                                   )
//                                 }
//                                 className="w-full appearance-none dark:hover:bg-neutral-700 hover:bg-neutral-100
//                          dark:bg-neutral-800 bg-neutral-50
//                          dark:border-neutral-700 border-neutral-200
//                          dark:text-white text-neutral-900
//                          rounded-lg px-4 py-2
//                          focus:ring-2 focus:ring-blue-500/20
//                          transition-all border"
//                               >
//                                 Mark as IN_PROGRESS
//                               </button>
//                             )}
//                         </div>

//                         <button
//                           onClick={() => setSelectedReport(null)}
//                           className="flex-1 px-4 py-2
//                    dark:bg-neutral-800 bg-neutral-50
//                    dark:hover:bg-neutral-700 hover:bg-neutral-100
//                    dark:text-neutral-300 text-neutral-600
//                    dark:hover:text-white hover:text-neutral-900
//                    rounded-lg transition-colors
//                    border dark:border-neutral-700 border-neutral-200"
//                         >
//                           Close
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Modals */}
//       <SOSAlertModal />
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { Users, FileText, AlertCircle, Activity, Menu, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { jwtDecode } from "jwt-decode";
import {
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ReportDetailModal from "@/components/ReportDetailsModal";
import Sidebar from "@/components/DashboardSidebar";

interface DisasterReport {
  id: string;
  reportId: string;
  description: string;
  disasterType: string;
  severity: string;
  status: string;
  location: string;
  contactInfo: string;
  imageUrl: string | null;
  createdAt: string;
  teamAssign: {
    teamName: string;
    team_id: string;
    status: string;
  } | null;
  title: string | null;
  reviewReport: {
    id: string;
    affectedPeople: string;
    approved: boolean;
    casualties: string;
    detailedDescription: string;
    numberOfPeopleRescued: string | null;
    evacuationCentres: string;
  };
}

interface Team {
  team_id: string;
  teamName: string;
  status: string;
}

interface CustomJwtPayload {
  sub: string;
  role: string;
  phoneNumber: string;
}

interface AssignTeamResponse {
  reportId: string;
  teamId: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(
    null
  );
  const [reload, setReload] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availTeams, setavAvailTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchReports();
    setReload(false);
  }, [reload]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes or screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setAccessToken(localStorage.getItem("token") || "");
    if (accessToken) {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      if (decodedToken) {
        const Role = decodedToken.role.toLowerCase();
        setRole(Role);
        const phoneNumber = decodedToken.phoneNumber;
        setPhoneNumber(phoneNumber);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    setAccessToken(localStorage.getItem("token") || "");
    if (accessToken) {
      const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
      if (decodedToken) {
        const Role = decodedToken.role.toLowerCase();
        if (Role === "admin" || Role === "moderator") {
          router.push("/dashboard");
        } else if (Role === "vendor") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    }
  }, [accessToken]);

  const fetchTeams = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team_assign/getAllTeams`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setavAvailTeams(response.data);
        const availableTeams = response.data.filter(
          (team: Team) => team.status !== "BUSY"
        );
        setTeams(availableTeams);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  };

  const handleAssignTeam = async (reportId: string): Promise<void> => {
    const token = localStorage.getItem("token");

    if (!selectedTeam) {
      toast.error("Please select a team to assign.");
      return;
    }

    console.log("Assigning team:", selectedTeam, "to report:", reportId);

    try {
      await axios.put<AssignTeamResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/assign-team`,
        {
          reportId,
          teamId: selectedTeam,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedReport(null);
      toast.success("Team assigned successfully");
      fetchReports();
    } catch (error) {
      console.error("Error assigning team:", error);
      toast.error("Failed to assign team");
    }
  };

  const incidentData = [
    { month: "Jan", incidents: 65, resolved: 50 },
    { month: "Feb", incidents: 78, resolved: 68 },
    { month: "Mar", incidents: 90, resolved: 82 },
    { month: "Apr", incidents: 81, resolved: 70 },
    { month: "May", incidents: 56, resolved: 50 },
    { month: "Jun", incidents: 55, resolved: 48 },
  ];

  const disasterTypeData = [
    { name: "Flood", value: 35 },
    { name: "Fire", value: 25 },
    { name: "Earthquake", value: 20 },
    { name: "Storm", value: 15 },
    { name: "Other", value: 5 },
  ];

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: DisasterReport[] = response.data;
      console.log(data);

      // Define the sort order
      const statusOrder = ["PENDING", "IN_PROGRESS", "COMPLETED"];

      // Sort the data based on status
      const sortedData = data.sort((a, b) => {
        const statusA = statusOrder.indexOf(a.status);
        const statusB = statusOrder.indexOf(b.status);

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setReports(sortedData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    console.log(token);
    console.log("Updating report status:", reportId, newStatus);
    try {
      const endpoint =
        newStatus === "COMPLETED"
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/completed/${reportId}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/review/${reportId}`;

      await axios.put(
        endpoint,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {}
      );
      setReload(true);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30",
      IN_PROGRESS:
        "bg-blue-100 text-green-800 dark:bg-blue-500/20 dark:text-green-200 border border-blue-200 dark:border-blue-500/30",
      COMPLETED:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30",
      REJECTED:
        "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200 border border-red-200 dark:border-red-500/30",
    };

    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-black bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 dark:border-neutral-800 border-gray-300 border-t-blue-500"></div>
          <p className="dark:text-neutral-400 text-gray-600">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black/90">
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="z-40 flex">
          <Sidebar role={role || ""} phoneNumber={phoneNumber || ""} />
        </div>
        <main className="flex-1 min-h-screen w-full">
          {/* Header */}
          <header className="bg-white dark:bg-neutral-900 border-b p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              {/* Left Section: Title & Description */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reports Insights
                  </h1>
                  <p className="mt-1 text-slate-500 dark:text-white">
                    Real-time monitoring and analytics
                  </p>
                </div>
                {/* Sidebar Button (Moved to Right of Title & Description) */}
                {/* <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden flex p-2 z-50 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-gray-200 dark:border-neutral-800 ml-4"
                >
                  {" "}
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-900 dark:text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
                  )}
                </button> */}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Total Reports",
                  value: reports.length,
                  icon: FileText,
                  color: "blue",
                },
                {
                  title: "Active Cases",
                  value: reports.filter((r) => r.status === "IN_PROGRESS")
                    .length,
                  icon: AlertCircle,
                  color: "green",
                },
                {
                  title: "Teams Deployed",
                  value: availTeams.filter((team) => team.status === "BUSY")
                    .length,
                  icon: Users,
                  color: "purple",
                },
                {
                  title: "Completion Rate",
                  value: `${Math.round(
                    (reports
                      .filter((r) => r.status !== "REJECTED")
                      .filter((r) => r.status === "COMPLETED").length /
                      reports.filter((r) => r.status !== "REJECTED").length) *
                      100
                  )}%`,
                  icon: Activity,
                  color: "amber",
                },
              ].map((stat) => (
                <Card
                  key={stat.title}
                  className="bg-gray-50 dark:bg-slate-800/50 shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white text-sm">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Charts and Recent Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Make charts responsive */}
              <Card className="bg-gray-50 dark:bg-slate-800/50 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Incident Trends
                  </h2>
                  <div className="h-60 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={incidentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                          }}
                          labelStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="incidents"
                          stroke="#ff513d"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          stroke="#10B981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Disaster Types Distribution */}
              <Card className="bg-gray-50 dark:bg-slate-800/50 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Disaster Types
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={disasterTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          fill="#3B82F6"
                          dataKey="value"
                          label
                          strokeWidth={0}
                        >
                          {disasterTypeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#3B82F6",
                                  "#10B981",
                                  "#6366F1",
                                  "#F59E0B",
                                  "#EC4899",
                                ][index]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #22C55E",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          labelStyle={{
                            color: "#166534",
                          }}
                        />
                        <Legend
                          formatter={(value) => (
                            <span style={{ color: "#166534" }}>{value}</span>
                          )}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card className="bg-gray-50 dark:bg-slate-800/50 shadow-md lg:col-span-2 cursor-pointer">
                <CardContent className="p-6">
                  <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">
                    Recent Reports
                  </h2>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : (
                      reports.slice(0, 5).map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-slate-700/30 shadow-lg rounded-lg"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="w-10 h-10 bg-green-200 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Activity
                              className={`w-5 h-5 ${getStatusColor(
                                report.status
                              )}`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-black/90 dark:text-white font-medium">
                              {report.title || report.disasterType}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {report.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-4 py-2 rounded-full text-sm ${getStatusColor(
                                report.status
                              )} dark:bg-slate-700`}
                            >
                              {report.status}
                            </span>
                            <p className="text-sm dark:text-slate-400 mr-5 mt-3">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <ReportDetailModal
        role={role}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onAssignTeam={handleAssignTeam}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={teams}
        onUpdateStatus={updateReportStatus}
      />
    </div>
  );
}

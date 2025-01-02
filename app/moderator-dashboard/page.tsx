"use client";
// import { useState, useEffect } from "react";
// import { signOut, useSession } from "next-auth/react";
// import {
//   Award,
//   Clock,
//   MapPin,
//   User,
//   FileText,
//   Check,
//   XCircle,
//   RefreshCw,
//   Filter,
//   Search,
//   MoreHorizontal,
//   MessageSquare,
//   Users,
// } from "lucide-react";
// import Link from "next/link";
// import { toast } from "react-hot-toast";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";

// // Types for our dashboard
// type RescueTeam = {
//   id: string;
//   name: string;
//   specialization: string;
//   isAvailable: boolean;
// };

// type ModeratorResponse = {
//   id: string;
//   reportId: string;
//   message: string;
//   createdAt: Date;
//   moderatorId: string;
// };

// type Report = {
//   id: string;
//   title: string;
//   description: string;
//   status: ReportStatus;
//   type: ReportType;
//   location?: string;
//   createdAt: Date;
//   user: {
//     id: string;
//     name: string;
//   };
//   image?: string;
//   assignedTeam?: RescueTeam;
//   moderatorResponses?: ModeratorResponse[];
// };

// enum ReportStatus {
//   PENDING = "PENDING",
//   IN_PROGRESS = "IN_PROGRESS",
//   RESOLVED = "RESOLVED",
//   DISMISSED = "DISMISSED",
// }

// enum ReportType {
//   EMERGENCY = "EMERGENCY",
//   NON_EMERGENCY = "NON_EMERGENCY",
//   MAINTENANCE = "MAINTENANCE",
// }

// interface MyComponentProps {
//   report: Report;
//   isSelected: boolean;
//   onClick: React.MouseEventHandler<HTMLDivElement>;
// }

// const ReportCard: React.FC<MyComponentProps> = ({
//   report,
//   isSelected,
//   onClick,
// }) => {
//   const getStatusIcon = (status: string | number) => {
//     const icons = {
//       PENDING: <Clock className="text-amber-300" />,
//       IN_PROGRESS: <RefreshCw className="text-sky-300" />,
//       RESOLVED: <Check className="text-emerald-300" />,
//       DISMISSED: <XCircle className="text-neutral-300" />,
//     };
//     return icons[status];
//   };

//   const getStatusColor = (status: string | number) => {
//     const colors = {
//       PENDING: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
//       IN_PROGRESS: "bg-sky-500/20 text-sky-200 border border-sky-500/30",
//       RESOLVED:
//         "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
//       DISMISSED:
//         "bg-neutral-500/20 text-neutral-200 border border-neutral-500/30",
//     };
//     return colors[status];
//   };

//   return (
//     <div
//       onClick={onClick}
//       className={`bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border ${
//         isSelected
//           ? "border-blue-500/50"
//           : "border-neutral-800 hover:border-neutral-700"
//       } transition-all shadow-lg cursor-pointer`}
//     >
//       <div className="flex justify-between items-start">
//         <div className="space-y-3 flex-1">
//           <div className="flex items-center gap-3">
//             {getStatusIcon(report.status)}
//             <h2 className="text-lg font-semibold text-neutral-100 flex-grow truncate">
//               {report.title}
//             </h2>
//             <span
//               className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
//                 report.status
//               )}`}
//             >
//               {report.status.replace("_", " ")}
//             </span>
//           </div>
//           <p className="text-neutral-300 text-sm line-clamp-2">
//             {report.description}
//           </p>
//           {report.assignedTeam && (
//             <div className="flex items-center gap-2 text-sm text-neutral-400">
//               <Users className="w-4 h-4" />
//               <span>Assigned to: {report.assignedTeam.name}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// const DetailsSidebar = ({
//   report,
//   onClose,
//   onUpdate,
//   onAssign,
//   rescueTeams,
// }: {
//   report: Report;
//   onClose: () => void;
//   onUpdate: (id: string, status: string) => void;
//   onAssign: (id: string, teamId: string) => void;
//   rescueTeams: RescueTeam[];
// }) => {
//   const [newResponse, setNewResponse] = useState("");

//   // Check if the report already has a response
//   const hasResponse =
//     report.moderatorResponses && report.moderatorResponses.length > 0;

//   const handleSubmitResponse = async () => {
//     if (!newResponse.trim()) return;

//     try {
//       await fetch(`/api/reports/${report.id}/responses`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: newResponse }),
//       });

//       setNewResponse("");
//       onUpdate(report.id, report.status);
//       toast.success("Response added successfully");
//     } catch (error) {
//       toast.error("Failed to add response");
//     }
//   };

//   return (
//     <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-br from-neutral-800 to-neutral-900 border-l border-neutral-700 shadow-xl z-50 overflow-y-auto">
//       <div className="p-6 border-b border-neutral-700 flex justify-between items-center sticky top-0 bg-neutral-900 rounded-t-lg">
//         <h2 className="text-xl font-semibold text-neutral-100">
//           Report Details
//         </h2>
//         <button
//           onClick={onClose}
//           className="text-neutral-400 hover:text-white transition duration-300"
//         >
//           <XCircle className="w-6 h-6" />
//         </button>
//       </div>

//       <div className="p-6 space-y-6 overflow-y-auto">
//         <Card className="bg-neutral-800 rounded-lg shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-neutral-100">{report.title}</CardTitle>
//             <div className="flex items-center gap-2">
//               <select
//                 value={report.status}
//                 onChange={(e) => onUpdate(report.id, e.target.value)}
//                 className="bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300"
//               >
//                 {Object.values(ReportStatus).map((status) => (
//                   <option key={status} value={status}>
//                     {status.replace("_", " ")}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <div className="bg-neutral-700 rounded-lg p-4">
//               <h4 className="text-neutral-300 text-sm mb-2">Description</h4>
//               <p className="text-neutral-100">{report.description}</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-neutral-700 rounded-lg p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Award className="w-4 h-4 text-neutral-300" />
//                   <h4 className="text-neutral-300 text-sm">Type</h4>
//                 </div>
//                 <p className="text-neutral-100">
//                   {report.type.replace("_", " ")}
//                 </p>
//               </div>

//               <div className="bg-neutral-700 rounded-lg p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <MapPin className="w-4 h-4 text-neutral-300" />
//                   <h4 className="text-neutral-300 text-sm">Location</h4>
//                 </div>
//                 <p className="text-neutral-100">{report.location || "N/A"}</p>
//               </div>
//             </div>

//             <div className="bg-neutral-700 rounded-lg p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Users className="w-4 h-4 text-neutral-300" />
//                 <h4 className="text-neutral-300 text-sm">Rescue Team</h4>
//               </div>

//               {report.assignedTeam ? (
//                 <p className="text-neutral-100">
//                   {report.assignedTeam.name} (
//                   {report.assignedTeam.specialization})
//                 </p>
//               ) : (
//                 <select
//                   onChange={(e) => onAssign(report.id, e.target.value)}
//                   disabled={!!report.assignedTeam} // Disable if a team is already assigned
//                   className="bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300 w-full"
//                 >
//                   <option value="">Assign a team</option>
//                   {rescueTeams.map((team) => (
//                     <option key={team.id} value={team.id}>
//                       {team.name} ({team.specialization})
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>

//             <div>
//               <Textarea
//                 value={newResponse}
//                 onChange={(e) => setNewResponse(e.target.value)}
//                 placeholder="Write a response"
//                 className="bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300"
//                 disabled={hasResponse} // Disable if a response is already present
//               />
//               <Button
//                 className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-neutral-100 rounded-lg transition duration-300"
//                 onClick={handleSubmitResponse}
//                 disabled={!newResponse.trim() || hasResponse} // Disable if response already exists
//               >
//                 Submit Response
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// // Main component for Moderator Dashboard
// export default function ModeratorDashboard() {
//   const [reports, setReports] = useState<Report[]>([]);
//   const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
//   const [selectedReport, setSelectedReport] = useState<Report | null>(null);
//   const [filter, setFilter] = useState("");
//   const { data: session } = useSession();

//   useEffect(() => {
//     async function fetchReports() {
//       const res = await fetch("/api/reports");
//       const data = await res.json();
//       setReports(data);
//     }

//     async function fetchRescueTeams() {
//       const res = await fetch("/api/rescue-teams");
//       const data = await res.json();
//       setRescueTeams(data);
//     }

//     fetchReports();
//     fetchRescueTeams();
//   }, []);

//   const filteredReports = reports.filter(
//     (report) =>
//       report.title.toLowerCase().includes(filter.toLowerCase()) ||
//       report.description.toLowerCase().includes(filter.toLowerCase())
//   );

//   const handleReportClick = (report: Report) => {
//     setSelectedReport(report);
//   };

//   const handleCloseSidebar = () => {
//     setSelectedReport(null);
//   };

//   const handleStatusUpdate = (id: string, status: string) => {
//     setReports((prevReports) =>
//       prevReports.map((report) =>
//         report.id === id ? { ...report, status } : report
//       )
//     );
//   };

//   const handleAssignTeam = (id: string, teamId: string) => {
//     setReports((prevReports) =>
//       prevReports.map((report) =>
//         report.id === id
//           ? {
//               ...report,
//               assignedTeam: rescueTeams.find((team) => team.id === teamId),
//             }
//           : report
//       )
//     );
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center py-6 px-10">
//         <h1 className="text-3xl font-semibold text-neutral-100">
//           Moderator Dashboard
//         </h1>
//         <Button variant="outline" onClick={() => signOut()}>
//           Logout
//         </Button>
//       </div>

//       <div className="px-10 py-6">
//         <div className="mb-4 flex gap-4 items-center">
//           <Search className="w-4 h-4 text-neutral-500" />
//           <input
//             type="text"
//             placeholder="Search Reports..."
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="bg-neutral-900 text-neutral-100 placeholder-neutral-500 border border-neutral-700 rounded-lg p-2 w-full"
//           />
//           <Button
//             variant="outline"
//             className="text-neutral-100 hover:text-neutral-500"
//             onClick={() => setFilter("")}
//           >
//             <Filter className="w-4 h-4" />
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredReports.map((report) => (
//             <ReportCard
//               key={report.id}
//               report={report}
//               isSelected={selectedReport?.id === report.id}
//               onClick={() => handleReportClick(report)}
//             />
//           ))}
//         </div>
//       </div>

//       {selectedReport && (
//         <DetailsSidebar
//           report={selectedReport}
//           onClose={handleCloseSidebar}
//           onUpdate={handleStatusUpdate}
//           onAssign={handleAssignTeam}
//           rescueTeams={rescueTeams}
//         />
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/ReportCard";
import { DetailsSidebar } from "@/components/DetailsSidebar";
import { Report, ReportStatus, RescueTeam } from "@/types/types";
import { toast } from "react-hot-toast";

export default function ModeratorDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchData() {
      try {
        const [reportsRes, teamsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/rescue-teams"),
        ]);

        if (!reportsRes.ok || !teamsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [reportsData, teamsData] = await Promise.all([
          reportsRes.json(),
          teamsRes.json(),
        ]);

        setReports(reportsData);
        setRescueTeams(teamsData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      }
    }

    fetchData();
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(filter.toLowerCase()) ||
      report.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleStatusUpdate = async (id: string, status: ReportStatus) => {
    try {
      const response = await fetch(`/api/reports/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedReport = await response.json();
      setReports((prevReports) =>
        prevReports.map((report) => (report.id === id ? updatedReport : report))
      );

      if (selectedReport?.id === id) {
        setSelectedReport(updatedReport);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAssignTeam = async (id: string, teamId: string) => {
    try {
      const response = await fetch(`/api/reports/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign team");
      }

      const updatedReport = await response.json();
      setReports((prevReports) =>
        prevReports.map((report) => (report.id === id ? updatedReport : report))
      );

      if (selectedReport?.id === id) {
        setSelectedReport(updatedReport);
      }
    } catch (error) {
      console.error("Error assigning team:", error);
      toast.error("Failed to assign team");
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center py-6 px-10 bg-neutral-900">
        <h1 className="text-3xl font-semibold text-neutral-100">
          Moderator Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-neutral-300">{session?.user?.name}</span>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="hover:bg-neutral-800"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="px-10 py-6">
        <div className="mb-6 flex gap-4 items-center bg-neutral-800/50 rounded-lg p-3">
          <Search className="w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search reports by title or description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-neutral-100 placeholder-neutral-500 border-none focus:ring-0 w-full"
          />
          <Button
            variant="outline"
            className="text-neutral-400 hover:text-neutral-100"
            onClick={() => setFilter("")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">
              {filter ? "No reports match your search" : "No reports found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReport?.id === report.id}
                onClick={() => handleReportClick(report)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <DetailsSidebar
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleStatusUpdate}
          onAssign={handleAssignTeam}
          rescueTeams={rescueTeams}
        />
      )}
    </div>
  );
}

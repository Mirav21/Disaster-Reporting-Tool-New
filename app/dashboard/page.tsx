"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Clock,
  MapPin,
  User,
  Users,
  FileText,
  Check,
  XCircle,
  RefreshCw,
  Search,
  MoreHorizontal,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  Building,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the new interface based on the API response
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

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(
    null
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosRadius, setSOSRadius] = useState(5);
  const [sosMessage, setSOSMessage] = useState("");
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    fetchReports();
    setReload(false);
  }, [reload]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

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
        const availableTeams = response.data.filter(
          (team: Team) => team.status !== "BUSY"
        );
        setTeams(availableTeams);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  };

  interface AssignTeamResponse {
    reportId: string;
    teamId: string;
  }

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

  const signOut = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/userlogin/logout`,
      { token: token }
    );
    if (response.status === 200) {
      localStorage.clear();
    }
    router.push("/auth/signin");
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`
      );
      const data: DisasterReport[] = await response.json();

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
      console.log("Sorted Reports:", sortedData);
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

  const filteredReports = reports.filter((report) => {
    const statusMatch = filter === "ALL" || report.status === filter;
    const typeMatch =
      typeFilter === "ALL" || report.disasterType === typeFilter;
    const searchMatch =
      report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && typeMatch && searchMatch;
  });

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock className="text-amber-400" />,
      IN_PROGRESS: <RefreshCw className="text-blue-400 animate-spin" />,
      RESOLVED: <Check className="text-emerald-400" />,
      DISMISSED: <XCircle className="text-neutral-400" />,
    };
    return icons[status as keyof typeof icons] || icons.PENDING;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
      IN_PROGRESS: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
      COMPLETED:
        "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
      DISMISSED:
        "bg-neutral-500/20 text-neutral-200 border border-neutral-500/30",
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const sendSOSAlert = async () => {
    if (!selectedReport) return;

    setIsSendingAlert(true);
    try {
      const response = await fetch("/api/reports/sos-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          radius: sosRadius,
          message: sosMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowSOSModal(false);
      }
    } catch (error) {
      console.error("Error sending SOS alert:", error);
    } finally {
      setIsSendingAlert(false);
    }
  };

  const SOSAlertSection = () => (
    <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h4 className="text-red-400 text-sm">Emergency Alert</h4>
        </div>
        <button
          onClick={() => setShowSOSModal(true)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Send SOS Alert
        </button>
      </div>
      <p className="text-neutral-400 text-sm">
        Send emergency alerts to all users in the affected area.
      </p>
    </div>
  );

  const SOSAlertModal = () =>
    showSOSModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Send Emergency Alert
            </h3>
            <button
              onClick={() => setShowSOSModal(false)}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Alert Radius (km)
              </label>
              <input
                type="number"
                value={sosRadius}
                onChange={(e) => setSOSRadius(Number(e.target.value))}
                min="1"
                max="50"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Alert Message
              </label>
              <textarea
                value={sosMessage}
                onChange={(e) => setSOSMessage(e.target.value)}
                placeholder="Enter emergency alert message..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white h-32 resize-none"
              />
            </div>

            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <p className="text-sm text-red-400">
                ⚠️ This will send an emergency alert to all users within{" "}
                {sosRadius}km of the incident location.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSOSModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendSOSAlert}
                disabled={isSendingAlert || !sosMessage.trim()}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                {isSendingAlert ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Send Alert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-800 border-t-blue-500"></div>
          <p className="text-neutral-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[92.5vh] bg-gradient-to-br from-black via-neutral-950 to-neutral-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-grow">
          <div className="px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Main Menu
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-blue-500/10 cursor-pointer flex items-center gap-3 text-blue-400 transition-colors group"
              >
                <FileText className="w-5 h-5" />
                Reports
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <User className="w-5 h-5" />
                Users
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>

          <div className="px-4 py-2 mt-6 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Settings
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/notifications"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <Bell className="w-5 h-5" />
                Notifications
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <Settings className="w-5 h-5" />
                Settings
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow text-left">
                <p className="text-sm font-medium truncate">
                  {/* {session?.user?.name || "Admin"} */}
                </p>
                <p className="text-xs text-neutral-400">
                  {localStorage.getItem("username")}
                </p>
              </div>
              <MoreHorizontal className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Reports Dashboard
              </h1>
              <p className="text-neutral-400">
                Manage and track all reported incidents
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <h1 className="text-neutral-200 text-2xl">Pending Reports</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.filter((report) => report.reviewReport == null)
              .length > 0 ? (
              filteredReports.map((report) =>
                report.reviewReport == null ? (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`group bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border ${
                      selectedReport?.id === report.id
                        ? "border-blue-500/50 ring-1 ring-blue-500/20"
                        : "border-neutral-800 hover:border-neutral-700"
                    } transition-all cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-xl`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(report.status)}
                        <h2 className="text-lg font-semibold text-white flex-grow truncate">
                          {report.disasterType} - {report.reportId}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <p className="text-neutral-400 text-sm line-clamp-2 group-hover:text-neutral-300 transition-colors">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{report.contactInfo || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                        {report.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{report.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              )
            ) : (
              <div className="flex items-center justify-center col-span-2 h-10">
                <h4 className="text-neutral-400 text-md">No pending reports</h4>
              </div>
            )}
          </div>

          {localStorage.getItem("username") === "hrm" && (
            <>
              <div className="flex justify-center items-center">
                <h1 className="text-neutral-200 text-2xl mt-20">
                  Reviewed Reports
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReports.filter((report) => report.reviewReport)
                  .length > 0 ? (
                  filteredReports.map(
                    (report) =>
                      report.reviewReport &&
                      report.status !== "COMPLETED" && (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`group bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border ${
                            selectedReport?.id === report.id
                              ? "border-blue-500/50 ring-1 ring-blue-500/20"
                              : "border-neutral-800 hover:border-neutral-700"
                          } transition-all cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-xl`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(report.status)}
                              <h2 className="text-lg font-semibold text-white flex-grow truncate">
                                {report.disasterType} - {report.reportId}
                              </h2>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                                  "COMPLETED"
                                )}`}
                              >
                                Reviewed
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                                  report.status
                                )}`}
                              >
                                {report.status}
                              </span>
                            </div>

                            <p className="text-neutral-400 text-sm line-clamp-2 group-hover:text-neutral-300 transition-colors">
                              {report.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{report.contactInfo || "Anonymous"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                              {report.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{report.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                  )
                ) : (
                  <div className="flex items-center justify-center col-span-2 h-10">
                    <h4 className="text-neutral-400 text-md">
                      No reports have been reviewed.
                    </h4>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="text-center py-16 bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-800">
              <FileText className="mx-auto mb-4 w-12 h-12 text-neutral-500" />
              <p className="text-lg text-neutral-400">
                No reports found matching the selected filters.
              </p>
              <button
                onClick={() => {
                  setFilter("ALL");
                  setTypeFilter("ALL");
                  setSearchTerm("");
                }}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Report Details Sidebar */}
      {selectedReport && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-800 shadow-2xl z-[50] overflow-y-auto transition-transform duration-300 transform">
          <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 p-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Details</h2>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white z-[0] ">
                  {selectedReport.disasterType}
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-2 z-[0] ${getStatusColor(
                    selectedReport.status
                  )}`}
                >
                  {getStatusIcon(selectedReport.status)}
                  {selectedReport.status.replace("_", " ")}
                </div>
              </div>

              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                <h4 className="text-neutral-400 text-sm mb-2">Description</h4>
                <p className="text-white">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-neutral-400 text-sm">Type</h4>
                  </div>
                  <p className="text-white">
                    {selectedReport.disasterType.replace("_", " ")}
                  </p>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-neutral-400 text-sm">Location</h4>
                  </div>
                  <p className="text-white">
                    {selectedReport.location || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-neutral-400 text-sm">Created At</h4>
                  </div>
                  <p className="text-white">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}{" "}
                    {new Date(selectedReport.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {selectedReport.imageUrl && (
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-neutral-400 text-sm mb-2">
                    Attached Image
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-neutral-700">
                    <img
                      src={selectedReport.imageUrl}
                      alt="Report Attachment"
                      className="w-full h-auto object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </div>
              )}

              <SOSAlertSection />

              {selectedReport.status === "IN_PROGRESS" &&
              !selectedReport.reviewReport &&
              !selectedReport.teamAssign ? (
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-neutral-400 text-sm">Assigned Team</h4>
                  </div>
                  <div className="space-y-2">
                    {teams.length > 0 ? (
                      <>
                        <select
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          className="w-full bg-neutral-700 text-white border border-neutral-600 rounded-lg px-4 py-2"
                        >
                          <option value="">Select a team</option>
                          {teams.map((team) => (
                            <option key={team.team_id} value={team.team_id}>
                              {team.teamName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignTeam(selectedReport.id)}
                          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                        >
                          Assign Team
                        </button>
                      </>
                    ) : (
                      <p className="text-neutral-400 text-sm">
                        No team available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-neutral-400 text-sm">Assigned Team</h4>
                  </div>
                  <p className="text-white">
                    {selectedReport.teamAssign?.teamName || "No Team Assigned"}
                  </p>
                </div>
              )}

              {selectedReport.reviewReport && (
                <>
                  <div className="flex justify-between items-center text-2xl bg-neutral-900/95 backdrop-blur-xl border-t border-b border-neutral-800 -mx-6 p-6">
                    <h2 className="text-xl font-semibold">Review Section</h2>
                    {/* <Badge
                      variant={
                        selectedReport.reviewReport.approved
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedReport.reviewReport.approved
                        ? "Approved"
                        : "Pending"}
                    </Badge> */}
                  </div>

                  <div className="backdrop-blur-md py-3">
                    <div className="space-y-5">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-neutral-800/50 backdrop-blur-sm border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-neutral-400 text-sm">
                                Affected People
                              </span>
                            </div>
                            <p className="text-xl font-bold text-green-500">
                              {selectedReport.reviewReport.affectedPeople}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-neutral-800/50 backdrop-blur-sm border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              <span className="text-neutral-400 text-sm">
                                Casualties
                              </span>
                            </div>
                            <p className="text-xl font-bold text-green-500">
                              {selectedReport.reviewReport.casualties}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-neutral-800/50 backdrop-blur-sm border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="w-4 h-4 text-green-400" />
                              <span className="text-neutral-400 text-sm">
                                People Rescued
                              </span>
                            </div>
                            <p className="text-xl font-bold text-green-500">
                              {selectedReport.reviewReport
                                .numberOfPeopleRescued || "0"}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-neutral-800/50 backdrop-blur-sm border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-purple-400" />
                              <span className="text-neutral-400 text-sm">
                                Evacuation Centers
                              </span>
                            </div>
                            <p className="text-xl font-bold text-green-500">
                              {selectedReport.reviewReport.evacuationCentres}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detailed Description */}
                      <Alert className="bg-neutral-800/30 border-neutral-700">
                        <AlertDescription className="text-neutral-200">
                          {selectedReport.reviewReport.detailedDescription}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </>
              )}

              <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 -m-6 p-5">
                <div className="flex gap-3 w-full">
                  <div className="flex-2">
                    {selectedReport.reviewReport &&
                      selectedReport.status === "IN_PROGRESS" && (
                        <button
                          value="COMPLETED"
                          onClick={() =>
                            updateReportStatus(selectedReport.id, "COMPLETED")
                          }
                          className="w-full appearance-none hover:bg-neutral-700 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          Mark as COMPLETED
                        </button>
                      )}

                    {selectedReport.reviewReport === null &&
                      selectedReport.status === "PENDING" && (
                        <button
                          value="IN_PROGRESS"
                          onClick={() =>
                            updateReportStatus(selectedReport.id, "IN_PROGRESS")
                          }
                          className="w-full appearance-none hover:bg-neutral-700 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          Mark as IN_PROGRESS
                        </button>
                      )}
                  </div>

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SOSAlertModal />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  User,
  Users,
  FileText,
  Check,
  XCircle,
  RefreshCw,
  Search,
  Bell,
  AlertTriangle,
  AlertCircle,
  Building,
  Award,
  MapPin,
  UserCheck,
  Filter,
  Calendar,
  TwitterIcon,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/DashboardSidebar";
import { TwitterShareButton } from "react-share";

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
  phoneNumber: string;
  sub: string;
  role: string;
}

interface AssignTeamResponse {
  reportId: string;
  teamId: string;
}

export default function Reports() {
  const router = useRouter();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosRadius, setSOSRadius] = useState(5);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sosMessage] = useState(textareaRef.current?.value || "");

  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [reload, setReload] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [dateFilter, setDateFilter] = useState<
    "ALL" | "DAY" | "WEEK" | "MONTH"
  >("ALL");

  useEffect(() => {
    fetchReports();
    setReload(false);
  }, [reload]);

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
          router.push("/reports");
        } else if (Role === "vendor") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }
    }
  }, [accessToken]);

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

  const filteredReports = reports.filter((report) => {
    const statusMatch = filter === "ALL" || report.status === filter;
    const typeMatch =
      typeFilter === "ALL" || report.disasterType === typeFilter;
    const searchMatch =
      report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering logic
    const reportDate = new Date(report.createdAt);
    const now = new Date();
    let dateMatch = true;

    switch (dateFilter) {
      case "DAY":
        dateMatch = now.getTime() - reportDate.getTime() <= 24 * 60 * 60 * 1000;
        break;
      case "WEEK":
        dateMatch =
          now.getTime() - reportDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;
      case "MONTH":
        dateMatch =
          now.getTime() - reportDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        dateMatch = true;
    }

    return statusMatch && typeMatch && searchMatch && dateMatch;
  });
  const handleAssignTeam = async (reportId: string): Promise<void> => {
    const token = localStorage.getItem("token");

    if (!selectedTeam) {
      toast.error("Please select a team to assign.");
      return;
    }

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

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
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

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock className="text-amber-400" />,
      IN_PROGRESS: <RefreshCw className="text-green-400 animate-spin" />,
      RESOLVED: <Check className="text-emerald-400" />,
      REJECTED: <XCircle className="text-red-400" />,
    };
    return icons[status as keyof typeof icons] || icons.PENDING;
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
        "bg-gray-100 text-gray-800 dark:bg-red-500/20 dark:text-red-200 border border-gray-200 dark:border-red-500/30",
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
    <div className="bg-red-500/10 dark:bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20 dark:border-red-500/20 bg-red-100 border-red-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 dark:text-red-400 text-red-600" />
          <h4 className="dark:text-red-400 text-red-600 text-sm">
            Emergency Alert
          </h4>
        </div>
        <button
          onClick={() => setShowSOSModal(true)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Send SOS Alert
        </button>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
        Send emergency alerts to all users in the affected area.
      </p>
    </div>
  );

  const SOSAlertModal = () =>
    showSOSModal && (
      <div className="fixed inset-0 bg-gray-800/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-full max-w-md p-6 space-y-4 rounded-xl border bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Send Emergency Alert
            </h3>
            <button
              onClick={() => setShowSOSModal(false)}
              className="p-2 rounded-lg text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-gray-800 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">
                Alert Radius (km)
              </label>
              <input
                type="number"
                value={sosRadius}
                onChange={(e) => setSOSRadius(Number(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1">
                Alert Message
              </label>
              <textarea
                ref={textareaRef}
                placeholder="Enter emergency alert message..."
                className="w-full h-32 px-4 py-2 rounded-lg border resize-none bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white"
              />
            </div>

            <div className="p-4 rounded-lg border bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠ This will send an emergency alert to all users within{" "}
                {sosRadius}km of the incident location.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSOSModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendSOSAlert}
                disabled={isSendingAlert}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
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

  const url = "https://dhruvasetu.vercel.app";
  const title = `${selectedReport?.disasterType} happened at ${selectedReport?.location}`;
  const text = `Urgent Alert: A ${selectedReport?.disasterType} has struck ${selectedReport?.location}. Stay informed, Stay safe and support the relief efforts.`;

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

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full">
          {/* Header */}
          <header className="bg-white dark:bg-neutral-900 border-b p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reports Insights
                  </h1>
                  <p className="mt-1 text-slate-500 dark:text-white">
                    Real-time monitoring and analytics
                  </p>
                </div>

                {/* <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden flex p-2 z-50 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-gray-200 dark:border-neutral-800 ml-4"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-900 dark:text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
                  )}
                </button> */}
              </div>
            </div>
          </header>

          <div className="bg-white dark:bg-black/90 p-4 border-b dark:border-neutral-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
                <Search className="absolute right-3 top-3 text-gray-400 dark:text-neutral-400" />
              </div>

              {/* Status Filters */}
              <div className="flex items-center space-x-2">
                {["PENDING", "IN_PROGRESS", "COMPLETED"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilter(filter === status ? "ALL" : status)
                    }
                    className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      filter === status
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value as "ALL" | "DAY" | "WEEK" | "MONTH"
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg border dark:bg-neutral-800 dark:border-neutral-700 dark:text-white flex items-center"
                >
                  <option value="ALL">All Time</option>
                  <option value="DAY">Last 24 Hours</option>
                  <option value="WEEK">Last Week</option>
                  <option value="MONTH">Last Month</option>
                </select>
                <Calendar className="text-gray-400 dark:text-neutral-400" />
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="flex flex-col h-screen">
              {/* Pending Reports Section */}
              {filter !== "COMPLETED" && (
                <div className="h-[400px]">
                  {" "}
                  {/* Fixed height container */}
                  {/* Title Section */}
                  <div className="flex justify-center items-center p-4 shrink-0">
                    <h1 className="text-gray-900 dark:text-neutral-100 text-xl lg:text-2xl">
                      Pending Reports
                    </h1>
                  </div>
                  {/* Scrollable Reports Container */}
                  <div className="h-[320px] overflow-y-auto px-4">
                    <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                      {filteredReports.filter(
                        (report) => report.reviewReport == null
                      ).length > 0 ? (
                        filteredReports.map(
                          (report) =>
                            report.reviewReport == null && (
                              <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                className={`group bg-white dark:bg-neutral-900 rounded-xl p-4 border ${
                                  selectedReport?.id === report.id
                                    ? "border-blue-500/50 ring-1 ring-blue-500/30"
                                    : "border-gray-200 border-[2px] dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
                                } transition-all cursor-pointer hover:shadow-lg`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100 truncate">
                                      {report.disasterType} - {report.reportId}
                                    </h2>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(report.status)}
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm font-medium uppercase ${getStatusColor(
                                        report.status
                                      )}`}
                                    >
                                      {report.status}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-600 dark:text-neutral-300 text-lg line-clamp-2 mt-4">
                                  {report.description}
                                </p>

                                <div className="flex items-center gap-3 mt-4 text-md">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <User className="w-3 h-3" />
                                    <span>
                                      {report.contactInfo || "Anonymous"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-blue-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(report.createdAt)}</span>
                                  </div>
                                  {report.location && (
                                    <div className="flex items-center gap-1 text-orange-400">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">
                                        {report.location}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-neutral-500">
                            No pending reports
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviewed Reports Section */}
              {role === "admin" && (
                <div className="h-[400px]">
                  {" "}
                  {/* Fixed height container */}
                  <div className="flex justify-center items-center p-4 shrink-0">
                    <h1 className="text-gray-900 dark:text-neutral-100 text-2xl">
                      Reviewed Reports
                    </h1>
                  </div>
                  <div className="h-[320px] overflow-y-auto px-4">
                    <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                      {filteredReports.filter((report) => report.reviewReport)
                        .length > 0 ? (
                        filteredReports.map(
                          (report) =>
                            report.reviewReport && (
                              <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                className={`group bg-white dark:bg-neutral-900 rounded-xl p-4 border ${
                                  selectedReport?.id === report.id
                                    ? "border-blue-500/50 ring-1 ring-blue-500/30"
                                    : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
                                } transition-all cursor-pointer hover:shadow-lg`}
                              >
                                {/* Similar content to pending reports, with some styling adjustments */}
                                <div className="flex items-center justify-between">
                                  <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100 truncate">
                                    {report.disasterType} - {report.reportId}
                                  </h2>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                                        "COMPLETED"
                                      )}`}
                                    >
                                      Reviewed By Rescue Teams
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                                        report.status
                                      )}`}
                                    >
                                      Reviewed By Admin
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-600 dark:text-neutral-300 text-lg line-clamp-2 mt-4">
                                  {report.description}
                                </p>

                                <div className="flex items-center gap-3 mt-4 text-md">
                                  <div className="flex items-center gap-1 text-green-400">
                                    <User className="w-3 h-3" />
                                    <span>
                                      {report.contactInfo || "Anonymous"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-blue-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(report.createdAt)}</span>
                                  </div>
                                  {report.location && (
                                    <div className="flex items-center gap-1 text-orange-400">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">
                                        {report.location}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                        )
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-neutral-500">
                            No reports have been reviewed.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
              <FileText className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-neutral-500" />
              <p className="text-lg text-gray-600 dark:text-neutral-400">
                No reports found matching the selected filters.
              </p>
              <button
                onClick={() => {
                  setFilter("ALL");
                  setTypeFilter("ALL");
                  setSearchTerm("");
                }}
                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Report Details Sidebar */}
          {selectedReport && (
            <div className="fixed inset-y-0 right-0 w-full lg:w-[480px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-neutral-800 shadow-2xl z-[60] overflow-y-auto">
              <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 p-4 lg:p-6 flex justify-between items-center">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center justify-center mt-5">
                <TwitterShareButton
                  url={url}
                  title={`${title} - ${text}`}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold border-2 py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <TwitterIcon className="w-8 h-8" />
                  <span className="text-xl">Alert on Twitter</span>
                </TwitterShareButton>
              </div>

              {/* Report Details Content */}
              <div className="p-4 lg:p-6 space-y-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-[0]">
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

                  <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                    <h4 className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
                      Description
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                        <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
                          Type
                        </h4>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.disasterType.replace("_", " ")}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                        <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
                          Location
                        </h4>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.location || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Additional sections with similar theming */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                        <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
                          Created At
                        </h4>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(
                          selectedReport.createdAt
                        ).toLocaleDateString()}{" "}
                        {new Date(
                          selectedReport.createdAt
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {selectedReport.imageUrl && (
                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <h4 className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
                        Attached Image
                      </h4>
                      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700">
                        <img
                          src={selectedReport.imageUrl}
                          alt="Report Attachment"
                          className="w-full h-auto object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </div>
                  )}

                  <SOSAlertSection />

                  {/* Team Assignment Section */}
                  {selectedReport.status === "IN_PROGRESS" &&
                  !selectedReport.reviewReport &&
                  !selectedReport.teamAssign ? (
                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                        <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
                          Assigned Team
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {teams.length > 0 ? (
                          <>
                            <select
                              value={selectedTeam}
                              onChange={(e) => setSelectedTeam(e.target.value)}
                              className="w-full bg-white dark:bg-neutral-700 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-600 rounded-lg px-4 py-2"
                            >
                              <option value="">Select a team</option>
                              {teams.map((team) => (
                                <option key={team.team_id} value={team.team_id}>
                                  {team.teamName}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                handleAssignTeam(selectedReport.id)
                              }
                              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              Assign Team
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-500 dark:text-neutral-400 text-sm">
                            No team available
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                        <h4 className="text-gray-500 dark:text-neutral-400 text-sm">
                          Assigned Team
                        </h4>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {selectedReport.teamAssign?.teamName ||
                          "No Team Assigned"}
                      </p>
                    </div>
                  )}

                  {/* Review Section */}
                  {selectedReport.reviewReport && (
                    <>
                      <div className="flex justify-between items-center text-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-b border-gray-200 dark:border-neutral-800 -mx-6 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Review Section
                        </h2>
                      </div>

                      <div className="backdrop-blur-md py-3">
                        <div className="space-y-5">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-4 h-4 text-blue-400" />
                                  <span className="text-gray-500 dark:text-neutral-400 text-sm">
                                    Affected People
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-green-500">
                                  {selectedReport.reviewReport.affectedPeople}
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                  <span className="text-neutral-400 dark:text-neutral-400 text-sm">
                                    Casualties
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-green-500">
                                  {selectedReport.reviewReport.casualties}
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <UserCheck className="w-4 h-4 text-green-400" />
                                  <span className="text-neutral-400 dark:text-neutral-400 text-sm">
                                    People Rescued
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-green-500">
                                  {selectedReport.reviewReport
                                    .numberOfPeopleRescued || "0"}
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="bg-gray-50 dark:bg-neutral-800/50 backdrop-blur-sm border-0">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="w-4 h-4 text-purple-400" />
                                  <span className="text-neutral-400 dark:text-neutral-400 text-sm">
                                    Evacuation Centers
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-green-500">
                                  {
                                    selectedReport.reviewReport
                                      .evacuationCentres
                                  }
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

                  <div className="sticky bottom-0 border-t p-5 -m-6 dark:bg-neutral-900/95 bg-white/95 backdrop-blur-xl dark:border-neutral-800 border-neutral-200">
                    <div className="flex gap-3 w-full">
                      <div className="flex-2">
                        {selectedReport.reviewReport &&
                          selectedReport.status === "IN_PROGRESS" && (
                            <button
                              value="COMPLETED"
                              onClick={() =>
                                updateReportStatus(
                                  selectedReport.id,
                                  "COMPLETED"
                                )
                              }
                              className="w-full appearance-none dark:hover:bg-neutral-700 hover:bg-neutral-100 
                       dark:bg-neutral-800 bg-neutral-50 
                       dark:border-neutral-700 border-neutral-200 
                       dark:text-white text-neutral-900 
                       rounded-lg px-4 py-2 
                       focus:ring-2 focus:ring-blue-500/20 
                       transition-all border"
                            >
                              Mark as COMPLETED
                            </button>
                          )}

                        {selectedReport.reviewReport === null &&
                          selectedReport.status === "PENDING" &&
                          ["admin", "moderator"].includes(
                            (role?.toLowerCase() as "admin" | "moderator") ||
                              "guest"
                          ) && (
                            <button
                              value="IN_PROGRESS"
                              onClick={() =>
                                updateReportStatus(
                                  selectedReport.id,
                                  "IN_PROGRESS"
                                )
                              }
                              className="w-full appearance-none dark:hover:bg-neutral-700 hover:bg-neutral-100 
                         dark:bg-neutral-800 bg-neutral-50 
                         dark:border-neutral-700 border-neutral-200 
                         dark:text-white text-neutral-900 
                         rounded-lg px-4 py-2 
                         focus:ring-2 focus:ring-blue-500/20 
                         transition-all border"
                            >
                              Mark as IN_PROGRESS
                            </button>
                          )}
                      </div>

                      <button
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 px-4 py-2 
                   dark:bg-neutral-800 bg-neutral-50
                   dark:hover:bg-neutral-700 hover:bg-neutral-100
                   dark:text-neutral-300 text-neutral-600
                   dark:hover:text-white hover:text-neutral-900
                   rounded-lg transition-colors
                   border dark:border-neutral-700 border-neutral-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <SOSAlertModal />
    </div>
  );
}

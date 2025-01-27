"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  ChevronRight,
  User,
  LogOut,
  Search,
  MapPin,
  Clock,
  Users,
  Heart,
  Home,
  Shell,
  Save,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// interface CustomJwtPayload {
//   sub: string;
//   role: string;
// }

type DisasterStats = {
  rescueTeamsDeployed: string;
  affectedPeople: string;
  numberOfPeopleRescued: string;
  casualties: string;
  detailedDescription: string;
  evacuationCentres: string;
  disasterReportId: string;
};

interface Report {
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

export default function RescueTeamDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingStats, setEditingStats] = useState<DisasterStats | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Create refs for form inputs
  const affectedPeopleRef = useRef<HTMLInputElement>(null);
  const peopleRescuedRef = useRef<HTMLInputElement>(null);
  const casualtiesRef = useRef<HTMLInputElement>(null);
  const evacuationCentresRef = useRef<HTMLInputElement>(null);
  const detailedDescriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  // Add authentication check
  useEffect(() => {
    // const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (username) {
      // const decodeToken = jwtDecode<CustomJwtPayload>(token);
      // const username = decodeToken?.sub;
      //setUser(username);
      if (
        username === "admin" ||
        username === "moderator" ||
        username === "MODERATOR" ||
        username === "ADMIN"
      ) {
        router.push("/dashboard");
      } else if (username === "VENDOR" || username === "vendor") {
        router.push("/vendor");
      } else {
        router.push("/");
      }
    }
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`
      );
      const data = await response.json();

      const statusOrder = ["PENDING", "IN_PROGRESS", "COMPLETED"];
      const sortedData = data.sort((a: Report, b: Report) => {
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

  const startResponding = (report: Report) => {
    setEditingStats({
      rescueTeamsDeployed: "0",
      affectedPeople: "0",
      numberOfPeopleRescued: "0",
      casualties: "0",
      detailedDescription: "",
      evacuationCentres: "0",
      disasterReportId: report.id,
    });
    setSelectedReport(report);
    // Close sidebar on mobile when viewing report details
    setIsSidebarOpen(false);
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

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      PENDING:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30",
      IN_PROGRESS:
        "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30",
      COMPLETED:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30",
      DISMISSED:
        "bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-200 border border-gray-200 dark:border-neutral-500/30",
    };

    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const submitResponse = async () => {
    if (!selectedReport || !editingStats) return;

    const updatedStats = {
      ...editingStats,
      affectedPeople: affectedPeopleRef.current?.value || "0",
      numberOfPeopleRescued: peopleRescuedRef.current?.value || "0",
      casualties: casualtiesRef.current?.value || "0",
      evacuationCentres: evacuationCentresRef.current?.value || "0",
      detailedDescription: detailedDescriptionRef.current?.value || "",
    };

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/review-report/addReviewReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedStats),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review report");
      }

      const team_id = selectedReport.teamAssign?.team_id;
      if (team_id) {
        try {
          const unassignResponse = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/team_assign/unassign/${team_id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (unassignResponse.status !== 200) {
            console.warn("Failed to unassign team");
          }
        } catch (unassignError) {
          console.error("Error unassigning team:", unassignError);
        }
      }

      await fetchReports();
      setSelectedReport(null);
      setEditingStats(null);
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const StatInput = ({
    label,
    defaultValue,
    inputRef,
    type = "number",
  }: {
    label: string;
    defaultValue: string;
    inputRef: React.RefObject<HTMLInputElement>;
    type?: string;
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={label}
        className="text-sm text-neutral-800 dark:text-neutral-400"
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        min="0"
        defaultValue={defaultValue}
        ref={inputRef}
        onChange={(e) => {
          if (type === "number" && !/^\d*$/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^\d]/g, "");
          }
        }}
        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-300 dark:border-neutral-800 border-t-blue-500 dark:border-t-blue-400"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-white flex flex-col md:flex-row dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-950 dark:to-black dark:text-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
        <div className="p-2 hover:bg-neutral-800 rounded-lg"></div>
        <h1 className="text-xl font-bold bg-gradient-to-r text-white bg-clip-text">
          Rescue Team
        </h1>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Sidebar */}
      <aside
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        fixed md:relative
        inset-y-0 left-0
        w-64 bg-gray-100 dark:bg-neutral-900/50 backdrop-blur-md
        border-r border-gray-200 dark:border-neutral-800
        flex flex-col
        z-30
        transition-transform duration-200 ease-in-out
      `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-black dark:text-transparent">
            Rescue Team
          </h1>
        </div>

        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-3 hover:bg-blue-200 dark:hover:bg-blue-500/10"
              >
                <FileText className="w-5 h-5" />
                Reports
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow text-left">
                <p className="text-sm font-medium text-black dark:text-white">
                  Rescue Team Member
                </p>
                <p className="text-xs text-gray-600 dark:text-neutral-400">
                  Vendor | {localStorage.getItem("username") || "Rescue Team"}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg"
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
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              Disaster Reports
            </h1>
            <p className="text-gray-500 dark:text-neutral-400">
              Respond to and manage disaster reports
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-neutral-400 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-400 w-5 h-5" />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {reports.length > 0 ? (
              reports
                .filter(
                  (report) =>
                    report.title
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    report.location
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((report) => (
                  <div
                    key={report.reportId}
                    onClick={() => startResponding(report)}
                    className="group g-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 cursor-pointer rounded-xl p-6 transition-all shadow-sm dark:shadow-neutral-800"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.title || "Untitled Report"}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeColor(
                            report.status as
                              | "PENDING"
                              | "IN_PROGRESS"
                              | "COMPLETED"
                              | "RESPONDED"
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-500 dark:text-neutral-400 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {report.reviewReport && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-200 dark:bg-neutral-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600 dark:text-neutral-400 text-sm">
                                Affected People
                              </span>
                            </div>
                            <p className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                              {report.reviewReport.affectedPeople}
                            </p>
                          </div>
                          <div className="bg-gray-200 dark:bg-neutral-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600 dark:text-neutral-400 text-sm">
                                Casualties
                              </span>
                            </div>
                            <p className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                              {report.reviewReport.casualties}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-1 lg:col-span-2 text-center py-16 bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded-xl">
                <FileText className="mx-auto mb-4 w-12 h-12 text-gray-500 dark:text-neutral-500" />
                <p className="text-lg text-gray-600 dark:text-neutral-400">
                  No reports found.
                </p>
                <button
                  onClick={() => {
                    fetchReports();
                  }}
                  className="mt-4 px-4 py-2 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700 rounded-lg text-gray-900 dark:text-white transition-all text-sm"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Report Details Sidebar - Mobile Optimized */}
      {selectedReport && (
        <div
          className={`fixed inset-0 md:inset-y-0 md:right-0 md:w-[480px]
    bg-white dark:bg-neutral-800/95 backdrop-blur-xl
    border-l border-neutral-300 dark:border-neutral-700
    shadow-2xl z-50
    overflow-y-auto
    transition-transform duration-200 ease-in-out
    ${selectedReport ? "translate-x-0" : "translate-x-full"}
  `}
        >
          <div className="p-6 border-b border-neutral-300 dark:border-neutral-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Report Response
            </h2>
            <button
              onClick={() => {
                setSelectedReport(null);
                setEditingStats(null);
              }}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {selectedReport.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeColor(
                    selectedReport.status as
                      | "PENDING"
                      | "IN_PROGRESS"
                      | "RESPONDED"
                      | "COMPLETED"
                  )}`}
                >
                  {selectedReport.status}
                </span>
              </div>

              <div className="bg-neutral-200 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl p-4">
                <h4 className="text-neutral-700 dark:text-neutral-400 text-sm mb-2">
                  Description
                </h4>
                <p className="text-black dark:text-white">
                  {selectedReport.description}
                </p>
              </div>

              {editingStats ? (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <h4 className="text-blue-400 text-sm mb-4">
                      Enter Disaster Statistics
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <StatInput
                        label="Affected People"
                        defaultValue={editingStats.affectedPeople}
                        inputRef={affectedPeopleRef}
                        type="number"
                      />
                      <StatInput
                        label="People Rescued"
                        defaultValue={editingStats.numberOfPeopleRescued}
                        inputRef={peopleRescuedRef}
                        type="number"
                      />
                      <StatInput
                        label="Casualties"
                        defaultValue={editingStats.casualties}
                        inputRef={casualtiesRef}
                        type="number"
                      />
                      <StatInput
                        label="Evacuation Centres"
                        defaultValue={editingStats.evacuationCentres}
                        inputRef={evacuationCentresRef}
                        type="number"
                      />
                      <StatInput
                        label="Detailed Description"
                        defaultValue={editingStats.detailedDescription}
                        inputRef={detailedDescriptionRef}
                        type="text"
                      />
                    </div>
                  </div>

                  <button
                    onClick={submitResponse}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-blue-500/50 rounded-lg text-white flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving Response...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Submit Response
                      </>
                    )}
                  </button>
                </div>
              ) : (
                !editingStats &&
                selectedReport.reviewReport && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-200 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <h4 className="text-neutral-600 dark:text-neutral-400 text-sm">
                            Affected People
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-black dark:text-white">
                          {selectedReport.reviewReport.affectedPeople}
                        </p>
                      </div>
                      <div className="bg-neutral-200 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <h4 className="text-neutral-600 dark:text-neutral-400 text-sm">
                            Casualties
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-black dark:text-white">
                          {selectedReport.reviewReport.casualties}
                        </p>
                      </div>
                      <div className="bg-neutral-200 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-neutral-600 dark:text-neutral-400 text-sm">
                            Evacuation Centers
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1 text-black dark:text-white">
                          {selectedReport.reviewReport.evacuationCentres}
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-200 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Shell className="w-4 h-4 text-neutral-400" />
                        <h4 className="text-neutral-600 dark:text-neutral-400 text-sm">
                          Response Information
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Team Name:
                          </span>{" "}
                          <span className="text-black dark:text-white">
                            {selectedReport.teamAssign?.teamName ||
                              "Not Assigned"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Team Status:
                          </span>{" "}
                          <span className="text-black dark:text-white">
                            {selectedReport.teamAssign?.status || "Pending"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Disaster Type:
                          </span>{" "}
                          <span className="text-black dark:text-white">
                            {selectedReport.disasterType}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Severity:
                          </span>{" "}
                          <span className="text-black dark:text-white">
                            {selectedReport.severity}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

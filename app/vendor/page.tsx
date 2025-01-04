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
  BarChart,
  Heart,
  Home,
  Shell,
  Save,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  sub: string;
  role: string;
}

// Types remain the same
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

  // Create refs for form inputs
  const affectedPeopleRef = useRef<HTMLInputElement>(null);
  const peopleRescuedRef = useRef<HTMLInputElement>(null);
  const casualtiesRef = useRef<HTMLInputElement>(null);
  const evacuationCentresRef = useRef<HTMLInputElement>(null);
  const detailedDescriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodeToken = jwtDecode<CustomJwtPayload>(token);
      const username = decodeToken?.sub;
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

  const getStatusBadgeColor = (status: keyof typeof colors) => {
    const colors = {
      PENDING: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
      IN_PROGRESS: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
      RESPONDED: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
      COMPLETED:
        "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    };
    return colors[status];
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
      <label className="text-sm text-neutral-400">{label}</label>
      <input
        type={type}
        min="0"
        defaultValue={defaultValue}
        ref={inputRef}
        onChange={(e) => {
          if (type === "number" && !/^\d*$/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^\d]/g, "");
          }
        }}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
      />
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
            Rescue Team
          </h1>
        </div>

        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-3"
              >
                <FileText className="w-5 h-5" />
                Reports
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </li>
            <li>
              <Link
                href="/teams"
                className="px-4 py-3 rounded-lg hover:bg-neutral-800 text-neutral-400 flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Team Status
              </Link>
            </li>
            <li>
              <Link
                href="/analytics"
                className="px-4 py-3 rounded-lg hover:bg-neutral-800 text-neutral-400 flex items-center gap-3"
              >
                <BarChart className="w-5 h-5" />
                Analytics
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow text-left">
                <p className="text-sm font-medium">Rescue Team Member</p>
                <p className="text-xs text-neutral-400">
                  Vendor | {localStorage.getItem("username") || "Rescue Team"}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
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
          <div>
            <h1 className="text-2xl font-bold">Disaster Reports</h1>
            <p className="text-neutral-400">
              Respond to and manage disaster reports
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              placeholder="Search reports by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className="group bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
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

                      <div className="flex items-center gap-4 text-sm text-neutral-400">
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
                          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-neutral-400 text-sm">
                                Affected People
                              </span>
                            </div>
                            <p className="text-xl font-bold mt-1">
                              {report.reviewReport.affectedPeople}
                            </p>
                          </div>
                          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-neutral-400 text-sm">
                                Casualties
                              </span>
                            </div>
                            <p className="text-xl font-bold mt-1">
                              {report.reviewReport.casualties}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-1 lg:col-span-2 text-center py-16 bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-800">
                <FileText className="mx-auto mb-4 w-12 h-12 text-neutral-500" />
                <p className="text-lg text-neutral-400">No reports founds.</p>
                <button
                  onClick={() => {
                    fetchReports();
                  }}
                  className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Report Details Sidebar */}
      {selectedReport && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-800 shadow-2xl z-50 overflow-y-auto">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Response</h2>
            <button
              onClick={() => {
                setSelectedReport(null);
                setEditingStats(null);
              }}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
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

              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                <h4 className="text-neutral-400 text-sm mb-2">Description</h4>
                <p className="text-white">{selectedReport.description}</p>
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
                    className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white flex items-center justify-center gap-2"
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
                      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <h4 className="text-neutral-400 text-sm">
                            Affected People
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {selectedReport.reviewReport.affectedPeople}
                        </p>
                      </div>
                      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <h4 className="text-neutral-400 text-sm">
                            Casualties
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {selectedReport.reviewReport.casualties}
                        </p>
                      </div>
                      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-neutral-400 text-sm">
                            Evacuation Centers
                          </h4>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {selectedReport.reviewReport.evacuationCentres}
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Shell className="w-4 h-4 text-neutral-400" />
                        <h4 className="text-neutral-400 text-sm">
                          Response Information
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-neutral-400">Team Name:</span>{" "}
                          <span className="text-white">
                            {selectedReport.teamAssign?.teamName ||
                              "Not Assigned"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-400">Team Status:</span>{" "}
                          <span className="text-white">
                            {selectedReport.teamAssign?.status || "Pending"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-400">
                            Disaster Type:
                          </span>{" "}
                          <span className="text-white">
                            {selectedReport.disasterType}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-neutral-400">Severity:</span>{" "}
                          <span className="text-white">
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
    </div>
  );
}

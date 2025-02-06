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
import ReportDetailModel from "@/components/ReportDetailModel";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [reload, setReload] = useState(false);

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
      DISMISSED:
        "bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-200 border border-gray-200 dark:border-neutral-500/30",
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

        {/* Main Content */}
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
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden flex p-2 z-50 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-gray-200 dark:border-neutral-800 ml-4"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-900 dark:text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
                  )}
                </button>
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

      <ReportDetailModel
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

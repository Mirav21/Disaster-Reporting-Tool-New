import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  Clock,
  Phone,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  CalendarClock,
  Shield,
  FileText,
  ImageIcon,
  TwitterIcon,
} from "lucide-react";
import Map, { Marker, Popup } from "react-map-gl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterShareButton,
} from "react-share";

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

interface Team {
  team_id: string;
  teamName: string;
  status: string;
}

interface ReportDetailModalProps {
  role: string | null;
  report: Report | null;
  onClose: () => void;
  onAssignTeam: (reportId: string) => void;
  selectedTeam: string;
  setSelectedTeam: (teamId: string) => void;
  teams: Team[];
  onUpdateStatus: (reportId: string, status: string) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  role,
  report,
  onClose,
  onAssignTeam,
  selectedTeam,
  setSelectedTeam,
  teams,
  onUpdateStatus,
}) => {
  const isAdminOrModerator = ["admin", "moderator"].includes(
    role?.toLowerCase() || ""
  );
  const [activeTab, setActiveTab] = useState("details");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (report?.location) {
      const [lat, lng] = report.location.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates([lng, lat]);
      }
    }
  }, [report?.location]);

  if (!report) return null;

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING:
        "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 dark:border-yellow-500/30",
      IN_PROGRESS:
        "bg-blue-500/10 dark:bg-blue-500/20 text-green-600 dark:text-green-400 border-blue-500/20 dark:border-blue-500/30",
      COMPLETED:
        "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
      DISMISSED:
        "bg-neutral-500/10 dark:bg-neutral-500/20 text-neutral-600 dark:text-neutral-400 border-neutral-500/20 dark:border-neutral-500/30",
    };
    const icons = {
      PENDING: Clock,
      IN_PROGRESS: Activity,
      COMPLETED: CheckCircle,
      DISMISSED: XCircle,
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
          badges[status as keyof typeof badges]
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{status}</span>
      </div>
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 border-green-500/20 dark:border-green-500/30",
      MEDIUM:
        "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/20 dark:border-yellow-500/30",
      HIGH: "text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 border-red-500/20 dark:border-red-500/30",
      CRITICAL:
        "text-red-700 dark:text-red-300 bg-red-600/10 dark:bg-red-600/20 border-red-600/20 dark:border-red-600/30",
    };
    return colors[severity as keyof typeof colors] || colors.MEDIUM;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="grid gap-6">
            <Card className="bg-white dark:bg-black/50 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-gray-700 font-bold dark:text-gray-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Description
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {report.description}
                  </p>
                </div>

                {coordinates && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <Map
                      initialViewState={{
                        longitude: coordinates[0],
                        latitude: coordinates[1],
                        zoom: 14,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      mapStyle="mapbox://styles/mapbox/dark-v10"
                      mapboxAccessToken={
                        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                      }
                    >
                      <Marker
                        longitude={coordinates[0]}
                        latitude={coordinates[1]}
                        anchor="bottom"
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                        </div>
                      </Marker>

                      <Popup
                        longitude={coordinates[0]}
                        latitude={coordinates[1]}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="top"
                        offset={20}
                      >
                        Incident Location
                      </Popup>
                    </Map>
                  </div>
                )}

                {report.imageUrl && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-gray-700 dark:text-gray-300 font-bold mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-green-400" />
                      Incident Image
                    </h4>
                    <div className="relative w-full h-64 rounded-lg">
                      <img
                        src={report.imageUrl}
                        alt="Incident"
                        className="w-full h-full object-fill rounded-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-gray-700 font-bold dark:text-gray-300">
                        Location
                      </h4>
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      {report.location}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-gray-700 font-bold dark:text-gray-300">
                        Contact
                      </h4>
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      {report.contactInfo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "team":
        return (
          <div className="space-y-6">
            {report.status === "IN_PROGRESS" && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Team Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => onAssignTeam(report.reportId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                    disabled={!selectedTeam}
                  >
                    <Users className="w-4 h-4" />
                    Assign Team
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "review":
        return (
          report.reviewReport && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Review Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-slate-300 mb-2">Affected People</h4>
                    <p className="text-2xl font-bold text-white">
                      {report.reviewReport.affectedPeople}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-slate-300 mb-2">Casualties</h4>
                    <p className="text-2xl font-bold text-white">
                      {report.reviewReport.casualties}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-slate-300 mb-2">People Rescued</h4>
                    <p className="text-2xl font-bold text-white">
                      {report.reviewReport.numberOfPeopleRescued || "0"}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-slate-300 mb-2">Evacuation Centres</h4>
                    <p className="text-white">
                      {report.reviewReport.evacuationCentres}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        );
      default:
        return null;
    }
  };

  const url = "https://dhruvasetu.vercel.app" as string;
  const title = `${report.disasterType} happened at ${report.location}`;
  const text = `Urgent Alert: A ${report.disasterType} has struck ${report.location}. Stay informed, Stay safe and support the relief efforts.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/90 dark:bg-black/90">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {report.title || `${report.disasterType} Report`}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                  <span className="text-sm">ID: {report.reportId}</span>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <CalendarClock className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { id: "details", label: "Details", icon: FileText },
              ...(report.status !== "PENDING"
                ? [{ id: "team", label: "Team Assignment", icon: Users }]
                : []),
              ...(report.reviewReport
                ? [{ id: "review", label: "Review Report", icon: CheckCircle }]
                : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-500/10 dark:bg-blue-500/20 text-green-600 dark:text-green-400 border border-blue-500/20 dark:border-blue-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center mt-5 gap-4">
            <FacebookShareButton
              url={url}
              hashtag={`${title} - ${text}` || ""}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold border-2 py-2 px-4 rounded-lg transition-all duration-300"
            >
              <FacebookIcon className="w-8 h-8" />
              <span className="text-xl">Share on Facebook</span>
            </FacebookShareButton>

            <TwitterShareButton
              url={url}
              title={`${title} - ${text}`}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold border-2 py-2 px-4 rounded-lg transition-all duration-300"
            >
              <TwitterIcon className="w-8 h-8" />
              <span className="text-xl">Alert on Twitter</span>
            </TwitterShareButton>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {getStatusBadge(report.status)}
              <div
                className={`px-3 py-1 rounded-full border ${getSeverityColor(
                  report.severity
                )}`}
              >
                {report.disasterType}
              </div>
            </div>
            <div className="flex gap-3">
              {report.status === "PENDING" && isAdminOrModerator && (
                <Button
                  onClick={() => onUpdateStatus(report.id, "IN_PROGRESS")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Verify Report
                </Button>
              )}
              {report.status === "IN_PROGRESS" && report.reviewReport && (
                <Button
                  onClick={() => onUpdateStatus(report.id, "COMPLETED")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;

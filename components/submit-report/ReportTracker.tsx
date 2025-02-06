"use client";
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

// Dynamically import Map and Marker with no SSR
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
    DISMISSED:
      "bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-200 border border-gray-200 dark:border-neutral-500/30",
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
    HIGH: "text-red-600 dark:text-red-400",
    MEDIUM: "text-yellow-600 dark:text-yellow-400",
    LOW: "text-green-600 dark:text-green-400",
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

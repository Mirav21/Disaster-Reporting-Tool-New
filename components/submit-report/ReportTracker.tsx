"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = dynamic(() => import("react-map-gl"), {
  ssr: false,
});

interface ReportDetails {
  longitude: number;
  latitude: number;
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

export function ReportTracker() {
  const [reportId, setReportId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReportDetails(null);
    setLoading(true);

    if (!reportId.trim()) {
      setError("Please enter a report ID");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/disaster-report/admin-reports`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();

      const matchedReport = data.find(
        (report: ReportDetails) =>
          report.reportId === reportId || report.id === reportId
      );

      if (!matchedReport) {
        setError("Report not found. Please check the ID and try again.");
        setLoading(false);
        return;
      }

      if (matchedReport.location) {
        // If location is coordinates (like "23.235789, 72.663040")
        if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(matchedReport.location)) {
          const [latitude, longitude] = matchedReport.location
            .split(",")
            .map(parseFloat);
          matchedReport.latitude = latitude;
          matchedReport.longitude = longitude;
        }
        // If location is an address and Mapbox token is available
        else if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
          try {
            const geocodeResponse = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                matchedReport.location
              )}.json?access_token=${
                process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              }`
            );

            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.features && geocodeData.features.length > 0) {
                const [longitude, latitude] = geocodeData.features[0].center;
                matchedReport.longitude = longitude;
                matchedReport.latitude = latitude;
              }
            }
          } catch (geocodeError) {
            console.error("Geocoding failed", geocodeError);
          }
        }
      }

      setReportDetails(matchedReport);
    } catch (error) {
      console.error("Error fetching report", error);
      setError("Unable to fetch reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  function getStatusColor(status: string): string {
    if (!status) return "text-white";

    const colors: { [key: string]: string } = {
      PENDING: "text-yellow-400",
      IN_PROGRESS: "text-blue-400",
      COMPLETED: "text-green-400",
      REJECTED: "text-red-400",
    };
    return colors[status.toUpperCase() as keyof typeof colors] || "text-white";
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex h-9 items-center mt-10 gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm text-emerald-400">
          <Search className="w-4 h-4" />
          Track Your Report Status
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Track Your Report
          <span className="block bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Stay Informed
          </span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Enter your report ID to check the current status and updates
        </p>
      </div>

      {/* Dynamic Layout Container */}
      <div className="flex justify-center">
        <div
          className={`transition-all duration-300 ease-in-out 
          ${
            reportDetails
              ? "w-full grid md:grid-cols-2 gap-8"
              : "max-w-lg w-full"
          }`}
        >
          {/* Form Section */}
          <div
            className={`bg-zinc-900/50 backdrop-blur-xl rounded-2xl border 
            border-white/5 p-6 w-full transition-all duration-300
            ${reportDetails ? "" : "mx-auto"}`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="reportId"
                  className="block text-sm font-medium mb-2 text-zinc-400"
                >
                  Report ID
                </label>
                <input
                  type="text"
                  id="reportId"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/5 rounded-xl
                           text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                           focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  placeholder="Enter your report ID"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 
                         text-white py-3 px-4 rounded-xl hover:from-emerald-400 
                         hover:to-green-500 transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{loading ? "Searching..." : "Track Report"}</span>
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div
            className={`transition-all duration-300 
            ${
              reportDetails
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 absolute"
            }`}
          >
            {reportDetails && (
              <div className="rounded-xl border border-white/5 bg-black/30 backdrop-blur-xl p-6 h-full">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Report Details
                </h2>

                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-900/20">
                    <span className="text-zinc-400">Status</span>
                    <span
                      className={`font-medium ${getStatusColor(
                        reportDetails.status
                      )} 
                        px-3 py-1 rounded-full bg-emerald-900/10`}
                    >
                      {reportDetails.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-900/20">
                    <span className="text-zinc-400">Assigned Team</span>
                    <span className="text-white font-mono">
                      {reportDetails?.teamAssign?.teamName ||
                        "No team assigned"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 space-y-1.5">
                    <span className="text-zinc-400 text-sm">Image</span>
                    {reportDetails.imageUrl ? (
                      <Image
                        src={reportDetails.imageUrl}
                        alt="Report"
                        className="rounded-lg shadow-lg border border-white/5"
                        width={500}
                        height={300}
                        layout="responsive"
                      />
                    ) : (
                      <p className="text-white text-sm">
                        No image available for this report.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-900/20">
                    <span className="text-zinc-400">Report ID</span>
                    <span className="text-white font-mono">
                      {reportDetails.reportId || reportDetails.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-900/20">
                    <span className="text-zinc-400">Submitted On</span>
                    <span className="text-white">
                      {new Date(reportDetails.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-900/20 space-y-1.5">
                    <span className="text-zinc-400 text-sm">Title</span>
                    <span className="text-white block font-medium">
                      {reportDetails.title}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-900/20 space-y-1.5">
                    <span className="text-zinc-400 text-sm">Location</span>
                    <span className="text-white block font-medium">
                      {reportDetails.location}
                    </span>
                  </div>

                  {reportDetails?.location && (
                    <div className="p-3 rounded-lg bg-white/5 space-y-1.5">
                      <span className="text-zinc-400 text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location
                      </span>
                      <div className="h-64 w-full rounded-lg overflow-hidden border border-white/10">
                        {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? (
                          <div className="w-full h-full flex items-center justify-center text-yellow-400 bg-yellow-900/10 p-4">
                            Mapbox token is not configured. Please set
                            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
                          </div>
                        ) : reportDetails.latitude &&
                          reportDetails.longitude ? (
                          <Map
                            initialViewState={{
                              latitude: reportDetails.latitude,
                              longitude: reportDetails.longitude,
                              zoom: 14,
                            }}
                            style={{ width: "100%", height: "100%" }}
                            mapStyle="mapbox://styles/mapbox/dark-v11"
                            mapboxAccessToken={
                              process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                            }
                          >
                            <Marker
                              longitude={reportDetails.longitude}
                              latitude={reportDetails.latitude}
                            >
                              <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                            </Marker>
                          </Map>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-yellow-400 bg-yellow-900/10 p-4">
                            Unable to resolve location coordinates
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm mt-2">
                        {reportDetails.location}
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-emerald-900/20 space-y-1.5">
                    <span className="text-zinc-400 text-sm">Description</span>
                    <p className="text-white text-sm leading-relaxed">
                      {reportDetails.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

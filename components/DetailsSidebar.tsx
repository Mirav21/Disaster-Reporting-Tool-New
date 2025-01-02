import { useState } from "react";
import { Award, MapPin, Users, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Report, ReportStatus, RescueTeam } from "@/types/types";

interface DetailsSidebarProps {
  report: Report;
  onClose: () => void;
  onUpdate: (id: string, status: ReportStatus) => void;
  onAssign: (id: string, teamId: string) => void;
  rescueTeams: RescueTeam[];
}

export const DetailsSidebar: React.FC<DetailsSidebarProps> = ({
  report,
  onClose,
  onUpdate,
  onAssign,
  rescueTeams,
}) => {
  const [newResponse, setNewResponse] = useState("");

  const hasResponse = report.moderatorResponses.length > 0;

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return;

    try {
      const response = await fetch(`/api/reports/${report.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newResponse }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      setNewResponse("");
      toast.success("Response added successfully");
    } catch (error) {
      console.error("Error adding response:", error);
      toast.error("Failed to add response");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-br from-neutral-800 to-neutral-900 border-l border-neutral-700 shadow-xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-neutral-700 flex justify-between items-center sticky top-0 bg-neutral-900 rounded-t-lg">
        <h2 className="text-xl font-semibold text-neutral-100">
          Report Details
        </h2>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition duration-300"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        <Card className="bg-neutral-800 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-neutral-100">{report.title}</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={report.status}
                onChange={(e) =>
                  onUpdate(report.id, e.target.value as ReportStatus)
                }
                className="bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300"
              >
                {Object.values(ReportStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-neutral-700 rounded-lg p-4">
              <h4 className="text-neutral-300 text-sm mb-2">Description</h4>
              <p className="text-neutral-100">{report.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-neutral-300" />
                  <h4 className="text-neutral-300 text-sm">Type</h4>
                </div>
                <p className="text-neutral-100">
                  {report.type.replace("_", " ")}
                </p>
              </div>

              <div className="bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-neutral-300" />
                  <h4 className="text-neutral-300 text-sm">Location</h4>
                </div>
                <p className="text-neutral-100">{report.location || "N/A"}</p>
              </div>
            </div>

            <div className="bg-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-neutral-300" />
                <h4 className="text-neutral-300 text-sm">Rescue Team</h4>
              </div>

              {report.assignedTeams.length > 0 ? (
                <p className="text-neutral-100">
                  {report.assignedTeams[0].name} (
                  {report.assignedTeams[0].specialization})
                </p>
              ) : (
                <select
                  onChange={(e) => onAssign(report.id, e.target.value)}
                  className="bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300 w-full"
                >
                  <option value="">Assign a team</option>
                  {rescueTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.specialization})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <Textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Write a response"
                className="bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition duration-300"
                disabled={hasResponse}
              />
              <Button
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-neutral-100 rounded-lg transition duration-300"
                onClick={handleSubmitResponse}
                disabled={!newResponse.trim() || hasResponse}
              >
                Submit Response
              </Button>
            </div>

            {hasResponse && (
              <div className="bg-neutral-700 rounded-lg p-4">
                <h4 className="text-neutral-300 text-sm mb-2">
                  Moderator Responses
                </h4>
                {report.moderatorResponses.map((response) => (
                  <div key={response.id} className="mb-2">
                    <p className="text-neutral-100">{response.message}</p>
                    <p className="text-neutral-400 text-sm">
                      By {response.moderator.name} on{" "}
                      {new Date(response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

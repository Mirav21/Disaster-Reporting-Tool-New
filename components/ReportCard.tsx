import { ReportStatus, Report } from "@/types/types";
import { Clock, RefreshCw, Check, XCircle, Users } from "lucide-react";


interface ReportCardProps {
  report: Report;
  isSelected: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isSelected,
  onClick,
}) => {
  const getStatusIcon = (status: ReportStatus) => {
    const icons = {
      [ReportStatus.PENDING]: <Clock className="text-amber-300" />,
      [ReportStatus.IN_PROGRESS]: <RefreshCw className="text-sky-300" />,
      [ReportStatus.RESOLVED]: <Check className="text-emerald-300" />,
      [ReportStatus.DISMISSED]: <XCircle className="text-neutral-300" />,
    };
    return icons[status];
  };

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      [ReportStatus.PENDING]: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
      [ReportStatus.IN_PROGRESS]: "bg-sky-500/20 text-sky-200 border border-sky-500/30",
      [ReportStatus.RESOLVED]: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
      [ReportStatus.DISMISSED]: "bg-neutral-500/20 text-neutral-200 border border-neutral-500/30",
    };
    return colors[status];
  };

  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border ${
        isSelected ? "border-blue-500/50" : "border-neutral-800 hover:border-neutral-700"
      } transition-all shadow-lg cursor-pointer`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            {getStatusIcon(report.status)}
            <h2 className="text-lg font-semibold text-neutral-100 flex-grow truncate">
              {report.title}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                report.status
              )}`}
            >
              {report.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-neutral-300 text-sm line-clamp-2">
            {report.description}
          </p>
          {report.assignedTeams.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Users className="w-4 h-4" />
              <span>Assigned to: {report.assignedTeams[0].name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
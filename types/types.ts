export enum ReportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum ReportType {
  EMERGENCY = "EMERGENCY",
  NON_EMERGENCY = "NON_EMERGENCY",
  MAINTENANCE = "MAINTENANCE",
}

export type User = {
  id: string;
  name: string;
};

export type RescueTeam = {
  id: string;
  name: string;
  specialization: string;
  isAvailable: boolean;
};

export type ModeratorResponse = {
  id: string;
  message: string;
  createdAt: string;
  moderatorId: string;
  moderator: User;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  type: ReportType;
  location?: string;
  createdAt: string;
  user: User;
  image?: string;
  assignedTeams: RescueTeam[];
  moderatorResponses: ModeratorResponse[];
};

export interface UserStats {
  reportsSubmitted: number;
  communitiesHelped: number;
  responseRate: number;
}

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  location: string;
  role: "ADMIN" | "MODERATOR" | "USER";
  createdAt: Date;
}

export interface RecentReport {
  id: string;
  type: string;
  location: string;
  date: Date;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  urgency: "CRITICAL" | "LOW_PRIORITY" | "EMERGENCY" | "NON_EMERGENCY";
}

export type DisasterReportWeather = {
  id: string;
  type: string;
  location: {
    lat: number;
    lon: number;
  };
  description: string;
  timestamp: number;
}

export type WeatherData = {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

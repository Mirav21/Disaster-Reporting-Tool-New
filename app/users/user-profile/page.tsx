'use client'

import React, { useEffect, useState } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Bell, 
  FileText, 
  Settings, 
  Calendar,
  Activity,
  Star,
  Loader2
} from "lucide-react";
import { UserProfileData, UserStats, RecentReport } from "@/types/types";

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [reports, setReports] = useState<RecentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        const userId = "2";

        const profileRes = await fetch(`/api/user/${userId}`);
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();

        const statsRes = await fetch(`/api/user/${userId}/stats`);
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();

        // Fetch recent reports
        const reportsRes = await fetch(`/api/user/${userId}/reports?limit=3`);
        if (!reportsRes.ok) throw new Error('Failed to fetch reports');
        const reportsData = await reportsRes.json();

        setProfile(profileData);
        setStats(statsData);
        setReports(reportsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading profile</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const userStats = [
    {
      label: "Reports Submitted",
      value: stats?.reportsSubmitted.toString() ?? "0",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      trend: "Loading..."
    },
    {
      label: "Communities Helped",
      value: stats?.communitiesHelped.toString() ?? "0",
      icon: <MapPin className="h-5 w-5 text-purple-500" />,
      trend: "Loading..."
    },
    {
      label: "Response Rate",
      value: `${Math.round(stats?.responseRate ?? 0)}%`,
      icon: <Activity className="h-5 w-5 text-teal-500" />,
      trend: "Loading..."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="absolute inset-0 bg-black opacity-70" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-green-800">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 p-0.5">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-100" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-gray-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-100">{profile.name}</h1>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-blue-400 flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4" />
                    Member since {new Date(profile.createdAt).getFullYear()}
                  </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4" />
                  Contact via app
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {userStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-800 hover:border-green-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-2">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6 text-gray-100">Recent Reports</h2>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm">{report.type}</td>
                      <td className="px-6 py-4 text-sm">{report.location}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            report.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'}`}>
                          {report.status ? report.status.replace('_', ' ') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${report.urgency === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-400' :
                            report.urgency === 'CRITICAL' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'}`}>
                          {report.urgency ? report.urgency.replace('_', ' ') : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900/50 backdrop-blur-sm p-4 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-all">
            <Bell className="h-5 w-5 text-amber-500" />
            <span>Notifications</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900/50 backdrop-blur-sm p-4 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-all">
            <Settings className="h-5 w-5 text-purple-500" />
            <span>Settings</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900/50 backdrop-blur-sm p-4 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-all">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Activity Log</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900/50 backdrop-blur-sm p-4 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-all">
            <Shield className="h-5 w-5 text-teal-500" />
            <span>Privacy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
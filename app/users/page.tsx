"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  FileText,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

// Types to match Prisma schema
type UserRole = "USER" | "ADMIN" | "MODERATOR";
type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  _count: {
    reports: number;
  };
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user`);
      const data = await response.json();
      setUsers(data || []);
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const renderUserCard = (user: User) => (
    <div
      key={user.id}
      onClick={() => setSelectedUser(user)}
      className={`bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border transition-all shadow-lg cursor-pointer ${
        selectedUser?.id === user.id
          ? "border-blue-500/50"
          : "border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-100 flex-grow truncate">
              {user.name || "Unnamed User"}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                user.role === "ADMIN"
                  ? "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                  : user.role === "MODERATOR"
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                  : "bg-neutral-500/20 text-neutral-200 border border-neutral-500/30"
              }`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 text-sm">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>
          <div className="text-neutral-400 text-xs">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-grow">
          <div className="px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Main Menu
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-blue-500/10 cursor-pointer flex items-center gap-3 text-blue-400 transition-colors group"
              >
                <FileText className="w-5 h-5" />
                Reports
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <User className="w-5 h-5" />
                Users
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>

          <div className="px-4 py-2 mt-6 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Settings
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/notifications"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <Bell className="w-5 h-5" />
                Notifications
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="px-4 py-3 mx-2 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group"
              >
                <Settings className="w-5 h-5" />
                Settings
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow text-left">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-neutral-400">Administrator</p>
              </div>
              <MoreHorizontal className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-lg"
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
      <main className="flex-grow bg-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 flex justify-between items-center">
            <div className="relative flex-grow mr-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as UserRole | "ALL")
                }
                className="appearance-none bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            </div>
          </div>

          {/* Users List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users && users.length > 0 ? (
              users.map(renderUserCard)
            ) : (
              <div className="text-center py-16 text-neutral-400 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <User className="mx-auto mb-4 w-12 h-12 text-neutral-500" />
                <p className="text-lg">
                  No users found matching the selected filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-neutral-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* User Details Sidebar */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-96 bg-neutral-900 border-l border-neutral-800 shadow-2xl z-50 overflow-y-auto">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Details</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Name</span>
              <span className="text-neutral-200">
                {selectedUser.name || "Unnamed User"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Email</span>
              <span className="text-neutral-200">{selectedUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Role</span>
              <div className="flex gap-2">
                {["USER", "MODERATOR", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() =>
                      handleRoleChange(selectedUser, role as UserRole)
                    }
                    className="text-sm bg-neutral-700 hover:bg-neutral-600 rounded-full px-4 py-1"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Reports</span>
              <span className="text-neutral-200">
                {selectedUser._count.reports}
              </span>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="w-full px-6 py-2 bg-red-600 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4 inline-block mr-2" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

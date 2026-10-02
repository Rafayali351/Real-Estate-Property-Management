'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Toggle Active State
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.users.getAll({
        search: search || undefined,
        page,
        pageSize: 15,
      });
      setUsers(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      error(err.message || 'Could not load registered users.');
    } finally {
      setLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async () => {
    if (!toggleUser) return;
    setUpdating(true);
    try {
      const newStatus = !(toggleUser.isActive ?? true);
      await api.admin.users.toggleActive(toggleUser.userId, newStatus);
      success(`User account has been ${newStatus ? 'unblocked' : 'blocked'}.`);
      setToggleUser(null);
      await loadUsers();
    } catch (err: any) {
      error(err.message || 'Could not update user status.');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      header: 'User / Investor',
      accessor: (u: User) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-white">{u.fullName}</p>
            {u.role === 'Admin' && (
              <span className="p-0.5 rounded bg-gold/20 text-gold" title="Administrator">
                <Shield className="w-3 h-3" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-muted">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: (u: User) => (
        <span className="text-white font-mono">{u.phone}</span>
      ),
    },
    {
      header: 'Verification',
      accessor: (u: User) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={u.isEmailVerified ? 'emerald' : 'neutral'}>
            Email {u.isEmailVerified ? '✓' : '✗'}
          </Badge>
          <Badge variant={u.isPhoneVerified ? 'emerald' : 'neutral'}>
            Phone {u.isPhoneVerified ? '✓' : '✗'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (u: User) => (
        <Badge variant={u.role === 'Admin' ? 'gold' : 'neutral'}>{u.role}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (u: User) => (
        <Badge variant={u.isActive !== false ? 'emerald' : 'red'}>
          {u.isActive !== false ? 'Active' : 'Blocked'}
        </Badge>
      ),
    },
    {
      header: 'Registered',
      accessor: (u: User) => (
        <span className="text-slate-muted text-xs">{formatDateTime(u.createdAt)}</span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (u: User) => {
        const isSelf = u.userId === currentUser?.userId;
        const isActive = u.isActive !== false;

        return (
          <div className="flex justify-end">
            {isSelf ? (
              <span className="text-[11px] text-slate-sub italic">Current Session</span>
            ) : (
              <button
                onClick={() => setToggleUser(u)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border-emerald/30 text-emerald-light hover:bg-emerald/10'
                }`}
              >
                {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>{isActive ? 'Block User' : 'Unblock'}</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Directory & Security
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Registered Clients & Investors
          </h1>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-obsidian-card border border-white/10 rounded-2xl flex items-center">
        <div className="flex-1 flex items-center px-3 py-2 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
          <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search users by name, email, or telephone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-sub outline-none"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found matching search criteria."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Confirm Block / Unblock Dialog */}
      {toggleUser && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setToggleUser(null)}
          onConfirm={handleToggleActive}
          title={toggleUser.isActive !== false ? 'Block Client Account' : 'Unblock Client Account'}
          message={
            toggleUser.isActive !== false
              ? `Are you sure you wish to disable access for ${toggleUser.fullName} (${toggleUser.email})? They will be locked out from scheduling tours and logging into the portfolio.`
              : `Restore full platform privileges for ${toggleUser.fullName}?`
          }
          confirmLabel={toggleUser.isActive !== false ? 'Block User' : 'Unblock Account'}
          isDestructive={toggleUser.isActive !== false}
          loading={updating}
        />
      )}
    </div>
  );
}

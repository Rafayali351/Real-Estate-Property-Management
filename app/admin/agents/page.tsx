'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Agent } from '@/lib/types';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit, UserX } from 'lucide-react';

export default function AdminAgentsPage() {
  const { success, error } = useToast();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [profileImgUrl, setProfileImgUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Deactivate
  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await api.admin.agents.getAll();
      setAgents(data);
    } catch (err: any) {
      error(err.message || 'Could not load advisors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFullName('');
    setEmail('');
    setPhone('+92 300 ');
    setSpecialization('Trophy Penthouses & Mansions');
    setBio('');
    setProfileImgUrl('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (agent: Agent) => {
    setEditId(agent.agentId);
    setFullName(agent.fullName);
    setEmail(agent.email);
    setPhone(agent.phone);
    setSpecialization(agent.specialization);
    setBio(agent.bio);
    setProfileImgUrl(agent.profileImgUrl);
    setIsActive(agent.isActive ?? true);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !specialization || !profileImgUrl) {
      error('Please complete all required fields and upload a profile photo.');
      return;
    }

    setSubmitting(true);
    const payload = {
      fullName,
      email,
      phone,
      specialization,
      bio,
      profileImgUrl,
      isActive,
    };

    try {
      if (editId) {
        await api.admin.agents.update(editId, payload);
        success('Advisor profile updated.');
      } else {
        await api.admin.agents.create(payload);
        success('New advisor registered.');
      }
      setModalOpen(false);
      await loadAgents();
    } catch (err: any) {
      error(err.message || 'Failed to save advisor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    setDeactivating(true);
    try {
      await api.admin.agents.delete(deactivateId);
      success('Advisor deactivated.');
      setDeactivateId(null);
      await loadAgents();
    } catch (err: any) {
      error(err.message || 'Could not deactivate advisor.');
    } finally {
      setDeactivating(false);
    }
  };

  const columns = [
    {
      header: 'Advisor',
      accessor: (a: Agent) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black shrink-0 border border-gold/30">
            <Image src={a.profileImgUrl} alt={a.fullName} fill className="object-cover" />
          </div>
          <div>
            <p className="font-semibold text-white">{a.fullName}</p>
            <p className="text-[11px] text-gold">{a.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (a: Agent) => (
        <div>
          <p className="text-white">{a.email}</p>
          <p className="text-slate-muted">{a.phone}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (a: Agent) => (
        <Badge variant={a.isActive !== false ? 'emerald' : 'neutral'}>
          {a.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (a: Agent) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(a)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-muted hover:text-gold"
            title="Edit Advisor"
          >
            <Edit className="w-4 h-4" />
          </button>
          {a.isActive !== false && (
            <button
              onClick={() => setDeactivateId(a.agentId)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-muted hover:text-red-400"
              title="Deactivate Advisor"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Advisory Desk
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Managing Advisors & Agents
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Advisor</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={agents}
        loading={loading}
        emptyMessage="No advisors currently registered."
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Advisor Profile' : 'Register New Advisor'}
        subtitle="Manage advisor credentials, portrait photo, and specialization"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Specialization *
            </label>
            <input
              type="text"
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Waterfront Trophy Estates & Penthouses"
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Biography & Credentials
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          {/* Profile Photo Uploader */}
          <ImageUploader
            value={profileImgUrl}
            onChange={setProfileImgUrl}
            folder="agents"
            label="Advisor Portrait Photo *"
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-muted pt-2 select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-obsidian-charcoal border-white/20 text-gold focus:ring-gold"
            />
            <span className="text-white font-medium">Active (Visible on public advisor showcase)</span>
          </label>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-slate-muted hover:text-white text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editId ? 'Update Profile' : 'Register Advisor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivation */}
      <ConfirmDialog
        isOpen={deactivateId !== null}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Advisor"
        message="Are you sure you wish to deactivate this advisor? They will be removed from the public website showcase."
        confirmLabel="Deactivate"
        isDestructive={true}
        loading={deactivating}
      />
    </div>
  );
}

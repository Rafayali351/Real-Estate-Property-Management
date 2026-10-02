'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { PropertySummary, Agent, PagedResult } from '@/lib/types';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/format';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const { success, error } = useToast();

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Agents for dropdown
  const [agents, setAgents] = useState<Agent[]>([]);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [listingType, setListingType] = useState('Sale');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [propertyType, setPropertyType] = useState('Mansion');
  const [bedrooms, setBedrooms] = useState<number | ''>(5);
  const [bathrooms, setBathrooms] = useState<number | ''>(6);
  const [sqFt, setSqFt] = useState<number | ''>(8500);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('Available');
  const [agentId, setAgentId] = useState<number | ''>('');

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load Agents
  useEffect(() => {
    api.admin.agents.getAll().then(setAgents).catch(() => {});
  }, []);

  // Load Properties
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.properties.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        city: cityFilter || undefined,
        listingType: listingTypeFilter || undefined,
        page,
        pageSize: 10,
      });
      setProperties(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      error(err.message || 'Could not load properties');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, cityFilter, listingTypeFilter, page, error]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const openCreateModal = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setListingType('Sale');
    setAddress('');
    setCity('Islamabad');
    setPropertyType('Mansion');
    setBedrooms(5);
    setBathrooms(6);
    setSqFt(8000);
    setImageUrl('');
    setIsFeatured(false);
    setStatus('Available');
    setAgentId(agents[0]?.agentId || '');
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    try {
      const prop = await api.admin.properties.getById(id);
      setEditId(id);
      setTitle(prop.title);
      setDescription(prop.description);
      setPrice(prop.price);
      setListingType(prop.listingType);
      setAddress(prop.address);
      setCity(prop.city);
      setPropertyType(prop.propertyType);
      setBedrooms(prop.bedrooms);
      setBathrooms(prop.bathrooms);
      setSqFt(prop.sqFt);
      setImageUrl(prop.imageUrl);
      setIsFeatured(prop.isFeatured);
      setStatus(prop.status);
      setAgentId(prop.agentId || '');
      setModalOpen(true);
    } catch (err: any) {
      error(err.message || 'Could not load property details');
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || price === '' || !address || !city || !imageUrl) {
      error('Please complete all required fields including the cover image.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      description,
      price: Number(price),
      listingType,
      address,
      city,
      propertyType,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      sqFt: Number(sqFt) || 0,
      imageUrl,
      isFeatured,
      status,
      agentId: agentId ? Number(agentId) : null,
    };

    try {
      if (editId) {
        await api.admin.properties.update(editId, payload);
        success('Property updated successfully.');
      } else {
        await api.admin.properties.create(payload);
        success('New property listing created.');
      }
      setModalOpen(false);
      await loadProperties();
    } catch (err: any) {
      error(err.message || 'Failed to save property.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.admin.properties.delete(deleteId);
      success('Property soft deleted.');
      setDeleteId(null);
      await loadProperties();
    } catch (err: any) {
      error(err.message || 'Could not delete property.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Property',
      accessor: (p: PropertySummary) => (
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
            <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate max-w-[200px]">{p.title}</p>
            <p className="text-[11px] text-slate-muted truncate">{p.address}, {p.city}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: (p: PropertySummary) => (
        <span className="font-serif font-bold text-gold">{formatPrice(p.price)}</span>
      ),
    },
    {
      header: 'Type',
      accessor: (p: PropertySummary) => (
        <span className="text-white">{p.propertyType} ({p.listingType})</span>
      ),
    },
    {
      header: 'Status',
      accessor: (p: PropertySummary) => (
        <Badge
          variant={
            p.status === 'Available'
              ? 'emerald'
              : p.status === 'Reserved'
              ? 'cyan'
              : 'neutral'
          }
        >
          {p.status}
        </Badge>
      ),
    },
    {
      header: 'Featured',
      accessor: (p: PropertySummary) =>
        p.isFeatured ? <Badge variant="gold">Featured</Badge> : <span className="text-slate-sub">Standard</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (p: PropertySummary) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/properties/${p.propertyId}`}
            target="_blank"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-muted hover:text-white"
            title="View Public Page"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openEditModal(p.propertyId)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-muted hover:text-gold"
            title="Edit Property"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(p.propertyId)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-muted hover:text-red-400"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Inventory Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">
            Properties Portfolio
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gold hover:bg-gold-hover text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-gold-glow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Estate</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-obsidian-card border border-white/10 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center px-3 py-2 bg-obsidian-charcoal border border-white/15 focus-within:border-gold rounded-xl">
          <Search className="w-4 h-4 text-gold shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search properties by title, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-sub outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-obsidian-charcoal border border-white/15 rounded-xl text-xs text-white outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
          <option value="Rented">Rented</option>
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-obsidian-charcoal border border-white/15 rounded-xl text-xs text-white outline-none cursor-pointer"
        >
          <option value="">All Cities</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
          <option value="Rawalpindi">Rawalpindi</option>
          <option value="Gwadar">Gwadar</option>
        </select>

        <select
          value={listingTypeFilter}
          onChange={(e) => setListingTypeFilter(e.target.value)}
          className="px-3 py-2 bg-obsidian-charcoal border border-white/15 rounded-xl text-xs text-white outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="Sale">For Sale</option>
          <option value="Rent">For Rent</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={properties}
        loading={loading}
        emptyMessage="No properties found matching criteria."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Trophy Estate' : 'Add New Luxury Estate'}
        subtitle="Manage listing details, pricing, assigned advisor, and media assets"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProperty} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Property Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Margalla Crest Presidential Estate"
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Architectural Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed property highlights, architectural style, materials, views..."
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Price (PKR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Listing Type
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              >
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sector F-6/3, Hillside Road"
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Islamabad"
                className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Typology
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
              >
                <option value="Mansion">Mansion</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Villa</option>
                <option value="Modern Estate">Modern Estate</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Beds
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Baths
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
                Sq. Ft.
              </label>
              <input
                type="number"
                value={sqFt}
                onChange={(e) => setSqFt(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-muted font-medium">
              Assigned Advisor
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-obsidian-charcoal border border-white/15 focus:border-gold rounded-xl text-sm text-white outline-none"
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.agentId} value={a.agentId}>
                  {a.fullName} ({a.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Uploader */}
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            folder="properties"
            label="Cover Image (or upload new) *"
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-muted pt-2 select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded bg-obsidian-charcoal border-white/20 text-gold focus:ring-gold"
            />
            <span className="text-white font-medium">Mark as Featured Trophy Estate (Frontpage placement)</span>
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
              {submitting ? 'Saving...' : editId ? 'Update Listing' : 'Publish Estate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Soft Delete Property"
        message="Are you sure you wish to soft delete this property listing? It will immediately be hidden from all public searches and client portfolios."
        confirmLabel="Soft Delete"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
}

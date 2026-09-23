import React, { useState } from 'react';
import { StaffMember, DayOfWeek, ServiceItem } from '../../types';
import { Plus, Trash2, Edit2, Check, User, Scissors, Calendar, Sparkles, Upload, X } from 'lucide-react';
import { SlideToggle } from '../AdminPanel';

interface StaffManagerTabProps {
  staffList: StaffMember[];
  services: ServiceItem[];
  onUpdateStaff: (newList: StaffMember[]) => void;
  onUploadPhoto?: (file: File) => Promise<string>;
}

const ALL_DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export const StaffManagerTab: React.FC<StaffManagerTabProps> = ({
  staffList,
  services,
  onUpdateStaff,
  onUploadPhoto,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form State
  const [formState, setFormState] = useState<Omit<StaffMember, 'id'>>({
    name: '',
    role: 'Senior Stylist',
    avatarUrl: '',
    phone: '',
    assignedServiceIds: [],
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    active: true,
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setFormState({
      name: '',
      role: 'Senior Stylist',
      avatarUrl: '',
      phone: '',
      assignedServiceIds: services.map((s) => s.id),
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      active: true,
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (staff: StaffMember) => {
    setEditingId(staff.id);
    setFormState({
      name: staff.name,
      role: staff.role,
      avatarUrl: staff.avatarUrl || '',
      phone: staff.phone || '',
      assignedServiceIds: staff.assignedServiceIds || [],
      workingDays: staff.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      active: staff.active,
    });
    setShowAddForm(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    if (editingId) {
      const updated = staffList.map((st) =>
        st.id === editingId ? { ...st, ...formState } : st
      );
      onUpdateStaff(updated);
    } else {
      const newStaff: StaffMember = {
        ...formState,
        id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      };
      onUpdateStaff([...staffList, newStaff]);
    }

    setShowAddForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      onUpdateStaff(staffList.filter((st) => st.id !== id));
    }
  };

  const handleToggleDay = (day: DayOfWeek) => {
    const current = formState.workingDays;
    if (current.includes(day)) {
      setFormState({ ...formState, workingDays: current.filter((d) => d !== day) });
    } else {
      setFormState({ ...formState, workingDays: [...current, day] });
    }
  };

  const handleToggleService = (svcId: string) => {
    const current = formState.assignedServiceIds;
    if (current.includes(svcId)) {
      setFormState({ ...formState, assignedServiceIds: current.filter((id) => id !== svcId) });
    } else {
      setFormState({ ...formState, assignedServiceIds: [...current, svcId] });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#6c2e3e]/30 via-black/40 to-black/40 border border-[#fed488]/30">
        <div>
          <div className="flex items-center gap-2 text-[#fed488] mb-1">
            <Scissors className="w-5 h-5 text-[#fed488]" />
            <h2 className="font-['Playfair_Display'] text-xl font-semibold text-white">
              Stylists & Team Members
            </h2>
          </div>
          <p className="text-xs text-[#dfc3c9]">
            Manage your salon stylists, aestheticians, working shifts, and assigned treatments.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="px-4 py-2.5 rounded-xl bg-[#fed488] hover:bg-[#fed488]/90 text-[#562230] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Add / Edit Form Modal / Card */}
      {showAddForm && (
        <form onSubmit={handleSaveForm} className="p-5 rounded-2xl bg-black/40 border-2 border-[#fed488]/50 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-['Playfair_Display'] text-base font-medium text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#fed488]" />
              <span>{editingId ? 'Edit Team Member' : 'New Team Member'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#dfc3c9] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Stylist Profile Photo Uploader */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#fed488]/15 border-2 border-[#fed488]/40 overflow-hidden flex items-center justify-center text-[#fed488] font-bold text-lg shrink-0 shadow-inner relative">
                {formState.avatarUrl ? (
                  <img
                    src={formState.avatarUrl}
                    alt={formState.name || 'Member'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span className={formState.avatarUrl ? 'hidden' : 'block'}>
                  {(formState.name || 'M').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#fed488] font-semibold block mb-0.5">
                  Stylist Profile Photo
                </label>
                <p className="text-[11px] text-[#dfc3c9]/70 leading-tight">
                  Upload a professional headshot or paste an image link.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                placeholder="Paste photo link (https://...)"
                value={formState.avatarUrl || ''}
                onChange={(e) => setFormState({ ...formState, avatarUrl: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-xs text-white placeholder-zinc-500 w-full sm:w-52 focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
              <label className="px-3 py-1.5 rounded-lg bg-[#fed488]/20 hover:bg-[#fed488]/30 text-[#fed488] border border-[#fed488]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPhoto}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = '';
                    setIsUploadingPhoto(true);
                    try {
                      let url = '';
                      if (onUploadPhoto) {
                        url = await onUploadPhoto(file);
                      } else {
                        url = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve((reader.result as string) || '');
                          reader.onerror = () => resolve('');
                          reader.readAsDataURL(file);
                        });
                      }
                      if (url) {
                        setFormState((prev) => ({ ...prev, avatarUrl: url }));
                      }
                    } catch (err) {
                      console.error('Failed to upload staff photo:', err);
                    } finally {
                      setIsUploadingPhoto(false);
                    }
                  }}
                />
              </label>
              {formState.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, avatarUrl: '' })}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-white/10 text-xs transition-colors shrink-0"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1">
                Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master Stylist & Colorist"
                value={formState.role}
                onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
            </div>

            <div className="flex items-center pt-5">
              <SlideToggle
                checked={formState.active}
                onChange={(val) => setFormState({ ...formState, active: val })}
                label="Active for Bookings"
                sublabel="Available on public appointment picker"
                size="sm"
              />
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
              <span>Working Days</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const isSelected = formState.workingDays.includes(d.key);
                return (
                  <button
                    type="button"
                    key={d.key}
                    onClick={() => handleToggleDay(d.key)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#fed488] text-[#562230] border-[#fed488] shadow-sm font-semibold'
                        : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Services */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-2">
              Assigned Services ({formState.assignedServiceIds.length} of {services.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {services.map((svc) => {
                const isAssigned = formState.assignedServiceIds.includes(svc.id);
                return (
                  <button
                    type="button"
                    key={svc.id}
                    onClick={() => handleToggleService(svc.id)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer truncate ${
                      isAssigned
                        ? 'bg-[#fed488]/20 border-[#fed488] text-white font-medium'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {svc.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#fed488] hover:bg-[#fed488]/90 text-[#562230] text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
            >
              Save Team Member
            </button>
          </div>
        </form>
      )}

      {/* Staff Roster List */}
      {staffList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
          <User className="w-10 h-10 text-[#fed488]/40 mx-auto" />
          <p className="text-sm text-white font-medium">No team members added yet.</p>
          <p className="text-xs text-[#dfc3c9]/70 max-w-sm mx-auto">
            Add your stylists, aestheticians, or makeup assistants so clients can select their preferred professional.
          </p>
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 rounded-xl bg-[#fed488] text-[#562230] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Add First Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffList.map((st) => (
            <div
              key={st.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#fed488]/20 border border-[#fed488]/40 overflow-hidden flex items-center justify-center text-[#fed488] font-bold text-sm shrink-0 relative shadow-sm">
                    {st.avatarUrl ? (
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className={st.avatarUrl ? 'hidden' : 'block'}>
                      {st.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{st.name}</span>
                      {!st.active && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-mono">
                          Inactive
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#fed488]">{st.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(st)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#fed488] cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    className="p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Working Days Badges */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#dfc3c9]/80">
                <span className="font-semibold text-[#fed488]">Days:</span>
                <span className="uppercase tracking-wide">
                  {st.workingDays.map((d) => d.slice(0, 3)).join(', ')}
                </span>
              </div>

              {/* Assigned services count */}
              <div className="text-[11px] text-[#dfc3c9]/70 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>{st.assignedServiceIds.length} Assigned Services</span>
                {st.phone && <span className="font-mono text-[10px]">{st.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

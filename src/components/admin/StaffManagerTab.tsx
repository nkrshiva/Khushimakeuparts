import React, { useState, useEffect } from 'react';
import { StaffMember, DayOfWeek, ServiceItem } from '../../types';
import { Plus, Trash2, Edit2, Check, User, Scissors, Calendar, Sparkles, Upload, X, ShieldCheck, Mail, UserCheck, Power, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SlideToggle } from '../ui/SlideToggle';
import { tenantRepository } from '../../repositories/tenant/TenantRepository';
import type { TenantUserProfile } from '../../domain/tenant/types';

interface StaffManagerTabProps {
  staffList: StaffMember[];
  services: ServiceItem[];
  onUpdateStaff: (newList: StaffMember[]) => void;
  onUploadPhoto?: (file: File) => Promise<string>;
  tenantId?: string;
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
  tenantId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'accounts'>('roster');
  const [employees, setEmployees] = useState<TenantUserProfile[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState<{
    email: string;
    displayName: string;
    employeeId: string;
    permissions: string[];
    active: boolean;
  }>({
    email: '',
    displayName: '',
    employeeId: '',
    permissions: ['view_schedule'],
    active: true,
  });

  const loadEmployees = async () => {
    if (!tenantId) return;
    setLoadingEmployees(true);
    setEmployeeError(null);
    try {
      const list = await tenantRepository.getTenantEmployees(tenantId);
      setEmployees(list);
    } catch (err: any) {
      console.warn('Failed to load tenant employees:', err);
      setEmployeeError(err?.message || 'Could not load employee accounts.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'accounts' && tenantId) {
      loadEmployees();
    }
  }, [activeSubTab, tenantId]);

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

  // Employee Management Handlers
  const handleStartAddEmployee = () => {
    setEditingEmployeeId(null);
    setEmployeeForm({
      email: '',
      displayName: '',
      employeeId: '',
      permissions: ['view_schedule'],
      active: true,
    });
    setShowAddEmployeeForm(true);
  };

  const handleStartEditEmployee = (emp: TenantUserProfile) => {
    setEditingEmployeeId(emp.uid || emp.email || '');
    setEmployeeForm({
      email: emp.email || '',
      displayName: emp.displayName || '',
      employeeId: emp.employeeId || '',
      permissions: emp.permissions || ['view_schedule'],
      active: emp.active !== false,
    });
    setShowAddEmployeeForm(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !employeeForm.email.trim()) return;
    try {
      await tenantRepository.saveEmployeeUserProfile(tenantId, employeeForm.email, {
        uid: editingEmployeeId || undefined,
        displayName: employeeForm.displayName.trim() || undefined,
        employeeId: employeeForm.employeeId.trim() || undefined,
        permissions: employeeForm.permissions,
        active: employeeForm.active,
      });
      setShowAddEmployeeForm(false);
      setEditingEmployeeId(null);
      await loadEmployees();
    } catch (err: any) {
      alert('Failed to save employee profile: ' + (err?.message || err));
    }
  };

  const handleDeleteEmployee = async (userId: string) => {
    if (!tenantId) return;
    if (window.confirm('Are you sure you want to revoke and delete this employee account?')) {
      try {
        await tenantRepository.deleteEmployeeUserProfile(tenantId, userId);
        await loadEmployees();
      } catch (err: any) {
        alert('Failed to delete employee account: ' + (err?.message || err));
      }
    }
  };

  const handleToggleEmployeeActive = async (emp: TenantUserProfile) => {
    if (!tenantId || !emp.email) return;
    try {
      await tenantRepository.saveEmployeeUserProfile(tenantId, emp.email, {
        uid: emp.uid,
        displayName: emp.displayName,
        employeeId: emp.employeeId,
        permissions: emp.permissions,
        active: !emp.active,
      });
      await loadEmployees();
    } catch (err: any) {
      alert('Failed to toggle status: ' + (err?.message || err));
    }
  };

  const handleTogglePermission = (permId: string) => {
    const current = employeeForm.permissions;
    if (current.includes(permId)) {
      setEmployeeForm({ ...employeeForm, permissions: current.filter((p) => p !== permId) });
    } else {
      setEmployeeForm({ ...employeeForm, permissions: [...current, permId] });
    }
  };

  const AVAILABLE_PERMISSIONS = [
    { id: 'view_schedule', label: 'View Schedule', desc: 'Can view daily appointments and schedule' },
    { id: 'manage_appointments', label: 'Manage Appointments', desc: 'Can update appointment status (Complete, Cancel, Confirm)' },
    { id: 'view_customer_pii', label: 'View Customer Contact', desc: 'Can view unmasked phone numbers and client contact details' },
    { id: 'manage_inventory', label: 'Manage Consumables', desc: 'Can view and track salon inventory and supplies' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-white/10 gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'roster'
              ? 'bg-[#fed488] text-[#562230] shadow-md'
              : 'bg-white/5 text-[#dfc3c9] hover:text-white hover:bg-white/10'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Stylist Booking Profiles ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'accounts'
              ? 'bg-[#fed488] text-[#562230] shadow-md'
              : 'bg-white/5 text-[#dfc3c9] hover:text-white hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Employee Accounts & Permissions ({employees.length})</span>
        </button>
      </div>

      {activeSubTab === 'accounts' ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-black/40 to-black/40 border border-purple-500/40">
            <div>
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h2 className="font-['Playfair_Display'] text-xl font-semibold text-white">
                  Staff Workspace Access & RBAC
                </h2>
              </div>
              <p className="text-xs text-[#dfc3c9]">
                Assign delegated permissions to your staff accounts. Employees sign in via Universal Entry with their registered email.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartAddEmployee}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Invite / Add Employee</span>
            </button>
          </div>

          {/* Add / Edit Employee Modal / Form */}
          {showAddEmployeeForm && (
            <form onSubmit={handleSaveEmployee} className="p-5 rounded-2xl bg-black/60 border-2 border-purple-500/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-['Playfair_Display'] text-base font-medium text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>{editingEmployeeId ? 'Edit Employee Permissions' : 'New Employee Account'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeForm(false)}
                  className="text-xs text-[#dfc3c9] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-purple-300 font-semibold mb-1">
                    Employee Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingEmployeeId)}
                    placeholder="e.g. stylist@salon.com"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Used to authenticate on the Universal Platform.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-purple-300 font-semibold mb-1">
                    Employee Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={employeeForm.displayName}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, displayName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-purple-300 font-semibold mb-1">
                    Link to Stylist Roster (Optional)
                  </label>
                  <select
                    value={employeeForm.employeeId}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="" className="bg-[#1d0e15] text-white">None (General Staff)</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id} className="bg-[#1d0e15] text-white">
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <SlideToggle
                    checked={employeeForm.active}
                    onChange={(val) => setEmployeeForm({ ...employeeForm, active: val })}
                    label="Workspace Access Active"
                    sublabel="When inactive, user is trapped in NO_WORKSPACE"
                    size="sm"
                  />
                </div>
              </div>

              {/* Delegated Permissions Checkboxes */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-purple-300 font-semibold mb-2">
                  Delegated Workspace Permissions ({employeeForm.permissions.length} granted)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = employeeForm.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-950/60 border-purple-500 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-white/30 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-xs text-white block">{perm.label}</span>
                          <span className="text-[11px] text-zinc-400 block leading-tight">{perm.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Employee Account
                </button>
              </div>
            </form>
          )}

          {/* Employees List */}
          {loadingEmployees ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading employee accounts...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-purple-400/40 mx-auto" />
              <p className="text-sm text-white font-medium">No employee accounts created yet.</p>
              <p className="text-xs text-[#dfc3c9]/70 max-w-sm mx-auto">
                Invite team members so they can log into the Staff Operations Console and view today's schedule.
              </p>
              <button
                type="button"
                onClick={handleStartAddEmployee}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Add First Employee Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.uid || emp.email}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                        {(emp.displayName || emp.email || 'E').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{emp.displayName || emp.email}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                              emp.active !== false
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {emp.active !== false ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">{emp.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleEmployeeActive(emp)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          emp.active !== false
                            ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                        }`}
                        title={emp.active !== false ? 'Deactivate / Revoke Access' : 'Activate Access'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEditEmployee(emp)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-300 border border-white/10 cursor-pointer"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(emp.uid || emp.email || '')}
                        className="p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delegated Permissions Badges */}
                  <div className="border-t border-white/10 pt-2">
                    <span className="text-[10px] text-zinc-400 block mb-1">Delegated Permissions:</span>
                    <div className="flex flex-wrap gap-1">
                      {(emp.permissions || ['view_schedule']).map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-200 border border-purple-500/30 text-[10px]"
                        >
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
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
      )}
    </div>
  );
};

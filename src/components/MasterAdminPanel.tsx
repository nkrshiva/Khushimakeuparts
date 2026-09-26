import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Plus,
  ExternalLink,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Wand2,
  Phone,
  Instagram,
  MapPin,
  LogOut,
  RefreshCw,
  Mail,
  Send,
  Clock,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { authorizationService } from '../services/auth/AuthorizationService';
import { tenantService } from '../services/tenant';
import { invitationDeliveryService } from '../services/invitation/InvitationDeliveryService';
import { ClientTenantSummary, BusinessArchetype, TenantLifecycleStatus, TenantInvitation } from '../types';
import { ARCHETYPE_PRESETS } from '../data/archetypePresets';

interface MasterAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterTenantAdmin: (tenantId: string) => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({
  isOpen,
  onClose,
  onEnterTenantAdmin,
}) => {
  const {
    clientsList,
    createClientSite,
    resendTenantInvitation,
    revokeTenantInvitation,
    setTenantLifecycleStatus,
    permanentDeleteTenant,
    isFirebaseConnected,
  } = useSiteContent();

  const { user, logout } = useAuth();
  const { role, isDeveloper } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetypeFilter, setSelectedArchetypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // New Tenant Provisioning Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState<{
    name: string;
    founder: string;
    city: string;
    phone: string;
    instagram: string;
    customDomain: string;
    invitedOwnerEmail: string;
    archetype: BusinessArchetype;
  }>({
    name: '',
    founder: '',
    city: '',
    phone: '',
    instagram: '',
    customDomain: '',
    invitedOwnerEmail: '',
    archetype: 'solo_mua',
  });

  // Invitation Success & Feedback Dialog State
  const [invitationSuccessDialog, setInvitationSuccessDialog] = useState<{
    tenantName: string;
    clientId: string;
    invitedEmail: string;
    invitationId?: string;
    token?: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isResendingForClientId, setIsResendingForClientId] = useState<string | null>(null);
  const [isRevokingForClientId, setIsRevokingForClientId] = useState<string | null>(null);

  // Permanent Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<ClientTenantSummary | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<string | null>(null);

  // Status Notification
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Independent Authorization Guard: refuse privileged rendering unless role === 'developer' and matching master admin identity
  if (!isOpen || !authorizationService.canAccessMasterAdmin(role, user?.email)) return null;

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  // Filtered tenants list
  const filteredTenants = clientsList.filter((tenant) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tenant.name.toLowerCase().includes(q) ||
      tenant.id.toLowerCase().includes(q) ||
      tenant.founder.toLowerCase().includes(q) ||
      tenant.city.toLowerCase().includes(q);

    const matchesArchetype =
      selectedArchetypeFilter === 'all' || tenant.archetype === selectedArchetypeFilter;

    const currentStatus = tenant.status || (tenant.active !== false ? 'active' : 'suspended');
    const matchesStatus =
      selectedStatusFilter === 'all' || currentStatus === selectedStatusFilter;

    return matchesSearch && matchesArchetype && matchesStatus;
  });

  // Metric counts
  const totalCount = clientsList.length;
  const activeCount = clientsList.filter(
    (c) => (c.status || (c.active !== false ? 'active' : 'suspended')) === 'active'
  ).length;
  const suspendedCount = clientsList.filter(
    (c) => (c.status || (c.active !== false ? 'active' : 'suspended')) === 'suspended'
  ).length;
  const archivedCount = clientsList.filter((c) => c.status === 'archived').length;

  // Handle Provisioning
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTenantForm.name.trim();
    if (!cleanName) {
      showNotice('error', 'Salon / Brand name is required.');
      return;
    }
    const cleanEmail = newTenantForm.invitedOwnerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showNotice('error', 'A valid Owner Email is required for tenant onboarding.');
      return;
    }

    setIsCreating(true);
    try {
      // 1. Provision Tenant in Firestore (PENDING_INVITATION status, active: false)
      const res = await createClientSite({
        ...newTenantForm,
        name: cleanName,
        invitedOwnerEmail: cleanEmail,
      });

      if (!res.success || !res.id) {
        showNotice('error', res.error || 'Failed to provision tenant.');
        setIsCreating(false);
        return;
      }

      setShowCreateModal(false);
      setNewTenantForm({
        name: '',
        founder: '',
        city: '',
        phone: '',
        instagram: '',
        customDomain: '',
        invitedOwnerEmail: '',
        archetype: 'solo_mua',
      });

      // 2. Dispatch Onboarding Invitation Email via Resend
      let emailSent = false;
      let emailError: string | undefined;

      if (res.invitation) {
        const emailRes = await invitationDeliveryService.sendInvitationEmail({
          invitationId: res.invitation.invitationId,
          token: res.invitation.token,
        });

        if (emailRes.success) {
          emailSent = true;
          showNotice('success', `🎉 Provisioned "${cleanName}" and sent invitation email to ${cleanEmail}!`);
        } else {
          emailError = emailRes.error || 'Failed to deliver invitation email.';
          showNotice('error', `Tenant provisioned, but email failed: ${emailError}`);
        }
      }

      // 3. Open informative success dialog
      setInvitationSuccessDialog({
        tenantName: cleanName,
        clientId: res.id,
        invitedEmail: cleanEmail,
        invitationId: res.invitation?.invitationId,
        token: res.invitation?.token,
        emailSent,
        emailError,
      });
    } catch (err: any) {
      showNotice('error', 'Provisioning error: ' + (err?.message || err));
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Resending an Invitation
  const handleResendInvitation = async (tenant: ClientTenantSummary) => {
    const email = tenant.invitedOwnerEmail;
    if (!email) {
      showNotice('error', 'No invited owner email address recorded for this tenant.');
      return;
    }

    setIsResendingForClientId(tenant.id);
    try {
      const res = await resendTenantInvitation(tenant.id, email);
      if (!res.success || !res.invitation) {
        showNotice('error', res.error || 'Failed to generate new invitation.');
        return;
      }

      const emailRes = await invitationDeliveryService.sendInvitationEmail({
        invitationId: res.invitation.invitationId,
        token: res.invitation.token,
      });

      if (emailRes.success) {
        showNotice('success', `📬 Fresh invitation sent to ${email} (prior link invalidated).`);
      } else {
        showNotice('error', `Fresh invitation created, but email delivery failed: ${emailRes.error}`);
      }
    } catch (err: any) {
      showNotice('error', 'Error resending invitation: ' + (err?.message || err));
    } finally {
      setIsResendingForClientId(null);
    }
  };

  // Handle Revoking an Invitation
  const handleRevokeInvitation = async (tenant: ClientTenantSummary) => {
    if (
      !confirm(
        `Are you sure you want to revoke the pending invitation for "${tenant.name}"? The recipient will not be able to activate this tenant.`
      )
    ) {
      return;
    }

    setIsRevokingForClientId(tenant.id);
    try {
      const pendingList = await tenantService.getPendingInvitationsForTenant(tenant.id);
      for (const inv of pendingList) {
        await revokeTenantInvitation(inv.invitationId);
      }
      showNotice('success', `Pending invitation for "${tenant.name}" has been revoked.`);
    } catch (err: any) {
      showNotice('error', 'Error revoking invitation: ' + (err?.message || err));
    } finally {
      setIsRevokingForClientId(null);
    }
  };

  // Handle Lifecycle Toggle (Activate / Suspend)
  const handleToggleLifecycle = async (tenant: ClientTenantSummary, newStatus: TenantLifecycleStatus) => {
    try {
      const ok = await setTenantLifecycleStatus(tenant.id, newStatus);
      if (ok) {
        showNotice('success', `Tenant "${tenant.name}" set to ${newStatus.toUpperCase()}.`);
      } else {
        showNotice('error', `Failed to update status for "${tenant.name}".`);
      }
    } catch (err: any) {
      showNotice('error', 'Status error: ' + (err?.message || err));
    }
  };

  // Handle Permanent Delete
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmInput.trim() !== deleteTarget.id) {
      showNotice('error', `Confirmation mismatch. You must type "${deleteTarget.id}" exactly.`);
      return;
    }
    setIsDeleting(true);
    setDeleteProgress('Initiating paginated chunked subcollection purge...');
    try {
      const res = await permanentDeleteTenant(deleteTarget.id, (msg) => {
        setDeleteProgress(msg);
      });
      if (res.success) {
        showNotice('success', `Tenant "${deleteTarget.name}" (${deleteTarget.id}) and all subcollections were permanently purged.`);
        setDeleteTarget(null);
        setDeleteConfirmInput('');
      } else {
        showNotice('error', res.error || 'Failed to delete tenant.');
      }
    } catch (err: any) {
      showNotice('error', 'Deletion error: ' + (err?.message || err));
    } finally {
      setIsDeleting(false);
      setDeleteProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f080c]/98 backdrop-blur-md text-[#fcecee] font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* ── Top Header ── */}
      <header className="px-6 py-4 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-4 bg-[#1a0e1b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-[#6c2e3e] to-[#b89758] flex items-center justify-center shadow-lg shrink-0 border border-purple-400/40">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                Master SaaS Admin Cockpit
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                SuperAdmin Developer Mode
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
                {isFirebaseConnected ? 'Cloud Synced 🟢' : 'Local Mode 🟡'}
              </span>
            </div>
            <p className="text-xs text-purple-200/70">
              Multi-tenant architecture cockpit. Manage tenants, lifecycle statuses, archetypes, and provisioning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-[#b89758] hover:from-purple-500 hover:to-[#cbb075] text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant</span>
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Master Cockpit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Notice Banner ── */}
      {notice && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-500/40'
              : 'bg-rose-950/80 text-rose-300 border-b border-rose-500/40'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* ── Main Cockpit Body ── */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#1b101c]/80 border border-white/10 flex flex-col">
            <span className="text-xs text-purple-200/60 font-semibold uppercase tracking-wider">Total Tenants</span>
            <span className="text-2xl font-bold text-white mt-1">{totalCount}</span>
            <span className="text-[11px] text-purple-300/50 mt-1">Configured on platform</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col">
            <span className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">Active Tenants</span>
            <span className="text-2xl font-bold text-emerald-300 mt-1">{activeCount}</span>
            <span className="text-[11px] text-emerald-300/50 mt-1">Live & taking bookings</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col">
            <span className="text-xs text-amber-300/70 font-semibold uppercase tracking-wider">Suspended</span>
            <span className="text-2xl font-bold text-amber-300 mt-1">{suspendedCount}</span>
            <span className="text-[11px] text-amber-300/50 mt-1">Hold / Maintenance</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-700/40 flex flex-col">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Archived</span>
            <span className="text-2xl font-bold text-zinc-300 mt-1">{archivedCount}</span>
            <span className="text-[11px] text-zinc-500 mt-1">Decommissioned records</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#170c18] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-purple-300/60 shrink-0" />
            <input
              type="text"
              placeholder="Search by salon name, ID, founder, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white placeholder-purple-200/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedArchetypeFilter}
              onChange={(e) => setSelectedArchetypeFilter(e.target.value)}
              className="bg-[#241326] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-purple-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Archetypes</option>
              <option value="solo_mua">Solo MUA</option>
              <option value="hair_salon">Hair Salon</option>
              <option value="beauty_parlour">Beauty Parlour</option>
              <option value="hybrid_atelier">Hybrid Atelier</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#241326] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-purple-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Symmetrical Tenant Table */}
        <div className="bg-[#170c18] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#231225] border-b border-white/10 text-purple-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Tenant Details</th>
                  <th className="px-5 py-3.5">Archetype Blueprint</th>
                  <th className="px-5 py-3.5">Contact & Location</th>
                  <th className="px-5 py-3.5">Lifecycle Status</th>
                  <th className="px-5 py-3.5 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-purple-100/90">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-purple-300/50">
                      No tenants match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => {
                    const status = tenant.status || (tenant.active !== false ? 'active' : 'suspended');
                    const arch = ARCHETYPE_PRESETS[tenant.archetype || 'solo_mua'];
                    return (
                      <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                        {/* Tenant Details */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-purple-300" />
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{tenant.name}</span>
                              </div>
                              <div className="text-[11px] text-purple-300/60 flex items-center gap-2 mt-0.5">
                                <code>id: {tenant.id}</code>
                                {tenant.customDomain && (
                                  <span className="text-purple-300/80">🌐 {tenant.customDomain}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Archetype */}
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 font-medium text-[11px]">
                            <span>{arch?.name || tenant.archetype}</span>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="text-white/90 font-medium">{tenant.founder}</div>
                            <div className="text-purple-300/60 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-purple-400" />
                              <span>{tenant.city}</span>
                            </div>
                            <div className="text-purple-300/60 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-purple-400" />
                              <span>{tenant.phone}</span>
                            </div>
                            {tenant.invitedOwnerEmail && (
                              <div className="text-amber-300/80 flex items-center gap-1 font-mono text-[10px] pt-0.5">
                                <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[170px]" title={tenant.invitedOwnerEmail}>
                                  {tenant.invitedOwnerEmail}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Lifecycle Status */}
                        <td className="px-5 py-4">
                          {status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Active
                            </span>
                          )}
                          {status === 'pending_invitation' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold text-[10px] uppercase">
                              <Clock className="w-3 h-3 text-amber-400" />
                              Pending Invite
                            </span>
                          )}
                          {status === 'suspended' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold text-[10px] uppercase">
                              <PauseCircle className="w-3 h-3" />
                              Suspended
                            </span>
                          )}
                          {status === 'archived' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700/50 font-semibold text-[10px] uppercase">
                              <Archive className="w-3 h-3" />
                              Archived
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Resend & Revoke Invitation (Available for Pending Tenants) */}
                            {status === 'pending_invitation' && (
                              <>
                                <button
                                  onClick={() => handleResendInvitation(tenant)}
                                  disabled={isResendingForClientId === tenant.id}
                                  className="p-1.5 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  title="Resend Invitation Email (revokes prior link and dispatches fresh one)"
                                >
                                  <RotateCcw className={`w-3.5 h-3.5 ${isResendingForClientId === tenant.id ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleRevokeInvitation(tenant)}
                                  disabled={isRevokingForClientId === tenant.id}
                                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  title="Revoke Pending Invitation"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Manage Tenant Admin */}
                            <button
                              onClick={() => {
                                onEnterTenantAdmin(tenant.id);
                              }}
                              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Open Tenant Admin Panel in Developer Context"
                            >
                              <span>Manage Admin</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            {/* View Public Website */}
                            <a
                              href={`/?client=${tenant.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg transition-colors inline-flex items-center justify-center"
                              title="Open Public Website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Suspend / Re-activate */}
                            {status === 'active' ? (
                              <button
                                onClick={() => handleToggleLifecycle(tenant, 'suspended')}
                                className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                                title="Suspend Tenant (disables bookings & shows maintenance screen)"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : status === 'suspended' ? (
                              <button
                                onClick={() => handleToggleLifecycle(tenant, 'active')}
                                className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                                title="Re-activate Tenant"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {/* Archive */}
                            {status !== 'archived' && (
                              <button
                                onClick={() => handleToggleLifecycle(tenant, 'archived')}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                                title="Archive Tenant (decommission website)"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Permanent Delete */}
                            <button
                              onClick={() => {
                                setDeleteTarget(tenant);
                                setDeleteConfirmInput('');
                              }}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                              title="Permanently Purge Tenant and All Subcollections"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Provision New Tenant Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b101d] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-['Playfair_Display'] text-lg font-medium text-white">
                  Provision New Client Tenant
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-300/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-200/80 font-medium mb-1">
                  Salon / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zara Beauty Lounge"
                  value={newTenantForm.name}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                  className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-purple-200/80 font-medium mb-1">
                  Business Archetype Blueprint
                </label>
                <select
                  value={newTenantForm.archetype}
                  onChange={(e) =>
                    setNewTenantForm({
                      ...newTenantForm,
                      archetype: e.target.value as BusinessArchetype,
                    })
                  }
                  className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="solo_mua">Solo MUA (Bridal & Muhurat Focus)</option>
                  <option value="hair_salon">Hair Salon (Time-Slots & Stylists)</option>
                  <option value="beauty_parlour">Beauty Parlour (Aesthetics & Treatment Rooms)</option>
                  <option value="hybrid_atelier">Hybrid Luxury Atelier (Full Suite)</option>
                </select>
                <span className="text-[11px] text-purple-300/50 mt-1 block">
                  Automatically initializes services, staff roles, and enabled modules for this archetype.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200/80 font-medium mb-1">
                    Founder / Lead Artist
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zara Khan"
                    value={newTenantForm.founder}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, founder: e.target.value })}
                    className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-purple-200/80 font-medium mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={newTenantForm.city}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, city: e.target.value })}
                    className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-200/80 font-medium mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newTenantForm.phone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                    className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-purple-200/80 font-medium mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@zarabeautylounge"
                    value={newTenantForm.instagram}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, instagram: e.target.value })}
                    className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200/80 font-medium mb-1">
                  Owner Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. owner@salon.com"
                  value={newTenantForm.invitedOwnerEmail}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, invitedOwnerEmail: e.target.value })}
                  className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                />
                <span className="text-[11px] text-purple-300/60 mt-1 block">
                  An invitation link will be sent to this email address. The recipient must sign in with this Google account to accept ownership.
                </span>
              </div>

              <div>
                <label className="block text-purple-200/80 font-medium mb-1">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. zarabeauty.com"
                  value={newTenantForm.customDomain}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, customDomain: e.target.value })}
                  className="w-full bg-[#120813] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-[#b89758] text-white rounded-xl font-medium shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Create Tenant & Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Provisioning & Invitation Success Dialog ── */}
      {invitationSuccessDialog && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1b101e] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {invitationSuccessDialog.emailSent ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="font-['Playfair_Display'] text-lg font-medium text-white">
                  {invitationSuccessDialog.emailSent
                    ? 'Tenant Provisioned & Invitation Sent!'
                    : 'Tenant Provisioned (Action Required)'}
                </h3>
              </div>
              <button
                onClick={() => setInvitationSuccessDialog(null)}
                className="text-purple-300/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/60">Salon Workspace:</span>
                  <span className="font-bold text-white text-sm">{invitationSuccessDialog.tenantName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/60">Tenant ID:</span>
                  <code className="text-purple-300 font-mono">{invitationSuccessDialog.clientId}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/60">Invited Owner Email:</span>
                  <span className="font-mono text-amber-300">{invitationSuccessDialog.invitedEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/60">Initial Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold text-[10px] uppercase">
                    Pending Invitation (Inactive)
                  </span>
                </div>
              </div>

              {invitationSuccessDialog.emailSent ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    Transactional Email Delivered via Resend
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    The owner has been emailed. Once they sign in with their Google account and accept, the tenant site will automatically transition to ACTIVE.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    Automatic Email Delivery Incomplete
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    {invitationSuccessDialog.emailError || 'The email could not be dispatched automatically.'}
                  </p>
                  <p className="text-[11px] text-purple-200/70">
                    The tenant is safely created in <code>pending_invitation</code> status. You can share the invitation link directly or resend from the dashboard once configured.
                  </p>
                </div>
              )}

              {/* Direct Invitation Link */}
              {invitationSuccessDialog.invitationId && invitationSuccessDialog.token && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-purple-200/70 font-semibold">
                    Direct Invitation URL (Single-Use, 72h Expiry):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?inviteId=${invitationSuccessDialog.invitationId}&token=${invitationSuccessDialog.token}&client=${invitationSuccessDialog.clientId}`}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/?inviteId=${invitationSuccessDialog.invitationId}&token=${invitationSuccessDialog.token}&client=${invitationSuccessDialog.clientId}`;
                        navigator.clipboard.writeText(link);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setInvitationSuccessDialog(null)}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-[#b89758] text-white rounded-xl font-medium text-xs shadow-md hover:from-purple-500 hover:to-[#cbb075] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permanent Delete Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#200c14] border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-white">
                Permanent Tenant Deletion
              </h3>
              <p className="text-xs text-rose-200/70">
                This will permanently execute a cascading purge of all subcollections (appointments, enquiries, slot_locks, busy_slots, staff) and the tenant document for:
              </p>
              <div className="p-2 rounded-xl bg-black/40 text-rose-300 font-bold text-sm mt-2">
                {deleteTarget.name} (<code>{deleteTarget.id}</code>)
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-white/80 font-medium">
                Type <strong className="text-rose-400">{deleteTarget.id}</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder={deleteTarget.id}
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                className="w-full bg-black/40 border border-rose-500/40 rounded-xl px-3 py-2 text-white placeholder-rose-400/30 focus:outline-none focus:border-rose-400"
              />
              {deleteProgress && (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 animate-pulse">
                  {deleteProgress}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmInput.trim() !== deleteTarget.id}
                onClick={handleExecuteDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? 'Purging Tenant...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

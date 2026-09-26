import React, { useState, useEffect } from 'react';
import { X, UserCheck, Calendar, Clock, Scissors, ShieldCheck, LogOut, CheckCircle2, ShieldAlert, Check, CheckCheck, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/booking';
import { authorizationService } from '../../services/auth/AuthorizationService';
import type { AppointmentItem, AppointmentStatus } from '../../domain/booking/types';

interface EmployeeWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName?: string;
  employeeId?: string;
  permissions?: string[];
}

function maskPhoneNumber(phone?: string): string {
  if (!phone) return '••••••••••';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length <= 4) return '•••• ' + clean;
  const last4 = clean.slice(-4);
  return `•••• ••${last4}`;
}

export const EmployeeWorkspaceModal: React.FC<EmployeeWorkspaceModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  employeeId,
  permissions = ['view_schedule'],
}) => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Authoritative permission gates
  const canViewSchedule = authorizationService.hasEmployeePermission(permissions, 'view_schedule');
  const canManageAppointments = authorizationService.hasEmployeePermission(permissions, 'manage_appointments');
  const canViewCustomerPii = authorizationService.hasEmployeePermission(permissions, 'view_customer_pii');

  useEffect(() => {
    if (!isOpen || !tenantId || !canViewSchedule) return;

    setLoading(true);
    const unsubscribe = bookingService.subscribeAppointments(
      tenantId,
      (data) => {
        setAppointments(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load employee appointments:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, tenantId, canViewSchedule]);

  const handleStatusChange = async (aptId: string, newStatus: AppointmentStatus) => {
    if (!canManageAppointments) {
      alert('Permission Denied: You do not possess the "manage_appointments" permission.');
      return;
    }
    setUpdatingId(aptId);
    try {
      await bookingService.updateAppointmentStatus(tenantId, aptId, newStatus);
    } catch (e) {
      console.warn('Failed to update appointment status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#1d0e15] border border-[#b89758]/50 shadow-2xl p-6 sm:p-8 text-[#fcecee] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center text-white shadow-lg">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#fed488] uppercase tracking-[0.2em] font-semibold">
                Staff Operations Console
              </span>
              <h2 id="employee-workspace-title" className="font-['Playfair_Display'] text-xl text-white font-medium">
                {tenantName || tenantId}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close workspace"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Identity & Scope Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs mb-4">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">Staff Identity</span>
            <div className="font-medium text-white flex items-center gap-1.5 mt-0.5 truncate">
              <UserCheck className="w-3.5 h-3.5 text-[#fed488] shrink-0" />
              <span className="truncate">{user?.email || employeeId || 'Employee'}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">Assigned Atelier</span>
            <span className="font-medium text-[#fed488] truncate block mt-0.5">{tenantName || tenantId}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">Authority Scope</span>
            <div className="flex items-center gap-1 text-emerald-400 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tenant Member</span>
            </div>
          </div>
        </div>

        {/* Delegated Permissions */}
        <div className="mb-4">
          <span className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-2">
            Delegated Permissions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-[#fed488]" />
                <span className="capitalize">{perm.replace(/_/g, ' ')}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Schedule & Appointments Feed */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold">
              Today's Schedule & Appointments ({canViewSchedule ? appointments.length : 0})
            </span>
            {!canViewCustomerPii && canViewSchedule && (
              <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                🔒 PII Masked (No view_customer_pii permission)
              </span>
            )}
          </div>

          {!canViewSchedule ? (
            <div className="p-8 text-center rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-semibold">Access Restricted</p>
              <p className="text-zinc-400 text-[11px]">
                You do not possess the "view_schedule" permission required to view appointment bookings.
                Please contact your Salon Administrator to request access.
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading scheduled bookings...</div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/5 text-xs text-zinc-400 space-y-2">
              <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
              <p>No confirmed appointments recorded for this tenant site today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 10).map((apt) => {
                const phoneDisplay = canViewCustomerPii ? apt.customerPhone : maskPhoneNumber(apt.customerPhone);
                const isUpdating = updatingId === apt.id;

                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-white flex items-center gap-2">
                        <span>{apt.customerName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({phoneDisplay})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                        <span className="text-[#fed488]">{apt.serviceTitle || apt.serviceId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {apt.timeSlot || `${apt.startMinute}m`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : apt.status === 'completed'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            : apt.status === 'cancelled'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {apt.status}
                      </span>

                      {/* Gated Status Management Actions */}
                      {canManageAppointments && (
                        <div className="flex items-center gap-1">
                          {apt.status !== 'completed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(apt.id, 'completed')}
                              title="Mark as Completed"
                              className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-medium transition-colors cursor-pointer border border-blue-500/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(apt.id, 'cancelled')}
                              title="Mark as Cancelled"
                              className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] font-medium transition-colors cursor-pointer border border-rose-500/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:opacity-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

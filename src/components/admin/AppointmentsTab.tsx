import React, { useState, useMemo } from 'react';
import { AppointmentItem, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  DollarSign,
  MessageSquare
} from 'lucide-react';

interface AppointmentsTabProps {
  appointments: AppointmentItem[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => Promise<boolean>;
  onDeleteAppointment: (id: string) => Promise<boolean>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  onUpdateStatus,
  onDeleteAppointment,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredList = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false;

      // Date filter
      if (dateFilter === 'today' && apt.date !== todayStr) return false;
      if (dateFilter === 'upcoming' && apt.date < todayStr) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.customerName.toLowerCase().includes(q);
        const matchesPhone = apt.customerPhone.includes(q);
        const matchesService = apt.serviceTitle.toLowerCase().includes(q);
        const matchesStaff = (apt.staffName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesService && !matchesStaff) return false;
      }

      return true;
    });
  }, [appointments, filterStatus, dateFilter, searchQuery, todayStr]);

  // Metrics
  const stats = useMemo(() => {
    const todayCount = appointments.filter((a) => a.date === todayStr).length;
    const pendingCount = appointments.filter((a) => a.status === 'pending').length;
    const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
    return { todayCount, pendingCount, confirmedCount, total: appointments.length };
  }, [appointments, todayStr]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40';
      case 'completed':
        return 'bg-blue-900/60 text-blue-300 border-blue-500/40';
      case 'cancelled':
        return 'bg-rose-900/60 text-rose-300 border-rose-500/40';
      default:
        return 'bg-amber-900/60 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[11px] text-[#dfc3c9]/70 uppercase tracking-wider block">Today's Visits</span>
          <span className="text-2xl font-bold text-white mt-1 block font-mono">{stats.todayCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <span className="text-[11px] text-amber-200/80 uppercase tracking-wider block">Needs Confirmation</span>
          <span className="text-2xl font-bold text-amber-300 mt-1 block font-mono">{stats.pendingCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
          <span className="text-[11px] text-emerald-200/80 uppercase tracking-wider block">Confirmed</span>
          <span className="text-2xl font-bold text-emerald-300 mt-1 block font-mono">{stats.confirmedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[11px] text-[#dfc3c9]/70 uppercase tracking-wider block">Total Recorded</span>
          <span className="text-2xl font-bold text-[#fed488] mt-1 block font-mono">{stats.total}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, phone, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#562230] border border-white/20 text-white cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="upcoming">Upcoming Visits</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#562230] border border-white/20 text-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards */}
      {filteredList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <Calendar className="w-8 h-8 text-[#fed488]/40 mx-auto" />
          <p className="text-sm text-white font-medium">No appointments match your filters.</p>
          <p className="text-xs text-[#dfc3c9]/70">When clients book time slots on your website, they appear here instantly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((apt) => {
            const cleanPhone = (apt.customerPhone || '').replace(/[^0-9]/g, '');
            const whatsAppHref = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
              `Hello ${apt.customerName}! ✨ This is regarding your salon appointment for ${apt.serviceTitle} on ${apt.date} at ${apt.timeSlot}.`
            )}`;

            return (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-sm">{apt.customerName}</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(apt.status)}`}>
                      {apt.status}
                    </span>
                    {apt.variantLabel && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#fed488]">
                        {apt.variantLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#dfc3c9]">
                    <span className="text-[#fed488] font-medium">{apt.serviceTitle}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-semibold text-white">
                      <Clock className="w-3.5 h-3.5 text-[#fed488]" />
                      {apt.timeSlot}
                    </span>
                    {apt.staffName && (
                      <span className="text-[#fed488]/90">
                        Stylist: <strong>{apt.staffName}</strong>
                      </span>
                    )}
                    <span className="text-white font-bold">{apt.price}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-[#dfc3c9]/80 italic pt-0.5">
                      "{apt.notes}"
                    </p>
                  )}
                </div>

                {/* Status Switcher & Contact Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={apt.status}
                    onChange={(e) => onUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#562230] border border-white/20 text-white text-xs cursor-pointer"
                  >
                    <option value="pending">Mark Pending</option>
                    <option value="confirmed">Mark Confirmed</option>
                    <option value="completed">Mark Completed</option>
                    <option value="cancelled">Mark Cancelled</option>
                  </select>

                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#25d366]/20 border border-[#25d366]/50 text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all cursor-pointer"
                    title="Message Client on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`tel:${apt.customerPhone}`}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this appointment record?')) {
                        onDeleteAppointment(apt.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

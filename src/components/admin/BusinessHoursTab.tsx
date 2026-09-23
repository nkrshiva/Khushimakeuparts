import React from 'react';
import { BusinessHoursConfig, DaySchedule, DayOfWeek } from '../../types';
import { Clock, Calendar, Check, Sliders, Info, RotateCcw } from 'lucide-react';
import { SlideToggle } from '../AdminPanel';
import { DEFAULT_BUSINESS_HOURS } from '../../data/archetypePresets';

interface BusinessHoursTabProps {
  businessHours: BusinessHoursConfig;
  onUpdateBusinessHours: (newHours: BusinessHoursConfig) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const BusinessHoursTab: React.FC<BusinessHoursTabProps> = ({
  businessHours,
  onUpdateBusinessHours,
}) => {
  const schedule = businessHours?.schedule || DEFAULT_BUSINESS_HOURS.schedule;

  const handleUpdateSchedule = (day: DayOfWeek, patch: Partial<DaySchedule>) => {
    const updated = schedule.map((s) => (s.day === day ? { ...s, ...patch } : s));
    onUpdateBusinessHours({
      ...businessHours,
      schedule: updated,
    });
  };

  const handleApplyMondayToAll = () => {
    const mon = schedule.find((s) => s.day === 'monday') || schedule[0];
    const updated = schedule.map((s) => ({
      ...s,
      isOpen: mon.isOpen,
      openTime: mon.openTime,
      closeTime: mon.closeTime,
      breakStart: mon.breakStart,
      breakEnd: mon.breakEnd,
    }));
    onUpdateBusinessHours({
      ...businessHours,
      schedule: updated,
    });
  };

  const handleResetDefaults = () => {
    onUpdateBusinessHours(DEFAULT_BUSINESS_HOURS);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#6c2e3e]/30 via-black/40 to-black/40 border border-[#fed488]/30">
        <div>
          <div className="flex items-center gap-2 text-[#fed488] mb-1">
            <Clock className="w-5 h-5 text-[#fed488]" />
            <h2 className="font-['Playfair_Display'] text-xl font-semibold text-white">
              Business Hours & Appointment Slots
            </h2>
          </div>
          <p className="text-xs text-[#dfc3c9]">
            Configure operating days, opening/closing hours, afternoon breaks, and slot durations for real-time customer booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyMondayToAll}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium cursor-pointer transition-all"
            title="Copies Monday's hours to every day of the week"
          >
            Copy Mon to All Days
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#dfc3c9] hover:text-white cursor-pointer"
            title="Reset to 10 AM - 8 PM Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Slot Controls */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
            Slot Interval (Minutes)
          </label>
          <select
            value={businessHours.slotIntervalMinutes || 30}
            onChange={(e) =>
              onUpdateBusinessHours({
                ...businessHours,
                slotIntervalMinutes: Number(e.target.value),
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#562230] border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] cursor-pointer"
          >
            <option value={15}>15 Minutes (Express Services)</option>
            <option value={30}>30 Minutes (Standard Salon)</option>
            <option value={45}>45 Minutes (Haircuts & Styling)</option>
            <option value={60}>60 Minutes (Facials & Spa)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
            Buffer Time Between Slots
          </label>
          <select
            value={businessHours.bufferMinutes || 10}
            onChange={(e) =>
              onUpdateBusinessHours({
                ...businessHours,
                bufferMinutes: Number(e.target.value),
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#562230] border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] cursor-pointer"
          >
            <option value={0}>0 Minutes (Back to back)</option>
            <option value={5}>5 Minutes</option>
            <option value={10}>10 Minutes (Sanitization & prep)</option>
            <option value={15}>15 Minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
            Operating Timezone
          </label>
          <input
            type="text"
            readOnly
            value={businessHours.timezone || 'Asia/Kolkata (IST)'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs sm:text-sm cursor-not-allowed"
          />
        </div>
      </div>

      {/* Weekly Schedule Table */}
      <div className="space-y-2.5">
        <h3 className="text-xs uppercase tracking-wider text-[#fed488] font-semibold">
          Weekly Operating Schedule
        </h3>

        <div className="space-y-2">
          {schedule.map((item) => (
            <div
              key={item.day}
              className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                item.isOpen
                  ? 'bg-white/5 border-white/10'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}
            >
              {/* Day & Open Toggle */}
              <div className="w-40 flex items-center justify-between md:justify-start gap-3">
                <span className="text-xs font-semibold text-white w-24">
                  {DAY_LABELS[item.day]}
                </span>
                <SlideToggle
                  checked={item.isOpen}
                  onChange={(val) => handleUpdateSchedule(item.day, { isOpen: val })}
                  size="sm"
                />
              </div>

              {/* Working Hours Inputs */}
              {item.isOpen ? (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#dfc3c9]/70 text-[11px]">Hours:</span>
                    <input
                      type="time"
                      value={item.openTime}
                      onChange={(e) => handleUpdateSchedule(item.day, { openTime: e.target.value })}
                      className="px-2 py-1 rounded bg-[#562230] border border-white/20 text-white text-xs [color-scheme:dark]"
                    />
                    <span className="text-[#dfc3c9]/60">to</span>
                    <input
                      type="time"
                      value={item.closeTime}
                      onChange={(e) => handleUpdateSchedule(item.day, { closeTime: e.target.value })}
                      className="px-2 py-1 rounded bg-[#562230] border border-white/20 text-white text-xs [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 md:border-l md:border-white/10 md:pl-3">
                    <span className="text-[#dfc3c9]/70 text-[11px]">Break (Optional):</span>
                    <input
                      type="time"
                      value={item.breakStart || ''}
                      onChange={(e) => handleUpdateSchedule(item.day, { breakStart: e.target.value || undefined })}
                      className="px-2 py-1 rounded bg-black/40 border border-white/15 text-white text-xs [color-scheme:dark]"
                    />
                    <span className="text-[#dfc3c9]/60">-</span>
                    <input
                      type="time"
                      value={item.breakEnd || ''}
                      onChange={(e) => handleUpdateSchedule(item.day, { breakEnd: e.target.value || undefined })}
                      className="px-2 py-1 rounded bg-black/40 border border-white/15 text-white text-xs [color-scheme:dark]"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-rose-300/80 font-mono italic">
                  Closed all day
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#dfc3c9] flex items-center gap-2">
        <Info className="w-4 h-4 text-[#fed488] shrink-0" />
        <span>
          Days marked as closed will automatically be disabled on the customer booking calendar.
        </span>
      </div>
    </div>
  );
};

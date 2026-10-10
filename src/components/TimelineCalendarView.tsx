import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { STAGES_LIST } from '../data/defaultChecklists';
import { Calendar, ChevronLeft, ChevronRight, Filter, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export const TimelineCalendarView: React.FC = () => {
  const { tasks, supervisions, surveys, members } = useAuthGroup();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Get items for a specific day string (YYYY-MM-DD)
  const getDayItems = (dayNum: number) => {
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const dayTasks = tasks.filter((t) => {
      const matchesDate = t.deadline === dateStr;
      const matchesMember = selectedMember === 'all' || t.assigneeId === selectedMember;
      return matchesDate && matchesMember;
    });

    const daySupervisions = supervisions.filter((s) => s.date === dateStr);
    const daySurveys = surveys.filter((s) => s.date === dateStr);

    return { dayTasks, daySupervisions, daySurveys };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#2d6a4f]" />
            Timeline & Kalender Bulanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penjadwalan deadline tugas, bimbingan dosen, dan survei lokasi dalam Zona Waktu Asia/Jakarta (WIB).
          </p>
        </div>

        {/* Member Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Anggota</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Navigator Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="font-serif font-bold text-lg text-[#081c15]">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-600 border-b border-slate-200 pb-2 mb-2">
          <div className="text-red-600">Ming</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty padding cells for first week */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { dayTasks, daySupervisions, daySurveys } = getDayItems(dayNum);
            const totalItems = dayTasks.length + daySupervisions.length + daySurveys.length;

            return (
              <div
                key={dayNum}
                className={`h-20 sm:h-28 p-1.5 rounded-xl border flex flex-col justify-between transition text-xs overflow-hidden ${
                  totalItems > 0 ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">{dayNum}</div>

                <div className="space-y-1 overflow-y-auto max-h-16 text-[10px]">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`px-1.5 py-0.5 rounded truncate font-medium ${
                        t.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      title={t.title}
                    >
                      • {t.title}
                    </div>
                  ))}

                  {daySupervisions.map((s) => (
                    <div key={s.id} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 truncate font-semibold">
                      Bimbingan: {s.topic}
                    </div>
                  ))}

                  {daySurveys.map((sur) => (
                    <div key={sur.id} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 truncate font-semibold">
                      Survei: {sur.location}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-Week Long Term Roadmap Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Peta Jalan Panjang 8-Minggu Penelitian</h3>
        <p className="text-xs text-slate-500">
          Tahapan target acuan penyelesaian skripsi yang dapat disesuaikan dengan kalender akademik kampus UKRI:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#1b4332]">Minggu 1–2: Persiapan & Survei</div>
            <p className="text-slate-600 text-[11px]">Survei lokasi, pengumpulan data mentah, dan pembagian 3 judul.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#1b4332]">Minggu 3–4: Matriks Jurnal & Bab I-III</div>
            <p className="text-slate-600 text-[11px]">Studi literatur 2022-2026, penyusunan proposal, dan pendaftaran sempro.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#1b4332]">Minggu 5–6: Pelaksanaan & Bab IV</div>
            <p className="text-slate-600 text-[11px]">Pengolahan data, implementasi metode/sistem, dan evaluasi hasil.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#1b4332]">Minggu 7–8: Bab V, Sidang, & Revisi</div>
            <p className="text-slate-600 text-[11px]">Penyusunan kesimpulan, pendaftaran sidang, dan perbaikan revisi penguji.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

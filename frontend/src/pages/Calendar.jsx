// pages/Calendar.jsx — FullCalendar with month/week/day views.
// The feed already merges events + task deadlines (done server-side).
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useFetch from '../hooks/useFetch';
import { eventService } from '../services/eventService';
import EventModal from '../components/calendar/EventModal';
import Spinner from '../components/ui/Spinner';

const LEGEND = [
  { label: 'Assignment', color: '#6366f1' },
  { label: 'Exam', color: '#ef4444' },
  { label: 'Meeting', color: '#f59e0b' },
  { label: 'Group Study', color: '#10b981' },
  { label: 'Task deadline', color: '#8b5cf6' },
];

export default function Calendar() {
  const { data, loading, refetch } = useFetch(() => eventService.list());
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);

  const events = (data?.events || []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end || undefined,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: e, // keep the original payload
  }));

  function openCreate(dateStr = null) {
    setSelected(null);
    setDefaultDate(dateStr);
    setModalOpen(true);
  }

  function handleEventClick(info) {
    setSelected(info.event.extendedProps);
    setModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click a date to add an event · click an item to view it.
          </p>
        </div>
        <button className="btn-primary" onClick={() => openCreate()}>＋ New event</button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="card overflow-x-auto p-3 sm:p-5 [&_.fc]:min-w-[640px]">
        {loading ? (
          <div className="grid h-96 place-items-center"><Spinner /></div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            dateClick={(info) => openCreate(info.dateStr)}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEventRows={3}
            nowIndicator
          />
        )}
      </div>

      <EventModal
        open={modalOpen}
        selected={selected}
        defaultDate={defaultDate}
        onClose={() => setModalOpen(false)}
        onSaved={refetch}
      />
    </div>
  );
}

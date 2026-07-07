"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Plus, Calendar as CalendarIcon, Star, Filter, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { useIsHydrated } from "@/lib/useIsHydrated";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek, isSameDay, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarEventModal } from "@/components/modals/CalendarEventModal";

export default function CalendarPage() {
  const hydrated = useIsHydrated();
  const calendarEvents = useStore((s) => s.calendarEvents);
  const team = useStore((s) => s.team);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Month");
  const [modalOpen, setModalOpen] = useState(false);

  // Grid days
  const days = useMemo(() => {
    if (view === "Day") {
      return [currentDate];
    } else if (view === "Week") {
      const start = startOfWeek(currentDate);
      return eachDayOfInterval({ start, end: endOfWeek(start) });
    } else if (view === "Month") {
      const start = startOfWeek(startOfMonth(currentDate));
      return eachDayOfInterval({ start, end: endOfWeek(endOfMonth(currentDate)) });
    }
    return []; // Year view handled separately
  }, [currentDate, view]);

  const tasks = useStore(s => s.tasks);
  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10);
  }, [tasks]);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setCurrentDate(parseISO(e.target.value));
  };

  if (!hydrated) return <div className="text-neutral-500 p-4">Loading calendar...</div>;

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Event
          </Button>
          <div className="relative">
            <input 
              type="date" 
              onChange={handleDateSelect}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Button variant="secondary" icon={<CalendarIcon className="h-4 w-4" />}>
              Select dates
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col bg-ink-950 rounded-xl border border-ink-700/50 overflow-hidden">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-ink-700/50">
            <Button variant="secondary" onClick={goToToday} className="!py-1.5 !px-3">
              Today
            </Button>
            
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-ink-900 text-neutral-400 hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-[140px] text-center">
                {format(currentDate, "MMMM, yyyy")}
              </h2>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-ink-900 text-neutral-400 hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex bg-ink-900 rounded-lg p-1 border border-ink-700/50">
              {(["Day", "Week", "Month", "Year"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    view === v ? "bg-white text-ink-950 font-medium shadow-sm" : "text-neutral-400 hover:text-white hover:bg-ink-800"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Header */}
          {view !== "Year" && (
            <div className={`grid border-b border-ink-700/50 bg-ink-900/20 ${view === "Day" ? "grid-cols-1" : "grid-cols-7"}`}>
              {(view === "Day" ? [format(currentDate, "EEEE")] : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).map((day) => (
                <div key={day} className="py-3 text-center text-xs font-medium text-neutral-400">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Grid Cells */}
          {view === "Year" ? (
            <div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-y-auto auto-rows-fr">
              {Array.from({ length: 12 }).map((_, i) => {
                const monthDate = new Date(currentDate.getFullYear(), i, 1);
                return (
                  <div key={i} className="border border-ink-700/50 rounded-lg p-3 bg-ink-950 hover:bg-ink-900 transition-colors cursor-pointer" onClick={() => { setCurrentDate(monthDate); setView("Month"); }}>
                    <h3 className="font-semibold text-white mb-2">{format(monthDate, "MMMM")}</h3>
                    <div className="text-xs text-neutral-400">{calendarEvents.filter(e => new Date(e.startDate).getMonth() === i && new Date(e.startDate).getFullYear() === currentDate.getFullYear()).length} events</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex-1 grid overflow-y-auto ${view === "Day" ? "grid-cols-1 grid-rows-1" : view === "Week" ? "grid-cols-7 grid-rows-1" : "grid-cols-7 auto-rows-fr"}`}>
              {days.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                
                // Get events for this day
                const dayEvents = calendarEvents.filter(e => isSameDay(parseISO(e.startDate), day));

                // For the styling, we'll use the first event of the day
                const primaryEvent = dayEvents[0];
                let cellStyles = "";
                let textStyles = "";
                let borderStyles = "";
                
                if (primaryEvent) {
                  const uid = primaryEvent.userId || "";
                  if (uid.includes("1") || uid.includes("5")) {
                    cellStyles = "bg-purple-500/10";
                    textStyles = "text-purple-400";
                    borderStyles = "border-l-4 border-l-purple-500";
                  } else if (uid.includes("2") || uid.includes("6")) {
                    cellStyles = "bg-orange-500/10";
                    textStyles = "text-orange-400";
                    borderStyles = "border-l-4 border-l-orange-500";
                  } else if (uid.includes("3") || uid.includes("7")) {
                    cellStyles = "bg-green-500/10";
                    textStyles = "text-green-400";
                    borderStyles = "border-l-4 border-l-green-500";
                  } else {
                    cellStyles = "bg-blue-500/10";
                    textStyles = "text-blue-400";
                    borderStyles = "border-l-4 border-l-blue-500";
                  }
                }

                return (
                  <div 
                    key={day.toISOString()} 
                    className={`
                      border-b border-r border-ink-700/30 p-2 min-h-[120px] flex flex-col relative
                      ${!isCurrentMonth && view === "Month" ? "bg-ink-950/50" : ""}
                      ${(idx % 7 === 6 || view === "Day") ? "border-r-0" : ""}
                      ${primaryEvent ? `${cellStyles} ${borderStyles}` : ""}
                    `}
                  >
                    <div className="flex justify-end mb-1">
                      <span className={`
                        text-sm font-semibold
                        ${isCurrentDay && !primaryEvent ? "bg-accent-500 text-white h-7 w-7 flex items-center justify-center rounded-full" : (primaryEvent ? textStyles : (isCurrentMonth ? "text-neutral-300" : "text-neutral-600"))}
                      `}>
                        {format(day, "d")}
                      </span>
                    </div>
                    
                    {/* Events */}
                    <div className="flex-1 flex flex-col justify-end mt-2 overflow-hidden">
                      {primaryEvent && (
                        <div className="flex items-start gap-2">
                          <img 
                            src={`https://i.pravatar.cc/150?u=${primaryEvent.userId || primaryEvent.id}`} 
                            alt="User" 
                            className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5" 
                          />
                          <div className="flex flex-col min-w-0">
                            <span className={`text-[11px] font-semibold truncate ${textStyles}`}>
                              {primaryEvent.title}
                            </span>
                            <span className="text-[9px] text-neutral-400 truncate flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {format(new Date(primaryEvent.startDate), "hh:mm a")} - {format(new Date(primaryEvent.endDate), "hh:mm a")}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {dayEvents.length > 1 && (
                        <div className="text-[10px] text-neutral-500 mt-1 pl-7">
                          +{dayEvents.length - 1} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 pb-8">
          
          {/* Mini Calendar Widget */}
          <Card padding={false} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{format(currentDate, "MMMM, yyyy")}</h3>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 rounded text-neutral-400 hover:text-white hover:bg-ink-800">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded text-neutral-400 hover:text-white hover:bg-ink-800">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-neutral-500 font-medium mb-1">{d}</div>
              ))}
              {days.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`
                    w-7 h-7 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-colors
                    ${isToday(day) ? "bg-accent-500 text-white" : "hover:bg-ink-800 text-neutral-300"}
                    ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}
                  `}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </Card>

          {/* Newly Added Tasks */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-semibold text-white mb-4 px-1">Newly Added Tasks</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {recentTasks.map(task => (
                <div key={task.id} className="p-3 bg-ink-900 border border-ink-700/50 rounded-lg flex flex-col gap-1">
                  <span className="text-sm text-white font-medium">{task.title}</span>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-ink-950 border border-ink-800 capitalize">{task.status.replace("_", " ")}</span>
                    <span>{task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : "recently"}</span>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="text-sm text-neutral-500 text-center py-4">No tasks found.</div>
              )}
            </div>
          </div>
        </div>

      </div>
      <CalendarEventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

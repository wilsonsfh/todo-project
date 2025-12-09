"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import { cn } from "@/lib/utils";
import { parseTaskInput } from "@/lib/timeUtils";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  duration?: number; // in minutes
  startedAt?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showDoneList, setShowDoneList] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTask) return;
    
    try {
      const { title, duration } = parseTaskInput(newTask);
      
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, duration }),
      });
      
      if (res.status === 409) {
        alert("Task already exists!");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to add task: ${res.statusText}`);
      }

      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const startTask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent completing the task
    await fetch(`/api/tasks/${id}/start`, { method: "POST" });
    fetchTasks();
  };

  // Timer for progress bars
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getProgress = (task: Task) => {
    if (!task.startedAt || !task.duration) return 0;
    const start = new Date(task.startedAt).getTime();
    const durationMs = task.duration * 60 * 1000;
    const elapsed = now.getTime() - start;
    const percent = Math.min(100, (elapsed / durationMs) * 100);
    
    // Check for completion notification
    if (percent >= 100 && !task.completed) {
        // In a real app, we'd track if we already notified to avoid spam
    }
    
    return percent;
  };

  const completeTask = async (id: number) => {
    await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
    fetchTasks();
  };

  // Filter tasks
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  
  // Focus Mode: Show top 3 active tasks
  const visibleTasks = showAllTasks ? activeTasks : activeTasks.slice(0, 3);
  const hiddenCount = activeTasks.length - visibleTasks.length;

  // Weekly Done List: Completed in last 7 days
  const weeklyDone = completedTasks.filter(t => {
    if (!t.completedAt) return false;
    const date = new Date(t.completedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  return (
    <AuroraBackground>
      <NoiseOverlay />
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white tracking-tighter">
            Tasks
          </h2>
          <button
            onClick={() => setShowDoneList(!showDoneList)}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            {showDoneList ? "Back to Focus" : "Weekly Recap"}
          </button>
        </div>
        
        {!showDoneList ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 mb-6">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <button
                onClick={addTask}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-xl transition-all font-medium"
              >
                Add
              </button>
            </div>

            <ul className="space-y-3">
              {visibleTasks.map((t) => (
                <motion.li
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={t.id}
                  onClick={() => completeTask(t.id)}
                  className="group flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border border-white/20 bg-white/5 flex items-center justify-center transition-all",
                    t.completed && "bg-indigo-500 border-indigo-500"
                  )}>
                    {t.completed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span
                    className={cn(
                      "text-lg text-white/90 transition-all select-none",
                      t.completed && "line-through text-white/40"
                    )}
                  >
                    {t.title}
                    {t.duration && (
                      <span className="ml-2 text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                        {t.duration}m
                      </span>
                    )}
                  </span>
                  
                  {/* Start Button or Progress Bar */}
                  {!t.completed && t.duration && !t.startedAt && (
                    <button
                      onClick={(e) => startTask(t.id, e)}
                      className="ml-auto px-3 py-1 text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all"
                    >
                      Start
                    </button>
                  )}
                  
                  {!t.completed && t.duration && t.startedAt && (
                    <div className="absolute bottom-0 left-0 h-1 bg-green-500/50 transition-all duration-1000 ease-linear" style={{ width: `${getProgress(t)}%` }} />
                  )}
                </motion.li>
              ))}
            </ul>

            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="mt-4 text-sm text-white/40 hover:text-white/80 transition-colors text-center w-full"
              >
                {showAllTasks ? "Show Less" : `+ ${hiddenCount} more tasks`}
              </button>
            )}
            
            {activeTasks.length === 0 && tasks.length > 0 && (
              <p className="text-center text-white/40 mt-8">All caught up! 🎉</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
             <h3 className="text-xl font-semibold text-white/80 mb-4">Completed this week</h3>
             <ul className="space-y-3">
              {weeklyDone.length === 0 ? (
                <p className="text-white/40">No tasks completed yet.</p>
              ) : (
                weeklyDone.map((t) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={t.id}
                    className="flex items-center gap-3 p-4 bg-white/5/50 border border-white/5 rounded-xl"
                  >
                    <span className="text-green-400">✓</span>
                    <span className="text-lg text-white/60 line-through decoration-white/20">
                      {t.title}
                    </span>
                  </motion.li>
                ))
              )}
             </ul>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}

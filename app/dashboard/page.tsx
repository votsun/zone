"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Check, Plus } from "lucide-react";
import styles from "./home.module.css";
import { initialTasks, type Tasks } from "./data";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const [name, setName] = useState("there"); // fallback while loading
  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const emailName = user.email?.split("@")[0];
        setName(emailName ?? "there");

        // Option B — fetch full name from your profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) setName(profile.full_name);
      }
    }

    getUser();
  }, []);


  const [tasks, setTasks] = useState<Tasks[]>(initialTasks);
  const [slide, setSlide] = useState(0); // 0 = active tasks, 1 = completed tasks
  const sliderRef = useRef<HTMLDivElement>(null);

  // Split tasks into two groups
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Mark a task as complete (moves it to slide 2)
  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  };

  // Go to a specific slide
  const goToSlide = (index: number) => {
    setSlide(index);
    sliderRef.current?.children[index].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  return (
    <div className={styles.page}>

      {/* Stars in the background */}
      <div className={styles.starfield} aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>

        {/* Greeting */}
        <div className={styles.greeting}>
          <h1>Hi, {name} 👋</h1>
          <p>Today's Focus</p>
        </div>

        {/* Slide indicators — two dots showing which slide you're on */}
        <div className={styles.dots}>
          <button
            className={`${styles.dot} ${slide === 0 ? styles.dotActive : ""}`}
            onClick={() => goToSlide(0)}
          />
          <button
            className={`${styles.dot} ${slide === 1 ? styles.dotActive : ""}`}
            onClick={() => goToSlide(1)}
          />
        </div>

        {/* Slideshow — two slides side by side, CSS scroll snap handles the swiping */}
        <div
          className={styles.slider}
          ref={sliderRef}
          onScroll={(e) => {
            // Update the active dot when the user manually swipes
            const el = e.currentTarget;
            const newSlide = Math.round(el.scrollLeft / el.offsetWidth);
            setSlide(newSlide);
          }}
        >

          {/* Slide 1 — Active tasks */}
          <div className={styles.slide}>
            <div className={styles.slideHeader}>
              <span className={styles.slideTitle}>Active</span>
              <span className={styles.slideCount}>{activeTasks.length} tasks</span>
            </div>
            <div className={styles.taskList}>
              {activeTasks.length === 0 && (
                <div className={styles.emptyState}>All done! 🎉</div>
              )}
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${styles.taskCardFeatured}`}
                  onClick={() => completeTask(task.id)}
                >
                  <div className={styles.taskCardLeft}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {task.subtasks.length > 0
                        ? `${task.subtasks.filter((s) => !s.done).length} subtasks left`
                        : task.totalMinutes
                        ? `${task.totalMinutes} min total`
                        : "Tap to complete"}
                    </span>
                  </div>
                  <div className={styles.taskCardRight}>
                    {task.subtasks.length > 0 && (
                      <span className={styles.taskDuration}>
                        {task.subtasks.reduce((total, s) => total + s.duration, 0)} min
                      </span>
                    )}
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 2 — Completed tasks */}
          <div className={styles.slide}>
            <div className={styles.slideHeader}>
              <span className={styles.slideTitle}>Completed</span>
              <span className={styles.slideCount}>{completedTasks.length} tasks</span>
            </div>
            <div className={styles.taskList}>
              {completedTasks.length === 0 && (
                <div className={styles.emptyState}>Nothing completed yet</div>
              )}
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${styles.taskCardFeatured} ${styles.taskCardDone}`}
                >
                  <div className={styles.taskCardLeft}>
                    <span className={styles.taskTitleDone}>{task.title}</span>
                    <span className={styles.taskMeta}>Completed</span>
                  </div>
                  <div className={styles.taskCardRight}>
                    <Check size={14} className={styles.checkIcon} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Add new task button */}
        <button className={styles.fab}>
          <Plus size={22} />
        </button>

      </div>
    </div>
  );
}
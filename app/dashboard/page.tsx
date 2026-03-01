'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Check, Plus, X, Upload, BatteryLow, Coffee, Zap, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './home.module.css'
import { createClient } from '@/lib/supabase/client'
import { useTasks } from '@/hooks/useTasks'
import { EnergyLevel, Task } from '@/types/task'

type Star = {
  left: string
  top: string
  animationDelay: string
  opacity: number
}

export default function Page() {
  const router = useRouter()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskEnergy, setNewTaskEnergy] = useState<EnergyLevel>('medium')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState('there')
  const [slide, setSlide] = useState(0)

  const sliderRef = useRef<HTMLDivElement>(null)

  const stars = useRef<Star[]>(
    Array.from({ length: 60 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  ).current

  const { tasks, isLoading, error, createTask, updateTask } = useTasks()

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const emailName = user.email?.split('@')[0]
      setName(emailName ?? 'there')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setName(profile.full_name)
      }
    }

    getUser()
  }, [])

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  )

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.is_complete),
    [tasks]
  )

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.is_complete),
    [tasks]
  )

  const getRemainingSteps = (task: Task) =>
    task.micro_steps?.filter((step) => !step.is_complete).length ?? 0

  const getTotalMinutes = (task: Task) =>
    task.micro_steps?.reduce(
      (total, step) => total + (step.estimated_minutes ?? 0),
      0
    ) ?? 0

  const goToSlide = (index: number) => {
    setSlide(index)
    sliderRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  const completeTask = async (id: string) => {
    try {
      setActionError(null)
      await updateTask(id, { is_complete: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to complete task'
      setActionError(message)
    }
  }

  const resetAddTaskForm = () => {
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskEnergy('medium')
    setSelectedFile(null)
  }

  const openAddTaskModal = () => {
    setActionError(null)
    setSelectedTaskId(null)
    setIsAddModalOpen(true)
  }

  const closeAddTaskModal = () => {
    if (creatingTask) return
    setIsAddModalOpen(false)
    resetAddTaskForm()
  }

  const handleSubmitNewTask = async (e: FormEvent) => {
    e.preventDefault()
    if (creatingTask) return
    if (!newTaskTitle.trim() || !newTaskDescription.trim()) return

    setActionError(null)
    setCreatingTask(true)

    try {
      const created = await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        category: 'neutral',
        priority: 'medium',
        energy_level: newTaskEnergy,
      })

      // Best-effort step generation; task page also has retry/auto generation.
      await fetch('/api/tasks/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: created.id,
          energyLevel: newTaskEnergy,
          taskDescription: newTaskDescription.trim(),
          fileName: selectedFile?.name || null,
        }),
      }).catch(() => null)

      setSlide(0)
      closeAddTaskModal()
      router.push(`/tasks/${created.id}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create task'
      setActionError(message)
      window.alert(`Could not add task: ${message}`)
    } finally {
      setCreatingTask(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setActionError(null)
    setLoggingOut(true)

    try {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw new Error(signOutError.message)
      }
      router.push('/login')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to log out'
      setActionError(message)
      window.alert(`Could not log out: ${message}`)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.starfield} aria-hidden>
        {stars.map((star, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.greeting}>
            <h1>Hi, {name} 👋</h1>
            <p>Today&apos;s Focus</p>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <div className={styles.dots}>
          <button
            className={`${styles.dot} ${slide === 0 ? styles.dotActive : ''}`}
            onClick={() => goToSlide(0)}
            aria-label="Show active tasks"
          />
          <button
            className={`${styles.dot} ${slide === 1 ? styles.dotActive : ''}`}
            onClick={() => goToSlide(1)}
            aria-label="Show completed tasks"
          />
        </div>

        <div
          className={styles.slider}
          ref={sliderRef}
          onScroll={(e) => {
            const el = e.currentTarget
            const newSlide = Math.round(el.scrollLeft / el.offsetWidth)
            setSlide(newSlide)
          }}
        >
          <div className={styles.slide}>
            <div className={styles.slideHeader}>
              <span className={styles.slideTitle}>Active</span>
              <span className={styles.slideCount}>{activeTasks.length} tasks</span>
            </div>

            <div className={styles.taskList}>
              {isLoading && (
                <div className={styles.emptyState}>Loading tasks...</div>
              )}

              {!isLoading && !error && activeTasks.length === 0 && (
                <div className={styles.emptyState}>All done! 🎉</div>
              )}

              {error && <div className={styles.emptyState}>{error}</div>}
              {actionError && (
                <div className={styles.emptyState}>{actionError}</div>
              )}

              {activeTasks.map((task) => {
                const totalMinutes = getTotalMinutes(task)
                const remainingSteps = getRemainingSteps(task)
                const hasSteps = (task.micro_steps?.length ?? 0) > 0

                return (
                  <div
                    key={task.id}
                    className={`${styles.taskCard} ${styles.taskCardFeatured}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className={styles.taskCardLeft}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.taskMeta}>
                        {hasSteps
                          ? `${remainingSteps} subtasks left`
                          : totalMinutes > 0
                          ? `${totalMinutes} min total`
                          : 'Tap to open'}
                      </span>
                    </div>

                    <div className={styles.taskCardRight}>
                      {totalMinutes > 0 && (
                        <span className={styles.taskDuration}>
                          {totalMinutes} min
                        </span>
                      )}
                      <ChevronRight size={14} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.slide}>
            <div className={styles.slideHeader}>
              <span className={styles.slideTitle}>Completed</span>
              <span className={styles.slideCount}>
                {completedTasks.length} tasks
              </span>
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

        <button
          className={styles.fab}
          onClick={openAddTaskModal}
          disabled={creatingTask}
          aria-label="Add task"
        >
          <Plus size={22} />
        </button>
      </div>

      {selectedTask && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setSelectedTaskId(null)}
          />

          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{selectedTask.title}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedTaskId(null)}
                aria-label="Close task details"
              >
                ✕
              </button>
            </div>

            <div className={styles.subtaskList}>
              {!selectedTask.micro_steps || selectedTask.micro_steps.length === 0 ? (
                <p className={styles.emptyState}>No subtasks yet.</p>
              ) : (
                selectedTask.micro_steps.map((sub) => (
                  <div
                    key={sub.id}
                    className={`${styles.subtaskRow} ${
                      sub.is_complete ? styles.subtaskDone : ''
                    }`}
                  >
                    <div className={styles.subtaskLeft}>
                      <span className={styles.subtaskTitle}>
                        {sub.description}
                      </span>
                      <span className={styles.subtaskMeta}>
                        {sub.estimated_minutes ?? 0} min
                      </span>
                    </div>

                    <div className={styles.timerBlock}>
                      <div
                        className={styles.timerFill}
                        style={{ width: sub.is_complete ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {!!selectedTask.micro_steps?.length && (
              <p className={styles.totalTime}>
                ⏱ {getTotalMinutes(selectedTask)} min total
              </p>
            )}

            <div className={styles.detailActions}>
              <button
                className={styles.startBtn}
                onClick={() => {
                  router.push(`/tasks/${selectedTask.id}`)
                }}
              >
                ▶ Start
              </button>

              <button
                className={styles.completeBtn}
                onClick={async () => {
                  await completeTask(selectedTask.id)
                  setSelectedTaskId(null)
                }}
              >
                ✓ Mark Complete
              </button>
            </div>
          </div>
        </>
      )}

      {isAddModalOpen && (
        <>
          <div className={styles.addBackdrop} onClick={closeAddTaskModal} />
          <div className={styles.addModal}>
            <div className={styles.addModalHeader}>
              <h2>New Task</h2>
              <button
                type="button"
                className={styles.addCloseBtn}
                onClick={closeAddTaskModal}
                aria-label="Close add task modal"
              >
                <X size={16} />
              </button>
            </div>

            <form className={styles.addForm} onSubmit={handleSubmitNewTask}>
              <div className={styles.addInnerCard}>
                <h3>What&apos;s on your mind?</h3>

                <label htmlFor="new-task-title">Task Name</label>
                <input
                  id="new-task-title"
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="e.g., Study for Chem Midterm"
                />

                <label htmlFor="new-task-description">Quick Description</label>
                <textarea
                  id="new-task-description"
                  required
                  value={newTaskDescription}
                  onChange={(event) => setNewTaskDescription(event.target.value)}
                  placeholder="Paste the syllabus requirements or just vent about what needs to be done..."
                />

                <label className={styles.uploadZone}>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  />
                  <Upload className={styles.uploadIcon} size={30} />
                  <p>{selectedFile?.name || 'Drop a PDF or homework file here'}</p>
                  <span>Optional - we&apos;ll use this to break down tasks</span>
                </label>

                <div className={styles.energyWrap}>
                  <h4>How much energy do you have?</h4>
                  <div className={styles.energyOptions}>
                    <button
                      type="button"
                      className={`${styles.energyBtn} ${newTaskEnergy === 'low' ? styles.energyBtnActiveLow : ''}`}
                      onClick={() => setNewTaskEnergy('low')}
                    >
                      <BatteryLow size={18} />
                      Low
                    </button>
                    <button
                      type="button"
                      className={`${styles.energyBtn} ${newTaskEnergy === 'medium' ? styles.energyBtnActiveMedium : ''}`}
                      onClick={() => setNewTaskEnergy('medium')}
                    >
                      <Coffee size={18} />
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`${styles.energyBtn} ${newTaskEnergy === 'high' ? styles.energyBtnActiveHigh : ''}`}
                      onClick={() => setNewTaskEnergy('high')}
                    >
                      <Zap size={18} />
                      High
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.addSubmitBtn} disabled={creatingTask}>
                  {creatingTask ? 'Creating...' : 'Let\'s Go'}
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

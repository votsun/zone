"use client";


export interface Subtask {
  id: number;
  title: string;
  duration: number; //(in minutes)
  done: boolean;
}

export interface Tasks {
  id: number;
  title: string;
  subtasks: Subtask[];// array;
  totalMinutes?: number; //(in minutes)
  completed?: boolean;
}


export const initialTasks: Tasks[] = [
  {
    id: 1,
    title: "Task 1",
    subtasks: [
      { id: 1, title: "Subtask 1", duration: 25, done: true },
      { id: 2, title: "Subtask 2", duration: 15, done: false },
      { id: 3, title: "Subtask 3", duration: 10, done: false },
    ],
  },
  {
    id: 2,
    title: "Task 2",
    totalMinutes: 45,
    subtasks: [],
  },
  {
    id: 3,
    title: "Task 3",
    completed: true,
    subtasks: [],
  },
  {
    id: 4,
    title: "Task 4",
    subtasks: [],
  },
  {
    id: 5,
    title: "Task 5",
    subtasks: [],
  },
];
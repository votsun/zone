export interface Task {
  id: string;
  title: string;
}

export interface MicroStep {
  id: string;
  taskId: string;
  text: string;
}

export type Priority = "High" | "Medium" | "Low";

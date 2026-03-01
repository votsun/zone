import "./AddTask.css";

export default function Page() {
  return (
    <div className="page-wrapper">
      <div className="add-task-card">
        <h2 className="task-title">New Task</h2>

        <label className="upload-box">
          Upload File
        </label>

        <textarea placeholder="or type here..." />

        <div className="energy-section">
          <span>Pick your energy level</span>
          <div className="energy-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>

        <button className="add-btn">Add Task</button>
      </div>
    </div>
  );
}
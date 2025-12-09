import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetch(`${API}/tasks`).then(res => res.json()).then(setTasks);
  }, []);

  const addTask = async () => {
    if (!newTask) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask("");
    fetch(`${API}/tasks`).then(res => res.json()).then(setTasks);
  };

  const completeTask = async (id) => {
    await fetch(`${API}/tasks/${id}/complete`, { method: "POST" });
    fetch(`${API}/tasks`).then(res => res.json()).then(setTasks);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>To-Do List</h2>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {tasks.map(t => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <input type="checkbox" onChange={() => completeTask(t.id)} style={{ marginRight: 8 }} />
            <span>{t.title}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add new task"
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={addTask} style={{ padding: "6px 12px" }}>Add</button>
      </div>
    </div>
  );
}

export default App;
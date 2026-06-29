function loadTasks() {
  const saved = localStorage.getItem("nerima_tasks");
  return saved ? JSON.parse(saved) : defaultTasks;
}

function saveTasks() {
  localStorage.setItem("nerima_tasks", JSON.stringify(tasks));
}
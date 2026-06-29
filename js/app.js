let currentUser = "川井（雅）";
let currentPage = "my";
let tasks = loadTasks();

function changeUser(name) {
  currentUser = name;
  render();
}

function changePage(page) {
  currentPage = page;
  render();
}

function startTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, status: "作業中" } : t
  );
  saveTasks();
  render();
}

function completeTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, status: "完了" } : t
  );
  saveTasks();
  render();
}

function passTask(id) {
  tasks = tasks.map(t =>
    t.id === id
      ? { ...t, owner: t.nextOwner, status: "新着", ballDays: 0 }
      : t
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  if (!confirm("このタスクを削除しますか？")) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function addTask() {
  const project = document.getElementById("newProject").value;
  const name = document.getElementById("newTaskName").value.trim();
  const owner = document.getElementById("newOwner").value;
  const nextOwner = document.getElementById("newNextOwner").value;
  const due = document.getElementById("newDue").value;

  if (!name) {
    alert("タスク名を入力してください。");
    return;
  }

  if (!due) {
    alert("期限を入力してください。");
    return;
  }

  const newTask = {
    id: Date.now(),
    project,
    name,
    owner,
    nextOwner,
    due,
    status: "未着手",
    ballDays: 0
  };

  tasks.push(newTask);
  saveTasks();
  render();
}

function saveEditedTask(id) {
  const name = document.getElementById(`editName-${id}`).value.trim();
  const owner = document.getElementById(`editOwner-${id}`).value;
  const nextOwner = document.getElementById(`editNextOwner-${id}`).value;
  const status = document.getElementById(`editStatus-${id}`).value;
  const due = document.getElementById(`editDue-${id}`).value;
  const ballDays = Number(document.getElementById(`editBallDays-${id}`).value);

  if (!name) {
    alert("タスク名を入力してください。");
    return;
  }

  if (!due) {
    alert("期限を入力してください。");
    return;
  }

  tasks = tasks.map(t =>
    t.id === id
      ? { ...t, name, owner, nextOwner, status, due, ballDays }
      : t
  );

  saveTasks();
  render();
}

function render() {
  if (currentPage === "my") {
    document.getElementById("app").innerHTML = renderMyPage();
  }

  if (currentPage === "boss") {
    document.getElementById("app").innerHTML = renderBossPage();
  }

  if (currentPage === "projects") {
    document.getElementById("app").innerHTML = renderProjectsPage();
  }

  if (currentPage === "admin") {
    document.getElementById("app").innerHTML = renderAdminPage();
  }
}

render();
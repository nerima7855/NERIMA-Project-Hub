function daysLeft(dateText) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateText + "T00:00:00");
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

function deadlineText(dateText) {
  const d = daysLeft(dateText);
  if (d < 0) return `超過${Math.abs(d)}日`;
  if (d === 0) return "今日";
  return `残り${d}日`;
}

function deadlineClass(dateText) {
  const d = daysLeft(dateText);
  if (d <= 1) return "";
  if (d <= 7) return "warn";
  return "safe";
}

function formatDate(dateText) {
  const d = new Date(dateText + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function renderMembers() {
  return `
    <div class="card">
      <div class="title">👤 メンバー選択</div>
      <div class="member-grid">
        ${members.map(m => `
          <button class="member-btn ${currentUser === m.name ? "active" : ""}" onclick="changeUser('${m.name}')">
            ${m.name}
            <span class="role">${m.role}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTask(t) {
  return `
    <div class="task">
      <div class="task-head">
        <div>
          <div class="project-name">${t.project}</div>
          <div class="task-name">${t.name}</div>
          <span class="status ${t.status === "新着" ? "new" : t.status === "作業中" ? "working" : ""}">${t.status}</span>
          <div class="meta">期限：${formatDate(t.due)} ／ ボール保持：${t.ballDays}日</div>
          <div class="meta">担当：${t.owner} ／ 次：${t.nextOwner}</div>
        </div>
        <div class="deadline ${deadlineClass(t.due)}">${deadlineText(t.due)}</div>
      </div>

      <div class="actions">
        <button class="start-btn" onclick="startTask(${t.id})">開始</button>
        <button class="done-btn" onclick="completeTask(${t.id})">完了</button>
        <button class="pass-btn" onclick="passTask(${t.id})">次へ渡す</button>
        <button class="delete-btn" onclick="deleteTask(${t.id})">削除</button>
      </div>
    </div>
  `;
}

function renderMyPage() {
  const member = members.find(m => m.name === currentUser);
  const myTasks = tasks.filter(t => t.owner === currentUser && t.status !== "完了");

  return `
    <div class="app">
      <div class="hero">
        <h1>おはようございます<br>${currentUser}さん</h1>
        <p>${member.role} ／ ${member.dept}</p>
      </div>

      ${renderMembers()}

      <div class="card">
        <div class="title">今日の確認</div>
        <div class="big-number">${myTasks.length}</div>
        <div class="big-label">未完了の仕事</div>
        <div class="meta">社長画面にも表示されます。</div>
      </div>

      <div class="card">
        <div class="title">🏃 自分のやること</div>
        ${myTasks.length === 0 ? `<div class="meta">未完了タスクはありません。</div>` : ""}
        ${myTasks.map(t => renderTask(t)).join("")}
      </div>
    </div>
    ${renderNav()}
  `;
}

function renderBossPage() {
  const openTasks = tasks.filter(t => t.status !== "完了");
  const risk = [...openTasks].sort((a, b) => {
    if (daysLeft(a.due) !== daysLeft(b.due)) return daysLeft(a.due) - daysLeft(b.due);
    return b.ballDays - a.ballDays;
  });

  return `
    <div class="app">
      <div class="hero">
        <h1>社長確認画面</h1>
        <p>全部は見ない。止まっている所だけ見る。</p>
      </div>

      <div class="card">
        <div class="title">🚨 要確認</div>
        <div class="big-number">${openTasks.length}</div>
        <div class="big-label">未完了タスク</div>
      </div>

      <div class="card">
        <div class="title">🔥 危険ランキング</div>
        ${risk.map((t, i) => `
          <div class="rank-row">
            <div class="badge">${i + 1}</div>
            <div>
              <div class="task-name">${t.project}</div>
              <div class="small">${t.name}</div>
              <div class="small">担当：${t.owner} ／ 状態：${t.status} ／ 保持：${t.ballDays}日</div>
            </div>
            <div class="deadline ${deadlineClass(t.due)}">${deadlineText(t.due)}</div>
          </div>
        `).join("")}
      </div>
    </div>
    ${renderNav()}
  `;
}

function renderProjectsPage() {
  const sorted = [...projects].sort((a, b) => daysLeft(a.due) - daysLeft(b.due));

  return `
    <div class="app">
      <div class="hero">
        <h1>プロジェクト一覧</h1>
        <p>工程を管理するのではなく、ゴールを達成する。</p>
      </div>

      <div class="card">
        <div class="title">🎯 進行中プロジェクト</div>
        ${sorted.map((p, i) => `
          <div class="rank-row">
            <div class="badge">${i + 1}</div>
            <div>
              <div class="task-name">${p.name}</div>
              <div class="small">終了日：${formatDate(p.due)}</div>
            </div>
            <div class="deadline ${deadlineClass(p.due)}">${deadlineText(p.due)}</div>
          </div>
        `).join("")}
      </div>
    </div>
    ${renderNav()}
  `;
}

function renderEditForm(t) {
  return `
    <div class="card">
      <div class="title">✏️ 編集：${t.name}</div>

      <div class="form">
        <div>
          <label>タスク名</label>
          <input id="editName-${t.id}" type="text" value="${t.name}">
        </div>

        <div>
          <label>担当者</label>
          <select id="editOwner-${t.id}">
            ${members.map(m => `<option value="${m.name}" ${t.owner === m.name ? "selected" : ""}>${m.name}</option>`).join("")}
          </select>
        </div>

        <div>
          <label>次の担当者</label>
          <select id="editNextOwner-${t.id}">
            ${members.map(m => `<option value="${m.name}" ${t.nextOwner === m.name ? "selected" : ""}>${m.name}</option>`).join("")}
          </select>
        </div>

        <div>
          <label>状態</label>
          <select id="editStatus-${t.id}">
            ${["未着手", "新着", "作業中", "完了"].map(s => `<option value="${s}" ${t.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>

        <div>
          <label>期限</label>
          <input id="editDue-${t.id}" type="date" value="${t.due}">
        </div>

        <div>
          <label>ボール保持日数</label>
          <input id="editBallDays-${t.id}" type="number" min="0" value="${t.ballDays}">
        </div>

        <button class="add-btn" onclick="saveEditedTask(${t.id})">編集を保存</button>
      </div>
    </div>
  `;
}

function renderAdminPage() {
  return `
    <div class="app">
      <div class="hero">
        <h1>管理画面</h1>
        <p>タスクを追加・編集・削除できます。</p>
      </div>

      <div class="card">
        <div class="title">➕ タスク追加</div>

        <div class="form">
          <div>
            <label>プロジェクト</label>
            <select id="newProject">
              ${projects.map(p => `<option value="${p.name}">${p.name}</option>`).join("")}
            </select>
          </div>

          <div>
            <label>タスク名</label>
            <input id="newTaskName" type="text" placeholder="例：設備レイアウト確認">
          </div>

          <div>
            <label>担当者</label>
            <select id="newOwner">
              ${members.map(m => `<option value="${m.name}">${m.name}</option>`).join("")}
            </select>
          </div>

          <div>
            <label>次の担当者</label>
            <select id="newNextOwner">
              ${members.map(m => `<option value="${m.name}">${m.name}</option>`).join("")}
            </select>
          </div>

          <div>
            <label>期限</label>
            <input id="newDue" type="date">
          </div>

          <button class="add-btn" onclick="addTask()">タスクを追加</button>
        </div>
      </div>

      ${tasks.map(t => renderEditForm(t)).join("")}
    </div>
    ${renderNav()}
  `;
}

function renderNav() {
  return `
    <div class="bottom-nav">
      <button class="${currentPage === "my" ? "active" : ""}" onclick="changePage('my')">自分</button>
      <button class="${currentPage === "boss" ? "active" : ""}" onclick="changePage('boss')">社長</button>
      <button class="${currentPage === "projects" ? "active" : ""}" onclick="changePage('projects')">案件</button>
      <button class="${currentPage === "admin" ? "active" : ""}" onclick="changePage('admin')">管理</button>
    </div>
  `;
}
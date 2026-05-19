// C:\Users\iswas\.gemini\antigravity\scratch\quant-tracker\app.js

// --- PRELOADED SNIPPETS Vault (Read Only Reference) ---
const PRELOADED_SNIPPETS = window.QUANT_SNIPPETS || [];

// --- STATE MANAGER ---
class StateManager {
  constructor() {
    this.loadState();
  }

  loadState() {
    // Stats
    this.streak = parseInt(localStorage.getItem("qp_streak") || "0");
    this.lastStudyDate = localStorage.getItem("qp_last_study_date") || "";
    this.totalHours = parseFloat(localStorage.getItem("qp_total_hours") || "0.0");

    // Dynamic User Syllabus (Empty by default)
    const savedSyllabus = localStorage.getItem("qp_custom_syllabus");
    this.syllabus = savedSyllabus ? JSON.parse(savedSyllabus) : [];

    // Custom User Resources (Empty by default)
    const savedResources = localStorage.getItem("qp_resources");
    this.resources = savedResources ? JSON.parse(savedResources) : [];

    // Daily Checklist
    const savedTasks = localStorage.getItem("qp_tasks");
    this.tasks = savedTasks ? JSON.parse(savedTasks) : [
      { id: "task-init-1", text: "Create my first Syllabus Phase", category: "daily", completed: false },
      { id: "task-init-2", text: "Add a YouTube lecture link to my resources", category: "python", completed: false }
    ];

    // Weekly schedule
    this.schedule = JSON.parse(localStorage.getItem("qp_schedule") || JSON.stringify({
      Mon: "Plan my course outline & core topics",
      Tue: "Gather YouTube lecture video links",
      Wed: "Read study materials & write notes",
      Thu: "Code model algorithms in Jupyter",
      Fri: "Run calculations & check results",
      Sat: "Log weekly progress metrics",
      Sun: "Outline objectives for next week"
    }));

    // Notes
    this.notes = JSON.parse(localStorage.getItem("qp_study_notes") || "{}");

    // Custom Code Snippets
    const savedSnippets = localStorage.getItem("qp_custom_snippets");
    this.customSnippets = savedSnippets ? JSON.parse(savedSnippets) : [];
  }

  saveState() {
    localStorage.setItem("qp_streak", this.streak);
    localStorage.setItem("qp_last_study_date", this.lastStudyDate);
    localStorage.setItem("qp_total_hours", this.totalHours.toFixed(1));
    localStorage.setItem("qp_custom_syllabus", JSON.stringify(this.syllabus));
    localStorage.setItem("qp_resources", JSON.stringify(this.resources));
    localStorage.setItem("qp_tasks", JSON.stringify(this.tasks));
    localStorage.setItem("qp_schedule", JSON.stringify(this.schedule));
    localStorage.setItem("qp_study_notes", JSON.stringify(this.notes));
    localStorage.setItem("qp_custom_snippets", JSON.stringify(this.customSnippets));
  }

  incrementStreak() {
    const today = new Date().toISOString().split("T")[0];
    if (this.lastStudyDate === today) return; // Already logged today
    
    if (this.lastStudyDate) {
      const lastDate = new Date(this.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.streak += 1;
      } else if (diffDays > 1) {
        this.streak = 1; // reset streak
      }
    } else {
      this.streak = 1;
    }
    
    this.lastStudyDate = today;
    this.saveState();
  }

  addHours(hours) {
    this.totalHours += hours;
    this.incrementStreak();
    this.saveState();
  }

  // --- SYLLABUS EDIT ACTIONS ---
  addSyllabusPhase(title, desc) {
    const newPhase = {
      phaseId: `phase-${Date.now()}`,
      phaseTitle: title,
      phaseDesc: desc || "Self-designed quantitative study segment.",
      items: []
    };
    this.syllabus.push(newPhase);
    this.saveState();
  }

  addImportedSyllabusPhase(title, desc, videos) {
    const newPhase = {
      phaseId: `phase-${Date.now()}`,
      phaseTitle: title,
      phaseDesc: desc || "Auto-imported course playlist from YouTube.",
      items: videos.map((video, idx) => {
        return {
          id: `item-${Date.now()}-${idx}`,
          title: video.title,
          concepts: video.concepts && video.concepts.length ? video.concepts : ["quant"],
          videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          videoId: video.videoId,
          progress: 0
        };
      })
    };
    this.syllabus.push(newPhase);
    this.saveState();
  }

  deleteSyllabusPhase(phaseId) {
    this.syllabus = this.syllabus.filter(p => p.phaseId !== phaseId);
    this.saveState();
  }

  addSyllabusItem(phaseId, title, concepts, videoUrl) {
    const phase = this.syllabus.find(p => p.phaseId === phaseId);
    if (phase) {
      let videoId = "";
      const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match) videoId = match[1];

      const newItem = {
        id: `item-${Date.now()}`,
        title: title,
        concepts: concepts ? concepts.split(",").map(c => c.trim()) : ["custom"],
        videoUrl: videoUrl,
        videoId: videoId,
        progress: 0 // Watched progress 0% to 100%
      };
      
      phase.items.push(newItem);
      this.saveState();
    }
  }

  deleteSyllabusItem(phaseId, itemId) {
    const phase = this.syllabus.find(p => p.phaseId === phaseId);
    if (phase) {
      phase.items = phase.items.filter(i => i.id !== itemId);
      this.saveState();
    }
  }

  updateSyllabusItemProgress(itemId, progressVal) {
    let found = false;
    this.syllabus.forEach(phase => {
      const item = phase.items.find(i => i.id === itemId);
      if (item) {
        item.progress = parseInt(progressVal);
        found = true;
      }
    });
    if (found) {
      this.incrementStreak();
      this.saveState();
    }
  }

  // --- RESOURCE ACTIONS ---
  addResource(resource) {
    this.resources.push(resource);
    this.saveState();
  }

  deleteResource(resId) {
    this.resources = this.resources.filter(r => r.id !== resId);
    this.saveState();
  }

  updateResourceProgress(resId, progressVal) {
    const res = this.resources.find(r => r.id === resId);
    if (res) {
      res.progress = parseInt(progressVal);
      this.incrementStreak();
      this.saveState();
    }
  }

  // --- TASKS ACTIONS ---
  addTask(task) {
    this.tasks.push(task);
    this.saveState();
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) this.incrementStreak();
      this.saveState();
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveState();
  }

  updateSchedule(day, planText) {
    this.schedule[day] = planText;
    this.saveState();
  }

  saveNote(resourceId, noteText) {
    this.notes[resourceId] = noteText;
    this.saveState();
  }

  // --- CODE VAULT CUSTOM SNIPPETS ---
  addCustomSnippet(title, description, libraries, code) {
    const newSnip = {
      id: `snip-${Date.now()}`,
      title,
      description,
      libraries: libraries ? libraries.split(",").map(l => l.trim()) : ["python"],
      code
    };
    this.customSnippets.push(newSnip);
    this.saveState();
  }
}

const state = new StateManager();

// --- POMODORO TIMER CORE ---
let timerInterval = null;
let timerTimeLeft = 25 * 60;
let timerPreset = 25;
let isTimerRunning = false;

function playTimerAlarm() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (err) {
    console.error("Synthesizer error: ", err);
  }
}

function updateTimerDisplay() {
  const mins = Math.floor(timerTimeLeft / 60);
  const secs = timerTimeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const timerDisplay = document.getElementById("timer-display");
  if (timerDisplay) {
    timerDisplay.innerText = timeStr;
  }
  
  if (isTimerRunning) {
    document.title = `(${timeStr}) Focus Session | QuantPy`;
  } else {
    document.title = "QuantPy - Quantitative Finance Study Dashboard";
  }
}

function startTimer() {
  if (isTimerRunning) return;
  isTimerRunning = true;
  document.getElementById("btn-play-pause").innerHTML = '<i class="lucide-pause"></i>';
  document.querySelector(".pomodoro-container").classList.add("active-timer");
  
  timerInterval = setInterval(() => {
    timerTimeLeft--;
    updateTimerDisplay();
    
    if (timerTimeLeft <= 0) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      document.getElementById("btn-play-pause").innerHTML = '<i class="lucide-play"></i>';
      document.querySelector(".pomodoro-container").classList.remove("active-timer");
      
      playTimerAlarm();
      showToast("Time is up! Outstanding focus session logged.", "success");
      
      if (timerPreset === 25) {
        state.addHours(0.4);
        renderStats();
        renderDashboardView();
      }
      
      timerTimeLeft = timerPreset * 60;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isTimerRunning) return;
  clearInterval(timerInterval);
  isTimerRunning = false;
  document.getElementById("btn-play-pause").innerHTML = '<i class="lucide-play"></i>';
  document.querySelector(".pomodoro-container").classList.remove("active-timer");
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  document.getElementById("btn-play-pause").innerHTML = '<i class="lucide-play"></i>';
  document.querySelector(".pomodoro-container").classList.remove("active-timer");
  timerTimeLeft = timerPreset * 60;
  updateTimerDisplay();
}

function setTimerPreset(mins) {
  timerPreset = mins;
  resetTimer();
  document.querySelectorAll(".timer-preset-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

// --- UTILITY TOAST NOTIFICATION ---
function showToast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.innerHTML = `<i class="lucide-${type === "success" ? "check" : "alert-triangle"}"></i> ${msg}`;
  
  container.appendChild(toast);
  lucide.createIcons({ nameAttr: 'class' });

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// --- OVERALL PROGRESS CALCULATION ---
function getOverallSyllabusProgress() {
  let totalItems = 0;
  let totalCompletion = 0;
  
  // Aggregate dynamic syllabus progress percentages
  state.syllabus.forEach(phase => {
    phase.items.forEach(item => {
      totalItems++;
      totalCompletion += item.progress;
    });
  });

  // Aggregate resource progress percentages
  state.resources.forEach(res => {
    totalItems++;
    totalCompletion += res.progress;
  });
  
  return totalItems === 0 ? 0 : Math.round(totalCompletion / totalItems);
}

// --- VIEW NAVIGATION ROUTER ---
function navigateTo(viewId) {
  document.querySelectorAll(".view-panel").forEach(p => {
    p.classList.remove("active");
  });
  
  const targetPanel = document.getElementById(`${viewId}-view`);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }
  
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
  
  const activeNavItem = document.querySelector(`.nav-item[onclick*="${viewId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }
  
  if (viewId === "dashboard") renderDashboardView();
  if (viewId === "roadmap") renderRoadmapView();
  if (viewId === "resources") renderResourcesView();
  if (viewId === "goals") renderGoalsView();
  if (viewId === "snippets") renderSnippetsView();
}

// --- TELEMETRY STATS PANEL ---
function renderStats() {
  document.getElementById("stat-val-streak").innerText = `${state.streak} Days`;
  document.getElementById("stat-val-progress").innerText = `${getOverallSyllabusProgress()}%`;
  document.getElementById("stat-val-hours").innerText = `${state.totalHours.toFixed(1)} hrs`;
  
  const pendingTasks = state.tasks.filter(t => !t.completed).length;
  document.getElementById("stat-val-tasks").innerText = `${pendingTasks} Tasks`;
  
  const headerStreak = document.getElementById("header-streak-count");
  if (headerStreak) {
    headerStreak.innerText = `${state.streak} DAY STREAK`;
  }
}

// --- DASHBOARD RENDER ---
function renderDashboardView() {
  renderStats();
  
  const checklistContainer = document.getElementById("quick-checklist-container");
  checklistContainer.innerHTML = "";
  
  if (state.tasks.length === 0) {
    checklistContainer.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-secondary); font-size: 13px;">
        <i class="lucide-check-circle" style="font-size: 28px; margin-bottom: 8px; color: var(--text-muted);"></i>
        <p>No remaining tasks for today! Click "New Task" above or schedule study blocks inside the planner.</p>
      </div>
    `;
    return;
  }
  
  state.tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = `checklist-item ${task.completed ? "completed" : ""}`;
    
    item.onclick = (e) => {
      if (e.target.closest('.delete-checklist-btn')) return;
      state.toggleTask(task.id);
      renderDashboardView();
      renderStats();
      showToast(task.completed ? "Goal checked off! Streak synchronized." : "Goal unmarked.", "success");
    };
    
    item.innerHTML = `
      <div class="checklist-item-left">
        <div class="custom-checkbox">
          <i class="lucide-check"></i>
        </div>
        <div class="checklist-text-wrapper">
          <span class="checklist-text">${task.text}</span>
          <span class="checklist-category-tag tag-${task.category}">${task.category}</span>
        </div>
      </div>
      <button class="delete-checklist-btn" title="Delete Task">
        <i class="lucide-trash-2"></i>
      </button>
    `;
    
    item.querySelector(".delete-checklist-btn").onclick = (e) => {
      e.stopPropagation();
      state.deleteTask(task.id);
      renderDashboardView();
      renderStats();
      showToast("Goal item removed successfully.", "success");
    };
    
    checklistContainer.appendChild(item);
  });
  
  lucide.createIcons({ nameAttr: 'class' });
}

// --- DYNAMIC ROADMAP SYLLABUS RENDER ---
let activeTargetSyllabusPhaseId = null;

function renderRoadmapView() {
  const container = document.getElementById("roadmap-timeline-wrapper");
  container.innerHTML = "";
  
  if (state.syllabus.length === 0) {
    container.innerHTML = `
      <div class="card-container" style="text-align: center; padding: 60px; color: var(--text-secondary);">
        <i class="lucide-git-fork" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
        <h2>No Custom Study Modules Defined Yet</h2>
        <p style="margin: 12px auto 24px; max-width: 500px; font-size: 14px; line-height: 1.6;">
          This study space is completely custom. Click the button below to define your first major course phase or study segment (e.g. "Phase 1: Foundations of Options").
        </p>
        <button class="btn-primary" onclick="openNewPhaseModal()" style="margin: 0 auto;">
          <i class="lucide-plus"></i> Define Study Phase
        </button>
      </div>
    `;
    return;
  }

  // Prepend modular buttons to add syllabus chapters
  const controlBox = document.createElement("div");
  controlBox.className = "panel-header-actions";
  controlBox.style.justifyContent = "flex-end";
  controlBox.style.marginBottom = "20px";
  controlBox.innerHTML = `
    <button class="btn-primary" onclick="openNewPhaseModal()">
      <i class="lucide-plus"></i> Add Study Phase
    </button>
  `;
  container.appendChild(controlBox);

  state.syllabus.forEach((phase) => {
    const completedItemsInPhase = phase.items.filter(i => i.progress === 100).length;
    const totalItemsInPhase = phase.items.length;
    const isPhaseDone = totalItemsInPhase > 0 && completedItemsInPhase === totalItemsInPhase;
    
    const card = document.createElement("div");
    card.className = `roadmap-phase-card ${isPhaseDone ? "completed-phase" : ""} expanded`;
    card.id = `card-${phase.phaseId}`;
    
    card.innerHTML = `
      <div class="roadmap-phase-header" onclick="togglePhaseExpand('${phase.phaseId}')">
        <div class="roadmap-phase-header-left">
          <div class="phase-badge"><i class="lucide-book-open" style="font-size: 12px;"></i></div>
          <div class="phase-title-desc">
            <span class="phase-title">${phase.phaseTitle}</span>
            <span class="phase-desc">${phase.phaseDesc}</span>
          </div>
        </div>
        <div class="roadmap-phase-stats" onclick="event.stopPropagation();">
          <span class="phase-progress-text">${completedItemsInPhase}/${totalItemsInPhase} Completed</span>
          <button class="btn-secondary" onclick="openNewUnitModal('${phase.phaseId}')" style="padding: 6px 10px; font-size: 11px; font-weight:700;" title="Add Lecture Unit to Section">
            <i class="lucide-plus"></i> Add Unit
          </button>
          <button class="delete-checklist-btn" onclick="deleteSyllabusPhase('${phase.phaseId}')" title="Delete Phase Section" style="color: var(--text-muted);">
            <i class="lucide-trash-2" style="font-size: 14px;"></i>
          </button>
          <i class="lucide-chevron-down phase-chevron"></i>
        </div>
      </div>
      
      <div class="phase-details-list" id="list-${phase.phaseId}" style="display: flex;">
        <!-- Sub items loaded dynamically -->
      </div>
    `;
    
    const subList = card.querySelector(".phase-details-list");
    
    if (phase.items.length === 0) {
      subList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); width: 100%; font-size: 13px;">
          <p>No study units registered inside this segment. Click "Add Unit" above to log custom YouTube lectures.</p>
        </div>
      `;
    } else {
      phase.items.forEach(item => {
        const subItem = document.createElement("div");
        subItem.className = `roadmap-item ${item.progress === 100 ? "completed" : ""}`;
        
        subItem.innerHTML = `
          <div class="roadmap-item-info">
            <div class="roadmap-item-details" style="width: 100%;">
              <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span class="roadmap-item-title" onclick="playSyllabusVideo('${item.id}', '${item.videoId}', '${item.title}')">${item.title}</span>
                <button class="delete-checklist-btn" onclick="deleteSyllabusItem('${phase.phaseId}', '${item.id}')" title="Delete Unit">
                  <i class="lucide-trash-2" style="font-size:12px;"></i>
                </button>
              </div>
              <div class="roadmap-item-concepts" style="margin-top: 4px;">
                ${item.concepts.map(c => `<span class="concept-pill">${c}</span>`).join("")}
              </div>
              
              <!-- Progress Slider in Syllabus row -->
              <div style="display:flex; align-items:center; gap: 14px; margin-top: 14px; background: rgba(255,255,255,0.01); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <label style="font-size: 11px; font-weight:700; color: var(--text-secondary); width: 100px;">Watched: ${item.progress}%</label>
                <input type="range" min="0" max="100" value="${item.progress}" oninput="updateSyllabusSliderProgress('${item.id}', this.value)" style="flex-grow: 1; accent-color: var(--accent-green); height:4px; border-radius:2px; cursor:pointer;">
              </div>

              ${item.videoId ? `
              <div class="roadmap-resource-link" style="margin-top: 10px;">
                <a href="#" onclick="playSyllabusVideo('${item.id}', '${item.videoId}', '${item.title}')" class="roadmap-resource-link">
                  <i class="lucide-youtube"></i> Load Embedded Study Theatre
                </a>
              </div>
              ` : ''}
            </div>
          </div>
        `;
        
        subList.appendChild(subItem);
      });
    }
    
    container.appendChild(card);
  });
  
  lucide.createIcons({ nameAttr: 'class' });
}

function deleteSyllabusPhase(phaseId) {
  event.stopPropagation();
  if (confirm("Are you sure you want to delete this study phase? All sub-unit progress records will be cleared.")) {
    state.deleteSyllabusPhase(phaseId);
    renderRoadmapView();
    renderStats();
    showToast("Study chapter section removed.", "success");
  }
}

function deleteSyllabusItem(phaseId, itemId) {
  event.stopPropagation();
  if (confirm("Delete this syllabus unit?")) {
    state.deleteSyllabusItem(phaseId, itemId);
    renderRoadmapView();
    renderStats();
    showToast("Syllabus lecture cleared.", "success");
  }
}

function updateSyllabusSliderProgress(itemId, val) {
  state.updateSyllabusItemProgress(itemId, val);
  
  // Throttle statistical updates
  renderStats();
  
  // Find text labels and adjust without full page reflow
  const label = event.target.previousElementSibling;
  if (label) {
    label.innerText = `Watched: ${val}%`;
  }
}

function togglePhaseExpand(phaseId) {
  const card = document.getElementById(`card-${phaseId}`);
  if (card) {
    card.classList.toggle("expanded");
  }
}

function playSyllabusVideo(itemId, videoId, title) {
  event.preventDefault();
  event.stopPropagation();
  loadTheatreMode(videoId, title, itemId, "syllabus");
}

// --- RESOURCE LIBRARY HUB RENDER ---
let activeResourceFilter = "all";

function setResourceFilter(filterType) {
  activeResourceFilter = filterType;
  document.querySelectorAll(".filter-pill").forEach(p => {
    p.classList.remove("active");
  });
  event.target.classList.add("active");
  renderResourcesView();
}

function renderResourcesView() {
  const grid = document.getElementById("resource-grid-wrapper");
  grid.innerHTML = "";
  
  const filtered = state.resources.filter(r => {
    if (activeResourceFilter === "all") return true;
    return r.type === activeResourceFilter;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: span 3; text-align: center; padding: 80px; color: var(--text-secondary);">
        <i class="lucide-library" style="font-size: 42px; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3>No Custom Materials logged in this channel</h3>
        <p style="margin-top: 8px;">Upload personal YouTube lectures, books, or web resources to initialize the library.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(res => {
    const card = document.createElement("div");
    card.className = "resource-card";
    
    card.innerHTML = `
      <div class="resource-thumbnail-container">
        <img class="resource-thumbnail-img" src="${res.thumbnail}" alt="${res.title}">
        <span class="resource-type-badge">
          <i class="lucide-${res.type === 'lecture' ? 'video' : res.type === 'book' ? 'book-open' : 'globe'}"></i>
          ${res.type}
        </span>
        <button class="delete-checklist-btn" onclick="deleteResourceItem('${res.id}')" title="Delete Material" style="position:absolute; top:16px; right:16px; background:rgba(7,9,14,0.85); border-radius:6px; padding:6px; color:#fff; border:1px solid var(--border-color);">
          <i class="lucide-trash-2" style="font-size: 12px;"></i>
        </button>
        <span class="resource-duration-badge">${res.duration}</span>
      </div>
      
      <div class="resource-card-body">
        <h4 class="resource-card-title">${res.title}</h4>
        <p class="resource-card-desc">${res.desc}</p>
        
        <!-- Completion range input inside resource card -->
        <div style="margin: 8px 0; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size: 11px; font-weight:700; color: var(--text-secondary);">Completion</span>
            <span style="font-size: 11px; font-weight:800; color: var(--accent-green);" id="card-progress-val-${res.id}">${res.progress}%</span>
          </div>
          <input type="range" min="0" max="100" value="${res.progress}" oninput="updateResourceSliderProgress('${res.id}', this.value)" style="width: 100%; accent-color: var(--accent-green); height:4px; border-radius:2px; cursor:pointer;">
        </div>

        <div class="resource-tags" style="margin-top:6px;">
          ${res.tags.map(t => `<span class="resource-tag">${t}</span>`).join("")}
        </div>
      </div>
      
      <div class="resource-card-footer" style="justify-content: flex-end;">
        <button class="play-resource-btn" onclick="openResourceTheatre('${res.id}')" title="Play Video & Open Study Notepad">
          <i class="lucide-play"></i>
        </button>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  lucide.createIcons({ nameAttr: 'class' });
}

function deleteResourceItem(resId) {
  event.stopPropagation();
  if (confirm("Delete this material resource from your collection?")) {
    state.deleteResource(resId);
    renderResourcesView();
    renderStats();
    showToast("Resource cleared from vault.", "success");
  }
}

function updateResourceSliderProgress(resId, val) {
  state.updateResourceProgress(resId, val);
  renderStats();
  
  const span = document.getElementById(`card-progress-val-${resId}`);
  if (span) span.innerText = `${val}%`;
}

function openResourceTheatre(resId) {
  const res = state.resources.find(r => r.id === resId);
  if (res) {
    if (res.videoId) {
      loadTheatreMode(res.videoId, res.title, res.id, "resource");
    } else {
      window.open(res.url, "_blank");
    }
  }
}

// --- THEATRE MODE NOTES & PROGRESS ---
let activeNotesResourceId = null;
let activeNotesSourceType = null; // 'syllabus' or 'resource'
let saveDebounceTimer = null;

function loadTheatreMode(videoId, title, resourceId, sourceType = "resource") {
  navigateTo("theatre");
  
  const frame = document.getElementById("theatre-iframe");
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
  
  document.getElementById("theatre-title").innerText = title;
  
  activeNotesResourceId = resourceId;
  activeNotesSourceType = sourceType;

  // Retrieve current notes
  const savedNotes = state.notes[activeNotesResourceId] || "";
  const notepad = document.getElementById("theatre-notes-textarea");
  notepad.value = savedNotes;
  notepad.placeholder = `# Notes: ${title}\n\nOutline core concepts, algorithms, and equations from this video.\n\nKey Insights:\n- `;
  
  // Identify and display completion percent
  let initialProgress = 0;
  if (sourceType === "syllabus") {
    state.syllabus.forEach(phase => {
      const item = phase.items.find(i => i.id === resourceId);
      if (item) initialProgress = item.progress;
    });
  } else {
    const res = state.resources.find(r => r.id === resourceId);
    if (res) initialProgress = res.progress;
  }

  // Populate Interactive Progress Scrubber inside Theatre meta panel
  const progressBox = document.getElementById("theatre-progress-container");
  progressBox.innerHTML = `
    <div style="background: rgba(255,255,255,0.03); border:1px solid var(--border-color); padding: 14px 20px; border-radius: 12px; margin-top:14px; display:flex; align-items:center; gap: 20px;">
      <span style="font-size: 13px; font-weight:700; color: var(--text-secondary); width:150px;" id="theatre-progress-lbl">Completed: ${initialProgress}%</span>
      <input type="range" min="0" max="100" value="${initialProgress}" oninput="updateTheatreSliderProgress(this.value)" style="flex-grow:1; accent-color: var(--accent-green); height:6px; border-radius:3px; cursor:pointer;">
    </div>
  `;

  updateAutoSaveText(false);
}

function updateTheatreSliderProgress(val) {
  const lbl = document.getElementById("theatre-progress-lbl");
  if (lbl) lbl.innerText = `Completed: ${val}%`;

  if (activeNotesSourceType === "syllabus") {
    state.updateSyllabusItemProgress(activeNotesResourceId, val);
  } else {
    state.updateResourceProgress(activeNotesResourceId, val);
  }

  renderStats();
}

function handleNotesTyping() {
  updateAutoSaveText(true);
  
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  
  saveDebounceTimer = setTimeout(() => {
    const val = document.getElementById("theatre-notes-textarea").value;
    state.saveNote(activeNotesResourceId, val);
    updateAutoSaveText(false);
  }, 800);
}

function updateAutoSaveText(isTyping) {
  const label = document.getElementById("auto-save-status-text");
  if (label) {
    if (isTyping) {
      label.innerHTML = `<i class="lucide-refresh-cw" style="animation: spin 1.5s linear infinite;"></i> Saving...`;
      label.style.color = "var(--accent-gold)";
    } else {
      label.innerHTML = `<i class="lucide-cloud-lightning"></i> Saved to browser database`;
      label.style.color = "var(--accent-green)";
    }
    lucide.createIcons({ nameAttr: 'class' });
  }
}

// --- FOCUS STUDY TIMER & BLUEPRINT ---
function renderGoalsView() {
  renderStats();
  updateTimerDisplay();
  
  const container = document.getElementById("schedule-rows-wrapper");
  container.innerHTML = "";
  
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  weekdays.forEach(day => {
    const row = document.createElement("div");
    row.className = "schedule-day-row";
    
    row.innerHTML = `
      <span class="schedule-day-label">${day}</span>
      <input type="text" class="schedule-day-input" value="${state.schedule[day]}" onchange="updateDaySchedule('${day}')" placeholder="Plan core quantitative study slots...">
    `;
    
    container.appendChild(row);
  });
}

function updateDaySchedule(day) {
  const val = event.target.value;
  state.updateSchedule(day, val);
  showToast(`${day} target saved successfully.`, "success");
}

// --- PYTHON CODE VAULT ---
let activeSnippetId = "fetch-data";

function renderSnippetsView() {
  const listPanel = document.getElementById("snippets-list-wrapper");
  listPanel.innerHTML = "";
  
  // Combine preloaded and custom user snippets
  const allSnippets = [...PRELOADED_SNIPPETS, ...state.customSnippets];
  
  if (allSnippets.length === 0) {
    listPanel.innerHTML = `<p style="padding:20px; color:var(--text-secondary); text-align:center;">No snippets defined. Click "Add Custom Snippet" to log recipes.</p>`;
    return;
  }

  allSnippets.forEach(snip => {
    const card = document.createElement("div");
    card.className = `snippet-item-card ${snip.id === activeSnippetId ? "active" : ""}`;
    card.onclick = () => {
      activeSnippetId = snip.id;
      renderSnippetsView();
    };
    
    card.innerHTML = `
      <span class="snippet-card-title">${snip.title}</span>
      <span class="snippet-card-desc">${snip.description}</span>
    `;
    
    listPanel.appendChild(card);
  });
  
  const activeSnip = allSnippets.find(s => s.id === activeSnippetId);
  if (activeSnip) {
    document.getElementById("snippet-view-title").innerText = activeSnip.title;
    
    const libBox = document.getElementById("snippet-libs-wrapper");
    libBox.innerHTML = activeSnip.libraries.map(l => `<span class="lib-badge">${l}</span>`).join("");
    
    const codeContainer = document.getElementById("snippet-code-content");
    codeContainer.textContent = activeSnip.code;
  }
}

function copySnippetToClipboard() {
  const code = document.getElementById("snippet-code-content").textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast("Python script code copied to clipboard!", "success");
  }).catch(() => {
    showToast("Copy error. Select code manually.", "error");
  });
}

// --- DIALOG POPUP HANDLERS ---
function openNewGoalModal() {
  document.getElementById("new-goal-modal").style.display = "flex";
}
function closeNewGoalModal() {
  document.getElementById("new-goal-modal").style.display = "none";
}
function submitNewGoalForm() {
  const textInput = document.getElementById("input-goal-text");
  const categorySelect = document.getElementById("select-goal-category");
  
  if (!textInput.value.trim()) {
    showToast("Task description required.", "error");
    return;
  }
  
  const newTask = {
    id: `task-${Date.now()}`,
    text: textInput.value.trim(),
    category: categorySelect.value,
    completed: false
  };
  
  state.addTask(newTask);
  textInput.value = "";
  closeNewGoalModal();
  renderDashboardView();
  renderStats();
  showToast("Custom learning task registered.", "success");
}

// Custom Syllabus Phase Dialog
function openNewPhaseModal() {
  document.getElementById("new-phase-modal").style.display = "flex";
}
function closeNewPhaseModal() {
  document.getElementById("new-phase-modal").style.display = "none";
}
function submitNewPhaseForm() {
  const title = document.getElementById("input-phase-title").value.trim();
  const desc = document.getElementById("input-phase-desc").value.trim();
  
  if (!title) {
    showToast("Study Segment Title required.", "error");
    return;
  }
  
  state.addSyllabusPhase(title, desc);
  document.getElementById("input-phase-title").value = "";
  document.getElementById("input-phase-desc").value = "";
  
  closeNewPhaseModal();
  renderRoadmapView();
  showToast("Syllabus section phase initialized successfully.", "success");
}

// Custom Syllabus Lecture Unit Dialog
function openNewUnitModal(phaseId) {
  activeTargetSyllabusPhaseId = phaseId;
  document.getElementById("new-unit-modal").style.display = "flex";
}
function closeNewUnitModal() {
  document.getElementById("new-unit-modal").style.display = "none";
}
function submitNewUnitForm() {
  const title = document.getElementById("input-unit-title").value.trim();
  const concepts = document.getElementById("input-unit-concepts").value.trim();
  const url = document.getElementById("input-unit-url").value.trim();
  
  if (!title || !url) {
    showToast("Unit Title and Target URL required.", "error");
    return;
  }
  
  state.addSyllabusItem(activeTargetSyllabusPhaseId, title, concepts, url);
  
  document.getElementById("input-unit-title").value = "";
  document.getElementById("input-unit-concepts").value = "";
  document.getElementById("input-unit-url").value = "";
  
  closeNewUnitModal();
  renderRoadmapView();
  renderStats();
  showToast("Lecture integrated into study segment.", "success");
}

// Custom Resources Dialog
function openNewResourceModal() {
  document.getElementById("new-resource-modal").style.display = "flex";
}
function closeNewResourceModal() {
  document.getElementById("new-resource-modal").style.display = "none";
}
function submitNewResourceForm() {
  const title = document.getElementById("input-res-title").value.trim();
  const desc = document.getElementById("input-res-desc").value.trim();
  const type = document.getElementById("select-res-type").value;
  const tagsStr = document.getElementById("input-res-tags").value.trim();
  const duration = document.getElementById("input-res-duration").value.trim();
  const url = document.getElementById("input-res-url").value.trim();
  
  if (!title || !url) {
    showToast("Title and URL parameters are mandatory.", "error");
    return;
  }
  
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()) : ["custom"];
  
  let videoId = "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) videoId = ytMatch[1];
  
  let thumbnail = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop";
  if (type === "lecture") {
    thumbnail = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop";
  } else if (type === "book") {
    thumbnail = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";
  }
  
  const newRes = {
    id: `res-${Date.now()}`,
    title,
    desc: desc || "Self-directed reading or study materials.",
    type,
    thumbnail,
    tags,
    duration: duration || "N/A",
    url,
    videoId,
    progress: 0
  };
  
  state.addResource(newRes);
  
  document.getElementById("input-res-title").value = "";
  document.getElementById("input-res-desc").value = "";
  document.getElementById("input-res-tags").value = "";
  document.getElementById("input-res-duration").value = "";
  document.getElementById("input-res-url").value = "";
  
  closeNewResourceModal();
  renderResourcesView();
  renderStats();
  showToast("Quant resource saved in Library.", "success");
}

// Custom Snippets Dialog
function openNewSnippetModal() {
  document.getElementById("new-snippet-modal").style.display = "flex";
}
function closeNewSnippetModal() {
  document.getElementById("new-snippet-modal").style.display = "none";
}
function submitNewSnippetForm() {
  const title = document.getElementById("input-snip-title").value.trim();
  const desc = document.getElementById("input-snip-desc").value.trim();
  const libs = document.getElementById("input-snip-libs").value.trim();
  const code = document.getElementById("input-snip-code").value;
  
  if (!title || !code) {
    showToast("Snippet Title and Code block are required.", "error");
    return;
  }
  
  state.addCustomSnippet(title, desc || "Custom user calculations script.", libs, code);
  
  document.getElementById("input-snip-title").value = "";
  document.getElementById("input-snip-desc").value = "";
  document.getElementById("input-snip-libs").value = "";
  document.getElementById("input-snip-code").value = "";
  
  closeNewSnippetModal();
  renderSnippetsView();
  showToast("Custom algorithm snippet saved in vault.", "success");
}

// Study Time Logging Dialog
function openLogTimeModal() {
  document.getElementById("log-time-modal").style.display = "flex";
}
function closeLogTimeModal() {
  document.getElementById("log-time-modal").style.display = "none";
}
function submitLogTimeForm() {
  const inputHours = document.getElementById("input-log-hours");
  const hours = parseFloat(inputHours.value);
  
  if (isNaN(hours) || hours <= 0) {
    showToast("Please state valid study hour parameters.", "error");
    return;
  }
  
  state.addHours(hours);
  inputHours.value = "";
  closeLogTimeModal();
  renderDashboardView();
  renderStats();
  showToast("Study time logged successfully. Daily streak synced!", "success");
}

// --- YOUTUBE PLAYLIST AUTOMATED COURSE IMPORTER ---
function openImportPlaylistModal() {
  document.getElementById("import-playlist-modal").style.display = "flex";
  document.getElementById("input-playlist-url").value = "";
  document.getElementById("yt-import-status").style.display = "none";
  document.getElementById("btn-submit-yt-import").disabled = false;
  document.getElementById("btn-cancel-yt-import").disabled = false;
}

function closeImportPlaylistModal() {
  document.getElementById("import-playlist-modal").style.display = "none";
}

function extractPlaylistId(url) {
  url = url.trim();
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  if (match) return match[1];
  
  const matchDirect = url.match(/^[a-zA-Z0-9_-]{18,34}$/);
  if (matchDirect) return url;
  
  return null;
}

function parsePlaylistHtml(html) {
  const regex = /ytInitialData\s*=\s*({.+?});/s;
  const match = html.match(regex);
  if (!match) {
    const altRegex = /ytInitialData\s*=\s*({.+?})\s*(?:<\/script>|;)/s;
    const altMatch = html.match(altRegex);
    if (!altMatch) throw new Error("Could not parse YouTube page structure. The playlist may be invalid or private.");
    return decodePlaylistJson(altMatch[1]);
  }
  return decodePlaylistJson(match[1]);
}

function decodePlaylistJson(jsonStr) {
  const ytData = JSON.parse(jsonStr);
  
  // Extract Playlist Name
  let playlistTitle = "Imported YouTube Playlist";
  try {
    playlistTitle = ytData.metadata.playlistMetadataRenderer.title || playlistTitle;
  } catch (e) {
    try {
      playlistTitle = ytData.header.playlistHeaderRenderer.title.simpleText || playlistTitle;
    } catch(err) {
      try {
        playlistTitle = ytData.header.playlistHeaderRenderer.title.runs[0].text || playlistTitle;
      } catch (err2) {}
    }
  }
  
  // Extract Videos
  let videos = [];
  try {
    let listContents = null;
    
    if (ytData.contents && ytData.contents.twoColumnBrowseResultsRenderer) {
      listContents = ytData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    } else if (ytData.contents && ytData.contents.singleColumnBrowseResultsRenderer) {
      listContents = ytData.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    }
    
    if (listContents) {
      listContents.forEach(item => {
        if (item.playlistVideoRenderer) {
          const r = item.playlistVideoRenderer;
          const videoId = r.videoId;
          let title = "Untitled Lecture";
          try {
            title = r.title.runs[0].text;
          } catch (e) {
            try {
              title = r.title.accessibility.accessibilityData.label;
            } catch(err) {}
          }
          
          // Generate semantic concepts
          let concepts = ["quant"];
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes("python") || lowerTitle.includes("code")) concepts.push("python");
          if (lowerTitle.includes("math") || lowerTitle.includes("stochastic") || lowerTitle.includes("calculus")) concepts.push("math");
          if (lowerTitle.includes("option") || lowerTitle.includes("greek") || lowerTitle.includes("derivative")) concepts.push("options");
          if (lowerTitle.includes("portfolio") || lowerTitle.includes("weight") || lowerTitle.includes("sharpe")) concepts.push("portfolio");
          if (lowerTitle.includes("backtest") || lowerTitle.includes("strategy")) concepts.push("backtesting");
          if (lowerTitle.includes("data") || lowerTitle.includes("pandas") || lowerTitle.includes("fetch")) concepts.push("data");
          if (concepts.length === 1) concepts.push("lecture");
          
          videos.push({
            videoId,
            title,
            concepts
          });
        }
      });
    }
  } catch (e) {
    console.error("Scraper JSON parsing details:", e);
  }
  
  if (videos.length === 0) {
    throw new Error("No public videos could be extracted from this playlist. Verify it is public.");
  }
  
  return {
    title: playlistTitle,
    videos: videos
  };
}

async function submitImportPlaylistForm() {
  const urlInput = document.getElementById("input-playlist-url");
  const playlistId = extractPlaylistId(urlInput.value);
  
  if (!playlistId) {
    showToast("Invalid YouTube Playlist ID or URL.", "error");
    return;
  }
  
  const statusBox = document.getElementById("yt-import-status");
  const statusText = document.getElementById("yt-import-status-text");
  const submitBtn = document.getElementById("btn-submit-yt-import");
  const cancelBtn = document.getElementById("btn-cancel-yt-import");
  
  statusBox.style.display = "flex";
  statusText.innerText = "Connecting to CORS Proxy...";
  submitBtn.disabled = true;
  cancelBtn.disabled = true;
  
  const targetUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  
  // Try Proxy 1: allorigins
  try {
    statusText.innerText = "Fetching course structure (allorigins.win)...";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      statusText.innerText = "Parsing videos and playlists...";
      const course = parsePlaylistHtml(data.contents);
      
      // Inject Syllabus
      state.addImportedSyllabusPhase(course.title, `Dynamic quantitative curriculum consisting of ${course.videos.length} imported lectures.`, course.videos);
      
      closeImportPlaylistModal();
      renderRoadmapView();
      renderStats();
      showToast(`Successfully imported course: ${course.title} (${course.videos.length} units created!)`, "success");
      return;
    }
  } catch (e) {
    console.warn("Proxy 1 failed, trying Proxy 2...", e);
  }
  
  // Try Proxy 2: corsproxy.io
  try {
    statusText.innerText = "Re-routing request (corsproxy.io)...";
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      statusText.innerText = "Extracting videos and playlists...";
      const course = parsePlaylistHtml(html);
      
      // Inject Syllabus
      state.addImportedSyllabusPhase(course.title, `Dynamic quantitative curriculum consisting of ${course.videos.length} imported lectures.`, course.videos);
      
      closeImportPlaylistModal();
      renderRoadmapView();
      renderStats();
      showToast(`Successfully imported course: ${course.title} (${course.videos.length} units created!)`, "success");
      return;
    }
  } catch (e) {
    console.error("Proxy 2 failed too", e);
  }
  
  // Reset buttons
  statusBox.style.display = "none";
  submitBtn.disabled = false;
  cancelBtn.disabled = false;
  showToast("Failed to fetch playlist contents. Verify the playlist URL/ID is public.", "error");
}

// --- INITIALIZE MAIN WORKSPACE ON LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  navigateTo("dashboard");
  renderStats();
  
  const textEditor = document.getElementById("theatre-notes-textarea");
  if (textEditor) {
    textEditor.addEventListener("input", handleNotesTyping);
  }
});

// Default sample content for each format (Minimalist edition)

export const DEFAULT_MARKDOWN = `# Welcome to Docklify

Docklify is a fast, minimalist multi-format document viewer and editor.

## Key Features

- **Markdown**: Full GFM support with Mermaid and KaTeX
- **HTML**: Live rendered preview in isolated environment
- **JSON**: Clean pretty printing and structure inspection
- **AI Assist**: Clean formatting and conversion tools

### Code Sample

\`\`\`javascript
function formatDocument(content, type) {
    return {
        type,
        timestamp: Date.now(),
        content: content.trim(),
    };
}
\`\`\`

### Status Matrix

| Format | Syntax | Preview | Export |
|---|---|---|---|
| Markdown | Supported | Live GFM | PDF / HTML |
| HTML | Supported | Isolated Iframe | PDF / Raw |
| JSON | Supported | Tree View | Clean Format |

### Flow Diagram

\`\`\`mermaid
graph LR
    A[Input] --> B[Parse]
    B --> C[Validate]
    C --> D[Render]
\`\`\`

> **Note**: Toggle AI mode in the toolbar to access automated restructuring tools.
`;

export const DEFAULT_HTML_CODE = `<div class="app-container">
  <!-- Top Navigation Bar -->
  <header class="app-header">
    <div class="brand">
      <div class="brand-badge">⚡</div>
      <div class="brand-info">
        <h1>Docklify Studio</h1>
        <span class="version-tag">v2.5 • Reactive Preview</span>
      </div>
    </div>
    <div class="header-actions">
      <span class="status-pill"><span class="dot"></span> Live Engine</span>
      <button id="like-btn" class="btn btn-outline" type="button">
        ❤️ <span id="like-count">128</span>
      </button>
    </div>
  </header>

  <!-- Metrics Grid -->
  <section class="metrics-grid">
    <div class="metric-card">
      <span class="metric-label">Total Requests</span>
      <div class="metric-val">124.8k</div>
      <span class="metric-trend positive">↑ 14.2% this week</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">Latency</span>
      <div class="metric-val">18.4ms</div>
      <span class="metric-trend neutral">⚡ Ultra fast</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">Health Score</span>
      <div class="metric-val">99.9%</div>
      <span class="metric-trend positive">● All systems normal</span>
    </div>
  </section>

  <!-- Interactive Project Milestone Section -->
  <main class="main-card">
    <div class="card-header">
      <div>
        <h2>Project Milestones</h2>
        <p class="subtitle">Add, complete, and filter project tasks in real time</p>
      </div>
      <div class="filter-group">
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="active">Active</button>
        <button class="filter-chip" data-filter="completed">Done</button>
      </div>
    </div>

    <!-- Add Task Form -->
    <form id="task-form" class="task-form">
      <input 
        type="text" 
        id="task-input" 
        placeholder="Enter milestone title (e.g. Design responsive navbar)..." 
        autocomplete="off" 
        required 
      />
      <button type="submit" class="btn btn-primary">
        <span>+ Add Milestone</span>
      </button>
    </form>

    <!-- Task List -->
    <ul id="task-list" class="task-list">
      <li class="task-item completed">
        <label class="task-checkbox-label">
          <input type="checkbox" checked class="task-check" />
          <span class="task-text">Integrate isolated iframe preview sandbox</span>
        </label>
        <button class="delete-btn" title="Delete milestone">✕</button>
      </li>
      <li class="task-item">
        <label class="task-checkbox-label">
          <input type="checkbox" class="task-check" />
          <span class="task-text">Organize workspace into HTML, CSS, and Script tabs</span>
        </label>
        <button class="delete-btn" title="Delete milestone">✕</button>
      </li>
      <li class="task-item">
        <label class="task-checkbox-label">
          <input type="checkbox" class="task-check" />
          <span class="task-text">Implement zero-flash tab switching</span>
        </label>
        <button class="delete-btn" title="Delete milestone">✕</button>
      </li>
    </ul>

    <!-- Quick Links & Anchor Testing Section -->
    <footer class="card-footer">
      <div class="footer-note">
        <span>Safe Navigation:</span>
        <a href="#" id="sample-anchor" class="safe-link">Empty Anchor (#)</a>
        <span>•</span>
        <a href="#quick-docs" class="safe-link">In-Page Scroll (#quick-docs)</a>
      </div>
    </footer>
  </main>

  <!-- In-page target section for smooth scrolling demo -->
  <section id="quick-docs" class="docs-section">
    <h3>📖 Quick Documentation</h3>
    <p>Docklify provides a lightweight, reactive environment for Markdown, HTML, and JSON workflows. All changes persist automatically.</p>
  </section>

  <!-- Live Toast Element -->
  <div id="toast-container" class="toast-container"></div>
</div>`;

export const DEFAULT_CSS_CODE = `:root {
  --bg-primary: #09090b;
  --bg-secondary: #121215;
  --bg-tertiary: #18181c;
  --border-color: #27272a;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
  --text-dim: #71717a;
  --accent: #38bdf8;
  --accent-hover: #0ea5e9;
  --accent-glow: rgba(56, 189, 248, 0.15);
  --success: #10b981;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-main);
  line-height: 1.5;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: var(--radius-md);
  color: var(--accent);
  box-shadow: 0 0 15px var(--accent-glow);
}

.brand-info h1 {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-main);
}

.version-tag {
  font-size: 0.72rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-val {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.metric-trend {
  font-size: 0.72rem;
  font-weight: 500;
}

.metric-trend.positive { color: var(--success); }
.metric-trend.neutral { color: var(--accent); }

/* Main Card */
.main-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-header h2 {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.filter-group {
  display: flex;
  gap: 4px;
  background: var(--bg-tertiary);
  padding: 3px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.filter-chip {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip.active {
  background: var(--bg-secondary);
  color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Form */
.task-form {
  display: flex;
  gap: 10px;
}

.task-form input {
  flex: 1;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--text-main);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.task-form input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 15px;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-primary {
  background: var(--accent);
  color: #09090b;
  border: none;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.btn-outline:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-dim);
}

/* Task List */
.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: background 0.15s, border-color 0.15s;
}

.task-item:hover {
  border-color: #3f3f46;
}

.task-checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.task-check {
  accent-color: var(--accent);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.task-text {
  font-size: 0.875rem;
  color: var(--text-main);
  transition: color 0.15s, text-decoration 0.15s;
}

.task-item.completed .task-text {
  color: var(--text-dim);
  text-decoration: line-through;
}

.delete-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Footer & Docs */
.card-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.775rem;
  color: var(--text-dim);
}

.safe-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.15s;
}

.safe-link:hover {
  text-decoration: underline;
}

.docs-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  margin-top: 4px;
}

.docs-section h3 {
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.docs-section p {
  font-size: 0.825rem;
  color: var(--text-muted);
}

/* Toast */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  background: #18181b;
  border: 1px solid var(--accent);
  color: var(--text-main);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`;

export const DEFAULT_JS_CODE = `// State & Elements
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterChips = document.querySelectorAll('.filter-chip');
const sampleAnchor = document.getElementById('sample-anchor');
const toastContainer = document.getElementById('toast-container');

// 1. Interactive Like Counter
let likes = 128;
likeBtn.addEventListener('click', () => {
  likes++;
  likeCount.textContent = likes;
  likeBtn.style.transform = 'scale(1.15)';
  setTimeout(() => { likeBtn.style.transform = 'scale(1)'; }, 150);
  showToast('❤️ Liked Docklify Studio!');
});

// 2. Add Milestone / Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.className = 'task-item';
  li.innerHTML = \`
    <label class="task-checkbox-label">
      <input type="checkbox" class="task-check" />
      <span class="task-text">\${escapeHTML(text)}</span>
    </label>
    <button class="delete-btn" title="Delete milestone">✕</button>
  \`;

  taskList.prepend(li);
  taskInput.value = '';
  showToast(\`✓ Added milestone: "\${text}"\`);
});

// 3. Toggle Complete & Delete via Event Delegation
taskList.addEventListener('click', (e) => {
  const item = e.target.closest('.task-item');
  if (!item) return;

  if (e.target.classList.contains('task-check')) {
    item.classList.toggle('completed', e.target.checked);
    showToast(e.target.checked ? '✓ Milestone completed' : '↩ Milestone marked active');
  }

  if (e.target.classList.contains('delete-btn')) {
    item.remove();
    showToast('✕ Milestone removed');
  }
});

// 4. Milestone Filter (All / Active / Done)
filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;

    document.querySelectorAll('.task-item').forEach((item) => {
      const isDone = item.classList.contains('completed');
      if (filter === 'all') {
        item.style.display = 'flex';
      } else if (filter === 'active') {
        item.style.display = isDone ? 'none' : 'flex';
      } else if (filter === 'completed') {
        item.style.display = isDone ? 'flex' : 'none';
      }
    });
  });
});

// 5. Test Anchor Guard (will never reload Docklify!)
sampleAnchor.addEventListener('click', (e) => {
  e.preventDefault();
  showToast('⚡ Empty link caught! Docklify preview will never reload.');
});

// Helper: Toast Notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}`;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docklify Studio Preview</title>
  <style>
${DEFAULT_CSS_CODE}
  </style>
</head>
<body>
${DEFAULT_HTML_CODE}
<script>
${DEFAULT_JS_CODE}
<\/script>
</body>
</html>`;

export const DEFAULT_JSON = `{
  "project": {
    "name": "Docklify Studio",
    "slug": "docklify-studio",
    "version": "2.5.0",
    "description": "High-performance multi-format document editor & preview engine",
    "status": "production",
    "visibility": "public",
    "repository": {
      "type": "git",
      "url": "https://github.com/docklify/docklify",
      "branch": "main",
      "stars": 4820
    }
  },
  "runtime": {
    "framework": "Next.js 16",
    "rendering": "Turbopack",
    "platform": "Node.js 20 LTS",
    "region": "us-east-1",
    "memoryAllocatedMb": 1024,
    "uptimeSeconds": 864200
  },
  "features": {
    "syntaxHighlighting": true,
    "realtimePreview": true,
    "isolatedSandbox": true,
    "safeNavigationGuard": true,
    "aiAssistance": {
      "enabled": true,
      "providers": ["gemini", "openai", "claude"],
      "model": "gemini-1.5-pro",
      "maxTokens": 4096
    },
    "supportedFormats": [
      {
        "id": "markdown",
        "name": "Markdown",
        "extensions": [".md", ".markdown"],
        "capabilities": ["GFM", "Mermaid Diagrams", "KaTeX Math", "Auto-save"]
      },
      {
        "id": "html",
        "name": "HTML5 Studio",
        "extensions": [".html", ".htm"],
        "capabilities": ["HTML + CSS + JS Tabs", "Live Sandbox", "Auto-format"]
      },
      {
        "id": "json",
        "name": "JSON Inspector",
        "extensions": [".json"],
        "capabilities": ["Pretty Format", "Minify", "Tree Explorer", "Validation"]
      }
    ]
  },
  "metrics": {
    "documentsRendered": 48210,
    "avgLatencyMs": 18.4,
    "errorRate": 0.0008,
    "activeUsers": 1420
  },
  "team": [
    {
      "id": "usr_01",
      "name": "Alex Morgan",
      "role": "Lead Architect",
      "email": "alex@docklify.io",
      "permissions": ["admin", "deploy", "billing"]
    },
    {
      "id": "usr_02",
      "name": "Sophia Chen",
      "role": "Frontend Engineer",
      "email": "sophia@docklify.io",
      "permissions": ["write", "review"]
    }
  ],
  "environments": {
    "production": {
      "endpoint": "https://docklify.io",
      "ssl": true,
      "autoDeploy": true
    },
    "staging": {
      "endpoint": "https://staging.docklify.io",
      "ssl": true,
      "autoDeploy": true
    }
  }
}`;


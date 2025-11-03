// ...existing code...

// 备注名数据结构与存储方案（提前声明，避免被早期调用的函数访问到未初始化的变量）
type UserNoteMap = Record<string, string>; // key: github用户名, value: 备注名

const STORAGE_KEY = 'github_user_notes';
const STORAGE_LANG_KEY = 'github_user_notes_lang';

// 简单 i18n 支持（中文 zh, English en）
const I18N: Record<string, Record<string, string | ((vars?: any) => string)>> = {
  zh: {
    'panel.title': 'GitHub 用户备注管理',
    'panel.button': '备注管理',
    'panel.close': '关闭',
    'panel.import': '导入 CSV',
    'panel.export': '导出 CSV',
    'alert.csv_only': '仅支持 CSV 文件',
    'alert.import_failed': '导入失败，请检查文件格式',
    'preview.info': (v: any) => `将导入 ${v.count} 条记录（含表头/无头请确认）`,
    'preview.confirm': '确认导入',
    'preview.cancel': '取消',
    'add.username.placeholder': 'GitHub用户名',
    'add.note.placeholder': '备注名',
    'add.button': '添加',
    'list.delete': '删除',
    'btn.save': '保存',
    'btn.cancel': '取消',
    'input.placeholder': '输入备注名',
    'badge.add': '（添加备注）',
    'badge.with': (v: any) => `（${v.note}）`,
    'badge.title.edit': '点击编辑备注',
    'badge.title.add': '点击添加备注',
    'lang.label': '语言',
    'export.filename': 'github-notes.csv'
  },
  en: {
    'panel.title': 'GitHub User Notes',
    'panel.button': 'Notes',
    'panel.close': 'Close',
    'panel.import': 'Import CSV',
    'panel.export': 'Export CSV',
    'alert.csv_only': 'Only CSV files are supported',
    'alert.import_failed': 'Import failed, please check the file format',
    'preview.info': (v: any) => `Will import ${v.count} rows (please confirm header/no-header)`,
    'preview.confirm': 'Confirm Import',
    'preview.cancel': 'Cancel',
    'add.username.placeholder': 'GitHub username',
    'add.note.placeholder': 'Remark',
    'add.button': 'Add',
    'list.delete': 'Delete',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'input.placeholder': 'Enter remark',
    'badge.add': '(add note)',
    'badge.with': (v: any) => `(${v.note})`,
    'badge.title.edit': 'Click to edit note',
    'badge.title.add': 'Click to add note',
    'lang.label': 'Language',
    'export.filename': 'github-notes.csv'
  }
};

function getSavedLang(): string {
  try {
    const v = localStorage.getItem(STORAGE_LANG_KEY);
    if (v) return v;
  } catch (e) { /* ignore */ }
  // detect from navigator
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}

function setSavedLang(lang: string) {
  try { localStorage.setItem(STORAGE_LANG_KEY, lang); } catch (e) { /* ignore */ }
}

let LANG = getSavedLang();

function t(key: string, vars?: any): string {
  const map = I18N[LANG] || I18N.en;
  const v = map[key];
  if (!v) return key;
  if (typeof v === 'function') return (v as any)(vars);
  let s = v as string;
  if (vars) {
    Object.keys(vars).forEach(k => { s = s.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), String(vars[k])); });
  }
  return s;
}

function loadNotes(): UserNoteMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as UserNoteMap;
    }
    return {};
  } catch {
    return {};
  }
}

function saveNotes(notes: UserNoteMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// 初始化 notes（尽早初始化，确保后续函数可安全访问）
let notes: UserNoteMap = {};
try {
  notes = loadNotes();
} catch {
  notes = {};
}

// 管理面板入口按钮
function createNotesPanelButton() {
  let btn = document.getElementById('user-notes-panel-btn') as HTMLButtonElement | null;
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'user-notes-panel-btn';
    btn.textContent = t('panel.button');
    btn.style.position = 'fixed';
    btn.style.bottom = '1.5rem';
    btn.style.right = '1.5rem';
    btn.style.zIndex = '99999';
    btn.style.background = '#2563eb';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '0.5rem';
    btn.style.padding = '0.5rem 1.2rem';
    btn.style.fontSize = '1rem';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    btn.style.cursor = 'pointer';
    document.body.appendChild(btn);
  }
  btn.onclick = () => {
    const panel = document.getElementById('user-notes-panel');
    if (panel) {
      panel.remove();
    } else {
      showNotesPanel();
    }
  };
}

// 插入基础样式，提高显示效果
function ensureStyles() {
  if (document.getElementById('user-notes-styles')) return;
  const style = document.createElement('style');
  style.id = 'user-notes-styles';
  style.textContent = `
    .user-note-badge{
      display:inline-block;
      margin-left:0.5rem;
      padding:0.15rem 0.45rem;
      background: rgba(253, 230, 138, 0.15);
      color:#b45309;
      border-radius:999px;
      font-size:90%;
      font-weight:600;
      cursor:pointer;
      border:1px solid rgba(209,213,219,0.6);
    }
    .user-note-badge:hover{ box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .user-note-input{ margin-left:0.5rem; display:inline-flex; gap:0.4rem; align-items:center; }
    .user-note-input input{ padding:0.15rem 0.4rem; border-radius:0.25rem; border:1px solid #d1d5db; }
    .user-note-input button{ padding:0.15rem 0.45rem; border-radius:0.25rem; border:none; cursor:pointer; }
    .user-note-input .save{ background:#10b981; color:#fff }
    .user-note-input .cancel{ background:#e5e7eb }
  `;
  document.head.appendChild(style);
}

// 管理面板
function showNotesPanel() {
  if (document.getElementById('user-notes-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'user-notes-panel';
  panel.style.position = 'fixed';
  panel.style.bottom = '4.5rem';
  panel.style.right = '1.5rem';
  panel.style.zIndex = '100000';
  panel.style.background = '#fff';
  panel.style.border = '1px solid #e5e7eb';
  panel.style.borderRadius = '0.75rem';
  panel.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  panel.style.padding = '1.2rem 1.5rem 1.2rem 1.5rem';
  panel.style.minWidth = '320px';
  panel.style.maxHeight = '60vh';
  panel.style.overflowY = 'auto';

  const title = document.createElement('div');
  title.textContent = t('panel.title');
  title.style.fontWeight = 'bold';
  title.style.fontSize = '1.1rem';
  title.style.marginBottom = '0.8rem';
  panel.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('panel.close');
  closeBtn.style.float = 'right';
  closeBtn.style.background = '#e5e7eb';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '0.4rem';
  closeBtn.style.padding = '0.2rem 0.8rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => panel.remove();
  panel.appendChild(closeBtn);

  // language selector
  const langRow = document.createElement('div');
  langRow.style.display = 'flex';
  langRow.style.alignItems = 'center';
  langRow.style.gap = '0.5rem';
  langRow.style.marginBottom = '0.6rem';
  const langLabel = document.createElement('label');
  langLabel.textContent = t('lang.label') + ':';
  const langSelect = document.createElement('select');
  const optZh = document.createElement('option'); optZh.value = 'zh'; optZh.textContent = '中文';
  const optEn = document.createElement('option'); optEn.value = 'en'; optEn.textContent = 'English';
  langSelect.appendChild(optZh); langSelect.appendChild(optEn);
  langSelect.value = LANG;
  langSelect.onchange = () => {
    LANG = langSelect.value;
    setSavedLang(LANG);
    panel.remove();
    showNotesPanel();
  };
  langRow.appendChild(langLabel);
  langRow.appendChild(langSelect);
  panel.appendChild(langRow);

  const list = document.createElement('div');
  // 导入导出区域
  const ioRow = document.createElement('div');
  ioRow.style.display = 'flex';
  ioRow.style.gap = '0.5rem';
  ioRow.style.marginBottom = '0.6rem';

  const importBtn = document.createElement('button');
  importBtn.textContent = t('panel.import');
  importBtn.style.background = '#3b82f6';
  importBtn.style.color = '#fff';
  importBtn.style.border = 'none';
  importBtn.style.borderRadius = '0.35rem';
  importBtn.style.padding = '0.25rem 0.6rem';
  importBtn.style.cursor = 'pointer';
  const exportBtn = document.createElement('button');
  exportBtn.textContent = t('panel.export');
  exportBtn.style.background = '#6b7280';
  exportBtn.style.color = '#fff';
  exportBtn.style.border = 'none';
  exportBtn.style.borderRadius = '0.35rem';
  exportBtn.style.padding = '0.25rem 0.6rem';
  exportBtn.style.cursor = 'pointer';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.style.display = 'none';

  importBtn.onclick = () => fileInput.click();
  exportBtn.onclick = () => {
    // 导出 notes 为 CSV
    const rows: string[] = ['username,remark'];
    Object.entries(notes).forEach(([u, r]) => {
      // escape quotes
      const safeU = `"${String(u).replace(/"/g, '""')}"`;
      const safeR = `"${String(r).replace(/"/g, '""')}"`;
      rows.push(`${safeU},${safeR}`);
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('export.filename');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  ioRow.appendChild(importBtn);
  ioRow.appendChild(fileInput);
  ioRow.appendChild(exportBtn);
  panel.appendChild(ioRow);
  Object.entries(notes).forEach(([username, note]) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '0.5rem';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = username;
    nameSpan.style.fontWeight = 'bold';
    nameSpan.style.marginRight = '0.7em';
    row.appendChild(nameSpan);

    const noteInput = document.createElement('input');
    noteInput.value = note;
    noteInput.style.flex = '1';
    noteInput.style.marginRight = '0.7em';
    noteInput.style.padding = '0.2em 0.5em';
    noteInput.style.border = '1px solid #d1d5db';
    noteInput.style.borderRadius = '0.3em';
    noteInput.onchange = () => {
      if (noteInput.value.trim()) {
        notes[username] = noteInput.value.trim();
      } else {
        delete notes[username];
      }
      saveNotes(notes);
      panel.remove();
      showNotesPanel();
      renderNotes();
    };
    row.appendChild(noteInput);

    const delBtn = document.createElement('button');
    delBtn.textContent = t('list.delete');
    delBtn.style.background = '#ef4444';
    delBtn.style.color = '#fff';
    delBtn.style.border = 'none';
    delBtn.style.borderRadius = '0.3em';
    delBtn.style.padding = '0.2em 0.7em';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => {
      delete notes[username];
      saveNotes(notes);
      panel.remove();
      showNotesPanel();
      renderNotes();
    };
    row.appendChild(delBtn);

    list.appendChild(row);
  });
  panel.appendChild(list);

  // 处理文件导入
  fileInput.onchange = async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    const name = f.name.toLowerCase();
    try {
      if (name.endsWith('.csv')) {
        const txt = await f.text();
        const rows = parseCSV(txt);
        // 显示预览并确认
        showImportPreview(panel, rows);
      } else {
        alert(t('alert.csv_only'));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(t('alert.import_failed'));
    } finally {
      fileInput.value = '';
      // 不在此处刷新面板，等待用户确认预览
    }
  };

  // import preview UI
  function showImportPreview(parentPanel: HTMLElement, rows: string[][]) {
    // 创建覆盖区域在 panel 内
    const preview = document.createElement('div');
    preview.style.borderTop = '1px dashed #e5e7eb';
    preview.style.paddingTop = '0.6rem';
    preview.style.marginTop = '0.6rem';

    const info = document.createElement('div');
    info.textContent = t('preview.info', { count: rows.length });
    info.style.marginBottom = '0.4rem';
    preview.appendChild(info);

    const table = document.createElement('div');
    table.style.maxHeight = '180px';
    table.style.overflow = 'auto';
    table.style.border = '1px solid #eef2f7';
    table.style.padding = '0.4rem';
    table.style.background = '#fff';
    rows.slice(0, 200).forEach(r => {
      const rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.gap = '0.8rem';
      const u = document.createElement('div'); u.textContent = r[0] || ''; u.style.flex = '0.6';
      const n = document.createElement('div'); n.textContent = r[1] || ''; n.style.flex = '1';
      rowEl.appendChild(u); rowEl.appendChild(n);
      table.appendChild(rowEl);
    });
    preview.appendChild(table);

    const actions = document.createElement('div');
    actions.style.marginTop = '0.6rem';
    const confirm = document.createElement('button');
    confirm.textContent = t('preview.confirm');
    confirm.style.background = '#10b981';
    confirm.style.color = '#fff';
    confirm.style.border = 'none';
    confirm.style.padding = '0.35rem 0.6rem';
    confirm.style.borderRadius = '0.35rem';
    confirm.style.cursor = 'pointer';
    confirm.onclick = () => {
      applyImportedRows(rows);
      preview.remove();
      parentPanel.remove();
      showNotesPanel();
      renderNotes();
    };
    const cancel = document.createElement('button');
    cancel.textContent = t('preview.cancel');
    cancel.style.marginLeft = '0.6rem';
    cancel.style.background = '#e5e7eb';
    cancel.style.border = 'none';
    cancel.style.padding = '0.35rem 0.6rem';
    cancel.style.borderRadius = '0.35rem';
    cancel.style.cursor = 'pointer';
    cancel.onclick = () => preview.remove();
    actions.appendChild(confirm); actions.appendChild(cancel);
    preview.appendChild(actions);

    parentPanel.appendChild(preview);
  }

  // 新增备注
  const addRow = document.createElement('div');
  addRow.style.display = 'flex';
  addRow.style.alignItems = 'center';
  addRow.style.marginTop = '1rem';

  const addInputName = document.createElement('input');
  addInputName.placeholder = t('add.username.placeholder');
  addInputName.style.flex = '0.7';
  addInputName.style.marginRight = '0.7em';
  addInputName.style.padding = '0.2em 0.5em';
  addInputName.style.border = '1px solid #d1d5db';
  addInputName.style.borderRadius = '0.3em';
  addRow.appendChild(addInputName);

  const addInputNote = document.createElement('input');
  addInputNote.placeholder = t('add.note.placeholder');
  addInputNote.style.flex = '1';
  addInputNote.style.marginRight = '0.7em';
  addInputNote.style.padding = '0.2em 0.5em';
  addInputNote.style.border = '1px solid #d1d5db';
  addInputNote.style.borderRadius = '0.3em';
  addRow.appendChild(addInputNote);

  const addBtn = document.createElement('button');
  addBtn.textContent = t('add.button');
  addBtn.style.background = '#10b981';
  addBtn.style.color = '#fff';
  addBtn.style.border = 'none';
  addBtn.style.borderRadius = '0.3em';
  addBtn.style.padding = '0.2em 0.7em';
  addBtn.style.cursor = 'pointer';
  addBtn.onclick = () => {
    const uname = addInputName.value.trim();
    const ntext = addInputNote.value.trim();
    if (uname && ntext) {
      notes[uname] = ntext;
      saveNotes(notes);
      panel.remove();
      showNotesPanel();
      renderNotes();
    }
  };
  addRow.appendChild(addBtn);
  panel.appendChild(addRow);

  document.body.appendChild(panel);
}

// 页面加载后插入管理按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createNotesPanelButton();
  }, { once: true });
} else {
  createNotesPanelButton();
}
// ...existing code...

// 在页面上显示备注名（会更新已有 badge）
function renderNotes() {
  ensureStyles();
  const users = getUserElements();
  users.forEach(({ username, el }) => {
    const parent = el.parentElement || el;
    // 如果有编辑框，跳过（编辑中）
    if (parent.querySelector('.user-note-input')) return;

    const existing = parent.querySelector('.user-note-badge') as HTMLElement | null;
    // Prefer notes keyed by href-derived username. If none, try to migrate any existing note
    // stored under display name or nearby .color-fg-default into the href-derived key.
    let note = notes[username];
    if (!note) {
      // try display text
      const displayText = el.textContent?.trim();
      if (displayText && notes[displayText]) {
        notes[username] = notes[displayText];
        delete notes[displayText];
        saveNotes(notes);
        note = notes[username];
      } else if (parent) {
        const alt = parent.querySelector('.color-fg-default');
        const altText = alt?.textContent?.trim();
        if (altText && notes[altText]) {
          notes[username] = notes[altText];
          delete notes[altText];
          saveNotes(notes);
          note = notes[username];
        }
      }
    }
    if (existing && existing instanceof HTMLElement) {
      // 更新文本与样式，并确保显示（可能被编辑时隐藏）
      existing.textContent = note ? t('badge.with', { note }) : t('badge.add');
      existing.style.color = note ? '#b45309' : '#888';
      existing.title = note ? t('badge.title.edit') : t('badge.title.add');
      existing.style.display = 'inline-block';
      return;
    }

    const badge = document.createElement('span');
    badge.className = 'user-note-badge';
    badge.textContent = note ? t('badge.with', { note }) : t('badge.add');
    badge.title = note ? t('badge.title.edit') : t('badge.title.add');

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      // 替换为内联编辑器（中文提示）
      const inputWrap = document.createElement('span');
      inputWrap.className = 'user-note-input';
      const input = document.createElement('input');
      input.value = note || '';
      input.placeholder = t('input.placeholder');
      const saveBtn = document.createElement('button');
      saveBtn.className = 'save';
      saveBtn.textContent = t('btn.save');
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cancel';
      cancelBtn.textContent = t('btn.cancel');

      saveBtn.onclick = () => {
        const val = input.value.trim();
        if (val) notes[username] = val; else delete notes[username];
        saveNotes(notes);
        inputWrap.remove();
        // 恢复 badge 显示并刷新内容
        badge.style.display = 'inline-block';
        renderNotes();
      };
      cancelBtn.onclick = () => {
        // 取消编辑，恢复 badge 显示
        badge.style.display = 'inline-block';
        inputWrap.remove();
      };

      inputWrap.appendChild(input);
      inputWrap.appendChild(saveBtn);
      inputWrap.appendChild(cancelBtn);

      // remove badge and insert inputWrap
      badge.style.display = 'none';
      parent.appendChild(inputWrap);
      input.focus();
    });

    parent.appendChild(badge);
  });
}

// 页面加载后渲染备注名
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
  }, { once: true });
} else {
  renderNotes();
}
// ...existing code...

// 识别GitHub页面用户元素（以组织成员页为例）
function getUserElements(): Array<{ username: string; el: HTMLElement }> {
  const result: Array<{ username: string; el: HTMLElement }> = [];

  // helper: extract login/username from an anchor's href (prefer), fallback to visible text
  function extractLoginFromAnchor(a: Element): string | null {
    const href = (a.getAttribute('href') || '').trim();
    if (href) {
      const parts = href.split('/').filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
    const txt = (a.textContent || '').trim();
    return txt || null;
  }
  // 组织成员页面新版：统一使用 href 的最后一段作为 username，回退到可见文本
  document.querySelectorAll('div.table-list-cell a[data-hovercard-type="user"]').forEach(el => {
    const username = extractLoginFromAnchor(el);
    if (username) result.push({ username, el: el as HTMLElement });
  });

  // 组织成员（people 列表新版布局）也按 href 优先原则处理
  document.querySelectorAll('div.pl-3.flex-auto a[data-hovercard-type="user"]').forEach(el => {
    const username = extractLoginFromAnchor(el);
    if (username) result.push({ username, el: el as HTMLElement });
  });

  // Settings / Access 页面：用户信息块常见结构，链接包含登录名/ID，显示名在 <strong>，登录名在旁边的 span
  // 选择器：div.d-flex.flex-column.flex-auto.col-6 a > strong
  document.querySelectorAll('div.d-flex.flex-column.flex-auto.col-6 a > strong').forEach(strEl => {
    const anchor = (strEl as Element).parentElement;
    if (!anchor) return;
    const username = extractLoginFromAnchor(anchor);
    if (username) result.push({ username, el: anchor as HTMLElement });
  });

  // PR页面：github.com/{org}/{repo}/pull/{id}
  document.querySelectorAll('.participation .participant-avatar + a[data-hovercard-type="user"]').forEach(el => {
    const username = extractLoginFromAnchor(el);
    if (username) result.push({ username, el: el as HTMLElement });
  });

  // PR评论区用户名
  document.querySelectorAll('.timeline-comment-header strong a[data-hovercard-type="user"]').forEach(el => {
    const username = extractLoginFromAnchor(el);
    if (username) result.push({ username, el: el as HTMLElement });
  });

  // PR列表页（作者）
  document.querySelectorAll('.opened-by a[data-hovercard-type="user"]').forEach(el => {
    const username = extractLoginFromAnchor(el);
    if (username) result.push({ username, el: el as HTMLElement });
  });

  return result;
}

// 后续可扩展到PR/issue等页面

// ...existing code...

// 动态加载 SheetJS（只会加载一次）
// removed XLSX support — CSV only now

// 解析 CSV（返回二维数组）
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  const rows: string[][] = lines.map(line => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
        continue;
      }
      if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; continue; }
      cur += ch;
    }
    result.push(cur);
    return result.map(c => c.trim());
  });
  return rows;
}

function applyImportedRows(rows: string[][]) {
  if (!rows || rows.length === 0) return;
  const header = rows[0].map(h => (h || '').toString().toLowerCase());
  let start = 0;
  let unameIdx = 0, noteIdx = 1;
  const headerCandidates = ['user', 'username', 'name', '账号', '用户'];
  const noteCandidates = ['note', 'remark', '备注', 'alias'];
  if (header.some(h => headerCandidates.includes(h) || noteCandidates.includes(h))) {
    header.forEach((h, i) => {
      if (headerCandidates.includes(h) && unameIdx === 0) unameIdx = i;
      if (noteCandidates.includes(h) && noteIdx === 1) noteIdx = i;
    });
    start = 1;
  }
  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    const u = (r[unameIdx] || '').toString().trim();
    const n = (r[noteIdx] || '').toString().trim();
    if (u) {
      if (n) notes[u] = n; else delete notes[u];
    }
  }
  saveNotes(notes);
}

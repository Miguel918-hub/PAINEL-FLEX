// Elementos da página
const pasteListEl = document.getElementById('pasteList');
const pasteTitleInput = document.getElementById('pasteTitleInput');
const pasteContentInput = document.getElementById('pasteContentInput');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const newPasteBtn = document.getElementById('newPasteBtn');
const shareLinkInput = document.getElementById('shareLink');

let pastes = [];
let selectedPasteId = null;

// Carregar pastes do localStorage
function loadPastes() {
  const saved = localStorage.getItem('pastefy_pastes');
  if (saved) {
    try {
      pastes = JSON.parse(saved);
    } catch {
      pastes = [];
    }
  } else {
    pastes = [];
  }
}

// Salvar pastes no localStorage
function savePastes() {
  localStorage.setItem('pastefy_pastes', JSON.stringify(pastes));
}

// Atualizar lista lateral
function renderPasteList() {
  pasteListEl.innerHTML = '';
  if (pastes.length === 0) {
    pasteListEl.innerHTML = '<li style="color:#555;cursor:default;">Nenhum paste salvo.</li>';
    return;
  }
  pastes.forEach(paste => {
    const li = document.createElement('li');
    li.classList.toggle('selected', paste.id === selectedPasteId);
    li.title = paste.title || '(Sem título)';

    // Título curto
    const titleSpan = document.createElement('span');
    titleSpan.className = 'paste-title';
    titleSpan.textContent = paste.title || '(Sem título)';

    li.appendChild(titleSpan);

    // Botão delete
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'deleteBtn';
    delBtn.title = 'Excluir paste';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Excluir esse paste?')) {
        deletePaste(paste.id);
      }
    });
    li.appendChild(delBtn);

    li.addEventListener('click', () => {
      selectPaste(paste.id);
    });

    pasteListEl.appendChild(li);
  });
}

// Selecionar paste para editar
function selectPaste(id) {
  const paste = pastes.find(p => p.id === id);
  if (!paste) return;
  selectedPasteId = id;
  pasteTitleInput.value = paste.title || '';
  pasteContentInput.value = paste.content || '';
  updateShareLink(id);
  renderPasteList();
}

// Criar um novo paste vazio e selecionar
function newPaste() {
  selectedPasteId = null;
  pasteTitleInput.value = '';
  pasteContentInput.value = '';
  shareLinkInput.value = '';
  renderPasteList();
  pasteTitleInput.focus();
}

// Salvar paste (novo ou editar)
function saveCurrentPaste() {
  const title = pasteTitleInput.value.trim();
  const content = pasteContentInput.value;
  if (!content) {
    alert('O conteúdo do paste não pode ser vazio.');
    return;
  }
  if (selectedPasteId) {
    // Editar existente
    const paste = pastes.find(p => p.id === selectedPasteId);
    if (paste) {
      paste.title = title;
      paste.content = content;
    }
  } else {
    // Criar novo
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    pastes.push({ id, title, content });
    selectedPasteId = id;
  }
  savePastes();
  renderPasteList();
  updateShareLink(selectedPasteId);
  alert('Paste salvo!');
}

// Deletar paste selecionado
function deletePaste(id) {
  pastes = pastes.filter(p => p.id !== id);
  if (selectedPasteId === id) {
    newPaste();
  }
  savePastes();
  renderPasteList();
  shareLinkInput.value = '';
}

// Gerar link interno para “compartilhar”
// Na prática, o link fica: index.html?pasteid=xxx
// E ao abrir, o script carrega o paste pelo id
function updateShareLink(id) {
  if (!id) {
    shareLinkInput.value = '';
    return;
  }
  const base = window.location.origin + window.location.pathname;
  const link = base + '?pasteid=' + encodeURIComponent(id);
  shareLinkInput.value = link;
}

// RAW view: mostra só o conteúdo puro do paste (sem layout)
function checkRawView() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('raw');
  if (rawId) {
    const paste = pastes.find(p => p.id === rawId);
    if (paste) {
      document.body.innerHTML = ''; // limpa tudo

      const pre = document.createElement('pre');
      pre.textContent = paste.content;
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.margin = '20px auto';
      pre.style.fontSize = '1.2em';
      pre.style.fontFamily = 'monospace';
      pre.style.color = '#0f0';
      pre.style.background = '#000';
      pre.style.padding = '15px';
      pre.style.borderRadius = '10px';
      pre.style.maxWidth = '900px';
      pre.style.boxShadow = '0 0 15px #0f0';
      document.body.appendChild(pre);

      return true;
    }
  }
  return false;
}

// Ao carregar a página, verifica se existe pasteid na URL para abrir automaticamente
function checkUrlPaste() {
  const params = new URLSearchParams(window.location.search);
  const pasteid = params.get('pasteid');
  if (pasteid) {
    const paste = pastes.find(p => p.id === pasteid);
    if (paste) {
      selectPaste(pasteid);
      return;
    }
  }
  newPaste();
}

// Eventos
saveBtn.addEventListener('click', saveCurrentPaste);
deleteBtn.addEventListener('click', () => {
  if (!selectedPasteId) {
    alert('Nenhum paste selecionado para excluir.');
    return;
  }
  if (confirm('Excluir este paste?')) {
    deletePaste(selectedPasteId);
  }
});
newPasteBtn.addEventListener('click', newPaste);

// Inicialização
loadPastes();
if (checkRawView()) {
  // Se raw, mostra só o texto e não inicializa editor
  return;
}
checkUrlPaste();
renderPasteList();

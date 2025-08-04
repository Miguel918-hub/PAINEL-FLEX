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

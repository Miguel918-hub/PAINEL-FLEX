document.addEventListener('DOMContentLoaded', () => {
  const pasteListEl = document.getElementById('pasteList');
  const pasteContentInput = document.getElementById('pasteContentInput');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const newPasteBtn = document.getElementById('newPasteBtn');
  const shareLinkInput = document.getElementById('shareLink');

  let pastes = [];
  let selectedPasteId = null;

  // Carrega scripts do localStorage
  function loadPastes() {
    const saved = localStorage.getItem('kitsune_pastes');
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

  // Salva scripts no localStorage
  function savePastes() {
    localStorage.setItem('kitsune_pastes', JSON.stringify(pastes));
  }

  // Atualiza lista lateral
  function renderPasteList() {
    pasteListEl.innerHTML = '';
    if (pastes.length === 0) {
      pasteListEl.innerHTML = '<li style="color:#555;cursor:default;">Nenhum script salvo.</li>';
      return;
    }
    pastes.forEach(paste => {
      const li = document.createElement('li');
      li.classList.toggle('selected', paste.id === selectedPasteId);
      li.textContent = paste.id;
      li.title = paste.id;
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        selectPaste(paste.id);
      });

      pasteListEl.appendChild(li);
    });
  }

  // Seleciona script
  function selectPaste(id) {
    const paste = pastes.find(p => p.id === id);
    if (!paste) return;
    selectedPasteId = id;
    pasteContentInput.value = paste.content || '';
    updateShareLink(id);
    renderPasteList();
  }

  // Novo script vazio
  function newPaste() {
    selectedPasteId = null;
    pasteContentInput.value = '';
    shareLinkInput.value = '';
    renderPasteList();
    pasteContentInput.focus();
  }

  // Salva script localmente
  function saveCurrentPaste() {
    const content = pasteContentInput.value.trim();
    if (!content) {
      alert('O conteúdo do script não pode ser vazio.');
      return;
    }

    if (!selectedPasteId) {
      selectedPasteId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    const existingIndex = pastes.findIndex(p => p.id === selectedPasteId);
    if (existingIndex >= 0) {
      pastes[existingIndex].content = content;
    } else {
      pastes.push({ id: selectedPasteId, content });
    }
    savePastes();
    renderPasteList();
    updateShareLink(selectedPasteId);
    alert('Script salvo localmente!');
  }

  // Deleta script
  function deletePaste(id) {
    pastes = pastes.filter(p => p.id !== id);
    if (selectedPasteId === id) {
      newPaste();
    }
    savePastes();
    renderPasteList();
    shareLinkInput.value = '';
  }

  // Atualiza o link para abrir só o script (loadstring)
  function updateShareLink(id) {
    if (!id) {
      shareLinkInput.value = '';
      return;
    }
    const baseUrl = location.origin + location.pathname;
    shareLinkInput.value = `${baseUrl}?id=${encodeURIComponent(id)}`;
  }

  // Verifica se abriu com ?id= para mostrar só o script raw
  function checkRawView() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      const paste = pastes.find(p => p.id === id);
      if (paste) {
        document.body.innerHTML = '';
        const pre = document.createElement('pre');
        pre.style.background = '#000';
        pre.style.color = '#0f0';
        pre.style.padding = '20px';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontFamily = 'monospace';
        pre.style.fontSize = '1.1em';
        pre.style.maxWidth = '900px';
        pre.style.margin = '20px auto';
        pre.textContent = paste.content;
        document.body.appendChild(pre);
        return true;
      } else {
        document.body.innerHTML = '<p style="color:red; text-align:center; margin-top:20px;">Script não encontrado!</p>';
        return true;
      }
    }
    return false;
  }

  // Eventos
  saveBtn.addEventListener('click', saveCurrentPaste);
  deleteBtn.addEventListener('click', () => {
    if (!selectedPasteId) {
      alert('Nenhum script selecionado para excluir.');
      return;
    }
    if (confirm('Excluir este script?')) {
      deletePaste(selectedPasteId);
    }
  });
  newPasteBtn.addEventListener('click', newPaste);

  // Inicialização
  loadPastes();
  if (!checkRawView()) {
    renderPasteList();
    if (pastes.length > 0) {
      selectPaste(pastes[0].id);
    }
  }
});

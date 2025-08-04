(() => {
  const translations = {
    english: {
      title: "🦊 Kitsune Hub - Roblox Script Editor",
      pastePlaceholder: "Paste your Roblox script here...",
      saveBtn: "Save Script",
      deleteBtn: "Delete Script",
      newPasteBtn: "New Script",
      shareLinkPlaceholder: "The link to use in Roblox will appear here...",
      noScripts: "No scripts saved.",
      confirmLangBtn: "Confirm / Confirmar",
      langInputPlaceholder: "Type your language (e.g. English, Português)",
      chooseLangTitle: "Choose your language / Escolha seu idioma",
      confirmDelete: "Delete this script?",
      alertSaved: "Script saved locally!",
      alertEmpty: "Script content cannot be empty."
    },
    português: {
      title: "🦊 Kitsune Hub - Editor de Scripts Roblox",
      pastePlaceholder: "Cole seu script Roblox aqui...",
      saveBtn: "Salvar Script",
      deleteBtn: "Excluir Script",
      newPasteBtn: "Novo Script",
      shareLinkPlaceholder: "O link para usar no Roblox aparecerá aqui...",
      noScripts: "Nenhum script salvo.",
      confirmLangBtn: "Confirmar",
      langInputPlaceholder: "Digite seu idioma (ex: English, Português)",
      chooseLangTitle: "Escolha seu idioma / Choose your language",
      confirmDelete: "Excluir este script?",
      alertSaved: "Script salvo localmente!",
      alertEmpty: "O conteúdo do script não pode ser vazio."
    }
  };

  // Elementos tela idioma e app
  const languageSelect = document.getElementById('languageSelect');
  const mainApp = document.getElementById('mainApp');
  const languageInput = document.getElementById('languageInput');
  const confirmLangBtn = document.getElementById('confirmLangBtn');

  // Elementos editor
  const pasteListEl = document.getElementById('pasteList');
  const pasteContentInput = document.getElementById('pasteContentInput');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const newPasteBtn = document.getElementById('newPasteBtn');
  const shareLinkInput = document.getElementById('shareLink');
  const titleEl = document.getElementById('title');

  let pastes = [];
  let selectedPasteId = null;
  let currentLang = 'english';

  // Aplicar traduções na interface
  function applyLanguage(lang) {
    const tr = translations[lang];
    titleEl.textContent = tr.title;
    pasteContentInput.placeholder = tr.pastePlaceholder;
    saveBtn.textContent = tr.saveBtn;
    deleteBtn.textContent = tr.deleteBtn;
    newPasteBtn.textContent = tr.newPasteBtn;
    shareLinkInput.placeholder = tr.shareLinkPlaceholder;
    languageInput.placeholder = tr.langInputPlaceholder;
    confirmLangBtn.textContent = tr.confirmLangBtn;
    languageSelect.querySelector('h1').textContent = tr.chooseLangTitle;

    renderPasteList();
  }

  // Load pastes do localStorage
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

  function savePastes() {
    localStorage.setItem('kitsune_pastes', JSON.stringify(pastes));
  }

  function renderPasteList() {
    pasteListEl.innerHTML = '';
    if (pastes.length === 0) {
      pasteListEl.innerHTML = `<li style="color:#555;cursor:default;">${translations[currentLang].noScripts}</li>`;
      return;
    }
    pastes.forEach(paste => {
      const li = document.createElement('li');
      li.classList.toggle('selected', paste.id === selectedPasteId);
      li.textContent = paste.id;
      li.title = paste.id;
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => selectPaste(paste.id));

      // Botão excluir
      const delBtn = document.createElement('button');
      delBtn.textContent = '×';
      delBtn.className = 'deleteBtn';
      delBtn.title = translations[currentLang].confirmDelete;
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(translations[currentLang].confirmDelete)) {
          deletePaste(paste.id);
        }
      });
      li.appendChild(delBtn);

      pasteListEl.appendChild(li);
    });
  }

  function selectPaste(id) {
    const paste = pastes.find(p => p.id === id);
    if (!paste) return;
    selectedPasteId = id;
    pasteContentInput.value = paste.content || '';
    updateShareLink(id);
    renderPasteList();
  }

  function newPaste() {
    selectedPasteId = null;
    pasteContentInput.value = '';
    shareLinkInput.value = '';
    renderPasteList();
    pasteContentInput.focus();
  }

  function saveCurrentPaste() {
    const content = pasteContentInput.value.trim();
    if (!content) {
      alert(translations[currentLang].alertEmpty);
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
    alert(translations[currentLang].alertSaved);
  }

  function deletePaste(id) {
    pastes = pastes.filter(p => p.id !== id);
    if (selectedPasteId === id) {
      newPaste();
    }
    savePastes();
    renderPasteList();
    shareLinkInput.value = '';
  }

  function updateShareLink(id) {
    if (!id) {
      shareLinkInput.value = '';
      return;
    }
    const baseUrl = location.origin + location.pathname;
    shareLinkInput.value = `${baseUrl}?id=${encodeURIComponent(id)}`;
  }

  // Verifica se está no modo raw (mostrar só o script)
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

  // Ao clicar no botão confirmar idioma
  confirmLangBtn.addEventListener('click', () => {
    const lang = languageInput.value.toLowerCase().trim();
    if (!lang) return alert('Please type a language / Por favor, digite um idioma.');
    currentLang = translations[lang] ? lang : 'english';

    // Salva idioma no localStorage
    localStorage.setItem('kitsune_lang', currentLang);

    // Aplica tradução
    applyLanguage(currentLang);

    // Esconde tela idioma, mostra app
    languageSelect.classList.remove('active');
    mainApp.classList.add('active');

    // Inicializa editor
    loadPastes();
    renderPasteList();
    newPaste();
  });

  // Na inicialização da página
  window.addEventListener('load', () => {
    loadPastes();

    // Verifica se está na view raw, se sim mostra só script e para
    if (checkRawView()) return;

    // Se tiver idioma salvo, pula a tela de idioma direto
    const savedLang = localStorage.getItem('kitsune_lang');
    if (savedLang && translations[savedLang]) {
      currentLang = savedLang;
      applyLanguage(currentLang);
      languageSelect.classList.remove('active');
      mainApp.classList.add('active');
      renderPasteList();
      newPaste();
    } else {
      // Senão, mostra a tela de seleção de idioma
      languageSelect.classList.add('active');
      mainApp.classList.remove('active');
    }
  });

  // Botões editor
  saveBtn.addEventListener('click', saveCurrentPaste);
  deleteBtn.addEventListener('click', () => {
    if (!selectedPasteId) {
      alert(currentLang === 'português' ? 'Nenhum script selecionado para excluir.' : 'No script selected to delete.');
      return;
    }
    if (confirm(translations[currentLang].confirmDelete)) {
      deletePaste(selectedPasteId);
    }
  });
  newPasteBtn.addEventListener('click', newPaste);

})();

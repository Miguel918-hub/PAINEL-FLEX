(() => {
  const translations = {
    english: {
      title: "🦊 Kitsune Hub - Roblox Script Editor",
      pastePlaceholder: "Paste your Roblox script here...",
      saveBtn: "Save Script",
      deleteBtn: "Delete Script",
      newPasteBtn: "New Script",
      shareLinkPlaceholder: "Your Roblox loadstring will appear here...",
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
      shareLinkPlaceholder: "Seu loadstring do Roblox aparecerá aqui...",
      noScripts: "Nenhum script salvo.",
      confirmLangBtn: "Confirmar",
      langInputPlaceholder: "Digite seu idioma (ex: English, Português)",
      chooseLangTitle: "Escolha seu idioma / Choose your language",
      confirmDelete: "Excluir este script?",
      alertSaved: "Script salvo localmente!",
      alertEmpty: "O conteúdo do script não pode ser vazio."
    }
  };

  const languageSelect = document.getElementById('languageSelect');
  const mainApp = document.getElementById('mainApp');
  const languageInput = document.getElementById('languageInput');
  const confirmLangBtn = document.getElementById('confirmLangBtn');

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

  function formatPasteId(rawId) {
    return rawId + " | Hospedado Kitsune Hub";
  }

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

  function loadPastes() {
    const saved = localStorage.getItem('kitsune_pastes');
    try {
      pastes = saved ? JSON.parse(saved) : [];
    } catch {
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
      li.textContent = formatPasteId(paste.id);
      li.title = formatPasteId(paste.id);
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => selectPaste(paste.id));

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
      let rawId = prompt(currentLang === 'português' ? 'Digite o nome da pasta:' : 'Type the folder name:');
      if (!rawId) {
        alert(currentLang === 'português' ? 'Nome da pasta é obrigatório!' : 'Folder name is required!');
        return;
      }
      selectedPasteId = rawId.trim();
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
    if (selectedPasteId === id) newPaste();
    savePastes();
    renderPasteList();
    shareLinkInput.value = '';
  }

  function updateShareLink(id) {
    if (!id) {
      shareLinkInput.value = '';
      return;
    }

    const paste = pastes.find(p => p.id === id);
    if (!paste) return;

    const base64 = btoa(unescape(encodeURIComponent(paste.content)));
    shareLinkInput.value = `loadstring(game:HttpGet("data:text/plain;base64,${base64}"))()`;
  }

  function checkRawView() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      loadPastes();
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
        pre.textContent = btoa(unescape(encodeURIComponent(paste.content)));
        document.body.appendChild(pre);
        return true;
      } else {
        document.body.innerHTML = '<p style="color:red; text-align:center; margin-top:20px;">Script não encontrado!</p>';
        return true;
      }
    }
    return false;
  }

  confirmLangBtn.addEventListener('click', () => {
    const lang = languageInput.value.toLowerCase().trim();
    if (!lang) return alert('Please type a language / Por favor, digite um idioma.');
    currentLang = translations[lang] ? lang : 'english';
    localStorage.setItem('kitsune_lang', currentLang);
    applyLanguage(currentLang);
    languageSelect.classList.remove('active');
    mainApp.classList.add('active');
    loadPastes();
    renderPasteList();
    newPaste();
  });

  window.addEventListener('load', () => {
    loadPastes();
    if (checkRawView()) return;
    const savedLang = localStorage.getItem('kitsune_lang');
    if (savedLang && translations[savedLang]) {
      currentLang = savedLang;
      applyLanguage(currentLang);
      languageSelect.classList.remove('active');
      mainApp.classList.add('active');
      renderPasteList();
      newPaste();
    } else {
      languageSelect.classList.add('active');
      mainApp.classList.remove('active');
    }
  });

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

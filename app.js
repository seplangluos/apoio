// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo
// Integração completa com Firebase - Versão com Firebase Authentication
// Importações do Firebase v9+
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase, ref, push, set, get, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let chartTop15Instance = null;
let chartTop610Instance = null;
// Configuração do Firebase principal
const firebaseConfig = {
  apiKey: "AIzaSyDUUXFPi2qbowPjx63YBYQWyZNXKfxz7u0",
  authDomain: "gluos-apoio.firebaseapp.com",
  databaseURL: "https://gluos-apoio-default-rtdb.firebaseio.com",
  projectId: "gluos-apoio",
  storageBucket: "gluos-apoio.firebasestorage.app",
  messagingSenderId: "200346424322",
  appId: "1:200346424322:web:d359faf0c8582c58c0031b"
};

// Configuração da base de processos (NOVA)
const firebaseConfigProcessos = {
  apiKey: "AIzaSyAWbo9MCRjE4776A_DpjJCWHPZap-goJDg",
  authDomain: "processos-gluos.firebaseapp.com",
  databaseURL: "https://processos-gluos-default-rtdb.firebaseio.com",
  projectId: "processos-gluos",
  storageBucket: "processos-gluos.firebasestorage.app",
  messagingSenderId: "189917349181",
  appId: "1:189917349181:web:efac81f4ed118cb48af154"
};

// Inicializar Firebase principal
let app, database, auth;
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

// Inicializar Firebase de processos (NOVO)
let processosApp, processosDatabase;
try {
  processosApp = initializeApp(firebaseConfigProcessos, 'processosApp');
  processosDatabase = getDatabase(processosApp);
} catch (error) {
  console.error('Erro ao inicializar Firebase de processos:', error);
}

// Mapeamento de usuários para emails
const USER_EMAIL_MAPPING = {
  "Wendel": "wendel_hai@hotmail.com",
  "Eduardo": "edu_rich@hotmail.com",
  "Sônia": "sonia@hotmail.com",
  "Júlia": "julia@hotmail.com",
  "Rita": "rita@hotmail.com",
  "Mara": "mara@hotmail.com",
  "Tati": "tati@hotmail.com",
  "Gabriella": "gabriela@hotmail.com",
  "Fabiano": "fabiano@hotmail.com",
  "Admin": "seplan.gluos@valadares.mg.gov.br"
};

// Função para converter email para nome de usuário
function emailToUsername(email) {
  for (const [username, userEmail] of Object.entries(USER_EMAIL_MAPPING)) {
    if (userEmail === email) {
      return username;
    }
  }
  return email;
}

// Dados da aplicação
const GLUOS_DATA = {
  usuarios: ["Eduardo", "Wendel", "Júlia", "Tati", "Sônia", "Rita", "Mara", "Gabriella", "Fabiano", "Admin"],
  assuntos: [
    {id: 1, texto: "Separar e Preparar os Processos Agendados no Dia"},
    {id: 2, texto: "Inserção de Avisos de Vistoria na E&L"},
    {id: 3, texto: "Arquivamento de Processos"},
    {id: 4, texto: "Solicitação de Desarquivamento"},
    {id: 5, texto: "Atendimento ao Contribuinte"},
    {id: 6, texto: "Pós Atendimento Balcão"},
    {id: 7, texto: "Atendimento ao Telefone"},
    {id: 8, texto: "Apoio aos Arquitetos/Engenheiros"},
    {id: 9, texto: "Envio de E-mail para o Arquitetos/Enginheiros"},
    {id: 10, texto: "Solicitação de Desarquivamento de Processo"},
    {id: 11, texto: "Lançamento Habite-se no E&L e na Receita Federal"},
    {id: 12, texto: "Lançamento de Alvará no E&L e na Receita Federal"},
    {id: 13, texto: "Lançamento de Sanção"},
    {id: 14, texto: "Preenchimento da Planilha de Controle Interno GLUOS"},
    {id: 15, texto: "Controle de Ponto GLUOS"},
    {id: 16, texto: "Confecção de Ofícios"},
    {id: 17, texto: "Solicitação de Materiais de Escritório"},
    {id: 18, texto: "Atendimento/Notificação de Alvará de Funcionamento"},
    {id: 19, texto: "Prorrogação de Processo Alvará de Funcionamento"},
    {id: 20, texto: "Indeferimento de Processo Alvará de Funcionamento"},
    {id: 21, texto: "Lançamento do Número dos Processos Finalizados"},
    {id: 22, texto: "Notificação de Alvará de Funcionamento"},
    {id: 23, texto: "Lançamento de Processos Novos"},
    {id: 24, texto: "Recebimento de Processo"},
    {id: 25, texto: "Rastreamento de Processo"},
    {id: 26, texto: "Distribuição de Processo"},
    {id: 27, texto: "Mudança de Passo no Sistema"},
    {id: 28, texto: "Notificação Atendidas por E-mail"},
    {id: 29, texto: "Separação de Processo e Distribuição para Eng/Arq"},
    {id: 30, texto: "Lançamento no Sistema de Pendências pós Atendimento"},
    {id: 31, texto: "Envio de Processo ao Arquivo Geral/GFO"},
    {id: 32, texto: "Resposta as Mensagens Via WhatsApp Conforme as Notificações no Processo"},
    {id: 33, texto: "Arquivamento de Processos Deferidos Semanal"},
    {id: 34, texto: "Digitação de Notificações"},
    {id: 35, texto: "Confecção de Planilha de Vistoria Semanal"},
    {id: 36, texto: "Localização de Processo Físico e no Sistema"},
    {id: 37, texto: "Encaminhamento de Processo para Análise"},
    {id: 38, texto: "Estudo de Viabilidade Urbanística"},
    {id: 39, texto: "Envio de e-mail para Contadores"},
    {id: 40, texto: "Análise de Matrícula para Sala Mineira"},
    {id: 41, texto: "Indeferimento de Processo"},
    {id: 42, texto: "Requisição de Veículo"},
    {id: 43, texto: "Encaminhamento de Processo a Outros Setores"},
    {id: 44, texto: "Montagem de Processo Novo"},
    {id: 45, texto: "Encaminhamento para indeferimento"},
    {id: 46, texto: "Protocolo de informação Básica"},
    {id: 47, texto: "Agendamento para contribuinte"},
    {id: 48, texto: "Viabilidade Pessoa Física"},
    {id: 49, texto: "Licenciamento (GV)"},
    {id: 50, texto: "Situação Imóvel"},
  ]
};

// Estado global
let currentUser = null;
let allEntries = [];
let processCounter = 1;
let selectedSubjectForMultiple = null;
let currentReportType = null;
let firebaseConnected = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  console.log('Sistema GLUOS iniciando...');
  
  fixUserSelect();
  initializeFirebase();
  setupEventListeners();
  populateSelectOptions();
  showScreen('login');
  updateDateTime();
  setInterval(updateDateTime, 1000);
});

// Corrigir o select de usuário
function fixUserSelect() {
  const userSelect = document.getElementById('user-select');
  if (userSelect) {
    userSelect.style.zIndex = '1000';
    userSelect.style.pointerEvents = 'auto';
    userSelect.style.position = 'relative';
    
    userSelect.removeAttribute('disabled');
    userSelect.setAttribute('tabindex', '0');
  }
}

// Inicialização do Firebase
async function initializeFirebase() {
  try {
    updateFirebaseStatus('warning', 'Conectando ao Firebase...');
    
    if (!database || !auth) {
      updateFirebaseStatus('error', 'Firebase não inicializado');
      return;
    }
    
    const testRef = ref(database, '.info/connected');
    onValue(testRef, (snapshot) => {
      firebaseConnected = snapshot.val() === true;
      if (firebaseConnected) {
        updateFirebaseStatus('success', 'Conectado ao Firebase');
        loadAllEntries();
      } else {
        updateFirebaseStatus('error', 'Desconectado do Firebase');
      }
    });
    
  } catch (error) {
    updateFirebaseStatus('error', 'Erro de conexão');
    firebaseConnected = false;
  }
}

// Carregar todas as entradas
async function loadAllEntries() {
  if (!firebaseConnected) return;
  
  try {
    const entriesRef = ref(database, 'gluos_entries');
    onValue(entriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        allEntries = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        allEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      } else {
        allEntries = [];
      }
      updateRecordCount();
    });
  } catch (error) {
    allEntries = [];
  }
}

// Configurar event listeners
function setupEventListeners() {
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const userSelect = document.getElementById('user-select');
  const passwordInput = document.getElementById('password');
  
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (loginBtn) loginBtn.addEventListener('click', e => { e.preventDefault(); handleLogin(e); });
  if (passwordInput) passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(e); } });
  
  setupMainNavigation();
  setupNewEntry();
  setupMultipleEntries();
  setupSearch();
  setupDatabase();
  setupReports();
  setupBulkEntries();
  setupMultiSubjectEntries();
  setupProfile();
  setupModals();
}

// Configurar navegação principal
function setupMainNavigation() {
  const statsBtn = document.getElementById('stats-btn');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      showScreen('stats');
      initStatsScreen();
    });
  }

  const backStatsBtn = document.getElementById('back-to-dashboard-stats');
  if (backStatsBtn) backStatsBtn.addEventListener('click', () => showScreen('dashboard'));

  const statsFilterBtn = document.getElementById('stats-filter-btn');
  if (statsFilterBtn) statsFilterBtn.addEventListener('click', renderStats);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  const navButtons = [
    { id: 'new-entry-btn', screen: 'new-entry' },
    { id: 'multiple-entries-btn', screen: 'multiple-entries' },
    { id: 'bulk-entries-btn', screen: 'bulk-entries' },
    { id: 'multi-subject-entries-btn', screen: 'multi-subject-entries' },
    { id: 'search-btn', screen: 'search' },
    { id: 'database-btn', screen: 'database', callback: loadDatabaseTable },
    { id: 'profile-btn', callback: showProfileModal },
    { id: 'report-btn', screen: 'report' }
  ];
  
  navButtons.forEach(btn => {
    const element = document.getElementById(btn.id);
    if (element) {
      element.addEventListener('click', function() {
        if (btn.screen) showScreen(btn.screen);
        if (btn.callback) btn.callback();
      });
    }
  });
  
  const backButtons = [
    'back-to-dashboard-1', 'back-to-dashboard-2', 'back-to-dashboard-3', 
    'back-to-dashboard-4', 'back-to-dashboard-5', 'back-to-dashboard-6', 'back-to-dashboard-7'
  ];
  
  backButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => showScreen('dashboard'));
  });
}

// Login com Firebase Authentication
async function handleLogin(e) {
  e.preventDefault();

  const userSelect = document.getElementById('user-select');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  const user = userSelect.value?.trim();
  const password = passwordInput.value?.trim();

  if (loginError) {
    loginError.classList.add('hidden');
    loginError.textContent = '';
  }

  if (!user) return showLoginError('Por favor, selecione um usuário.');
  if (!password) return showLoginError('Por favor, digite sua senha.');

  const userEmail = USER_EMAIL_MAPPING[user];
  if (!userEmail) return showLoginError('Usuário não encontrado.');

  setButtonLoading(loginBtn, true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
    currentUser = user;
    updateUserInfo();
    userSelect.value = '';
    passwordInput.value = '';
    showScreen('dashboard');

  } catch (error) {
    if (error.code === 'auth/user-not-found') showLoginError('Usuário não encontrado no sistema.');
    else if (error.code === 'auth/wrong-password') showLoginError('Senha incorreta.');
    else if (error.code === 'auth/invalid-email') showLoginError('Email inválido.');
    else if (error.code === 'auth/too-many-requests') showLoginError('Muitas tentativas. Tente novamente mais tarde.');
    else showLoginError('Usuário ou senha inválidos.');
  } finally {
    setButtonLoading(loginBtn, false);
  }
}

function showLoginError(message) {
  const loginError = document.getElementById('login-error');
  if (loginError) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  } else {
    alert(message);
  }
}

function handleLogout() {
  currentUser = null;
  updateUserInfo();
  showScreen('login');
}

// Nova entrada
function setupNewEntry() {
  const form = document.getElementById('new-entry-form');
  const subjectNumber = document.getElementById('subject-number');
  const subjectSelect = document.getElementById('subject-select');
  const processNumberInput = document.getElementById('process-number');
  const contributorInput = document.getElementById('contributor');
  const ctmInput = document.getElementById('ctm');

  if (form) form.addEventListener('submit', handleNewEntry);

  if (subjectNumber && subjectSelect) {
    subjectNumber.addEventListener('input', function() {
      const num = parseInt(this.value);
      if (num >= 1 && num <= 50) {
        const assunto = GLUOS_DATA.assuntos.find(a => a.id === num);
        if (assunto) subjectSelect.value = assunto.id;
      }
    });

    subjectSelect.addEventListener('change', function() {
      if (this.value) subjectNumber.value = this.value;
    });
  }

  if(processNumberInput && contributorInput && ctmInput) {
	processNumberInput.addEventListener('input', async function () {
   	let numeroProcesso = this.value.trim();
   	numeroProcesso = numeroProcesso.replace(/\//g, "-"); 
   	if (!numeroProcesso) {
        contributorInput.value = '';
        ctmInput.value = '';
        return;
    }

      try {
        if (processosDatabase) {
          const refProc = ref(processosDatabase, 'processos/' + numeroProcesso);
          const snapshot = await get(refProc);
          if (snapshot.exists()) {
            const dados = snapshot.val();
            contributorInput.value = dados.Requerente || '';
            ctmInput.value = dados.CTM || '';
          } else {
            contributorInput.value = '';
            ctmInput.value = '';
          }
        }
      } catch (err) {
        contributorInput.value = '';
        ctmInput.value = '';
      }
    });
  }
}

async function handleNewEntry(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const subjectId = parseInt(document.getElementById('subject-select').value);
  const processNumber = document.getElementById('process-number').value.trim();

  if (!subjectId) return alert('Por favor, selecione um assunto.');
  if (!processNumber) return alert('Por favor, informe o número do processo.');

  const assunto = GLUOS_DATA.assuntos.find(a => a.id === subjectId);
  const now = new Date();

  const entry = {
    subjectId: subjectId,
    subjectText: assunto ? assunto.texto : '',
    processNumber: processNumber,
    contributor: document.getElementById('contributor').value.trim(),
    ctm: document.getElementById('ctm').value.trim(),
    observation: document.getElementById('observation').value.trim(),
    habiteNumber: document.getElementById('habite-number').value.trim(),
    alvaraSituation: document.getElementById('alvara-situation').value.trim(),
    server: currentUser,
    date: now.toLocaleDateString('pt-BR'),
    time: now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
    timestamp: now.getTime()
  };

  setButtonLoading(submitBtn, true);

  try {
    if (firebaseConnected && database) {
      const entriesRef = ref(database, 'gluos_entries');
      await push(entriesRef, entry);
    } else {
      entry.id = 'local_' + Date.now();
      allEntries.unshift(entry);
    }

    form.reset();
    document.getElementById('subject-number').value = '';
    showSuccessModal('Entrada salva com sucesso!');

  } catch (error) {
    alert('Erro ao salvar entrada. Tente novamente.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Múltiplas entradas
function setupMultipleEntries() {
  const setSubjectBtn = document.getElementById('set-subject-btn');
  const addProcessBtn = document.getElementById('add-process-btn');
  const saveAllBtn = document.getElementById('save-all-btn');
  const multiSubjectNumber = document.getElementById('multi-subject-number');
  const multiSubjectSelect = document.getElementById('multi-subject-select');

  if (setSubjectBtn) setSubjectBtn.addEventListener('click', handleSetSubject);
  if (addProcessBtn) addProcessBtn.addEventListener('click', addProcessForm);
  if (saveAllBtn) saveAllBtn.addEventListener('click', handleSaveAllEntries);

  if (multiSubjectNumber && multiSubjectSelect) {
    multiSubjectNumber.addEventListener('input', function() {
      const num = parseInt(this.value);
      if (num >= 1 && num <= 50) {
        const assunto = GLUOS_DATA.assuntos.find(a => a.id === num);
        if (assunto) multiSubjectSelect.value = assunto.id;
      }
    });

    multiSubjectSelect.addEventListener('change', function() {
      if (this.value) multiSubjectNumber.value = this.value;
    });
  }
}

function handleSetSubject() {
  const subjectId = parseInt(document.getElementById('multi-subject-select').value);
  if (!subjectId) return alert('Por favor, selecione um assunto.');

  const assunto = GLUOS_DATA.assuntos.find(a => a.id === subjectId);
  selectedSubjectForMultiple = assunto;

  const container = document.getElementById('multiple-forms-container');
  const subjectText = document.getElementById('selected-subject-text');

  if (container && subjectText && assunto) {
    subjectText.textContent = assunto.texto;
    container.classList.remove('hidden');
    document.getElementById('processes-container').innerHTML = '';
    processCounter = 1;
    addProcessForm();
  }
}

function addProcessForm() {
    if (!selectedSubjectForMultiple) return;
    
    const container = document.getElementById('processes-container');
    if (!container) return;
    
    const formHtml = `
        <div class="process-form card" data-process="${processCounter}">
            <div class="card__body">
                <div class="process-form-header">
                    <h4>Processo ${processCounter}</h4>
                    <button type="button" class="remove-process-btn" onclick="removeProcessForm(${processCounter})">Remover</button>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nº Processo/Protocolo: *</label>
                    <input type="text" class="form-control process-number" placeholder="informe número do processo ou protocolo, ou digite 0" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contribuinte:</label>
                    <input type="text" class="form-control process-contributor" placeholder="Nome do contribuinte">
                </div>
                
                <div class="form-group">
                    <label class="form-label">CTM:</label>
                    <input type="text" class="form-control process-ctm" placeholder="CTM">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Observação:</label>
                    <textarea class="form-control process-observation" rows="3" placeholder="Observações"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Número do Habite-se/Alvará:</label>
                    <input type="text" class="form-control process-habite" placeholder="Número do Habite-se/Alvará">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Situação do Alvará de Funcionamento:</label>
                    <select class="form-control process-alvara">
                        <option value="">-- Selecione --</option>
                        <option value="Deferido">Deferido</option>
                        <option value="Indeferido">Indeferido</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Pendente">Pendente</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', formHtml);
    processCounter++;
}

window.removeProcessForm = function(processId) {
    const form = document.querySelector(`[data-process="${processId}"]`);
    if (form) form.remove();
};

async function handleSaveAllEntries() {
    if (!selectedSubjectForMultiple) return alert('Nenhum assunto selecionado.');
    
    const processForms = document.querySelectorAll('.process-form');
    if (processForms.length === 0) return alert('Nenhum processo adicionado.');
    
    const saveAllBtn = document.getElementById('save-all-btn');
    setButtonLoading(saveAllBtn, true);
    
    const entries = [];
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    const timestamp = now.getTime();
    
    processForms.forEach(form => {
        const processNumber = form.querySelector('.process-number').value.trim();
        if (processNumber) {
            const entry = {
                subjectId: selectedSubjectForMultiple.id,
                subjectText: selectedSubjectForMultiple.texto,
                processNumber: processNumber,
                contributor: form.querySelector('.process-contributor').value.trim(),
                ctm: form.querySelector('.process-ctm').value.trim(),
                observation: form.querySelector('.process-observation').value.trim(),
                habiteNumber: form.querySelector('.process-habite').value.trim(),
                alvaraSituation: form.querySelector('.process-alvara').value.trim(),
                server: currentUser,
                date: date,
                time: time,
                timestamp: timestamp
            };
            entries.push(entry);
        }
    });
    
    if (entries.length === 0) {
        alert('Por favor, preencha pelo menos um número de processo.');
        setButtonLoading(saveAllBtn, false);
        return;
    }
    
    try {
        if (firebaseConnected && database) {
            const entriesRef = ref(database, 'gluos_entries');
            const promises = entries.map(entry => push(entriesRef, entry));
            await Promise.all(promises);
        } else {
            entries.forEach((entry, index) => {
                entry.id = 'local_' + (Date.now() + index);
                allEntries.unshift(entry);
            });
        }
        
        selectedSubjectForMultiple = null;
        document.getElementById('multiple-forms-container').classList.add('hidden');
        document.getElementById('multi-subject-number').value = '';
        document.getElementById('multi-subject-select').value = '';
        document.getElementById('processes-container').innerHTML = '';
        processCounter = 1;
        
        showSuccessModal(`${entries.length} entrada(s) salva(s) com sucesso!`);
        
    } catch (error) {
        alert('Erro ao salvar entradas. Tente novamente.');
    } finally {
        setButtonLoading(saveAllBtn, false);
    }
}

// ===============================================
// PESQUISA ATUALIZADA (INCLUINDO FILTROS NOVOS)
// ===============================================
function setupSearch() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchSearchTab(tabName);
        });
    });
    
    const searchBtn = document.getElementById('search-submit');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
}

function switchSearchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    document.querySelectorAll('.search-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + '-search')?.classList.add('active');
}

async function handleSearch() {
    const activeTab = document.querySelector('.search-tab.active');
    if (!activeTab) return;
    
    const searchBtn = document.getElementById('search-submit');
    setButtonLoading(searchBtn, true);
    
    let filteredEntries = [];
    
    try {
        if (activeTab.id === 'process-search') {
            const processNumber = document.getElementById('search-process').value.trim();
            if (!processNumber) return alert('Digite o número do processo.');
            filteredEntries = allEntries.filter(entry => 
                entry.processNumber && entry.processNumber.toLowerCase().includes(processNumber.toLowerCase())
            );
        } else if (activeTab.id === 'date-search') {
            const searchDate = document.getElementById('search-date').value;
            if (!searchDate) return alert('Selecione uma data.');
            const targetDate = new Date(searchDate + 'T00:00:00').toLocaleDateString('pt-BR');
            filteredEntries = allEntries.filter(entry => entry.date === targetDate);
        } else if (activeTab.id === 'server-search') {
            const serverName = document.getElementById('search-server').value;
            if (!serverName) return alert('Selecione um servidor.');
            filteredEntries = allEntries.filter(entry => entry.server === serverName);
        } else if (activeTab.id === 'contributor-search') {
            const contributorName = document.getElementById('search-contributor').value.trim();
            if (!contributorName) return alert('Digite o nome do contribuinte.');
            filteredEntries = allEntries.filter(entry => 
                entry.contributor && entry.contributor.toLowerCase().includes(contributorName.toLowerCase())
            );
        } else if (activeTab.id === 'ctm-search') {
            const ctm = document.getElementById('search-ctm').value.trim();
            if (!ctm) return alert('Digite o CTM.');
            filteredEntries = allEntries.filter(entry => 
                entry.ctm && entry.ctm.toLowerCase().includes(ctm.toLowerCase())
            );
        }
        
        displaySearchResults(filteredEntries);
        
    } catch (error) {
        alert('Erro ao pesquisar. Tente novamente.');
    } finally {
        setButtonLoading(searchBtn, false);
    }
}

function displaySearchResults(entries) {
    const resultsContainer = document.getElementById('search-results');
    const tableBody = document.querySelector('#search-table tbody');
    
    if (!resultsContainer || !tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (entries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">Nenhum resultado encontrado.</td></tr>`;
    } else {
        entries.forEach(entry => {
            const row = document.createElement('tr');
            // Nota: truncateText removido da observação, e substituído por uma classe
            row.innerHTML = `
                <td>${entry.date || '-'}</td>
                <td>${entry.time || '-'}</td>
                <td>${entry.server || '-'}</td>
                <td>${entry.processNumber || '-'}</td>
                <td title="${entry.subjectText || '-'}">${truncateText(entry.subjectText || '-', 30)}</td>
                <td>${entry.contributor || '-'}</td>
                <td>${entry.ctm || '-'}</td>
                <td class="obs-cell">${entry.observation || '-'}</td> 
            `;
            tableBody.appendChild(row);
        });
    }
    
    resultsContainer.classList.remove('hidden');
}

// Base de dados
function setupDatabase() {
    const applyBtn = document.getElementById('apply-filters');
    const clearBtn = document.getElementById('clear-filters');
    
    if (applyBtn) applyBtn.addEventListener('click', applyDatabaseFilters);
    if (clearBtn) clearBtn.addEventListener('click', clearDatabaseFilters);
    
    setupPaginationEventListeners();
}

function loadDatabaseTable(entries = null) {
    const entriesToShow = entries || allEntries;
    const totalRecords = document.getElementById('total-records');
    if (totalRecords) totalRecords.textContent = `${entriesToShow.length} registro(s)`;

    if (entriesToShow.length === 0) {
        const tableBody = document.querySelector('#database-table tbody');
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Nenhum registro encontrado.</td></tr>`;
        hidePaginationControls();
        return;
    }

    initializePagination(entriesToShow);
}

function applyDatabaseFilters() {
    const serverFilter = document.getElementById('filter-server').value;
    const subjectFilter = document.getElementById('filter-subject').value;
    const dateFilter = document.getElementById('filter-date').value;
    
    let filteredEntries = [...allEntries];
    
    if (serverFilter) filteredEntries = filteredEntries.filter(entry => entry.server === serverFilter);
    if (subjectFilter) filteredEntries = filteredEntries.filter(entry => entry.subjectId === parseInt(subjectFilter));
    if (dateFilter) {
        const targetDate = new Date(dateFilter + 'T00:00:00').toLocaleDateString('pt-BR');
        filteredEntries = filteredEntries.filter(entry => entry.date === targetDate);
    }
    
    loadDatabaseTable(filteredEntries);
}

function clearDatabaseFilters() {
    document.getElementById('filter-server').value = '';
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-date').value = '';
    loadDatabaseTable();
}

// Funções globais para editar/excluir
window.editEntry = function(entryId) {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return alert('Entrada não encontrada.');
    if (entry.server !== currentUser) return alert('Você só pode editar suas próprias entradas.');
    showEditModal(entry);
};

window.deleteEntry = async function(entryId) {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return alert('Entrada não encontrada.');
    if (entry.server !== currentUser) return alert('Você só pode excluir suas próprias entradas.');
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;
    
    try {
        if (firebaseConnected && database && !entryId.startsWith('local_')) {
            const entryRef = ref(database, `gluos_entries/${entryId}`);
            await remove(entryRef);
        } else {
            allEntries = allEntries.filter(e => e.id !== entryId);
            updateRecordCount();
        }
        showSuccessModal('Entrada excluída com sucesso!');
    } catch (error) {
        alert('Erro ao excluir entrada. Tente novamente.');
    }
};

// Relatórios
function setupReports() {
    const personalBtn = document.getElementById('personal-report-btn');
    const completeBtn = document.getElementById('complete-report-btn');
    const generateBtn = document.getElementById('generate-report-btn');
    
    if (personalBtn) personalBtn.addEventListener('click', () => { currentReportType = 'personal'; showReportForm('Relatório Pessoal'); });
    if (completeBtn) completeBtn.addEventListener('click', () => { currentReportType = 'complete'; showReportForm('Relatório Completo'); });
    if (generateBtn) generateBtn.addEventListener('click', handleGenerateReport);
}

function showReportForm(title) {
    const form = document.getElementById('report-form');
    const formTitle = document.getElementById('report-form-title');
    
    if (form && formTitle) {
        formTitle.textContent = title;
        form.classList.remove('hidden');
        
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const startInput = document.getElementById('report-start-date');
        const endInput = document.getElementById('report-end-date');
        
        if (startInput) startInput.value = firstDay.toISOString().split('T')[0];
        if (endInput) endInput.value = today.toISOString().split('T')[0];
    }
}

async function handleGenerateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    
    if (!startDate || !endDate) return alert('Selecione as datas inicial e final.');
    if (new Date(startDate) > new Date(endDate)) return alert('A data inicial não pode ser maior que a data final.');
    
    const generateBtn = document.getElementById('generate-report-btn');
    setButtonLoading(generateBtn, true);
    
    try {
        if (currentReportType === 'personal') generatePersonalReport(startDate, endDate);
        else if (currentReportType === 'complete') generateCompleteReport(startDate, endDate);
    } catch (error) {
        alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
        setButtonLoading(generateBtn, false);
    }
}

function generatePersonalReport(startDate, endDate) {
    const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
    const endTimestamp = new Date(endDate + 'T23:59:59').getTime();
    
    const userEntries = allEntries.filter(entry => {
        return entry.server === currentUser && entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp;
    });
    
    const subjectCount = {};
    userEntries.forEach(entry => {
        if (!subjectCount[entry.subjectId]) {
            subjectCount[entry.subjectId] = { id: entry.subjectId, text: entry.subjectText, count: 0 };
        }
        subjectCount[entry.subjectId].count++;
    });
    
    const totalEntries = userEntries.length;
    const reportData = Object.values(subjectCount).map(subject => ({
        ...subject,
        percentage: totalEntries > 0 ? ((subject.count / totalEntries) * 100).toFixed(1) : '0.0'
    }));
    
    reportData.sort((a, b) => b.count - a.count);
    displayPersonalReport(reportData, totalEntries, startDate, endDate);
}

function displayPersonalReport(reportData, totalEntries, startDate, endDate) {
    const reportTitle = document.getElementById('report-title');
    const reportMeta = document.getElementById('report-meta');
    
    if (reportTitle) reportTitle.textContent = 'Relatório Pessoal de Produtividade';
    if (reportMeta) {
        reportMeta.innerHTML = `
            <p><strong>Usuário:</strong> ${currentUser}</p>
            <p><strong>Período:</strong> ${formatDateBR(startDate)} a ${formatDateBR(endDate)}</p>
            <p><strong>Total de Entradas:</strong> ${totalEntries}</p>
        `;
    }
    
    const tableHead = document.getElementById('report-table-head');
    const tableBody = document.getElementById('report-table-body');
    const tableFoot = document.getElementById('report-table-foot');
    
    if (tableHead) tableHead.innerHTML = `<tr><th>Assunto</th><th>Total</th><th>%</th></tr>`;
    
    if (tableBody) {
        tableBody.innerHTML = '';
        if (reportData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhum registro encontrado no período.</td></tr>`;
        } else {
            reportData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.text}</td><td>${item.count}</td><td>${item.percentage}%</td>`;
                tableBody.appendChild(row);
            });
        }
    }
    
    if (tableFoot) {
        tableFoot.innerHTML = `<tr><th><strong>TOTAL GERAL</strong></th><th><strong>${totalEntries}</strong></th><th><strong>100%</strong></th></tr>`;
    }
    
    const summary = document.getElementById('summary-content');
    if (summary && totalEntries > 0) {
        const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
        const endTimestamp = new Date(endDate + 'T23:59:59').getTime();
        
        const dates = [...new Set(allEntries
            .filter(entry => entry.server === currentUser && entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp)
            .map(entry => entry.date))];
        
        const activeDays = dates.length;
        const avgPerDay = activeDays > 0 ? (totalEntries / activeDays).toFixed(1) : '0.0';
        
        summary.innerHTML = `<p><strong>Dias com atividade:</strong> ${activeDays}</p><p><strong>Média diária:</strong> ${avgPerDay} entradas/dia</p>`;
        document.getElementById('report-summary').classList.remove('hidden');
    } else {
        document.getElementById('report-summary').classList.add('hidden');
    }
    
    document.getElementById('report-results').classList.remove('hidden');
}

function generateCompleteReport(startDate, endDate) {
    const usersWithoutAdmin = GLUOS_DATA.usuarios.filter(user => user !== "Admin");
    const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
    const endTimestamp = new Date(endDate + 'T23:59:59').getTime();
    
    const periodEntries = allEntries.filter(entry => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp);
    
    const reportMatrix = {};
    const userTotals = {};
    const subjectTotals = {};
    let grandTotal = 0;
    
    usersWithoutAdmin.forEach(user => userTotals[user] = 0);
    
    GLUOS_DATA.assuntos.forEach(subject => {
        reportMatrix[subject.id] = { id: subject.id, text: subject.texto, users: {} };
        subjectTotals[subject.id] = 0;
        usersWithoutAdmin.forEach(user => reportMatrix[subject.id].users[user] = 0);
    });
    
    periodEntries.forEach(entry => {
        const subjectId = entry.subjectId;
        const user = entry.server;
        if (reportMatrix[subjectId] && usersWithoutAdmin.includes(user)) {
            reportMatrix[subjectId].users[user]++;
            subjectTotals[subjectId]++;
            userTotals[user]++;
            grandTotal++;
        }
    });
    
    const reportData = Object.values(reportMatrix)
        .filter(subject => subjectTotals[subject.id] > 0)
        .map(subject => ({
            ...subject,
            total: subjectTotals[subject.id],
            percentage: grandTotal > 0 ? ((subjectTotals[subject.id] / grandTotal) * 100).toFixed(1) : '0.0'
        }));
    
    reportData.sort((a, b) => b.total - a.total);
    displayCompleteReport(reportData, userTotals, grandTotal, startDate, endDate, usersWithoutAdmin);
}

function displayCompleteReport(reportData, userTotals, grandTotal, startDate, endDate, usersWithoutAdmin) {
    const reportTitle = document.getElementById('report-title');
    const reportMeta = document.getElementById('report-meta');
    
    if (reportTitle) reportTitle.textContent = 'Relatório Completo de Produtividade';
    if (reportMeta) {
        reportMeta.innerHTML = `
            <p><strong>Período:</strong> ${formatDateBR(startDate)} a ${formatDateBR(endDate)}</p>
            <p><strong>Total de Entradas:</strong> ${grandTotal}</p>
            <p><strong>Relatório gerado por:</strong> ${currentUser}</p>
        `;
    }
    
    const tableHead = document.getElementById('report-table-head');
    if (tableHead) {
        let headerHtml = '<tr><th style="text-align: left; min-width: 300px;">Assunto</th>';
        usersWithoutAdmin.forEach(user => { headerHtml += `<th style="text-align: center; min-width: 80px;">${user}</th>`; });
        headerHtml += '<th style="text-align: center; min-width: 80px;">TOTAL</th><th style="text-align: center; min-width: 60px;">%</th></tr>';
        tableHead.innerHTML = headerHtml;
    }
    
    const tableBody = document.getElementById('report-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        if (reportData.length === 0) {
            const colspan = usersWithoutAdmin.length + 3;
            tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">Nenhum registro encontrado no período.</td></tr>`;
        } else {
            reportData.forEach(subject => {
                const row = document.createElement('tr');
                let rowHtml = `<td style="text-align: left; max-width: 300px; word-wrap: break-word;">${subject.text}</td>`;
                usersWithoutAdmin.forEach(user => {
                    const count = subject.users[user] || 0;
                    rowHtml += `<td style="text-align: center; ${count > 0 ? 'font-weight: bold;' : ''}">${count}</td>`;
                });
                rowHtml += `<td style="text-align: center; font-weight: bold;">${subject.total}</td>`;
                rowHtml += `<td style="text-align: center;">${subject.percentage}%</td>`;
                row.innerHTML = rowHtml;
                tableBody.appendChild(row);
            });
        }
    }
    
    const tableFoot = document.getElementById('report-table-foot');
    if (tableFoot) {
        let footerHtml = '<tr style="background: var(--color-bg-6); font-weight: bold;"><th style="text-align: left;">TOTAL GERAL</th>';
        usersWithoutAdmin.forEach(user => { footerHtml += `<th style="text-align: center;">${userTotals[user]}</th>`; });
        footerHtml += `<th style="text-align: center;">${grandTotal}</th><th style="text-align: center;">100%</th></tr>`;
        tableFoot.innerHTML = footerHtml;
    }
    
    const reportTable = document.getElementById('report-table');
    if (reportTable) reportTable.classList.add('admin-report-table');
    
    document.getElementById('report-results').classList.remove('hidden');
    document.getElementById('report-summary').classList.add('hidden');
}

// Perfil
function setupProfile() {
    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) passwordForm.addEventListener('submit', handlePasswordChange);
}

function showProfileModal() {
    const modal = document.getElementById('profile-modal');
    const username = document.getElementById('profile-username');
    if (username) username.textContent = currentUser || 'Usuário';
    if (modal) modal.classList.remove('hidden');
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    const submitBtn = e.target.querySelector('button[type=\"submit\"]');

    if (errorDiv) errorDiv.classList.add('hidden');
    if (newPassword !== confirmPassword) return showPasswordError('As senhas não coincidem.');
    if (newPassword.length < 6) return showPasswordError('A nova senha deve ter pelo menos 6 caracteres.');

    setButtonLoading(submitBtn, true);

    try {
        const user = auth.currentUser;
        if (!user || !user.email) return showPasswordError('Usuário não autenticado.');

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        e.target.reset();
        hideProfileModal();
        showSuccessModal('Senha alterada com sucesso!');
    } catch (error) {
        if (error.code === 'auth/wrong-password') showPasswordError('Senha atual incorreta.');
        else if (error.code === 'auth/weak-password') showPasswordError('A nova senha é muito fraca.');
        else showPasswordError('Erro ao alterar senha. Tente novamente.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

function hideProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
    const form = document.getElementById('password-change-form');
    if (form) form.reset();
    const errorDiv = document.getElementById('password-error');
    if (errorDiv) errorDiv.classList.add('hidden');
}

// Modais
function setupModals() {
    const closeModalBtn = document.getElementById('close-modal');
    const cancelProfileBtn = document.getElementById('cancel-profile');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideSuccessModal);
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', hideProfileModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', hideEditModal);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.add('hidden');
        });
    });
    
    const editForm = document.getElementById('edit-entry-form');
    if (editForm) editForm.addEventListener('submit', handleEditEntry);
}

function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageEl = document.getElementById('success-message');
    if (messageEl) messageEl.textContent = message;
    if (modal) modal.classList.remove('hidden');
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.add('hidden');
}

function showEditModal(entry) {
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-entry-id').value = entry.id;
    document.getElementById('edit-subject-select').value = entry.subjectId;
    document.getElementById('edit-process-number').value = entry.processNumber || '';
    document.getElementById('edit-contributor').value = entry.contributor || '';
    document.getElementById('edit-ctm').value = entry.ctm || '';
    document.getElementById('edit-observation').value = entry.observation || '';
    document.getElementById('edit-habite-number').value = entry.habiteNumber || '';
    document.getElementById('edit-alvara-situation').value = entry.alvaraSituation || '';
    
    if (modal) modal.classList.remove('hidden');
}

function hideEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('hidden');
}

async function handleEditEntry(e) {
    e.preventDefault();
    
    const entryId = document.getElementById('edit-entry-id').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const subjectId = parseInt(document.getElementById('edit-subject-select').value);
    
    const updatedEntry = {
        subjectId: subjectId,
        subjectText: GLUOS_DATA.assuntos.find(a => a.id === subjectId)?.texto || '',
        processNumber: document.getElementById('edit-process-number').value.trim(),
        contributor: document.getElementById('edit-contributor').value.trim(),
        ctm: document.getElementById('edit-ctm').value.trim(),
        observation: document.getElementById('edit-observation').value.trim(),
        habiteNumber: document.getElementById('edit-habite-number').value.trim(),
        alvaraSituation: document.getElementById('edit-alvara-situation').value.trim()
    };
    
    if (!updatedEntry.subjectId || !updatedEntry.processNumber) return alert('Por favor, preencha o assunto e o número do processo.');
    setButtonLoading(submitBtn, true);
    
    try {
        if (firebaseConnected && database && !entryId.startsWith('local_')) {
            const entryRef = ref(database, `gluos_entries/${entryId}`);
            await update(entryRef, updatedEntry);
        } else {
            const entryIndex = allEntries.findIndex(e => e.id === entryId);
            if (entryIndex !== -1) allEntries[entryIndex] = { ...allEntries[entryIndex], ...updatedEntry };
        }
        hideEditModal();
        showSuccessModal('Entrada atualizada com sucesso!');
    } catch (error) {
        alert('Erro ao atualizar entrada. Tente novamente.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Utilitários
function populateSelectOptions() {
    const subjectSelects = [
        'subject-select', 'multi-subject-select', 'edit-subject-select', 'filter-subject',
        'subject1-select', 'subject2-select', 'subject3-select', 'subject4-select', 'subject5-select'
    ];
    
    subjectSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            while (select.children.length > 1) select.removeChild(select.lastChild);
            GLUOS_DATA.assuntos.forEach(assunto => {
                const option = document.createElement('option');
                option.value = assunto.id;
                option.textContent = `${assunto.id} - ${assunto.texto}`;
                select.appendChild(option);
            });
        }
    });
    
    const serverSelects = ['search-server', 'filter-server'];
    serverSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            while (select.children.length > 1) select.removeChild(select.lastChild);
            GLUOS_DATA.usuarios.forEach(user => {
                const option = document.createElement('option');
                option.value = user;
                option.textContent = user;
                select.appendChild(option);
            });
        }
    });
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        if (screenName === 'report') {
            const reportForm = document.getElementById('report-form');
            const reportResults = document.getElementById('report-results');
            if (reportForm) reportForm.classList.add('hidden');
            if (reportResults) reportResults.classList.add('hidden');
            currentReportType = null;
        }
    }
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo) userInfo.textContent = currentUser ? `Usuário: ${currentUser}` : 'Bem-vindo!';
}

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const datetimeInfo = document.getElementById('datetime-info');
    if (datetimeInfo) datetimeInfo.textContent = dateTimeString;
}

function updateFirebaseStatus(status, message) {
    const indicator = document.getElementById('firebase-indicator');
    const statusText = document.getElementById('firebase-status-text');
    if (indicator && statusText) {
        indicator.className = `status-indicator status-indicator--${status}`;
        statusText.textContent = message;
    }
    const syncIndicator = document.getElementById('sync-indicator');
    const syncText = document.getElementById('sync-status-text');
    if (syncIndicator && syncText) {
        syncIndicator.className = `status-indicator status-indicator--${status}`;
        syncText.textContent = status === 'success' ? 'Sincronizado' : 'Offline';
    }
}

function updateRecordCount() {
    const totalRecords = document.getElementById('total-records');
    if (totalRecords) totalRecords.textContent = `${allEntries.length} registro(s)`;
}

function formatDateBR(dateString) { return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR'); }
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// SISTEMA DE PAGINAÇÃO
let currentPage = 1;
let itemsPerPage = 500;
let currentEntries = [];
let totalPages = 1;

function initializePagination(entries) {
    currentEntries = entries;
    currentPage = 1;
    totalPages = Math.ceil(entries.length / itemsPerPage);
    displayCurrentPage();
    updatePaginationControls();
    setupPaginationEventListeners();
}

function displayCurrentPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageEntries = currentEntries.slice(startIndex, endIndex);

    const tableBody = document.querySelector('#database-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    pageEntries.forEach(entry => {
        const row = document.createElement('tr');
        const canEdit = entry.server === currentUser;
        const actionsHtml = canEdit ? `<div class="action-buttons"><button class="btn--edit" onclick="editEntry('${entry.id}')">Editar</button><button class="btn--delete" onclick="deleteEntry('${entry.id}')">Excluir</button></div>` : '-';
        row.innerHTML = `
            <td>${entry.date || '-'}</td>
            <td>${entry.time || '-'}</td>
            <td>${entry.server || '-'}</td>
            <td>${entry.processNumber || '-'}</td>
            <td title="${entry.subjectText || '-'}">${truncateText(entry.subjectText || '-', 30)}</td>
            <td>${entry.contributor || '-'}</td>
            <td>${entry.ctm || '-'}</td>
            <td title="${entry.observation || '-'}">${truncateText(entry.observation || '-', 40)}</td>
            <td>${actionsHtml}</td>
        `;
        tableBody.appendChild(row);
    });
    updatePaginationInfo();
}

function updatePaginationInfo() {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, currentEntries.length);
    const totalEntries = currentEntries.length;
    const infoText = `Mostrando ${startIndex}-${endIndex} de ${totalEntries} registros`;
    [document.getElementById('pagination-info-text'), document.getElementById('pagination-info-text-bottom')].forEach(element => {
        if (element) element.textContent = infoText;
    });
}

function updatePaginationControls() {
    if (totalPages <= 1) { hidePaginationControls(); return; }
    showPaginationControls();
    updateNavigationButtons();
    updatePageNumbers();
}

function showPaginationControls() { document.querySelectorAll('.pagination-container').forEach(container => { if (container) container.style.display = 'flex'; }); }
function hidePaginationControls() { document.querySelectorAll('.pagination-container').forEach(container => { if (container) container.style.display = 'none'; }); }

function updateNavigationButtons() {
    const navigationButtons = [
        { ids: ['first-page-btn', 'first-page-btn-bottom'], condition: currentPage === 1 },
        { ids: ['prev-page-btn', 'prev-page-btn-bottom'], condition: currentPage === 1 },
        { ids: ['next-page-btn', 'next-page-btn-bottom'], condition: currentPage === totalPages },
        { ids: ['last-page-btn', 'last-page-btn-bottom'], condition: currentPage === totalPages }
    ];
    navigationButtons.forEach(buttonGroup => { buttonGroup.ids.forEach(id => { const button = document.getElementById(id); if (button) button.disabled = buttonGroup.condition; }); });
}

function updatePageNumbers() {
    [document.getElementById('page-numbers-top'), document.getElementById('page-numbers-bottom')].forEach(container => {
        if (container) container.innerHTML = generatePageNumbers();
    });
}

function generatePageNumbers() {
    let html = '';
    const maxVisiblePages = 15;
    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) html += createPageButton(i);
    } else {
        if (currentPage <= 10) {
            for (let i = 1; i <= 15; i++) html += createPageButton(i);
            if (totalPages > 15) html += '<span class="pagination-ellipsis">...</span>';
        } else if (currentPage > totalPages - 10) {
            if (totalPages > 15) html += '<span class="pagination-ellipsis">...</span>';
            for (let i = Math.max(1, totalPages - 14); i <= totalPages; i++) html += createPageButton(i);
        } else {
            html += createPageButton(1) + '<span class="pagination-ellipsis">...</span>';
            const start = Math.max(2, currentPage - 7);
            const end = Math.min(totalPages - 1, currentPage + 7);
            for (let i = start; i <= end; i++) html += createPageButton(i);
            html += '<span class="pagination-ellipsis">...</span>' + createPageButton(totalPages);
        }
    }
    return html;
}

function createPageButton(pageNumber) {
    const isActive = pageNumber === currentPage;
    const activeClass = isActive ? ' active' : '';
    return `<button class="page-number-btn${activeClass}" onclick="goToPage(${pageNumber})">${pageNumber}</button>`;
}

window.goToPage = function(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    currentPage = pageNumber;
    displayCurrentPage();
    updatePaginationControls();
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function goToFirstPage() { goToPage(1); }
function goToPrevPage() { goToPage(currentPage - 1); }
function goToNextPage() { goToPage(currentPage + 1); }
function goToLastPage() { goToPage(totalPages); }

function setupPaginationEventListeners() {
    const paginationButtons = [
        { ids: ['first-page-btn', 'first-page-btn-bottom'], handler: goToFirstPage },
        { ids: ['prev-page-btn', 'prev-page-btn-bottom'], handler: goToPrevPage },
        { ids: ['next-page-btn', 'next-page-btn-bottom'], handler: goToNextPage },
        { ids: ['last-page-btn', 'last-page-btn-bottom'], handler: goToLastPage }
    ];
    paginationButtons.forEach(buttonGroup => {
        buttonGroup.ids.forEach(id => {
            const button = document.getElementById(id);
            if (button) { button.removeEventListener('click', buttonGroup.handler); button.addEventListener('click', buttonGroup.handler); }
        });
    });
}

// VÁRIOS NOVOS
function setupBulkEntries() {
    const generateBtn = document.getElementById('generate-bulk-forms');
    const saveAllBtn = document.getElementById('save-all-bulk');
    const resetBtn = document.getElementById('reset-bulk-forms');
    const bulkSubjectNumber = document.getElementById('bulk-subject-number');
    const bulkSubjectSelect = document.getElementById('bulk-subject-select');

    if (bulkSubjectSelect) {
        bulkSubjectSelect.innerHTML = '<option value="">Selecione um assunto...</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const opt = document.createElement('option');
            opt.value = assunto.id;
            opt.textContent = `${assunto.id} - ${assunto.texto}`;
            bulkSubjectSelect.appendChild(opt);
        });
    }

    if (generateBtn) generateBtn.addEventListener('click', handleGenerateBulkForms);
    if (saveAllBtn) saveAllBtn.addEventListener('click', handleSaveAllBulkEntries);
    if (resetBtn) resetBtn.addEventListener('click', handleResetBulkForms);

    if (bulkSubjectNumber && bulkSubjectSelect) {
        bulkSubjectNumber.addEventListener('input', function() {
            const num = parseInt(this.value);
            if (num >= 1 && num <= 50) {
                const assunto = GLUOS_DATA.assuntos.find(a => a.id === num);
                if (assunto) bulkSubjectSelect.value = assunto.id;
            }
        });
        bulkSubjectSelect.addEventListener('change', function() {
            if (this.value) bulkSubjectNumber.value = this.value;
        });
    }
}

function handleGenerateBulkForms() {
    const subjectId = parseInt(document.getElementById('bulk-subject-select').value);
    const quantity = parseInt(document.getElementById('bulk-quantity').value);

    if (!subjectId) return alert('Por favor, selecione um assunto.');
    if (!quantity || quantity < 1 || quantity > 10) return alert('Por favor, informe uma quantidade válida (1-10).');

    const assunto = GLUOS_DATA.assuntos.find(a => a.id === subjectId);
    if (!assunto) return alert('Assunto não encontrado.');

    const container = document.getElementById('bulk-forms-container');
    const subjectText = document.getElementById('bulk-selected-subject-text');
    const processesContainer = document.getElementById('bulk-processes-container');

    if (container && subjectText && processesContainer && assunto) {
        subjectText.textContent = assunto.texto;
        container.classList.remove('hidden');
        processesContainer.innerHTML = '';
        for (let i = 1; i <= quantity; i++) processesContainer.appendChild(createBulkProcessForm(i));
    }
}

function createBulkProcessForm(processNumber) {
    const formDiv = document.createElement('div');
    formDiv.className = 'bulk-process-form';
    formDiv.setAttribute('data-process-number', processNumber);

    formDiv.innerHTML = `
        <div class="process-form-header">
            <h4>Processo ${processNumber}</h4>
            <button type="button" class="btn btn--sm btn--secondary expand-process-btn" data-process="${processNumber}">+ Campos Opcionais</button>
        </div>
        <div class="form-group">
            <label for="bulk-process-${processNumber}">Nº do Processo/Protocolo:</label>
            <input type="text" id="bulk-process-${processNumber}" class="form-control bulk-process-input" placeholder="Digite o número do processo" data-process="${processNumber}">
        </div>
        <div class="optional-fields hidden" id="optional-fields-${processNumber}">
            <div class="form-row">
                <div class="form-group"><label for="bulk-contributor-${processNumber}">Contribuinte:</label><input type="text" id="bulk-contributor-${processNumber}" class="form-control" placeholder="Nome do contribuinte"></div>
                <div class="form-group"><label for="bulk-ctm-${processNumber}">CTM:</label><input type="text" id="bulk-ctm-${processNumber}" class="form-control" placeholder="CTM do processo"></div>
            </div>
            <div class="form-group">
                <label for="bulk-observation-${processNumber}">Observação:</label>
                <textarea id="bulk-observation-${processNumber}" class="form-control" rows="2" placeholder="Observações sobre o processo"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group"><label for="bulk-habite-${processNumber}">Número do Habite-se/Alvará:</label><input type="text" id="bulk-habite-${processNumber}" class="form-control" placeholder="Número do habite-se ou alvará"></div>
                <div class="form-group"><label for="bulk-alvara-situation-${processNumber}">Situação do Alvará de Funcionamento:</label><select id="bulk-alvara-situation-${processNumber}" class="form-control"><option value="">Selecione uma situação...</option><option value="Deferido">Deferido</option><option value="Indeferido">Indeferido</option><option value="Pendente">Pendente</option><option value="Em análise">Em análise</option><option value="Aguardando documentação">Aguardando documentação</option></select></div>
            </div>
        </div>
    `;

    const expandBtn = formDiv.querySelector('.expand-process-btn');
    const optionalFields = formDiv.querySelector('.optional-fields');
    const processInput = formDiv.querySelector('.bulk-process-input');

    if (expandBtn && optionalFields) {
        expandBtn.addEventListener('click', function() {
            if (optionalFields.classList.contains('hidden')) {
                optionalFields.classList.remove('hidden');
                expandBtn.textContent = '- Campos Opcionais';
                expandBtn.classList.remove('btn--secondary');
                expandBtn.classList.add('btn--warning');
            } else {
                optionalFields.classList.add('hidden');
                expandBtn.textContent = '+ Campos Opcionais';
                expandBtn.classList.remove('btn--warning');
                expandBtn.classList.add('btn--secondary');
            }
        });
    }

    if (processInput) {
        processInput.addEventListener('input', async function() {
            let numeroProcesso = this.value.trim().replace(/\//g, "-");
            const contributorInput = formDiv.querySelector(`#bulk-contributor-${processNumber}`);
            const ctmInput = formDiv.querySelector(`#bulk-ctm-${processNumber}`);

            if (!numeroProcesso) {
                if (contributorInput) contributorInput.value = '';
                if (ctmInput) ctmInput.value = '';
                return;
            }

            try {
                if (processosDatabase) {
                    const refProc = ref(processosDatabase, 'processos/' + numeroProcesso);
                    const snapshot = await get(refProc);
                    if (snapshot.exists()) {
                        const dados = snapshot.val();
                        if (contributorInput) contributorInput.value = dados.Requerente || '';
                        if (ctmInput) ctmInput.value = dados.CTM || '';
                    } else {
                        if (contributorInput) contributorInput.value = '';
                        if (ctmInput) ctmInput.value = '';
                    }
                }
            } catch (err) {
                if (contributorInput) contributorInput.value = '';
                if (ctmInput) ctmInput.value = '';
            }
        });
    }

    return formDiv;
}

async function handleSaveAllBulkEntries() {
    const subjectId = parseInt(document.getElementById('bulk-subject-select').value);
    const assunto = GLUOS_DATA.assuntos.find(a => a.id === subjectId);

    if (!subjectId || !assunto) return alert('Erro: Assunto não selecionado.');

    const processesContainer = document.getElementById('bulk-processes-container');
    const processForms = processesContainer.querySelectorAll('.bulk-process-form');
    const entriesToSave = [];
    let firstProcessFilled = false;

    for (let i = 0; i < processForms.length; i++) {
        const form = processForms[i];
        const processNumber = form.getAttribute('data-process-number');
        const processInput = form.querySelector(`#bulk-process-${processNumber}`);
        if (!processInput) continue;

        const processValue = processInput.value.trim();
        if (i === 0 && !processValue) { alert('O primeiro processo deve ser preenchido.'); processInput.focus(); return; }
        if (i === 0 && processValue) firstProcessFilled = true;

        if (processValue) {
            const now = new Date();
            entriesToSave.push({
                subjectId: subjectId,
                subjectText: assunto.texto,
                processNumber: processValue,
                contributor: form.querySelector(`#bulk-contributor-${processNumber}`)?.value.trim() || '',
                ctm: form.querySelector(`#bulk-ctm-${processNumber}`)?.value.trim() || '',
                observation: form.querySelector(`#bulk-observation-${processNumber}`)?.value.trim() || '',
                habiteNumber: form.querySelector(`#bulk-habite-${processNumber}`)?.value.trim() || '',
                alvaraSituation: form.querySelector(`#bulk-alvara-situation-${processNumber}`)?.value.trim() || '',
                server: currentUser,
                date: now.toLocaleDateString('pt-BR'),
                time: now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: now.getTime()
            });
        }
    }

    if (!firstProcessFilled) return alert('Pelo menos o primeiro processo deve ser preenchido.');
    if (entriesToSave.length === 0) return alert('Nenhum processo foi preenchido.');
    if (!confirm(`Deseja salvar ${entriesToSave.length} entrada(s) para o assunto "${assunto.texto}"?`)) return;

    const saveBtn = document.getElementById('save-all-bulk');
    setButtonLoading(saveBtn, true);

    try {
        for (const entry of entriesToSave) {
            if (firebaseConnected && database) {
                await push(ref(database, 'gluos_entries'), entry);
            } else {
                entry.id = 'local_' + Date.now() + '_' + Math.random();
                allEntries.unshift(entry);
            }
        }
        showSuccessModal(`${entriesToSave.length} entrada(s) salva(s) com sucesso!`);
        handleResetBulkForms();
    } catch (error) {
        alert('Erro ao salvar as entradas. Tente novamente.');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

function handleResetBulkForms() {
    const container = document.getElementById('bulk-forms-container');
    const processesContainer = document.getElementById('bulk-processes-container');
    if (container) container.classList.add('hidden');
    if (processesContainer) processesContainer.innerHTML = '';
    document.getElementById('bulk-subject-number').value = '';
    document.getElementById('bulk-subject-select').value = '';
    document.getElementById('bulk-quantity').value = '5';
}

// NOVO: VÁRIOS ASSUNTOS
function setupMultiSubjectEntries() {
    const form = document.getElementById('multi-subject-form');
    const processNumberInput = document.getElementById('multi-process-number');
    const contributorInput = document.getElementById('multi-contributor');
    const ctmInput = document.getElementById('multi-ctm');

    if (form) form.addEventListener('submit', handleMultiSubjectSubmit);

    if (processNumberInput && contributorInput && ctmInput) {
        processNumberInput.addEventListener('input', async function() {
            let numeroProcesso = this.value.trim().replace(/\//g, "-");
            if (!numeroProcesso) { contributorInput.value = ''; ctmInput.value = ''; return; }

            try {
                if (processosDatabase) {
                    const refProc = ref(processosDatabase, 'processos/' + numeroProcesso);
                    const snapshot = await get(refProc);
                    if (snapshot.exists()) {
                        const dados = snapshot.val();
                        contributorInput.value = dados.Requerente || '';
                        ctmInput.value = dados.CTM || '';
                    } else {
                        contributorInput.value = '';
                        ctmInput.value = '';
                    }
                }
            } catch (err) {
                contributorInput.value = '';
                ctmInput.value = '';
            }
        });
    }

    for (let i = 1; i <= 5; i++) setupSubjectPair(i);
    populateMultiSubjectSelects();
}

function setupSubjectPair(index) {
    const idInput = document.getElementById(`subject${index}-id`);
    const selectInput = document.getElementById(`subject${index}-select`);

    if (idInput && selectInput) {
        idInput.addEventListener('input', function() {
            const num = parseInt(this.value);
            if (num >= 1 && num <= 50) {
                const assunto = GLUOS_DATA.assuntos.find(a => a.id === num);
                if (assunto) selectInput.value = assunto.id;
            } else if (!this.value) selectInput.value = '';
        });
        selectInput.addEventListener('change', function() {
            idInput.value = this.value ? this.value : '';
        });
    }
}

function populateMultiSubjectSelects() {
    for (let i = 1; i <= 5; i++) {
        const select = document.getElementById(`subject${i}-select`);
        if (select && select.options.length <= 1) {
            while (select.options.length > 1) select.removeChild(select.lastChild);
            GLUOS_DATA.assuntos.forEach(assunto => {
                const option = document.createElement('option');
                option.value = assunto.id;
                option.textContent = `${assunto.id} - ${assunto.texto}`;
                select.appendChild(option);
            });
        }
    }
}

async function handleMultiSubjectSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const processNumber = document.getElementById('multi-process-number').value.trim();
    const contributor = document.getElementById('multi-contributor').value.trim();
    const ctm = document.getElementById('multi-ctm').value.trim();
    const observation = document.getElementById('multi-observation').value.trim();
    const habiteNumber = document.getElementById('multi-habite-number').value.trim();
    const alvaraSituation = document.getElementById('multi-alvara-situation').value.trim();

    if (!processNumber) return alert('Por favor, informe o número do processo.');

    const selectedSubjects = [];
    for (let i = 1; i <= 5; i++) {
        const subjectId = parseInt(document.getElementById(`subject${i}-select`).value);
        if (subjectId) {
            const assunto = GLUOS_DATA.assuntos.find(a => a.id === subjectId);
            if (assunto) selectedSubjects.push({ id: subjectId, text: assunto.texto });
        }
    }

    if (selectedSubjects.length === 0) return alert('Por favor, selecione pelo menos um assunto.');
    setButtonLoading(submitBtn, true);

    try {
        const now = new Date();
        const savedEntries = [];

        for (const subject of selectedSubjects) {
            const entry = {
                subjectId: subject.id,
                subjectText: subject.text,
                processNumber: processNumber,
                contributor: contributor,
                ctm: ctm,
                observation: observation,
                habiteNumber: habiteNumber,
                alvaraSituation: alvaraSituation,
                server: currentUser,
                date: now.toLocaleDateString('pt-BR'),
                time: now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: now.getTime()
            };

            if (firebaseConnected && database) {
                await push(ref(database, 'gluos_entries'), entry);
            } else {
                entry.id = 'local_' + Date.now() + '_' + subject.id;
                allEntries.unshift(entry);
            }
            savedEntries.push(entry);
        }

        form.reset();
        for (let i = 1; i <= 5; i++) document.getElementById(`subject${i}-id`).value = '';

        const message = `${savedEntries.length} entradas salvas com sucesso!\n\nAssuntos cadastrados:\n${savedEntries.map(e => `- ${e.subjectText}`).join('\n')}`;
        showSuccessModal(message);

    } catch (error) {
        alert('Erro ao salvar entradas. Tente novamente.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ESTATÍSTICAS
function initStatsScreen() {
  const monthInput = document.getElementById('stats-month-filter');
  if (monthInput && !monthInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    monthInput.value = `${yyyy}-${mm}`;
  }
  renderStats();
}

function renderStats() {
  const monthInputValue = document.getElementById('stats-month-filter')?.value;
  if (!monthInputValue) return;

  const [yearStr, monthStr] = monthInputValue.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10);

  const totalEntriesCount = allEntries.length;
  document.getElementById('stat-total-entries').textContent = totalEntriesCount;

  const monthlyEntries = allEntries.filter(entry => {
    if (!entry.date) return false;
    const parts = entry.date.split('/');
    if (parts.length !== 3) return false;
    return parseInt(parts[1], 10) === selectedMonth && parseInt(parts[2], 10) === selectedYear;
  });

  const monthlyCount = monthlyEntries.length;
  document.getElementById('stat-monthly-entries').textContent = monthlyCount;

  const activeDays = new Set(monthlyEntries.map(e => e.date)).size;
  const dailyAverage = activeDays > 0 ? (monthlyCount / activeDays).toFixed(1) : '0.0';
  document.getElementById('stat-daily-avg').textContent = dailyAverage;

  const monthlySubjectCounts = {};
  monthlyEntries.forEach(e => {
    const sId = e.subjectId;
    const sText = e.subjectText || (GLUOS_DATA.assuntos.find(a => a.id === sId)?.texto) || `Assunto ${sId}`;
    if (!monthlySubjectCounts[sId]) monthlySubjectCounts[sId] = { id: sId, text: sText, count: 0 };
    monthlySubjectCounts[sId].count++;
  });

  const sortedMonthlySubjects = Object.values(monthlySubjectCounts).sort((a, b) => b.count - a.count);
  const top10Container = document.getElementById('stat-top10-list');
  top10Container.innerHTML = '';
  
  if (sortedMonthlySubjects.length === 0) {
    top10Container.innerHTML = '<li>Nenhum registro encontrado no mês selecionado.</li>';
  } else {
    const top10List = sortedMonthlySubjects.slice(0, 10);
    top10List.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `${item.id} - ${item.text}: <strong>${item.count} entrada(s)</strong>`;
      top10Container.appendChild(li);
    });
  }

  renderSubjectCharts(monthlyEntries, sortedMonthlySubjects, selectedYear, selectedMonth);
  renderGeneralSubjectTable(totalEntriesCount);
}

function renderSubjectCharts(monthlyEntries, sortedMonthlySubjects, year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const xAxisLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const top1to5 = sortedMonthlySubjects.slice(0, 5);
  const top6to10 = sortedMonthlySubjects.slice(5, 10);
  const colors = ['#21808d', '#e68161', '#22c55e', '#a855f7', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

  const buildDatasets = (subjectList, colorStartIndex) => {
    return subjectList.map((subj, idx) => {
      const dailyCounts = new Array(daysInMonth).fill(0);
      monthlyEntries.forEach(entry => {
        if (entry.subjectId === subj.id) {
          const day = parseInt(entry.date.split('/')[0], 10);
          if (day >= 1 && day <= daysInMonth) dailyCounts[day - 1]++;
        }
      });
      const color = colors[(colorStartIndex + idx) % colors.length];
      return {
        label: `${subj.id} - ${truncateText(subj.text, 25)}`,
        data: dailyCounts,
        borderColor: color,
        backgroundColor: color,
        tension: 0.2,
        fill: false
      };
    });
  };

  if (chartTop15Instance) chartTop15Instance.destroy();
  if (chartTop610Instance) chartTop610Instance.destroy();

  const ctx1 = document.getElementById('chart-top1-5')?.getContext('2d');
  const ctx2 = document.getElementById('chart-top6-10')?.getContext('2d');

  if (ctx1) {
    chartTop15Instance = new Chart(ctx1, {
      type: 'line',
      data: { labels: xAxisLabels, datasets: buildDatasets(top1to5, 0) },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Progresso Diário (Top 1 ao 5)' } }, scales: { x: { title: { display: true, text: 'Dia do Mês' } }, y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: 'Quantidade de Entradas' } } } }
    });
  }

  if (ctx2) {
    chartTop610Instance = new Chart(ctx2, {
      type: 'line',
      data: { labels: xAxisLabels, datasets: buildDatasets(top6to10, 5) },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Progresso Diário (Top 6 ao 10)' } }, scales: { x: { title: { display: true, text: 'Dia do Mês' } }, y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: 'Quantidade de Entradas' } } } }
    });
  }
}

function renderGeneralSubjectTable(totalGlobalEntries) {
  const tbody = document.querySelector('#stats-subject-table tbody');
  const tfoot = document.querySelector('#stats-subject-table tfoot');
  if (!tbody || !tfoot) return;

  const subjectTotals = {};
  GLUOS_DATA.assuntos.forEach(a => { subjectTotals[a.id] = { id: a.id, text: a.texto, count: 0 }; });

  allEntries.forEach(entry => {
    const sId = entry.subjectId;
    if (subjectTotals[sId]) subjectTotals[sId].count++;
    else if (sId) subjectTotals[sId] = { id: sId, text: entry.subjectText || `Assunto ${sId}`, count: 1 };
  });

  const sortedSubjects = Object.values(subjectTotals).sort((a, b) => b.count - a.count);

  tbody.innerHTML = '';
  sortedSubjects.forEach(item => {
    const percentage = totalGlobalEntries > 0 ? ((item.count / totalGlobalEntries) * 100).toFixed(2) : '0.00';
    const row = document.createElement('tr');
    row.innerHTML = `<td><strong>${item.id}</strong></td><td>${item.text}</td><td>${item.count}</td><td>${percentage}%</td>`;
    tbody.appendChild(row);
  });

  tfoot.innerHTML = `<tr style="background: var(--color-bg-3); font-weight: bold;"><td colspan="2" style="text-align: right;">SOMA TOTAL:</td><td>${totalGlobalEntries}</td><td>100.00%</td></tr>`;
}
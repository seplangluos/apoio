// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo
// Versão integrada com Firebase Realtime Database - SEM MODO DEMO

// ===== CONFIGURAÇÃO FIREBASE =====
// IMPORTANTE: Substitua os valores abaixo pela sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUUXFPi2qbowPjx63YBYQWyZNXKfxz7u0",
  authDomain: "gluos-apoio.firebaseapp.com",
  databaseURL: "https://gluos-apoio-default-rtdb.firebaseio.com",
  projectId: "gluos-apoio",
  storageBucket: "gluos-apoio.firebasestorage.app",
  messagingSenderId: "200346424322",
  appId: "1:200346424322:web:d359faf0c8582c58c0031b"
};

// ===== CONFIGURAÇÃO DE DEBUG =====
const DEBUG_MODE = true;
function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[GLUOS] ${message}`, data || '');
    }
}

// ===== DADOS ESTÁTICOS DA APLICAÇÃO =====
const GLUOS_DATA = {
    usuarios: ["Eduardo", "Wendel", "Júlia", "Tati", "Sônia", "Rita", "Mara", "Admin"],
    assuntos: [
        {id: 1, texto: "Separar e Preparar os Processos Agendados no Dia"},
        {id: 2, texto: "Inserção de Avisos de Vistoria na E&L"},
        {id: 3, texto: "Arquivamento de Processos"},
        {id: 4, texto: "Solicitação de Desarquivamento"},
        {id: 5, texto: "Atendimento ao Contribuinte"},
        {id: 6, texto: "Agendamento de Contribuinte"},
        {id: 7, texto: "Atendimento ao Telefone"},
        {id: 8, texto: "Apoio aos Arquitetos/Engenheiros"},
        {id: 9, texto: "Envio de E-mail para o Arquitetos/Engenheiros"},
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
        {id: 22, texto: "Protocolo de informação Básica"},
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
        {id: 37, texto: "Encaminhamento de Processo para Análise de Indeferimento"},
        {id: 38, texto: "Estudo de Viabilidade Urbanística"},
        {id: 39, texto: "Envio de e-mail para Contadores"},
        {id: 40, texto: "Análise de Matrícula para Sala Mineira"},
        {id: 41, texto: "Indeferimento de Processo"},
        {id: 42, texto: "Requisição de Veículo"},
        {id: 43, texto: "Encaminhamento de Processo a Outros Setores"},
        {id: 44, texto: "Montagem de Processo Novo"}
    ]
};

// ===== ESTADO DA APLICAÇÃO =====
let firebaseApp = null;
let database = null;
let isFirebaseInitialized = false;
let isFirebaseConfigured = false;
let currentUser = null;
let allEntries = [];
let userPasswords = {};
let entriesListener = null;
let passwordsListener = null;
let currentEditingEntry = null;

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    debugLog('🚀 GLUOS iniciando - Sistema carregado');
    
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        initializeSystem();
    }, 200);
});

async function initializeSystem() {
    try {
        debugLog('🔧 Inicializando sistema...');
        
        updateFirebaseStatus('warning', 'Verificando configuração...');
        
        // Verificar configuração Firebase
        checkFirebaseConfiguration();
        
        if (isFirebaseConfigured) {
            debugLog('🔥 Firebase configurado - inicializando...');
            await initializeFirebase();
        } else {
            updateFirebaseStatus('error', 'Configure Firebase no app.js');
            debugLog('❌ Firebase não configurado - usando dados locais');
        }
        
        // Inicializar interface
        initializeUI();
        
        // IMPORTANTE: Configurar event listeners depois da UI
        setTimeout(() => {
            setupEventListeners();
        }, 100);
        
        // Inicializar relógio
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        debugLog('✅ Sistema GLUOS inicializado completamente');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        updateFirebaseStatus('error', 'Erro de inicialização');
    }
}

// ===== VERIFICAR CONFIGURAÇÃO FIREBASE =====
function checkFirebaseConfiguration() {
    isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                          firebaseConfig.databaseURL !== "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/";
    
    debugLog('🔧 Configuração Firebase:', { 
        configured: isFirebaseConfigured,
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
        database: firebaseConfig.databaseURL.substring(0, 30) + '...'
    });
}

// ===== INICIALIZAÇÃO FIREBASE =====
async function initializeFirebase() {
    if (!isFirebaseConfigured) return;
    
    try {
        debugLog('🔥 Inicializando Firebase...');
        updateFirebaseStatus('warning', 'Conectando ao Firebase...');
        
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { 
            getDatabase, 
            ref, 
            set, 
            get, 
            push, 
            onValue, 
            off,
            remove,
            update,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        // Store Firebase functions globally
        window.firebaseFunctions = {
            getDatabase, ref, set, get, push, onValue, off, remove, update, serverTimestamp
        };
        
        // Initialize Firebase
        firebaseApp = initializeApp(firebaseConfig);
        database = getDatabase(firebaseApp);
        
        // Test connection
        const testRef = ref(database, '.info/connected');
        onValue(testRef, (snapshot) => {
            if (snapshot.val() === true) {
                isFirebaseInitialized = true;
                updateFirebaseStatus('success', 'Conectado ao Firebase');
                debugLog('✅ Firebase conectado com sucesso');
                
                // Load data and setup listeners
                loadFirebaseData();
                setupRealtimeListeners();
            } else {
                updateFirebaseStatus('error', 'Firebase desconectado');
                debugLog('❌ Firebase desconectado');
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        updateFirebaseStatus('error', 'Erro de conexão');
        isFirebaseInitialized = false;
    }
}

// ===== CARREGAMENTO DE DADOS DO FIREBASE =====
async function loadFirebaseData() {
    if (!isFirebaseInitialized) return;
    
    try {
        debugLog('📥 Carregando dados do Firebase...');
        
        const { ref, get } = window.firebaseFunctions;
        
        // Carregar entradas
        const entriesRef = ref(database, 'gluos_entries');
        const entriesSnapshot = await get(entriesRef);
        
        if (entriesSnapshot.exists()) {
            const entriesData = entriesSnapshot.val();
            allEntries = Object.keys(entriesData).map(key => ({
                ...entriesData[key],
                firebaseKey: key
            })).sort((a, b) => b.timestamp - a.timestamp);
            
            debugLog(`📊 ${allEntries.length} entradas carregadas do Firebase`);
        } else {
            allEntries = [];
            debugLog('📊 Nenhuma entrada encontrada no Firebase');
        }
        
        // Carregar senhas
        const passwordsRef = ref(database, 'gluos_passwords');
        const passwordsSnapshot = await get(passwordsRef);
        
        if (passwordsSnapshot.exists()) {
            userPasswords = passwordsSnapshot.val();
            debugLog(`🔐 Senhas carregadas:`, Object.keys(userPasswords));
        } else {
            userPasswords = {};
            debugLog('🔐 Nenhuma senha personalizada encontrada');
        }
        
        updateLastSync();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados do Firebase', 'error');
    }
}

// ===== LISTENERS EM TEMPO REAL =====
function setupRealtimeListeners() {
    if (!isFirebaseInitialized) return;
    
    try {
        debugLog('🔄 Configurando listeners em tempo real...');
        const { ref, onValue } = window.firebaseFunctions;
        
        // Listener para entradas
        const entriesRef = ref(database, 'gluos_entries');
        entriesListener = onValue(entriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const entriesData = snapshot.val();
                const newEntries = Object.keys(entriesData).map(key => ({
                    ...entriesData[key],
                    firebaseKey: key
                })).sort((a, b) => b.timestamp - a.timestamp);
                
                if (newEntries.length !== allEntries.length || 
                    JSON.stringify(newEntries) !== JSON.stringify(allEntries)) {
                    allEntries = newEntries;
                    debugLog(`🔄 Entradas atualizadas em tempo real: ${allEntries.length}`);
                    refreshCurrentView();
                    updateLastSync();
                }
            }
        });
        
        // Listener para senhas
        const passwordsRef = ref(database, 'gluos_passwords');
        passwordsListener = onValue(passwordsRef, (snapshot) => {
            if (snapshot.exists()) {
                userPasswords = snapshot.val();
                debugLog('🔄 Senhas atualizadas em tempo real');
            }
        });
        
        debugLog('✅ Listeners em tempo real configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar listeners:', error);
    }
}

// ===== INICIALIZAÇÃO DA UI =====
function initializeUI() {
    debugLog('🎨 Inicializando interface...');
    
    populateSubjectSelects();
    populateFilterSelects();
    showScreen('login');
    
    debugLog('🎨 Interface inicializada');
}

// ===== POPULAR SELECTS =====
function populateSubjectSelects() {
    // Select principal
    const subjectSelect = document.getElementById('subject-select');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">-- Selecione o assunto --</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            subjectSelect.appendChild(option);
        });
        debugLog('📝 Select de assuntos populado');
    }
    
    // Select de edição
    const editSubjectSelect = document.getElementById('edit-subject-select');
    if (editSubjectSelect) {
        editSubjectSelect.innerHTML = '<option value="">-- Selecione o assunto --</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            editSubjectSelect.appendChild(option);
        });
        debugLog('✏️ Select de edição de assuntos populado');
    }
}

function populateFilterSelects() {
    // Filtro por servidor
    const serverSelect = document.getElementById('filter-server');
    if (serverSelect) {
        serverSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            serverSelect.appendChild(option);
        });
        debugLog('🔽 Filtro de servidor populado');
    }
    
    // Filtro por assunto
    const subjectSelect = document.getElementById('filter-subject');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            subjectSelect.appendChild(option);
        });
        debugLog('🔽 Filtro de assunto populado');
    }
}

// ===== STATUS DO FIREBASE =====
function updateFirebaseStatus(status, message) {
    const indicator = document.getElementById('firebase-indicator');
    const statusText = document.getElementById('firebase-status-text');
    
    if (indicator && statusText) {
        indicator.className = 'status-indicator';
        
        switch(status) {
            case 'success':
                indicator.classList.add('status-indicator--success');
                break;
            case 'error':
                indicator.classList.add('status-indicator--error');
                break;
            case 'warning':
                indicator.classList.add('status-indicator--warning');
                break;
            default:
                indicator.classList.add('status-indicator--info');
        }
        
        statusText.textContent = message;
    }
    
    // Update sync status no dashboard
    const syncIndicator = document.getElementById('sync-indicator');
    const syncText = document.getElementById('sync-status-text');
    
    if (syncIndicator && syncText) {
        syncIndicator.className = 'status-indicator';
        
        if (isFirebaseInitialized) {
            syncIndicator.classList.add('status-indicator--success');
            syncText.textContent = 'Firebase Conectado';
        } else {
            syncIndicator.classList.add('status-indicator--error');
            syncText.textContent = 'Firebase Desconectado';
        }
    }
}

// ===== EVENT LISTENERS - CORRIGIDO =====
function setupEventListeners() {
    debugLog('🔧 Configurando event listeners...');
    
    // Login Form - PRIORIDADE MÁXIMA
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    
    if (loginForm) {
        // Remover listeners existentes para evitar duplicação
        loginForm.removeEventListener('submit', handleLogin);
        loginForm.addEventListener('submit', handleLogin);
        debugLog('✅ Login form listener configurado');
    }
    
    if (loginBtn) {
        loginBtn.removeEventListener('click', handleLoginClick);
        loginBtn.addEventListener('click', handleLoginClick);
        debugLog('✅ Login button listener configurado');
    }
    
    // Testar se os elementos estão funcionais
    if (userSelect) {
        userSelect.addEventListener('change', function() {
            debugLog('👤 Usuário selecionado:', this.value);
        });
        debugLog('✅ User select listener configurado');
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            debugLog('🔐 Senha digitada, length:', this.value.length);
        });
        debugLog('✅ Password input listener configurado');
    }
    
    // Outros listeners
    setupNavigationListeners();
    setupFormListeners();
    setupModalListeners();
    
    debugLog('✅ Todos os event listeners configurados');
}

// ===== HANDLER DE LOGIN - CORRIGIDO =====
function handleLoginClick(e) {
    e.preventDefault();
    debugLog('🖱️ Login button clicked');
    performLogin();
}

function handleLogin(e) {
    e.preventDefault();
    debugLog('📝 Login form submitted');
    performLogin();
}

function performLogin() {
    debugLog('🔐 Executando login...');
    
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (!userSelect || !passwordInput) {
        debugLog('❌ Elementos de login não encontrados');
        return;
    }
    
    const user = userSelect.value.trim();
    const password = passwordInput.value.trim();
    
    debugLog('📊 Dados do login:', { user, passwordLength: password.length });
    
    // Clear previous errors
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Validações
    if (!user) {
        showLoginError('Por favor, selecione um usuário.');
        return;
    }
    
    if (!password) {
        showLoginError('Por favor, digite a senha.');
        return;
    }
    
    // Check password
    const expectedPassword = getUserPassword(user);
    debugLog('🔐 Verificação de senha:', { entered: password, expected: expectedPassword });
    
    if (password !== expectedPassword) {
        showLoginError('Senha incorreta. Tente novamente.');
        return;
    }
    
    // Login successful
    currentUser = user;
    configureUserInterface(user);
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Usuário: ${currentUser}`;
    }
    
    // Clear form
    if (userSelect) userSelect.value = '';
    if (passwordInput) passwordInput.value = '';
    
    showScreen('dashboard');
    debugLog(`✅ Login realizado com sucesso: ${user}`);
}

function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }
    debugLog('⚠️ Erro de login:', message);
}

function configureUserInterface(user) {
    const newEntryBtn = document.getElementById('new-entry-btn');
    const personalReportBtn = document.getElementById('personal-report-btn');
    
    if (user === 'Admin') {
        // Admin: sem Nova Entrada, sem Relatório Pessoal
        if (newEntryBtn) newEntryBtn.style.display = 'none';
        if (personalReportBtn) personalReportBtn.classList.add('hidden');
        debugLog('👑 Interface Admin configurada');
    } else {
        // Usuários: com Nova Entrada e Relatório Pessoal
        if (newEntryBtn) newEntryBtn.style.display = 'inline-flex';
        if (personalReportBtn) personalReportBtn.classList.remove('hidden');
        debugLog('👤 Interface usuário configurada');
    }
}

// ===== NAVIGATION LISTENERS =====
function setupNavigationListeners() {
    const navButtons = {
        'logout-btn': handleLogout,
        'new-entry-btn': () => showScreen('new-entry'),
        'personal-report-btn': () => showScreen('personal-report'),
        'search-btn': () => showScreen('search'),
        'database-btn': () => { showScreen('database'); loadDatabaseTable(); },
        'profile-btn': showProfileModal,
        'back-to-dashboard-1': () => showScreen('dashboard'),
        'back-to-dashboard-2': () => showScreen('dashboard'),
        'back-to-dashboard-3': () => showScreen('dashboard'),
        'back-to-dashboard-4': () => showScreen('dashboard')
    };
    
    Object.keys(navButtons).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', navButtons[id]);
        }
    });
    
    debugLog('🧭 Navigation listeners configurados');
}

function setupFormListeners() {
    // Nova entrada
    const newEntryForm = document.getElementById('new-entry-form');
    if (newEntryForm) {
        newEntryForm.addEventListener('submit', handleNewEntry);
    }
    
    // Pesquisa
    const searchSubmit = document.getElementById('search-submit');
    if (searchSubmit) {
        searchSubmit.addEventListener('click', handleSearch);
    }
    
    // Relatório pessoal
    const generateReport = document.getElementById('generate-personal-report');
    if (generateReport) {
        generateReport.addEventListener('click', handleGeneratePersonalReport);
    }
    
    // Filtros
    const applyFilters = document.getElementById('apply-filters');
    const clearFilters = document.getElementById('clear-filters');
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyDatabaseFilters);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearDatabaseFilters);
    }
    
    debugLog('📋 Form listeners configurados');
}

function setupModalListeners() {
    // Success modal
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    // Profile modal
    const passwordForm = document.getElementById('password-change-form');
    const cancelProfile = document.getElementById('cancel-profile');
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    if (cancelProfile) {
        cancelProfile.addEventListener('click', hideProfileModal);
    }
    
    // Edit modal
    const saveEdit = document.getElementById('save-edit-btn');
    const cancelEdit = document.getElementById('cancel-edit-btn');
    
    if (saveEdit) {
        saveEdit.addEventListener('click', handleSaveEdit);
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', hideEditModal);
    }
    
    // Delete modal
    const confirmDelete = document.getElementById('confirm-delete-btn');
    const cancelDelete = document.getElementById('cancel-delete-btn');
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', handleConfirmDelete);
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', hideDeleteModal);
    }
    
    debugLog('🪟 Modal listeners configurados');
}

// ===== GERENCIAMENTO DE TELAS =====
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        debugLog(`📱 Tela ativa: ${screenName}`);
    }
}

// ===== GERENCIAMENTO DE SENHAS =====
function getUserPassword(username) {
    return userPasswords[username] || '123';
}

async function setUserPassword(username, password) {
    userPasswords[username] = password;
    
    if (isFirebaseInitialized) {
        try {
            const { ref, set } = window.firebaseFunctions;
            const passwordRef = ref(database, `gluos_passwords/${username}`);
            await set(passwordRef, password);
            debugLog(`🔐 Senha atualizada no Firebase: ${username}`);
        } catch (error) {
            console.error('❌ Erro ao salvar senha:', error);
        }
    }
}

// ===== NOVA ENTRADA =====
async function handleNewEntry(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser === 'Admin') {
        showToast('Você não tem permissão para criar entradas', 'error');
        return;
    }
    
    const processNumber = document.getElementById('process-number').value.trim();
    const ctm = document.getElementById('ctm').value.trim();
    const contributor = document.getElementById('contributor').value.trim();
    const subjectId = document.getElementById('subject-select').value;
    const observation = document.getElementById('observation').value.trim();
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    setButtonLoading('save-entry-btn', true);
    
    try {
        const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
        if (!subject) throw new Error('Assunto não encontrado');
        
        const now = new Date();
        const entry = {
            id: Date.now(),
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            server: currentUser,
            processNumber,
            ctm,
            contributor,
            subjectId: parseInt(subjectId),
            subjectText: subject.texto,
            observation: observation || '',
            timestamp: now.getTime()
        };
        
        if (isFirebaseInitialized) {
            const { ref, push } = window.firebaseFunctions;
            const entriesRef = ref(database, 'gluos_entries');
            await push(entriesRef, entry);
            debugLog('💾 Entrada salva no Firebase');
        } else {
            // Adicionar localmente se Firebase não disponível
            allEntries.unshift(entry);
            debugLog('💾 Entrada salva localmente');
        }
        
        showSuccessModal('Entrada salva com sucesso!');
        document.getElementById('new-entry-form').reset();
        
    } catch (error) {
        console.error('❌ Erro ao salvar entrada:', error);
        showToast('Erro ao salvar entrada', 'error');
    } finally {
        setButtonLoading('save-entry-btn', false);
    }
}

// ===== RELATÓRIO PESSOAL =====
function handleGeneratePersonalReport() {
    if (!currentUser || currentUser === 'Admin') {
        showToast('Funcionalidade não disponível para este usuário', 'error');
        return;
    }
    
    const startDate = document.getElementById('report-date-start').value;
    const endDate = document.getElementById('report-date-end').value;
    
    if (!startDate || !endDate) {
        showToast('Selecione as datas inicial e final', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showToast('Data inicial não pode ser posterior à final', 'error');
        return;
    }
    
    setButtonLoading('generate-personal-report', true);
    
    setTimeout(() => {
        try {
            generatePersonalReport(startDate, endDate);
        } finally {
            setButtonLoading('generate-personal-report', false);
        }
    }, 300);
}

function generatePersonalReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const userEntries = allEntries.filter(entry => {
        if (entry.server !== currentUser) return false;
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
    });
    
    const subjectCounts = {};
    let totalEntries = 0;
    
    userEntries.forEach(entry => {
        const subjectId = entry.subjectId;
        const subjectText = entry.subjectText;
        
        if (!subjectCounts[subjectId]) {
            subjectCounts[subjectId] = {
                id: subjectId,
                text: subjectText,
                count: 0
            };
        }
        
        subjectCounts[subjectId].count++;
        totalEntries++;
    });
    
    const reportData = Object.values(subjectCounts).sort((a, b) => b.count - a.count);
    displayPersonalReport(reportData, totalEntries, startDate, endDate);
}

function displayPersonalReport(data, totalEntries, startDate, endDate) {
    const resultsContainer = document.getElementById('personal-report-results');
    const tableBody = document.querySelector('#personal-report-table tbody');
    const reportPeriod = document.getElementById('report-period');
    const reportUser = document.getElementById('report-user');
    
    if (!resultsContainer || !tableBody) return;
    
    if (reportPeriod) {
        const start = new Date(startDate).toLocaleDateString('pt-BR');
        const end = new Date(endDate).toLocaleDateString('pt-BR');
        reportPeriod.textContent = `Período: ${start} a ${end}`;
    }
    
    if (reportUser) {
        reportUser.textContent = `Servidor: ${currentUser}`;
    }
    
    tableBody.innerHTML = '';
    
    if (totalEntries === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    Nenhum registro encontrado para o período selecionado.
                </td>
            </tr>
        `;
    } else {
        data.forEach(item => {
            const percentage = ((item.count / totalEntries) * 100).toFixed(2);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.text}</td>
                <td style="text-align: center;">${item.count}</td>
                <td style="text-align: center;">${percentage}%</td>
            `;
            tableBody.appendChild(row);
        });
        
        const totalRow = document.createElement('tr');
        totalRow.className = 'report-total-row';
        totalRow.innerHTML = `
            <td><strong>TOTAL GERAL</strong></td>
            <td style="text-align: center;"><strong>${totalEntries}</strong></td>
            <td style="text-align: center;"><strong>100,00%</strong></td>
        `;
        tableBody.appendChild(totalRow);
    }
    
    resultsContainer.classList.remove('hidden');
    debugLog(`📊 Relatório gerado: ${totalEntries} entradas`);
}

// ===== PESQUISA =====
function handleSearch() {
    const processNumber = document.getElementById('search-process').value.trim();
    
    if (!processNumber) {
        showToast('Digite um número de processo', 'error');
        return;
    }
    
    setButtonLoading('search-submit', true);
    
    setTimeout(() => {
        try {
            const results = allEntries.filter(entry => 
                entry.processNumber.toLowerCase().includes(processNumber.toLowerCase())
            );
            displaySearchResults(results, processNumber);
        } finally {
            setButtonLoading('search-submit', false);
        }
    }, 300);
}

function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    const tableBody = document.querySelector('#search-table tbody');
    
    if (!resultsContainer || !tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (results.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Nenhum resultado encontrado para "${searchTerm}".
                </td>
            </tr>
        `;
    } else {
        results.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.time}</td>
                <td>${entry.server}</td>
                <td>${entry.subjectText}</td>
                <td>${entry.ctm}</td>
                <td>${entry.contributor}</td>
                <td>${entry.observation || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    resultsContainer.classList.remove('hidden');
    debugLog(`🔍 Pesquisa: ${results.length} resultados`);
}

// ===== BASE DE DADOS =====
function loadDatabaseTable(filteredEntries = null) {
    const entries = filteredEntries || allEntries;
    const tableBody = document.querySelector('#database-table tbody');
    const totalRecords = document.getElementById('total-records');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (totalRecords) {
        totalRecords.textContent = `${entries.length} registro(s)`;
    }
    
    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        
        const canEditDelete = currentUser && 
                             entry.server === currentUser && 
                             currentUser !== 'Admin';
        
        let actionsHtml = '';
        if (canEditDelete) {
            const entryKey = entry.firebaseKey || entry.id;
            actionsHtml = `
                <div class="action-buttons">
                    <button type="button" class="btn btn--small btn--edit" onclick="editEntry('${entryKey}')">
                        Editar
                    </button>
                    <button type="button" class="btn btn--small btn--delete" onclick="deleteEntry('${entryKey}')">
                        Excluir
                    </button>
                </div>
            `;
        } else {
            actionsHtml = '<span style="color: var(--color-text-secondary);">-</span>';
        }
        
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.time}</td>
            <td>${entry.server}</td>
            <td>${entry.processNumber}</td>
            <td>${entry.ctm}</td>
            <td>${entry.contributor}</td>
            <td>${entry.subjectText}</td>
            <td>${entry.observation || '-'}</td>
            <td>${actionsHtml}</td>
        `;
        tableBody.appendChild(row);
    });
    
    debugLog(`📋 Tabela carregada: ${entries.length} registros`);
}

// ===== FUNÇÕES GLOBAIS DE EDIÇÃO/EXCLUSÃO =====
window.editEntry = function(entryId) {
    const entry = allEntries.find(e => (e.firebaseKey || e.id.toString()) === entryId.toString());
    if (!entry) {
        showToast('Entrada não encontrada', 'error');
        return;
    }
    
    if (!currentUser || entry.server !== currentUser || currentUser === 'Admin') {
        showToast('Sem permissão para editar', 'error');
        return;
    }
    
    currentEditingEntry = entry;
    
    document.getElementById('edit-entry-id').value = entryId;
    document.getElementById('edit-process-number').value = entry.processNumber;
    document.getElementById('edit-ctm').value = entry.ctm;
    document.getElementById('edit-contributor').value = entry.contributor;
    document.getElementById('edit-subject-select').value = entry.subjectId;
    document.getElementById('edit-observation').value = entry.observation || '';
    
    const editError = document.getElementById('edit-error');
    if (editError) {
        editError.classList.add('hidden');
    }
    
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.remove('hidden');
    }
};

window.deleteEntry = function(entryId) {
    const entry = allEntries.find(e => (e.firebaseKey || e.id.toString()) === entryId.toString());
    if (!entry) {
        showToast('Entrada não encontrada', 'error');
        return;
    }
    
    if (!currentUser || entry.server !== currentUser || currentUser === 'Admin') {
        showToast('Sem permissão para excluir', 'error');
        return;
    }
    
    document.getElementById('delete-process-info').textContent = entry.processNumber;
    document.getElementById('delete-subject-info').textContent = entry.subjectText;
    document.getElementById('confirm-delete-btn').setAttribute('data-entry-id', entryId);
    
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
    }
};

// ===== SALVAR EDIÇÃO =====
async function handleSaveEdit() {
    if (!currentEditingEntry) return;
    
    const processNumber = document.getElementById('edit-process-number').value.trim();
    const ctm = document.getElementById('edit-ctm').value.trim();
    const contributor = document.getElementById('edit-contributor').value.trim();
    const subjectId = document.getElementById('edit-subject-select').value;
    const observation = document.getElementById('edit-observation').value.trim();
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        const editError = document.getElementById('edit-error');
        if (editError) {
            editError.textContent = 'Preencha todos os campos obrigatórios.';
            editError.classList.remove('hidden');
        }
        return;
    }
    
    setButtonLoading('save-edit-btn', true);
    
    try {
        const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
        if (!subject) throw new Error('Assunto não encontrado');
        
        const updateData = {
            processNumber,
            ctm,
            contributor,
            subjectId: parseInt(subjectId),
            subjectText: subject.texto,
            observation
        };
        
        if (isFirebaseInitialized && currentEditingEntry.firebaseKey) {
            const { ref, update } = window.firebaseFunctions;
            const entryRef = ref(database, `gluos_entries/${currentEditingEntry.firebaseKey}`);
            await update(entryRef, updateData);
            debugLog('✏️ Entrada atualizada no Firebase');
        } else {
            // Update local entry
            const entryIndex = allEntries.findIndex(e => e.id === currentEditingEntry.id);
            if (entryIndex !== -1) {
                allEntries[entryIndex] = { ...allEntries[entryIndex], ...updateData };
            }
            debugLog('✏️ Entrada atualizada localmente');
        }
        
        hideEditModal();
        showSuccessModal('Entrada atualizada com sucesso!');
        loadDatabaseTable();
        
    } catch (error) {
        console.error('❌ Erro ao atualizar entrada:', error);
        const editError = document.getElementById('edit-error');
        if (editError) {
            editError.textContent = 'Erro ao atualizar entrada.';
            editError.classList.remove('hidden');
        }
    } finally {
        setButtonLoading('save-edit-btn', false);
    }
}

// ===== CONFIRMAR EXCLUSÃO =====
async function handleConfirmDelete() {
    const deleteBtn = document.getElementById('confirm-delete-btn');
    const entryId = deleteBtn.getAttribute('data-entry-id');
    
    if (!entryId) return;
    
    setButtonLoading('confirm-delete-btn', true);
    
    try {
        const entry = allEntries.find(e => 
            (e.firebaseKey || e.id.toString()) === entryId.toString()
        );
        
        if (!entry) throw new Error('Entrada não encontrada');
        
        if (isFirebaseInitialized && entry.firebaseKey) {
            const { ref, remove } = window.firebaseFunctions;
            const entryRef = ref(database, `gluos_entries/${entry.firebaseKey}`);
            await remove(entryRef);
            debugLog('🗑️ Entrada excluída do Firebase');
        } else {
            // Remove local entry
            const entryIndex = allEntries.findIndex(e => e.id === entry.id);
            if (entryIndex !== -1) {
                allEntries.splice(entryIndex, 1);
            }
            debugLog('🗑️ Entrada excluída localmente');
        }
        
        hideDeleteModal();
        showSuccessModal('Entrada excluída com sucesso!');
        loadDatabaseTable();
        
    } catch (error) {
        console.error('❌ Erro ao excluir entrada:', error);
        showToast('Erro ao excluir entrada', 'error');
    } finally {
        setButtonLoading('confirm-delete-btn', false);
    }
}

// ===== FILTROS =====
function applyDatabaseFilters() {
    const serverFilter = document.getElementById('filter-server').value;
    const dateFilter = document.getElementById('filter-date').value;
    const subjectFilter = document.getElementById('filter-subject').value;
    
    let filteredEntries = allEntries;
    
    if (serverFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.server === serverFilter);
    }
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter).toLocaleDateString('pt-BR');
        filteredEntries = filteredEntries.filter(entry => entry.date === filterDate);
    }
    
    if (subjectFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.subjectId === parseInt(subjectFilter));
    }
    
    loadDatabaseTable(filteredEntries);
    debugLog(`🔽 Filtros aplicados: ${filteredEntries.length} registros`);
}

function clearDatabaseFilters() {
    document.getElementById('filter-server').value = '';
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-subject').value = '';
    loadDatabaseTable();
    debugLog('🔽 Filtros limpos');
}

// ===== PERFIL DO USUÁRIO =====
function showProfileModal() {
    if (!currentUser) return;
    
    const profileModal = document.getElementById('profile-modal');
    const profileUsername = document.getElementById('profile-username');
    const passwordError = document.getElementById('password-error');
    
    if (profileUsername) {
        profileUsername.textContent = currentUser;
    }
    
    if (passwordError) {
        passwordError.classList.add('hidden');
    }
    
    const form = document.getElementById('password-change-form');
    if (form) {
        form.reset();
    }
    
    if (profileModal) {
        profileModal.classList.remove('hidden');
    }
}

function hideProfileModal() {
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
        profileModal.classList.add('hidden');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    const passwordError = document.getElementById('password-error');
    if (passwordError) {
        passwordError.classList.add('hidden');
    }
    
    setButtonLoading('password-change-form', true);
    
    try {
        const userCurrentPassword = getUserPassword(currentUser);
        
        if (currentPassword !== userCurrentPassword) {
            throw new Error('Senha atual incorreta.');
        }
        
        if (newPassword.length < 3) {
            throw new Error('Nova senha deve ter pelo menos 3 caracteres.');
        }
        
        if (newPassword !== confirmPassword) {
            throw new Error('Nova senha e confirmação não coincidem.');
        }
        
        if (newPassword === currentPassword) {
            throw new Error('Nova senha deve ser diferente da atual.');
        }
        
        await setUserPassword(currentUser, newPassword);
        hideProfileModal();
        showSuccessModal('Senha alterada com sucesso!');
        debugLog(`🔐 Senha alterada: ${currentUser}`);
        
    } catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        if (passwordError) {
            passwordError.textContent = error.message;
            passwordError.classList.remove('hidden');
        }
    } finally {
        setButtonLoading('password-change-form', false);
    }
}

// ===== UTILITÁRIOS =====
function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast--${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');
    
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function hideEditModal() {
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.add('hidden');
    }
    currentEditingEntry = null;
}

function hideDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.classList.add('hidden');
    }
}

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const datetimeInfo = document.getElementById('datetime-info');
    if (datetimeInfo) {
        datetimeInfo.textContent = dateTimeString;
    }
}

function updateLastSync() {
    const lastSyncElement = document.getElementById('last-sync');
    if (lastSyncElement) {
        const now = new Date();
        lastSyncElement.textContent = `Última sincronização: ${now.toLocaleTimeString('pt-BR')}`;
    }
}

function refreshCurrentView() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;
    
    const screenId = currentScreen.id;
    
    if (screenId === 'database-screen') {
        loadDatabaseTable();
    } else if (screenId === 'search-screen') {
        const searchInput = document.getElementById('search-process');
        if (searchInput && searchInput.value.trim()) {
            handleSearch();
        }
    }
}

function handleLogout() {
    currentUser = null;
    currentEditingEntry = null;
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = 'Bem-vindo!';
    }
    
    showScreen('login');
    debugLog('👋 Logout realizado');
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (entriesListener && window.firebaseFunctions) {
        const { ref, off } = window.firebaseFunctions;
        off(ref(database, 'gluos_entries'), 'value', entriesListener);
    }
    if (passwordsListener && window.firebaseFunctions) {
        const { ref, off } = window.firebaseFunctions;
        off(ref(database, 'gluos_passwords'), 'value', passwordsListener);
    }
});

debugLog('🚀 GLUOS JavaScript carregado - Firebase Integration Ready');
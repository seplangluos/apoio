// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo
// Versão integrada com Firebase Realtime Database

// ===== CONFIGURAÇÃO FIREBASE =====
// INSTRUÇÃO: Substitua os valores abaixo pela sua configuração do Firebase
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
        console.log(`[GLUOS DEBUG] ${message}`, data || '');
    }
}

// ===== DADOS DA APLICAÇÃO =====
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
let isOnline = true;
let currentUser = null;
let allEntries = [];
let userPasswords = {};
let entriesListener = null;
let passwordsListener = null;

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM loaded, starting GLUOS Firebase initialization');
    
    setTimeout(() => {
        try {
            checkFirebaseConfiguration();
            
            if (isFirebaseConfigured) {
                initializeFirebase();
            } else {
                debugLog('Firebase not configured - using localStorage mode');
                updateFirebaseStatus('warning', 'Configure Firebase no código');
            }
            
            initializeApp();
            setupEventListeners();
            loadData();
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            debugLog('GLUOS system fully initialized successfully');
            
        } catch (error) {
            console.error('Error during initialization:', error);
            updateFirebaseStatus('error', 'Erro na inicialização');
        }
    }, 200);
});

// ===== VERIFICAR CONFIGURAÇÃO FIREBASE =====
function checkFirebaseConfiguration() {
    isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                          firebaseConfig.databaseURL !== "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/";
    
    debugLog('Firebase configuration check:', { 
        configured: isFirebaseConfigured,
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
        databaseURL: firebaseConfig.databaseURL.substring(0, 30) + '...'
    });
}

// ===== INICIALIZAÇÃO FIREBASE =====
async function initializeFirebase() {
    if (!isFirebaseConfigured) {
        debugLog('Firebase not configured - skipping initialization');
        return;
    }
    
    debugLog('Initializing Firebase...');
    updateFirebaseStatus('warning', 'Conectando...');
    
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { 
            getDatabase, 
            ref, 
            set, 
            get, 
            push, 
            onValue, 
            off,
            serverTimestamp,
            goOffline,
            goOnline
        } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        window.firebaseFunctions = {
            getDatabase, ref, set, get, push, onValue, off, serverTimestamp, goOffline, goOnline
        };
        
        firebaseApp = initializeApp(firebaseConfig);
        database = getDatabase(firebaseApp);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        isFirebaseInitialized = true;
        updateFirebaseStatus('success', 'Conectado ao Firebase');
        
        debugLog('Firebase initialized successfully');
        
        setTimeout(() => {
            loadFirebaseData();
            setupRealtimeListeners();
        }, 1000);
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        isFirebaseInitialized = false;
        updateFirebaseStatus('error', 'Erro de conexão Firebase');
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
function initializeApp() {
    debugLog('Starting app initialization');
    
    try {
        setTimeout(() => {
            populateSubjectSelect();
            populateFilterSelects();
            debugLog('Selects populated successfully');
        }, 100);
        
        showScreen('login');
        debugLog('App initialization completed successfully');
    } catch (error) {
        console.error('Error in initializeApp:', error);
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
    
    const syncIndicator = document.getElementById('sync-indicator');
    const syncText = document.getElementById('sync-status-text');
    
    if (syncIndicator && syncText) {
        syncIndicator.className = 'status-indicator';
        
        if (isFirebaseInitialized && isOnline) {
            syncIndicator.classList.add('status-indicator--success');
            syncText.textContent = 'Sincronizado';
        } else if (!isOnline) {
            syncIndicator.classList.add('status-indicator--warning');
            syncText.textContent = 'Offline';
        } else {
            syncIndicator.classList.add('status-indicator--info');
            syncText.textContent = 'Modo Local';
        }
    }
}

// ===== GERENCIAMENTO ONLINE/OFFLINE =====
function handleOnline() {
    debugLog('Connection restored - going online');
    isOnline = true;
    updateFirebaseStatus('success', 'Conectado');
    
    if (isFirebaseInitialized && window.firebaseFunctions) {
        window.firebaseFunctions.goOnline(database);
        syncLocalData();
    }
    
    showToast('Conexão restaurada! Sincronizando dados...', 'success');
}

function handleOffline() {
    debugLog('Connection lost - going offline');
    isOnline = false;
    updateFirebaseStatus('warning', 'Offline');
    
    if (isFirebaseInitialized && window.firebaseFunctions) {
        window.firebaseFunctions.goOffline(database);
    }
    
    showToast('Sem conexão. Dados salvos localmente.', 'warning');
}

// ===== CARREGAMENTO DE DADOS =====
async function loadFirebaseData() {
    if (!isFirebaseInitialized || !window.firebaseFunctions) {
        debugLog('Firebase not initialized - loading local data');
        loadLocalData();
        return;
    }
    
    try {
        debugLog('Loading data from Firebase...');
        showLoadingOverlay(true);
        
        const { ref, get } = window.firebaseFunctions;
        
        const entriesRef = ref(database, 'gluos_entries');
        const entriesSnapshot = await get(entriesRef);
        
        if (entriesSnapshot.exists()) {
            const entriesData = entriesSnapshot.val();
            allEntries = Object.keys(entriesData)
                .map(key => ({ ...entriesData[key], firebaseKey: key }))
                .sort((a, b) => b.timestamp - a.timestamp);
            debugLog('Entries loaded from Firebase:', allEntries.length);
        } else {
            allEntries = [];
            debugLog('No entries found in Firebase');
        }
        
        const passwordsRef = ref(database, 'gluos_passwords');
        const passwordsSnapshot = await get(passwordsRef);
        
        if (passwordsSnapshot.exists()) {
            userPasswords = passwordsSnapshot.val();
            debugLog('Passwords loaded from Firebase:', Object.keys(userPasswords));
        } else {
            userPasswords = {};
            debugLog('No passwords found in Firebase');
        }
        
        saveToLocalStorage();
        savePasswordsToLocalStorage();
        
        updateLastSync();
        
    } catch (error) {
        console.error('Error loading Firebase data:', error);
        loadLocalData();
        updateFirebaseStatus('error', 'Erro ao carregar dados');
    } finally {
        showLoadingOverlay(false);
    }
}

// ===== CARREGAMENTO LOCAL =====
function loadLocalData() {
    debugLog('Loading data from localStorage');
    
    try {
        const savedEntries = localStorage.getItem('gluos_entries');
        if (savedEntries) {
            allEntries = JSON.parse(savedEntries);
            allEntries.sort((a, b) => b.timestamp - a.timestamp);
            debugLog('Entries loaded from localStorage:', allEntries.length);
        } else {
            allEntries = [];
        }
        
        const savedPasswords = localStorage.getItem('gluos_user_passwords');
        if (savedPasswords) {
            userPasswords = JSON.parse(savedPasswords);
            debugLog('Passwords loaded from localStorage:', Object.keys(userPasswords));
        } else {
            userPasswords = {};
        }
        
    } catch (error) {
        console.error('Error loading local data:', error);
        allEntries = [];
        userPasswords = {};
    }
}

function loadData() {
    if (isFirebaseInitialized) {
        loadFirebaseData();
    } else {
        loadLocalData();
    }
}

// ===== LISTENERS EM TEMPO REAL =====
function setupRealtimeListeners() {
    if (!isFirebaseInitialized || !window.firebaseFunctions) return;
    
    try {
        const { ref, onValue } = window.firebaseFunctions;
        
        const entriesRef = ref(database, 'gluos_entries');
        entriesListener = onValue(entriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const entriesData = snapshot.val();
                const newEntries = Object.keys(entriesData)
                    .map(key => ({ ...entriesData[key], firebaseKey: key }))
                    .sort((a, b) => b.timestamp - a.timestamp);
                
                if (newEntries.length !== allEntries.length) {
                    allEntries = newEntries;
                    debugLog('Entries updated from Firebase realtime:', allEntries.length);
                    
                    refreshCurrentView();
                    updateLastSync();
                    saveToLocalStorage();
                }
            }
        });
        
        const passwordsRef = ref(database, 'gluos_passwords');
        passwordsListener = onValue(passwordsRef, (snapshot) => {
            if (snapshot.exists()) {
                const newPasswords = snapshot.val();
                if (JSON.stringify(newPasswords) !== JSON.stringify(userPasswords)) {
                    userPasswords = newPasswords;
                    debugLog('Passwords updated from Firebase realtime');
                    savePasswordsToLocalStorage();
                }
            }
        });
        
        debugLog('Realtime listeners setup completed');
        
    } catch (error) {
        console.error('Error setting up realtime listeners:', error);
    }
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
    debugLog('Setting up event listeners - INÍCIO');
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    
    if (loginForm && loginBtn) {
        debugLog('Login elements found - setting up listeners');
        
        loginForm.addEventListener('submit', function(e) {
            debugLog('LOGIN FORM SUBMIT TRIGGERED!');
            e.preventDefault();
            handleLogin(e);
        });
        
        loginBtn.addEventListener('click', function(e) {
            debugLog('LOGIN BUTTON CLICKED!');
            e.preventDefault();
            handleLogin(e);
        });
        
        debugLog('Login listeners configured successfully');
    } else {
        console.error('CRITICAL: Login elements not found!');
    }
    
    setupNavigationListeners();
    setupFormListeners();
    setupModalListeners();
    
    debugLog('Event listeners setup COMPLETED successfully');
}

function setupNavigationListeners() {
    const navigationButtons = [
        { id: 'logout-btn', action: handleLogout },
        { 
            id: 'new-entry-btn', 
            action: () => {
                showScreen('new-entry');
                setTimeout(populateSubjectSelect, 100);
            }
        },
        { 
            id: 'personal-report-btn', 
            action: () => {
                showScreen('personal-report');
                setupPersonalReportDates();
            }
        },
        { id: 'search-btn', action: () => showScreen('search') },
        { id: 'database-btn', action: () => { showScreen('database'); loadDatabaseTable(); } },
        { id: 'profile-btn', action: showProfileModal },
        { id: 'back-to-dashboard-1', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-2', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-3', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-report', action: () => showScreen('dashboard') }
    ];
    
    navigationButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.action);
            debugLog(`Navigation button ${btn.id} configured`);
        }
    });
}

function setupFormListeners() {
    const newEntryForm = document.getElementById('new-entry-form');
    if (newEntryForm) {
        newEntryForm.addEventListener('submit', handleNewEntry);
    }
    
    const subjectNumber = document.getElementById('subject-number');
    const subjectSelect = document.getElementById('subject-select');
    
    if (subjectNumber) {
        subjectNumber.addEventListener('input', handleSubjectNumberChange);
    }
    
    if (subjectSelect) {
        subjectSelect.addEventListener('change', handleSubjectSelectChange);
    }
    
    const searchSubmit = document.getElementById('search-submit');
    const searchProcess = document.getElementById('search-process');
    
    if (searchSubmit) {
        searchSubmit.addEventListener('click', handleSearch);
    }
    
    if (searchProcess) {
        searchProcess.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
    
    const applyFilters = document.getElementById('apply-filters');
    const clearFilters = document.getElementById('clear-filters');
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyDatabaseFilters);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearDatabaseFilters);
    }
    
    // Relatório Pessoal
    const generateReportBtn = document.getElementById('generate-personal-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', handleGeneratePersonalReport);
    }
    
    const toggleDebug = document.getElementById('toggle-debug');
    if (toggleDebug) {
        toggleDebug.addEventListener('click', toggleDebugInfo);
    }
}

function setupModalListeners() {
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    const passwordChangeForm = document.getElementById('password-change-form');
    const cancelProfile = document.getElementById('cancel-profile');
    
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }
    
    if (cancelProfile) {
        cancelProfile.addEventListener('click', hideProfileModal);
    }
}

// ===== GERENCIAMENTO DE TELAS =====
function showScreen(screenName) {
    debugLog(`Changing to screen: ${screenName}`);
    
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        debugLog(`Screen ${screenName} is now active`);
        
        // Configurar botão Nova Entrada baseado no usuário
        if (screenName === 'dashboard') {
            updateDashboardForUser();
        }
        
        if (screenName === 'new-entry') {
            setTimeout(() => {
                populateSubjectSelect();
                debugLog('Subject select repopulated for new-entry screen');
            }, 50);
        }
    } else {
        console.error(`Screen not found: ${screenName}-screen`);
    }
}

function updateDashboardForUser() {
    const newEntryBtn = document.getElementById('new-entry-btn');
    if (newEntryBtn) {
        if (currentUser === 'Admin') {
            newEntryBtn.style.display = 'none';
            debugLog('Admin user - Nova Entrada button hidden');
        } else {
            newEntryBtn.style.display = 'flex';
            debugLog('Regular user - Nova Entrada button visible');
        }
    }
}

// ===== LOGIN - CORRIGIDO =====
function handleLogin(e) {
    debugLog('=== INÍCIO DO PROCESSO DE LOGIN ===');
    
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (!userSelect || !passwordInput) {
        console.error('CRITICAL: Login elements not found');
        showError('Erro interno: elementos de login não encontrados');
        return;
    }
    
    setButtonLoading('login-btn', true);
    
    setTimeout(() => {
        performLogin(userSelect, passwordInput, loginError);
    }, 300);
}

function performLogin(userSelect, passwordInput, loginError) {
    const user = userSelect.value.trim();
    const password = passwordInput.value.trim();
    
    debugLog('Login attempt:', {
        user: user,
        passwordLength: password.length,
        hasUser: !!user,
        hasPassword: !!password
    });
    
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    if (!user) {
        debugLog('Error: no user selected');
        showError('Por favor, selecione um usuário.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    if (!password) {
        debugLog('Error: no password entered');
        showError('Por favor, digite sua senha.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    const expectedPassword = getUserPassword(user);
    debugLog('Password check:', {
        entered: password,
        expected: expectedPassword,
        match: password === expectedPassword
    });
    
    if (password !== expectedPassword) {
        debugLog('Error: incorrect password');
        showError('Senha incorreta. Tente novamente.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    debugLog('=== LOGIN SUCCESSFUL ===', { user: user });
    
    currentUser = user;
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Usuário: ${currentUser}`;
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.reset();
    }
    
    setButtonLoading('login-btn', false);
    
    setTimeout(() => {
        showScreen('dashboard');
        debugLog('Redirected to dashboard successfully');
    }, 200);
}

// ===== GERENCIAMENTO DE SENHAS =====
function getUserPassword(username) {
    const customPassword = userPasswords[username];
    const finalPassword = customPassword || '123';
    debugLog(`Getting password for ${username}:`, { 
        hasCustom: !!customPassword, 
        using: finalPassword 
    });
    return finalPassword;
}

async function setUserPassword(username, password) {
    debugLog(`Setting new password for ${username}`);
    userPasswords[username] = password;
    
    try {
        if (isFirebaseInitialized && window.firebaseFunctions) {
            const { ref, set } = window.firebaseFunctions;
            const passwordRef = ref(database, `gluos_passwords/${username}`);
            await set(passwordRef, password);
            debugLog('Password updated successfully in Firebase');
        } else {
            debugLog('Password saved locally only (Firebase not available)');
        }
        
        savePasswordsToLocalStorage();
        
    } catch (error) {
        console.error('Error updating password:', error);
        savePasswordsToLocalStorage();
    }
}

// ===== NOVA ENTRADA =====
async function handleNewEntry(e) {
    e.preventDefault();
    debugLog('Creating new entry');
    
    if (!currentUser) {
        showError('Você precisa estar logado para criar uma nova entrada.');
        return;
    }
    
    const processNumber = document.getElementById('process-number').value.trim();
    const ctm = document.getElementById('ctm').value.trim();
    const contributor = document.getElementById('contributor').value.trim();
    const subjectId = document.getElementById('subject-select').value;
    const observation = document.getElementById('observation').value.trim();
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    setButtonLoading('save-entry-btn', true);
    
    try {
        const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
        if (!subject) {
            showError('Assunto selecionado não encontrado.');
            setButtonLoading('save-entry-btn', false);
            return;
        }
        
        const now = new Date();
        
        const entry = {
            id: Date.now(),
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            server: currentUser,
            processNumber: processNumber,
            ctm: ctm,
            contributor: contributor,
            subjectId: parseInt(subjectId),
            subjectText: subject.texto,
            observation: observation || '',
            timestamp: now.getTime()
        };
        
        allEntries.unshift(entry);
        saveToLocalStorage();
        
        if (isFirebaseInitialized && window.firebaseFunctions && isOnline) {
            try {
                const { ref, push } = window.firebaseFunctions;
                const entriesRef = ref(database, 'gluos_entries');
                await push(entriesRef, entry);
                debugLog('Entry saved to Firebase successfully');
            } catch (firebaseError) {
                console.error('Firebase save failed, but entry saved locally:', firebaseError);
                showToast('Entrada salva localmente (Firebase indisponível)', 'warning');
            }
        }
        
        showSuccessModal('Entrada salva com sucesso!');
        document.getElementById('new-entry-form').reset();
        
        debugLog('New entry saved:', entry);
        
    } catch (error) {
        console.error('Error saving entry:', error);
        showToast('Erro ao salvar entrada. Tente novamente.', 'error');
    } finally {
        setButtonLoading('save-entry-btn', false);
    }
}

// ===== RELATÓRIO PESSOAL - CORREÇÃO CRÍTICA =====
function setupPersonalReportDates() {
    debugLog('Setting up personal report dates');
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateInput = document.getElementById('report-date-start');
    const endDateInput = document.getElementById('report-date-end');
    
    if (startDateInput) {
        startDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
    }
    
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

function handleGeneratePersonalReport() {
    debugLog('=== GERANDO RELATÓRIO PESSOAL ===');
    
    if (!currentUser) {
        showError('Você precisa estar logado para gerar o relatório.');
        return;
    }
    
    const startDateInput = document.getElementById('report-date-start');
    const endDateInput = document.getElementById('report-date-end');
    
    if (!startDateInput || !endDateInput) {
        showError('Campos de data não encontrados.');
        return;
    }
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (!startDate || !endDate) {
        showError('Por favor, preencha as datas de início e fim.');
        return;
    }
    
    if (startDate > endDate) {
        showError('A data de início deve ser anterior ou igual à data de fim.');
        return;
    }
    
    setButtonLoading('generate-personal-report', true);
    
    setTimeout(() => {
        generatePersonalReport(startDate, endDate);
    }, 300);
}

function generatePersonalReport(startDate, endDate) {
    debugLog('=== INÍCIO DA GERAÇÃO DO RELATÓRIO ===');
    debugLog('Parâmetros:', { 
        usuario: currentUser, 
        dataInicio: startDate, 
        dataFim: endDate 
    });
    
    // 1. BUSCAR TODAS AS ENTRADAS DO FIREBASE
    debugLog('1. Total de entradas no Firebase:', allEntries.length);
    
    // 2. FILTRAR POR USUÁRIO
    const userEntries = allEntries.filter(entry => entry.server === currentUser);
    debugLog('2. Entradas filtradas por usuário:', userEntries.length);
    
    // 3. FILTRAR POR PERÍODO DE DATA
    const dateFilteredEntries = userEntries.filter(entry => {
        const entryDate = convertBrazilianDateToDateObject(entry.date);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Ajustar para comparar apenas datas (sem horários)
        entryDate.setHours(0, 0, 0, 0);
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(0, 0, 0, 0);
        
        const inRange = entryDate >= startDateObj && entryDate <= endDateObj;
        
        if (DEBUG_MODE) {
            console.log(`[GLUOS DEBUG] Comparação de data:`, {
                entryDate: entry.date,
                entryDateObj: entryDate.toISOString(),
                startDate: startDateObj.toISOString(),
                endDate: endDateObj.toISOString(),
                inRange: inRange
            });
        }
        
        return inRange;
    });
    
    debugLog('3. Entradas filtradas por data:', dateFilteredEntries.length);
    
    // 4. AGRUPAR POR ASSUNTO E CONTAR OCORRÊNCIAS
    const subjectCount = {};
    
    dateFilteredEntries.forEach(entry => {
        const subjectId = entry.subjectId;
        const subjectText = entry.subjectText;
        
        if (!subjectCount[subjectId]) {
            subjectCount[subjectId] = {
                id: subjectId,
                text: subjectText,
                count: 0
            };
        }
        
        subjectCount[subjectId].count++;
    });
    
    debugLog('4. Contagem por assunto:', subjectCount);
    
    // 5. CALCULAR PERCENTUAIS
    const totalEntries = dateFilteredEntries.length;
    const reportData = Object.values(subjectCount).map(subject => ({
        ...subject,
        percentage: totalEntries > 0 ? ((subject.count / totalEntries) * 100).toFixed(1) : 0
    }));
    
    // 6. ORDENAR POR TOTAL (MAIOR PARA MENOR)
    reportData.sort((a, b) => b.count - a.count);
    
    debugLog('5. Dados finais do relatório:', reportData);
    
    // 7. EXIBIR RELATÓRIO
    displayPersonalReport(reportData, totalEntries, startDate, endDate);
    
    // 8. ATUALIZAR DEBUG INFO
    updateDebugInfo(allEntries.length, userEntries.length, dateFilteredEntries.length);
    
    setButtonLoading('generate-personal-report', false);
    
    debugLog('=== RELATÓRIO GERADO COM SUCESSO ===');
}

function convertBrazilianDateToDateObject(brazilianDate) {
    // Converter data brasileira (dd/mm/yyyy) para Date object
    const parts = brazilianDate.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    
    // Se não conseguir converter, retornar data atual
    debugLog('Erro ao converter data brasileira:', brazilianDate);
    return new Date();
}

function displayPersonalReport(reportData, totalEntries, startDate, endDate) {
    debugLog('Exibindo relatório:', { reportData, totalEntries });
    
    // Atualizar informações do cabeçalho
    const reportUserName = document.getElementById('report-user-name');
    const reportPeriod = document.getElementById('report-period');
    const reportTotalEntries = document.getElementById('report-total-entries');
    
    if (reportUserName) reportUserName.textContent = currentUser;
    if (reportPeriod) reportPeriod.textContent = `${formatDateBR(startDate)} a ${formatDateBR(endDate)}`;
    if (reportTotalEntries) reportTotalEntries.textContent = totalEntries;
    
    // Atualizar tabela
    const tableBody = document.querySelector('#personal-report-table tbody');
    const grandTotalElement = document.getElementById('report-grand-total');
    
    if (!tableBody) {
        debugLog('Erro: tbody da tabela não encontrado');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (reportData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    Nenhum registro encontrado para o período selecionado.
                </td>
            </tr>
        `;
    } else {
        reportData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.text}</td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    if (grandTotalElement) {
        grandTotalElement.textContent = totalEntries;
    }
    
    // Mostrar resultados
    const resultsContainer = document.getElementById('personal-report-results');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
}

function updateDebugInfo(totalFirebase, filteredUser, filteredDate) {
    const debugTotalFirebase = document.getElementById('debug-total-firebase');
    const debugFilteredUser = document.getElementById('debug-filtered-user');
    const debugFilteredDate = document.getElementById('debug-filtered-date');
    
    if (debugTotalFirebase) debugTotalFirebase.textContent = totalFirebase;
    if (debugFilteredUser) debugFilteredUser.textContent = filteredUser;
    if (debugFilteredDate) debugFilteredDate.textContent = filteredDate;
}

function toggleDebugInfo() {
    const debugInfo = document.getElementById('report-debug-info');
    if (debugInfo) {
        debugInfo.classList.toggle('hidden');
    }
}

function formatDateBR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// ===== PESQUISA =====
function handleSearch() {
    const processNumber = document.getElementById('search-process').value.trim();
    
    if (!processNumber) {
        showError('Por favor, digite um número de processo para pesquisar.');
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
        resultsContainer.classList.remove('hidden');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Nenhum resultado encontrado para o processo "${searchTerm}".
                </td>
            </tr>
        `;
        return;
    }
    
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
    
    resultsContainer.classList.remove('hidden');
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
                <td colspan="8" class="text-center">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.time}</td>
            <td>${entry.server}</td>
            <td>${entry.processNumber}</td>
            <td>${entry.ctm}</td>
            <td>${entry.contributor}</td>
            <td>${entry.subjectText}</td>
            <td>${entry.observation || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

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
}

function clearDatabaseFilters() {
    document.getElementById('filter-server').value = '';
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-subject').value = '';
    loadDatabaseTable();
}

// ===== PERFIL DO USUÁRIO =====
function showProfileModal() {
    if (!currentUser) {
        showError('Você precisa estar logado para acessar o perfil.');
        return;
    }
    
    const profileModal = document.getElementById('profile-modal');
    const profileUsername = document.getElementById('profile-username');
    const passwordError = document.getElementById('password-error');
    
    if (profileUsername) {
        profileUsername.textContent = currentUser;
    }
    
    if (passwordError) {
        passwordError.classList.add('hidden');
        passwordError.textContent = '';
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
    debugLog('Changing user password');
    
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');
    
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
        console.error('Password change elements not found');
        return;
    }
    
    setButtonLoading('password-change-form', true);
    
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    if (passwordError) {
        passwordError.classList.add('hidden');
        passwordError.textContent = '';
    }
    
    try {
        const userCurrentPassword = getUserPassword(currentUser);
        if (currentPassword !== userCurrentPassword) {
            showPasswordError('Senha atual incorreta.');
            return;
        }
        
        if (newPassword.length < 3) {
            showPasswordError('A nova senha deve ter pelo menos 3 caracteres.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showPasswordError('A nova senha e a confirmação não coincidem.');
            return;
        }
        
        if (newPassword === currentPassword) {
            showPasswordError('A nova senha deve ser diferente da senha atual.');
            return;
        }
        
        await setUserPassword(currentUser, newPassword);
        hideProfileModal();
        showSuccessModal('Senha alterada com sucesso!');
        
        debugLog('Password changed successfully for:', currentUser);
        
    } catch (error) {
        console.error('Error changing password:', error);
        showPasswordError('Erro ao alterar senha. Tente novamente.');
    } finally {
        setButtonLoading('password-change-form', false);
    }
}

function showPasswordError(message) {
    const passwordError = document.getElementById('password-error');
    if (passwordError) {
        passwordError.textContent = message;
        passwordError.classList.remove('hidden');
    }
}

function showError(message) {
    debugLog('Showing error:', message);
    
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    } else {
        showToast(message, 'error');
    }
}

function handleLogout() {
    debugLog('Logging out');
    currentUser = null;
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = 'Bem-vindo!';
    }
    showScreen('login');
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

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast toast--${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
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

async function syncLocalData() {
    if (!isFirebaseInitialized || !isOnline) return;
    
    try {
        debugLog('Syncing local data to Firebase...');
        showToast('Sincronizando dados...', 'info');
        
        await loadFirebaseData();
        
        showToast('Dados sincronizados com sucesso!', 'success');
        
    } catch (error) {
        console.error('Error syncing data:', error);
        showToast('Erro na sincronização', 'error');
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('gluos_entries', JSON.stringify(allEntries));
        debugLog('Entries saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function savePasswordsToLocalStorage() {
    try {
        localStorage.setItem('gluos_user_passwords', JSON.stringify(userPasswords));
        debugLog('Passwords saved to localStorage');
    } catch (error) {
        console.error('Error saving passwords to localStorage:', error);
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

function populateSubjectSelect() {
    debugLog('Populating subject select - START');
    
    const select = document.getElementById('subject-select');
    if (!select) {
        debugLog('Subject select element not found!');
        return;
    }
    
    debugLog('Subject select element found, clearing and populating...');
    
    select.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Selecione o assunto --';
    select.appendChild(defaultOption);
    
    GLUOS_DATA.assuntos.forEach(assunto => {
        const option = document.createElement('option');
        option.value = assunto.id;
        option.textContent = `${assunto.id} - ${assunto.texto}`;
        select.appendChild(option);
    });
    
    debugLog(`Subject select populated with ${GLUOS_DATA.assuntos.length} options`);
}

function populateFilterSelects() {
    debugLog('Populating filter selects');
    
    const serverSelect = document.getElementById('filter-server');
    if (serverSelect) {
        serverSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            serverSelect.appendChild(option);
        });
        debugLog('Server filter populated');
    }
    
    const subjectSelect = document.getElementById('filter-subject');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            subjectSelect.appendChild(option);
        });
        debugLog('Subject filter populated');
    }
}

function handleSubjectNumberChange(e) {
    const number = parseInt(e.target.value);
    const select = document.getElementById('subject-select');
    
    if (number >= 1 && number <= 44 && select) {
        select.value = number;
    } else if (select) {
        select.value = '';
    }
}

function handleSubjectSelectChange(e) {
    const subjectNumber = document.getElementById('subject-number');
    if (subjectNumber) {
        subjectNumber.value = e.target.value;
    }
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
// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo
// Versão integrada com Firebase Realtime Database + Relatórios Admin + Relatório Pessoal
// VERSÃO CORRIGIDA - Dropdown de login funcionando

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
    
    // Aguardar um momento para garantir DOM estável
    setTimeout(() => {
        try {
            // Verificar se Firebase deve ser inicializado
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
    }, 500);
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
        // Usar import dinâmico para evitar erros de módulo
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
        
        // Armazenar as funções do Firebase globalmente para uso posterior
        window.firebaseFunctions = {
            getDatabase, ref, set, get, push, onValue, off, serverTimestamp, goOffline, goOnline
        };
        
        firebaseApp = initializeApp(firebaseConfig);
        database = getDatabase(firebaseApp);
        
        // Configurar listeners offline/online
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        isFirebaseInitialized = true;
        updateFirebaseStatus('success', 'Conectado ao Firebase');
        
        debugLog('Firebase initialized successfully');
        
        // Aguardar um pouco antes de carregar dados
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
        // Aguardar um pouco para garantir que DOM esteja totalmente carregado
        setTimeout(() => {
            populateSubjectSelect();
            populateFilterSelects();
            ensureUserSelectWorking(); // NOVA FUNÇÃO PARA CORRIGIR LOGIN
            debugLog('Selects populated successfully');
        }, 300);
        
        showScreen('login');
        debugLog('App initialization completed successfully');
    } catch (error) {
        console.error('Error in initializeApp:', error);
    }
}

// ===== NOVA FUNÇÃO: GARANTIR QUE SELECT DE USUÁRIOS FUNCIONE =====
function ensureUserSelectWorking() {
    const userSelect = document.getElementById('user-select');
    if (!userSelect) {
        debugLog('User select not found!');
        return;
    }
    
    // Verificar se o select já tem as opções
    const currentOptions = userSelect.querySelectorAll('option');
    debugLog('Current user select options:', currentOptions.length);
    
    // Se não tem as opções corretas, recriar
    if (currentOptions.length <= 1) {
        debugLog('Repopulating user select options');
        
        // Limpar select
        userSelect.innerHTML = '';
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Selecione --';
        userSelect.appendChild(defaultOption);
        
        // Adicionar usuários
        GLUOS_DATA.usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            userSelect.appendChild(option);
        });
        
        debugLog('User select repopulated with options:', GLUOS_DATA.usuarios);
    }
    
    // Garantir que o select seja funcional
    userSelect.style.pointerEvents = 'auto';
    userSelect.disabled = false;
    userSelect.style.zIndex = '10';
    
    // Forçar repaint
    userSelect.style.display = 'none';
    setTimeout(() => {
        userSelect.style.display = 'block';
        debugLog('User select forced repaint completed');
    }, 100);
    
    debugLog('User select functionality ensured');
}

// ===== STATUS DO FIREBASE =====
function updateFirebaseStatus(status, message) {
    const indicator = document.getElementById('firebase-indicator');
    const statusText = document.getElementById('firebase-status-text');
    
    if (indicator && statusText) {
        // Remover classes antigas
        indicator.className = 'status-indicator';
        
        // Adicionar nova classe
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
    
    // Atualizar status de sincronização no dashboard
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
        
        // Carregar entradas
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
        
        // Carregar senhas
        const passwordsRef = ref(database, 'gluos_passwords');
        const passwordsSnapshot = await get(passwordsRef);
        
        if (passwordsSnapshot.exists()) {
            userPasswords = passwordsSnapshot.val();
            debugLog('Passwords loaded from Firebase:', Object.keys(userPasswords));
        } else {
            userPasswords = {};
            debugLog('No passwords found in Firebase');
        }
        
        // Salvar backup local
        saveToLocalStorage();
        savePasswordsToLocalStorage();
        
        updateLastSync();
        
    } catch (error) {
        console.error('Error loading Firebase data:', error);
        // Fallback para dados locais
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
        // Carregar entradas
        const savedEntries = localStorage.getItem('gluos_entries');
        if (savedEntries) {
            allEntries = JSON.parse(savedEntries);
            allEntries.sort((a, b) => b.timestamp - a.timestamp);
            debugLog('Entries loaded from localStorage:', allEntries.length);
        } else {
            allEntries = [];
        }
        
        // Carregar senhas
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

// ===== FUNÇÃO PARA CARREGAR DADOS GERAL =====
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
        
        // Listener para entradas
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
                    
                    // Atualizar tabelas se estiverem visíveis
                    refreshCurrentView();
                    updateLastSync();
                    
                    // Salvar local backup
                    saveToLocalStorage();
                }
            }
        });
        
        // Listener para senhas
        const passwordsRef = ref(database, 'gluos_passwords');
        passwordsListener = onValue(passwordsRef, (snapshot) => {
            if (snapshot.exists()) {
                const newPasswords = snapshot.val();
                if (JSON.stringify(newPasswords) !== JSON.stringify(userPasswords)) {
                    userPasswords = newPasswords;
                    debugLog('Passwords updated from Firebase realtime');
                    
                    // Salvar local backup
                    savePasswordsToLocalStorage();
                }
            }
        });
        
        debugLog('Realtime listeners setup completed');
        
    } catch (error) {
        console.error('Error setting up realtime listeners:', error);
    }
}

// ===== CONFIGURAR EVENT LISTENERS - VERSÃO CORRIGIDA =====
function setupEventListeners() {
    debugLog('Setting up event listeners - INÍCIO');
    
    // Aguardar elementos estarem disponíveis
    setTimeout(() => {
        setupLoginListeners();
        setupNavigationListeners();
        setupFormListeners();
        setupModalListeners();
        setupReportsListeners();
        setupPersonalReportsListeners(); // Nova funcionalidade
        
        debugLog('Event listeners setup COMPLETED successfully');
    }, 100);
}

function setupLoginListeners() {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    
    if (loginForm) {
        debugLog('Login form found - setting up listeners');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            debugLog('LOGIN FORM SUBMIT TRIGGERED!');
            handleLogin(e);
            return false;
        });
        
        debugLog('Login form listener configured successfully');
    }
    
    if (loginBtn) {
        debugLog('Login button found - setting up click listener');
        
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            debugLog('LOGIN BUTTON CLICKED!');
            handleLogin(e);
            return false;
        });
        
        debugLog('Login button listener configured successfully');
    }
    
    if (!loginForm || !loginBtn) {
        console.error('CRITICAL: Login elements not found!');
    }
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
        { id: 'search-btn', action: () => showScreen('search') },
        { id: 'database-btn', action: () => { showScreen('database'); loadDatabaseTable(); } },
        { id: 'profile-btn', action: showProfileModal },
        { id: 'personal-reports-btn', action: () => showScreen('personal-reports') }, // Nova funcionalidade
        { id: 'reports-btn', action: () => showScreen('reports') },
        { id: 'back-to-dashboard-1', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-2', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-3', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-personal', action: () => showScreen('dashboard') }, // Nova funcionalidade
        { id: 'back-to-dashboard-reports', action: () => showScreen('dashboard') }
    ];
    
    navigationButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                btn.action();
            });
            debugLog(`Navigation button ${btn.id} configured`);
        }
    });
}

function setupFormListeners() {
    // Nova entrada
    const newEntryForm = document.getElementById('new-entry-form');
    if (newEntryForm) {
        newEntryForm.addEventListener('submit', handleNewEntry);
    }
    
    // Subject number/select sync
    const subjectNumber = document.getElementById('subject-number');
    const subjectSelect = document.getElementById('subject-select');
    
    if (subjectNumber) {
        subjectNumber.addEventListener('input', handleSubjectNumberChange);
    }
    
    if (subjectSelect) {
        subjectSelect.addEventListener('change', handleSubjectSelectChange);
    }
    
    // Pesquisa
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
    
    // Filtros
    const applyFilters = document.getElementById('apply-filters');
    const clearFilters = document.getElementById('clear-filters');
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyDatabaseFilters);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearDatabaseFilters);
    }
}

function setupModalListeners() {
    // Success modal
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    // Profile modal
    const passwordChangeForm = document.getElementById('password-change-form');
    const cancelProfile = document.getElementById('cancel-profile');
    
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }
    
    if (cancelProfile) {
        cancelProfile.addEventListener('click', hideProfileModal);
    }
}

function setupReportsListeners() {
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', handleGenerateReport);
    }
}

// ===== NOVA FUNCIONALIDADE: LISTENERS PARA RELATÓRIO PESSOAL =====
function setupPersonalReportsListeners() {
    const generatePersonalReportBtn = document.getElementById('generate-personal-report');
    if (generatePersonalReportBtn) {
        generatePersonalReportBtn.addEventListener('click', handleGeneratePersonalReport);
        debugLog('Personal report listener configured');
    }
}

// ===== GERENCIAMENTO DE TELAS =====
function showScreen(screenName) {
    debugLog(`Changing to screen: ${screenName}`);
    
    // Esconder todas as telas
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar tela solicitada
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        debugLog(`Screen ${screenName} is now active`);
        
        // Se for nova entrada, garantir que o select esteja populado
        if (screenName === 'new-entry') {
            setTimeout(() => {
                populateSubjectSelect();
                debugLog('Subject select repopulated for new-entry screen');
            }, 100);
        }
    } else {
        console.error(`Screen not found: ${screenName}-screen`);
    }
}

// ===== LOGIN - VERSÃO TOTALMENTE CORRIGIDA =====
function handleLogin(e) {
    debugLog('=== INÍCIO DO PROCESSO DE LOGIN ===');
    
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Buscar elementos sempre fresh
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (!userSelect || !passwordInput) {
        console.error('CRITICAL: Login elements not found');
        showError('Erro interno: elementos de login não encontrados');
        return false;
    }
    
    debugLog('Login elements found successfully');
    
    // Mostrar loading
    setButtonLoading('login-btn', true);
    
    // Pequeno delay para mostrar loading e garantir DOM estabilidade
    setTimeout(() => {
        try {
            performLogin(userSelect, passwordInput, loginError);
        } catch (error) {
            console.error('Error in performLogin:', error);
            setButtonLoading('login-btn', false);
            showError('Erro interno durante login');
        }
    }, 300);
    
    return false;
}

function performLogin(userSelect, passwordInput, loginError) {
    const user = userSelect ? userSelect.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    
    debugLog('Login attempt:', {
        user: user,
        passwordLength: password.length,
        hasUser: !!user,
        hasPassword: !!password,
        userSelectFound: !!userSelect,
        passwordInputFound: !!passwordInput,
        userSelectValue: userSelect.value,
        availableOptions: Array.from(userSelect.options).map(opt => opt.value)
    });
    
    // Limpar erro anterior
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Validações
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
    
    // Verificar se usuário existe na lista
    if (!GLUOS_DATA.usuarios.includes(user)) {
        debugLog('Error: invalid user');
        showError('Usuário não encontrado.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    // Verificar senha
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
    
    // LOGIN BEM-SUCEDIDO!
    debugLog('=== LOGIN SUCCESSFUL ===', { user: user });
    
    currentUser = user;
    
    // Atualizar interface
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Usuário: ${currentUser}`;
    }
    
    // Configurar interface para Admin ou usuário normal
    setupUserInterface(user);
    
    // Limpar formulário
    try {
        if (userSelect) userSelect.value = '';
        if (passwordInput) passwordInput.value = '';
    } catch (error) {
        debugLog('Error clearing form:', error);
    }
    
    // Remover loading
    setButtonLoading('login-btn', false);
    
    // Ir para dashboard com pequeno delay para UX
    setTimeout(() => {
        showScreen('dashboard');
        debugLog('Redirected to dashboard successfully');
    }, 500);
}

// ===== CONFIGURAÇÃO DA INTERFACE DO USUÁRIO =====
function setupUserInterface(user) {
    const reportsBtn = document.getElementById('reports-btn');
    const personalReportsBtn = document.getElementById('personal-reports-btn');
    const dashboardButtons = document.querySelector('.dashboard-buttons');
    
    if (user === 'Admin') {
        // Admin: mostrar relatórios administrativos, esconder relatório pessoal
        if (reportsBtn) {
            reportsBtn.classList.remove('hidden');
            reportsBtn.classList.add('visible');
        }
        
        if (personalReportsBtn) {
            personalReportsBtn.classList.add('hidden');
            personalReportsBtn.classList.remove('visible');
        }
        
        // Ajustar layout para Admin (5 botões)
        if (dashboardButtons) {
            dashboardButtons.classList.add('admin-layout');
            dashboardButtons.classList.remove('user-layout');
        }
        
        debugLog('Admin interface configured');
    } else {
        // Usuário normal: esconder relatórios administrativos, mostrar relatório pessoal
        if (reportsBtn) {
            reportsBtn.classList.add('hidden');
            reportsBtn.classList.remove('visible');
        }
        
        if (personalReportsBtn) {
            personalReportsBtn.classList.remove('hidden');
            personalReportsBtn.classList.add('visible');
        }
        
        // Layout para usuário normal (5 botões)
        if (dashboardButtons) {
            dashboardButtons.classList.add('user-layout');
            dashboardButtons.classList.remove('admin-layout');
        }
        
        debugLog('Regular user interface configured');
    }
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
        // Mesmo com erro, manter localmente
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
        
        // Adicionar localmente primeiro
        allEntries.unshift(entry);
        saveToLocalStorage();
        
        // Tentar salvar no Firebase se disponível
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
}

function clearDatabaseFilters() {
    document.getElementById('filter-server').value = '';
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-subject').value = '';
    loadDatabaseTable();
}

// ===== NOVA FUNCIONALIDADE: RELATÓRIO PESSOAL =====
function handleGeneratePersonalReport() {
    debugLog('Generating personal productivity report for:', currentUser);
    
    // Verificar se é usuário válido (não Admin)
    if (!currentUser) {
        showError('Você precisa estar logado para gerar relatórios.');
        return;
    }
    
    if (currentUser === 'Admin') {
        showError('Relatório pessoal não disponível para Admin. Use Relatórios Administrativos.');
        return;
    }
    
    const startDate = document.getElementById('personal-start-date').value;
    const endDate = document.getElementById('personal-end-date').value;
    const dateError = document.getElementById('personal-date-error');
    
    // Limpar erro anterior
    if (dateError) {
        dateError.classList.add('hidden');
        dateError.textContent = '';
    }
    
    // Validação das datas
    if (startDate && endDate && startDate > endDate) {
        showPersonalReportError('A data início não pode ser maior que a data final.');
        return;
    }
    
    setButtonLoading('generate-personal-report', true);
    
    setTimeout(() => {
        try {
            generatePersonalProductivityReport(startDate, endDate);
        } finally {
            setButtonLoading('generate-personal-report', false);
        }
    }, 500);
}

function generatePersonalProductivityReport(startDate, endDate) {
    debugLog('Generating personal report with date filters:', { startDate, endDate, user: currentUser });
    
    // Filtrar entradas do usuário atual por data
    let filteredEntries = allEntries.filter(entry => entry.server === currentUser);
    
    if (startDate || endDate) {
        filteredEntries = filteredEntries.filter(entry => {
            const entryDate = convertDateToComparison(entry.date);
            const start = startDate ? convertDateToComparison(startDate, true) : null;
            const end = endDate ? convertDateToComparison(endDate, true) : null;
            
            let includeEntry = true;
            
            if (start && entryDate < start) {
                includeEntry = false;
            }
            
            if (end && entryDate > end) {
                includeEntry = false;
            }
            
            return includeEntry;
        });
    }
    
    debugLog(`Filtered personal entries: ${filteredEntries.length} of ${allEntries.length} total`);
    
    // Gerar dados do relatório pessoal
    const personalReportData = generatePersonalReportData(filteredEntries, startDate, endDate);
    
    // Exibir relatório pessoal
    displayPersonalReport(personalReportData, startDate, endDate);
}

function generatePersonalReportData(entries, startDate, endDate) {
    debugLog('Processing personal report data for entries:', entries.length);
    
    const subjectStats = {};
    let totalEntries = 0;
    const entriesByDate = {};
    
    // Processar cada entrada
    entries.forEach(entry => {
        const subjectId = entry.subjectId;
        const subjectText = entry.subjectText;
        const entryDate = entry.date;
        
        // Inicializar estatísticas do assunto se não existir
        if (!subjectStats[subjectId]) {
            subjectStats[subjectId] = {
                text: subjectText,
                count: 0
            };
        }
        
        // Incrementar contadores
        subjectStats[subjectId].count++;
        totalEntries++;
        
        // Contar entradas por data (para calcular média)
        if (!entriesByDate[entryDate]) {
            entriesByDate[entryDate] = 0;
        }
        entriesByDate[entryDate]++;
    });
    
    // Converter para array e filtrar/ordenar
    const sortedSubjects = Object.keys(subjectStats)
        .map(id => ({ 
            id: parseInt(id), 
            ...subjectStats[id] 
        }))
        .filter(subject => subject.count > 0) // Apenas assuntos com pelo menos 1 entrada
        .sort((a, b) => b.count - a.count); // Ordenar do maior para menor
    
    // Calcular estatísticas
    const daysWithEntries = Object.keys(entriesByDate).length;
    const dailyAverage = daysWithEntries > 0 ? (totalEntries / daysWithEntries) : 0;
    
    debugLog('Personal report data generated:', {
        subjects: sortedSubjects.length,
        totalEntries,
        daysWithEntries,
        dailyAverage: dailyAverage.toFixed(2)
    });
    
    return {
        subjects: sortedSubjects,
        totalEntries,
        daysWithEntries,
        dailyAverage,
        entriesByDate
    };
}

function displayPersonalReport(reportData, startDate, endDate) {
    const reportContent = document.getElementById('personal-report-content');
    const reportTitle = document.getElementById('personal-report-title');
    const reportPeriod = document.getElementById('personal-report-period');
    const reportUser = document.getElementById('personal-report-user');
    const reportTbody = document.getElementById('personal-report-tbody');
    
    if (!reportContent || !reportTbody) return;
    
    // Configurar cabeçalho
    if (reportTitle) {
        reportTitle.textContent = 'Relatório Pessoal de Produtividade';
    }
    
    if (reportUser) {
        reportUser.textContent = `Servidor: ${currentUser}`;
    }
    
    if (reportPeriod) {
        if (startDate && endDate) {
            const formattedStart = formatDateForDisplay(startDate);
            const formattedEnd = formatDateForDisplay(endDate);
            reportPeriod.textContent = `${formattedStart} à ${formattedEnd}`;
        } else if (startDate) {
            const formattedStart = formatDateForDisplay(startDate);
            reportPeriod.textContent = `A partir de ${formattedStart}`;
        } else if (endDate) {
            const formattedEnd = formatDateForDisplay(endDate);
            reportPeriod.textContent = `Até ${formattedEnd}`;
        } else {
            reportPeriod.textContent = 'Todos os períodos';
        }
    }
    
    // Limpar tabela principal
    reportTbody.innerHTML = '';
    
    // Verificar se há dados
    if (reportData.subjects.length === 0) {
        reportTbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    Nenhuma entrada encontrada para o período selecionado.
                </td>
            </tr>
        `;
    } else {
        // Preencher dados dos assuntos
        reportData.subjects.forEach(subject => {
            const row = document.createElement('tr');
            
            const percentage = reportData.totalEntries > 0 ? 
                ((subject.count / reportData.totalEntries) * 100).toFixed(2) : '0.00';
            
            row.innerHTML = `
                <td>${subject.text}</td>
                <td class="number-cell">${subject.count}</td>
                <td class="percent-cell">${percentage}%</td>
            `;
            
            reportTbody.appendChild(row);
        });
    }
    
    // Atualizar tabela de estatísticas
    updatePersonalStatistics(reportData, startDate, endDate);
    
    // Mostrar relatório
    reportContent.classList.remove('hidden');
    
    debugLog('Personal report displayed successfully');
}

function updatePersonalStatistics(reportData, startDate, endDate) {
    // Atualizar período
    const statsPeriod = document.getElementById('stats-period');
    if (statsPeriod) {
        if (startDate && endDate) {
            const formattedStart = formatDateForDisplay(startDate);
            const formattedEnd = formatDateForDisplay(endDate);
            statsPeriod.textContent = `${formattedStart} à ${formattedEnd}`;
        } else if (startDate) {
            const formattedStart = formatDateForDisplay(startDate);
            statsPeriod.textContent = `A partir de ${formattedStart}`;
        } else if (endDate) {
            const formattedEnd = formatDateForDisplay(endDate);
            statsPeriod.textContent = `Até ${formattedEnd}`;
        } else {
            statsPeriod.textContent = 'Todos os períodos';
        }
    }
    
    // Atualizar total de entradas
    const statsTotalEntries = document.getElementById('stats-total-entries');
    if (statsTotalEntries) {
        statsTotalEntries.textContent = reportData.totalEntries.toString();
    }
    
    // Atualizar média diária (máximo 2 casas decimais)
    const statsDailyAverage = document.getElementById('stats-daily-average');
    if (statsDailyAverage) {
        const averageText = reportData.daysWithEntries > 0 ? 
            reportData.dailyAverage.toFixed(2) : '0.00';
        statsDailyAverage.textContent = averageText;
    }
    
    debugLog('Personal statistics updated:', {
        totalEntries: reportData.totalEntries,
        daysWithEntries: reportData.daysWithEntries,
        dailyAverage: reportData.dailyAverage.toFixed(2)
    });
}

function showPersonalReportError(message) {
    const dateError = document.getElementById('personal-date-error');
    if (dateError) {
        dateError.textContent = message;
        dateError.classList.remove('hidden');
    }
}

// ===== RELATÓRIOS ADMINISTRATIVOS - MANTIDOS INALTERADOS =====
function handleGenerateReport() {
    debugLog('Generating productivity report');
    
    // Verificar se é Admin
    if (currentUser !== 'Admin') {
        showError('Apenas o Admin pode gerar relatórios administrativos.');
        return;
    }
    
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const dateError = document.getElementById('date-error');
    
    // Limpar erro anterior
    if (dateError) {
        dateError.classList.add('hidden');
        dateError.textContent = '';
    }
    
    // Validação das datas
    if (startDate && endDate && startDate > endDate) {
        showReportError('A data início não pode ser maior que a data final.');
        return;
    }
    
    setButtonLoading('generate-report', true);
    
    setTimeout(() => {
        try {
            generateProductivityReport(startDate, endDate);
        } finally {
            setButtonLoading('generate-report', false);
        }
    }, 500);
}

function generateProductivityReport(startDate, endDate) {
    debugLog('Generating report with date filters:', { startDate, endDate });
    
    // Filtrar entradas por data
    let filteredEntries = allEntries;
    
    if (startDate || endDate) {
        filteredEntries = allEntries.filter(entry => {
            const entryDate = convertDateToComparison(entry.date);
            const start = startDate ? convertDateToComparison(startDate, true) : null;
            const end = endDate ? convertDateToComparison(endDate, true) : null;
            
            let includeEntry = true;
            
            if (start && entryDate < start) {
                includeEntry = false;
            }
            
            if (end && entryDate > end) {
                includeEntry = false;
            }
            
            return includeEntry;
        });
    }
    
    debugLog(`Filtered entries: ${filteredEntries.length} of ${allEntries.length}`);
    
    // Gerar dados do relatório
    const reportData = generateReportData(filteredEntries);
    
    // Exibir relatório
    displayReport(reportData, startDate, endDate);
}

function convertDateToComparison(dateStr, isInputDate = false) {
    if (isInputDate) {
        // Formato yyyy-mm-dd do input date
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    } else {
        // Já está em formato dd/mm/yyyy
        return dateStr;
    }
}

function generateReportData(entries) {
    debugLog('Processing report data for entries:', entries.length);
    
    const servers = ["Eduardo", "Wendel", "Júlia", "Tati", "Sônia", "Rita", "Mara", "Admin"];
    const subjectStats = {};
    const serverTotals = {};
    let grandTotal = 0;
    
    // Inicializar totais por servidor
    servers.forEach(server => {
        serverTotals[server] = 0;
    });
    
    // Processar cada entrada
    entries.forEach(entry => {
        const subjectId = entry.subjectId;
        const subjectText = entry.subjectText;
        const server = entry.server;
        
        // Inicializar estatísticas do assunto se não existir
        if (!subjectStats[subjectId]) {
            subjectStats[subjectId] = {
                text: subjectText,
                servers: {},
                total: 0
            };
            
            // Inicializar contadores por servidor para este assunto
            servers.forEach(srv => {
                subjectStats[subjectId].servers[srv] = 0;
            });
        }
        
        // Incrementar contadores
        subjectStats[subjectId].servers[server]++;
        subjectStats[subjectId].total++;
        serverTotals[server]++;
        grandTotal++;
    });
    
    // Converter para array e ordenar por total (maior para menor)
    const sortedSubjects = Object.keys(subjectStats)
        .map(id => ({ 
            id: parseInt(id), 
            ...subjectStats[id] 
        }))
        .filter(subject => subject.total > 0)
        .sort((a, b) => b.total - a.total);
    
    debugLog('Report data generated:', {
        subjects: sortedSubjects.length,
        grandTotal,
        serverTotals
    });
    
    return {
        subjects: sortedSubjects,
        serverTotals,
        grandTotal,
        servers
    };
}

function displayReport(reportData, startDate, endDate) {
    const reportContent = document.getElementById('report-content');
    const reportTitle = document.getElementById('report-title');
    const reportPeriod = document.getElementById('report-period');
    const reportTbody = document.getElementById('report-tbody');
    
    if (!reportContent || !reportTbody) return;
    
    // Configurar título e período
    if (reportTitle) {
        reportTitle.textContent = 'Relatório de Produtividade GLUOS';
    }
    
    if (reportPeriod) {
        if (startDate && endDate) {
            const formattedStart = formatDateForDisplay(startDate);
            const formattedEnd = formatDateForDisplay(endDate);
            reportPeriod.textContent = `${formattedStart} à ${formattedEnd}`;
        } else if (startDate) {
            const formattedStart = formatDateForDisplay(startDate);
            reportPeriod.textContent = `A partir de ${formattedStart}`;
        } else if (endDate) {
            const formattedEnd = formatDateForDisplay(endDate);
            reportPeriod.textContent = `Até ${formattedEnd}`;
        } else {
            reportPeriod.textContent = 'Todos os períodos';
        }
    }
    
    // Limpar tabela
    reportTbody.innerHTML = '';
    
    // Preencher dados dos assuntos
    reportData.subjects.forEach(subject => {
        const row = document.createElement('tr');
        
        const percentage = reportData.grandTotal > 0 ? ((subject.total / reportData.grandTotal) * 100).toFixed(2) : '0.00';
        
        row.innerHTML = `
            <td>${subject.text}</td>
            <td class="number-cell">${subject.servers.Eduardo}</td>
            <td class="number-cell">${subject.servers.Wendel}</td>
            <td class="number-cell">${subject.servers.Júlia}</td>
            <td class="number-cell">${subject.servers.Tati}</td>
            <td class="number-cell">${subject.servers.Sônia}</td>
            <td class="number-cell">${subject.servers.Rita}</td>
            <td class="number-cell">${subject.servers.Mara}</td>
            <td class="number-cell">${subject.servers.Admin}</td>
            <td class="number-cell" style="font-weight: bold;">${subject.total}</td>
            <td class="percent-cell">${percentage}%</td>
        `;
        
        reportTbody.appendChild(row);
    });
    
    // Atualizar linha de totais
    document.getElementById('total-eduardo').textContent = reportData.serverTotals.Eduardo;
    document.getElementById('total-wendel').textContent = reportData.serverTotals.Wendel;
    document.getElementById('total-julia').textContent = reportData.serverTotals.Júlia;
    document.getElementById('total-tati').textContent = reportData.serverTotals.Tati;
    document.getElementById('total-sonia').textContent = reportData.serverTotals.Sônia;
    document.getElementById('total-rita').textContent = reportData.serverTotals.Rita;
    document.getElementById('total-mara').textContent = reportData.serverTotals.Mara;
    document.getElementById('total-admin').textContent = reportData.serverTotals.Admin;
    document.getElementById('total-geral').textContent = reportData.grandTotal;
    
    // Mostrar relatório
    reportContent.classList.remove('hidden');
    
    debugLog('Report displayed successfully');
}

function formatDateForDisplay(dateStr) {
    // Converter yyyy-mm-dd para dd/mm/yyyy
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function showReportError(message) {
    const dateError = document.getElementById('date-error');
    if (dateError) {
        dateError.textContent = message;
        dateError.classList.remove('hidden');
    }
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
        // Se não há elemento de erro, mostrar como toast
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
    
    // Reset da interface
    setupUserInterface('');
    
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
    // Criar elemento toast se não existir
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Configurar toast
    toast.textContent = message;
    toast.className = `toast toast--${type}`;
    toast.classList.remove('hidden');
    
    // Auto-hide após 3 segundos
    setTimeout(() => {
        if (toast) {
            toast.classList.add('hidden');
        }
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
    // Verificar qual tela está ativa e recarregar dados se necessário
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;
    
    const screenId = currentScreen.id;
    
    if (screenId === 'database-screen') {
        loadDatabaseTable();
    } else if (screenId === 'search-screen') {
        // Se há resultados de pesquisa, reexecutar a pesquisa
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
        
        // Recarregar do Firebase
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

// ===== DATA/HORA =====
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

// ===== POPULAR SELECTS - VERSÃO CORRIGIDA =====
function populateSubjectSelect() {
    debugLog('Populating subject select - START');
    
    const select = document.getElementById('subject-select');
    if (!select) {
        debugLog('Subject select element not found!');
        return;
    }
    
    debugLog('Subject select element found, clearing and populating...');
    
    // Limpar opções existentes de forma segura
    try {
        select.innerHTML = '';
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Selecione o assunto --';
        select.appendChild(defaultOption);
        
        // Adicionar todas as opções de assuntos
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            select.appendChild(option);
        });
        
        debugLog(`Subject select populated with ${GLUOS_DATA.assuntos.length} options successfully`);
        
    } catch (error) {
        console.error('Error populating subject select:', error);
    }
}

function populateFilterSelects() {
    debugLog('Populating filter selects');
    
    try {
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
    } catch (error) {
        console.error('Error populating filter selects:', error);
    }
}

// ===== MANIPULAÇÃO DE ASSUNTOS =====
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

// ===== MODAL =====
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
    // Cleanup listeners
    if (entriesListener && window.firebaseFunctions) {
        const { ref, off } = window.firebaseFunctions;
        try {
            off(ref(database, 'gluos_entries'), 'value', entriesListener);
        } catch (error) {
            debugLog('Error cleaning up entries listener:', error);
        }
    }
    if (passwordsListener && window.firebaseFunctions) {
        const { ref, off } = window.firebaseFunctions;
        try {
            off(ref(database, 'gluos_passwords'), 'value', passwordsListener);
        } catch (error) {
            debugLog('Error cleaning up passwords listener:', error);
        }
    }
});

// ===== INICIALIZAÇÃO ADICIONAL =====
// Garantir que tudo esteja funcionando após carregamento completo
window.addEventListener('load', function() {
    debugLog('Window fully loaded - final setup check');
    
    // Verificar se elementos críticos existem e corrigir se necessário
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const userSelect = document.getElementById('user-select');
        
        if (!loginForm || !loginBtn || !userSelect) {
            console.error('CRITICAL ELEMENTS MISSING AFTER FULL LOAD!');
        } else {
            debugLog('All critical elements present after full load');
            
            // Garantir que o select de usuários funcione
            ensureUserSelectWorking();
        }
        
        // Re-setup listeners se necessário
        if (loginForm && loginBtn && !loginForm.hasAttribute('data-listener-set')) {
            debugLog('Re-setting up login listeners as backup');
            setupLoginListeners();
            loginForm.setAttribute('data-listener-set', 'true');
        }
    }, 1000);
});
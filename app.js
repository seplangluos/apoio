// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo
// Versão CORRIGIDA - Problema de conectividade Firebase RESOLVIDO

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
const FIREBASE_CONNECTION_TIMEOUT = 3000; // 3 segundos timeout - REDUZIDO

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[GLUOS DEBUG] ${message}`, data || '');
        
        // Mostrar debug visual na tela de login
        const debugElement = document.getElementById('login-debug');
        if (debugElement && message.includes('LOGIN')) {
            debugElement.textContent = `${new Date().toLocaleTimeString()}: ${message}\n${JSON.stringify(data, null, 2)}`;
            debugElement.classList.remove('hidden');
        }
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
let currentEditingEntry = null;
let isInitialized = false;
let connectionTimeout = null;

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM loaded, starting GLUOS system with FIXED connectivity');
    
    // Iniciar sistema imediatamente
    initializeSystem();
});

function initializeSystem() {
    debugLog('Starting FIXED system initialization');
    
    // 1. Inicializar aplicação básica PRIMEIRO
    initializeApp();
    
    // 2. Mostrar status inicial
    updateFirebaseStatus('warning', 'Verificando configuração...');
    
    // 3. Verificar configuração Firebase
    checkFirebaseConfiguration();
    
    // 4. Se Firebase configurado, tentar conectar com timeout
    if (isFirebaseConfigured) {
        debugLog('Firebase configured - starting connection with timeout');
        updateFirebaseStatus('warning', 'Conectando ao Firebase...');
        
        // Inicializar Firebase com timeout
        initializeFirebaseWithTimeout().then(success => {
            if (success) {
                debugLog('Firebase initialized successfully');
                updateFirebaseStatus('success', 'Conectado ao Firebase');
                
                // Carregar dados do Firebase
                setTimeout(() => {
                    loadFirebaseData();
                    setupRealtimeListeners();
                }, 300);
            } else {
                debugLog('Firebase initialization failed - using local mode');
                updateFirebaseStatus('info', 'Modo Local (Firebase não conectou)');
                loadLocalData();
            }
        }).catch(error => {
            debugLog('Firebase initialization error:', error);
            updateFirebaseStatus('error', 'Erro Firebase - Modo Local');
            loadLocalData();
        });
    } else {
        debugLog('Firebase not configured - using localStorage mode');
        updateFirebaseStatus('info', 'Modo Local (Configure Firebase)');
        loadLocalData();
    }
    
    // 5. Setup dos event listeners
    setTimeout(() => {
        setupEventListeners();
        debugLog('Event listeners configured');
    }, 100);
    
    // 6. Inicializar relógio
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 7. Garantir que overlay seja removido
    setTimeout(() => {
        showLoadingOverlay(false);
        isInitialized = true;
        debugLog('GLUOS system fully initialized with FIXED connectivity');
    }, 500);
}

// ===== VERIFICAR CONFIGURAÇÃO FIREBASE =====
function checkFirebaseConfiguration() {
    isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                          firebaseConfig.databaseURL !== "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/";
    
    debugLog('Firebase configuration check:', { 
        configured: isFirebaseConfigured,
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...'
    });
    
    return isFirebaseConfigured;
}

// ===== INICIALIZAÇÃO FIREBASE COM TIMEOUT - VERSÃO CORRIGIDA =====
async function initializeFirebaseWithTimeout() {
    return new Promise(async (resolve) => {
        debugLog('Starting Firebase initialization with 3s timeout...');
        
        let isResolved = false;
        
        // Set timeout para fallback
        const timeout = setTimeout(() => {
            if (!isResolved) {
                debugLog('Firebase initialization TIMEOUT (3s) - falling back to local mode');
                isResolved = true;
                resolve(false);
            }
        }, FIREBASE_CONNECTION_TIMEOUT);
        
        try {
            // Importar módulos Firebase
            debugLog('Importing Firebase modules...');
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
                serverTimestamp,
                goOffline,
                goOnline
            } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
            
            if (isResolved) return;
            
            // Armazenar funções globalmente
            window.firebaseFunctions = {
                getDatabase, ref, set, get, push, onValue, off, remove, update, serverTimestamp, goOffline, goOnline
            };
            
            debugLog('Initializing Firebase app...');
            
            // Inicializar Firebase
            firebaseApp = initializeApp(firebaseConfig);
            database = getDatabase(firebaseApp);
            
            if (isResolved) return;
            
            debugLog('Testing Firebase connection...');
            
            // Testar conectividade com timeout adicional
            const testPromise = Promise.race([
                get(ref(database, '.info/serverTimeOffset')),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection test timeout')), 2000)
                )
            ]);
            
            await testPromise;
            
            if (!isResolved) {
                debugLog('Firebase connection test successful');
                
                // Configurar listeners de rede
                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);
                
                // Sucesso - limpar timeout e resolver
                clearTimeout(timeout);
                isFirebaseInitialized = true;
                isResolved = true;
                resolve(true);
            }
            
        } catch (error) {
            debugLog('Firebase initialization error:', error.message);
            console.error('Firebase initialization error:', error);
            
            if (!isResolved) {
                // Erro - limpar timeout e resolver como false
                clearTimeout(timeout);
                isFirebaseInitialized = false;
                isResolved = true;
                resolve(false);
            }
        }
    });
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
function initializeApp() {
    debugLog('Starting app initialization');
    
    try {
        // Popular selects imediatamente
        populateSubjectSelect();
        populateEditSubjectSelect();
        populateFilterSelects();
        
        // Garantir que a tela de login seja mostrada
        showScreen('login');
        
        debugLog('App initialization completed successfully');
    } catch (error) {
        console.error('Error in initializeApp:', error);
    }
}

// ===== STATUS DO FIREBASE - VERSÃO CORRIGIDA =====
function updateFirebaseStatus(status, message) {
    debugLog(`Updating Firebase status: ${status} - ${message}`);
    
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
        debugLog(`Status updated to: ${message}`);
    } else {
        debugLog('Firebase status elements not found!');
    }
    
    // Atualizar status de sincronização
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
        
        // Carregar entries
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
        
        // Salvar localmente como backup
        saveToLocalStorage();
        savePasswordsToLocalStorage();
        
        updateLastSync();
        
    } catch (error) {
        console.error('Error loading Firebase data:', error);
        debugLog('Firebase load failed, using local data');
        loadLocalData();
        updateFirebaseStatus('error', 'Erro ao carregar dados - usando backup local');
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

// ===== LISTENERS EM TEMPO REAL =====
function setupRealtimeListeners() {
    if (!isFirebaseInitialized || !window.firebaseFunctions) return;
    
    try {
        const { ref, onValue } = window.firebaseFunctions;
        
        // Listener para entries
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
        
        // Listener para senhas
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
    debugLog('Setting up event listeners');
    
    try {
        setupLoginListeners();
        setupNavigationListeners();
        setupFormListeners();
        setupModalListeners();
        
        debugLog('Event listeners setup COMPLETED successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// ===== LOGIN LISTENERS =====
function setupLoginListeners() {
    debugLog('Setting up login listeners');
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm || !loginBtn || !userSelect || !passwordInput) {
        console.error('CRITICAL: Essential login elements not found!');
        return;
    }
    
    debugLog('All login elements found successfully');
    
    // Garantir que o select funcione - CORREÇÃO CRÍTICA
    userSelect.style.pointerEvents = 'auto';
    userSelect.style.zIndex = '1000';
    userSelect.disabled = false;
    userSelect.tabIndex = 0;
    
    debugLog('User select configured for interaction');
    
    // Form submit
    loginForm.addEventListener('submit', function(e) {
        debugLog('LOGIN FORM SUBMIT TRIGGERED!');
        e.preventDefault();
        e.stopPropagation();
        handleLogin();
        return false;
    });
    
    // Button click
    loginBtn.addEventListener('click', function(e) {
        debugLog('LOGIN BUTTON CLICKED!');
        e.preventDefault();
        e.stopPropagation();
        handleLogin();
        return false;
    });
    
    // Enter no campo de senha
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            debugLog('ENTER pressed in password input');
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
            return false;
        }
    });
    
    // Enter no select de usuário
    userSelect.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            debugLog('ENTER pressed in user select');
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
            return false;
        }
    });
    
    // Debug para o select
    userSelect.addEventListener('change', function(e) {
        debugLog('User select changed to:', e.target.value);
    });
    
    userSelect.addEventListener('click', function(e) {
        debugLog('User select clicked');
    });
    
    passwordInput.addEventListener('input', function(e) {
        debugLog('Password input changed - length:', e.target.value.length);
    });
    
    debugLog('Login listeners configured successfully');
}

// ===== NAVIGATION LISTENERS =====
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
        { id: 'personal-report-btn', action: () => showScreen('personal-report') },
        { id: 'search-btn', action: () => showScreen('search') },
        { id: 'database-btn', action: () => { showScreen('database'); loadDatabaseTable(); } },
        { id: 'profile-btn', action: showProfileModal },
        { id: 'back-to-dashboard-1', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-2', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-3', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-4', action: () => showScreen('dashboard') }
    ];
    
    navigationButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.action);
            debugLog(`Navigation button ${btn.id} configured`);
        }
    });
}

// ===== FORM LISTENERS =====
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
    
    const generatePersonalReport = document.getElementById('generate-personal-report');
    if (generatePersonalReport) {
        generatePersonalReport.addEventListener('click', handleGeneratePersonalReport);
    }
    
    const applyFilters = document.getElementById('apply-filters');
    const clearFilters = document.getElementById('clear-filters');
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyDatabaseFilters);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearDatabaseFilters);
    }
    
    const saveEditBtn = document.getElementById('save-edit-btn');
    
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleSaveEdit);
    }
}

// ===== MODAL LISTENERS =====
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
    
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideEditModal);
    }
    
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
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

// ===== LOGIN - VERSÃO CORRIGIDA =====
function handleLogin() {
    debugLog('=== INÍCIO DO PROCESSO DE LOGIN ===');
    
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (!userSelect || !passwordInput) {
        console.error('CRITICAL: Login elements not found');
        alert('ERRO CRÍTICO: Elementos de login não encontrados!');
        return;
    }
    
    debugLog('Login elements validated successfully');
    
    // Limpar erro anterior
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Mostrar loading
    setButtonLoading('login-btn', true);
    
    // Pequeno delay para mostrar o loading
    setTimeout(() => {
        performLogin(userSelect, passwordInput, loginError);
    }, 100);
}

function performLogin(userSelect, passwordInput, loginError) {
    const selectedUser = userSelect.value.trim();
    const typedPassword = passwordInput.value.trim();
    
    debugLog('LOGIN ATTEMPT - Values captured:', {
        selectedUser: selectedUser,
        passwordLength: typedPassword.length,
        selectIndex: userSelect.selectedIndex,
        selectOptions: userSelect.options.length
    });
    
    // Validações básicas
    if (!selectedUser || selectedUser === '') {
        debugLog('LOGIN ERROR: No user selected');
        showLoginError('Por favor, selecione um usuário na lista.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    if (!typedPassword || typedPassword === '') {
        debugLog('LOGIN ERROR: No password entered');
        showLoginError('Por favor, digite sua senha.');
        setButtonLoading('login-btn', false);
        return;
    }
    
    // Verificar usuário válido
    const isValidUser = GLUOS_DATA.usuarios.includes(selectedUser);
    
    debugLog('LOGIN - User validation:', {
        selectedUser: selectedUser,
        isValidUser: isValidUser
    });
    
    if (!isValidUser) {
        debugLog('LOGIN ERROR: Invalid user selected');
        showLoginError(`Usuário "${selectedUser}" não é válido.`);
        setButtonLoading('login-btn', false);
        return;
    }
    
    // Verificar senha
    const expectedPassword = getUserPassword(selectedUser);
    
    debugLog('LOGIN - Password verification:', {
        user: selectedUser,
        match: typedPassword === expectedPassword
    });
    
    if (typedPassword !== expectedPassword) {
        debugLog('LOGIN ERROR: Password mismatch');
        showLoginError(`Senha incorreta para o usuário "${selectedUser}".`);
        setButtonLoading('login-btn', false);
        return;
    }
    
    // ===== LOGIN BEM-SUCEDIDO! =====
    debugLog('=== LOGIN SUCCESSFUL ===', { 
        user: selectedUser
    });
    
    currentUser = selectedUser;
    
    // Configurar interface
    configureUserInterface(selectedUser);
    
    // Atualizar informações do usuário
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Usuário: ${currentUser}`;
    }
    
    // Limpar formulário
    userSelect.selectedIndex = 0;
    passwordInput.value = '';
    
    // Esconder debug
    const debugElement = document.getElementById('login-debug');
    if (debugElement) {
        debugElement.classList.add('hidden');
    }
    
    // Remover loading
    setButtonLoading('login-btn', false);
    
    // Redirecionar para dashboard
    setTimeout(() => {
        showScreen('dashboard');
        debugLog('LOGIN - Successfully redirected to dashboard');
        
        // Mostrar mensagem de boas-vindas
        showToast(`Bem-vindo(a), ${currentUser}!`, 'success');
    }, 200);
}

function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }
    
    debugLog('LOGIN ERROR DISPLAYED:', message);
}

// ===== CONFIGURAR INTERFACE DO USUÁRIO =====
function configureUserInterface(user) {
    const newEntryBtn = document.getElementById('new-entry-btn');
    const personalReportBtn = document.getElementById('personal-report-btn');
    
    if (user === 'Admin') {
        if (newEntryBtn) {
            newEntryBtn.style.display = 'none';
        }
        
        if (personalReportBtn) {
            personalReportBtn.classList.add('hidden');
        }
        
        debugLog('Admin interface configured - Nova Entrada disabled');
    } else {
        if (newEntryBtn) {
            newEntryBtn.style.display = 'inline-flex';
        }
        
        if (personalReportBtn) {
            personalReportBtn.classList.remove('hidden');
        }
        
        debugLog('Regular user interface configured - all features enabled');
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
    
    if (currentUser === 'Admin') {
        showError('Admin não pode criar novas entradas.');
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

// ===== RELATÓRIO PESSOAL =====
function handleGeneratePersonalReport() {
    if (!currentUser || currentUser === 'Admin') {
        showError('Esta funcionalidade não está disponível para este usuário.');
        return;
    }
    
    const startDate = document.getElementById('report-date-start').value;
    const endDate = document.getElementById('report-date-end').value;
    
    if (!startDate || !endDate) {
        showError('Por favor, selecione as datas inicial e final.');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showError('A data inicial não pode ser posterior à data final.');
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
    
    debugLog('Personal report generated:', {
        user: currentUser,
        period: `${startDate} to ${endDate}`,
        totalEntries: totalEntries,
        subjects: data.length
    });
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
                <td colspan="9" class="text-center">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        
        const canEditDelete = currentUser && entry.server === currentUser && currentUser !== 'Admin';
        
        let actionsHtml = '';
        if (canEditDelete) {
            actionsHtml = `
                <div class="action-buttons">
                    <button class="btn btn--small btn--edit" onclick="showEditModal('${entry.firebaseKey || entry.id}')">
                        Editar
                    </button>
                    <button class="btn btn--small btn--delete" onclick="showDeleteModal('${entry.firebaseKey || entry.id}')">
                        Excluir
                    </button>
                </div>
            `;
        } else {
            actionsHtml = '-';
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
}

// ===== EDIÇÃO DE ENTRADA =====
function showEditModal(entryId) {
    debugLog('Showing edit modal for entry:', entryId);
    
    const entry = allEntries.find(e => (e.firebaseKey || e.id.toString()) === entryId.toString());
    if (!entry) {
        showError('Entrada não encontrada.');
        return;
    }
    
    if (!currentUser || entry.server !== currentUser || currentUser === 'Admin') {
        showError('Você não tem permissão para editar esta entrada.');
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
        editError.textContent = '';
    }
    
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.remove('hidden');
    }
}

function hideEditModal() {
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.add('hidden');
    }
    currentEditingEntry = null;
}

async function handleSaveEdit() {
    if (!currentEditingEntry) {
        showError('Nenhuma entrada sendo editada.');
        return;
    }
    
    const processNumber = document.getElementById('edit-process-number').value.trim();
    const ctm = document.getElementById('edit-ctm').value.trim();
    const contributor = document.getElementById('edit-contributor').value.trim();
    const subjectId = document.getElementById('edit-subject-select').value;
    const observation = document.getElementById('edit-observation').value.trim();
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        const editError = document.getElementById('edit-error');
        if (editError) {
            editError.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            editError.classList.remove('hidden');
        }
        return;
    }
    
    setButtonLoading('save-edit-btn', true);
    
    try {
        const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
        if (!subject) {
            throw new Error('Assunto selecionado não encontrado.');
        }
        
        const entryId = document.getElementById('edit-entry-id').value;
        
        const entryIndex = allEntries.findIndex(e => 
            (e.firebaseKey || e.id.toString()) === entryId.toString()
        );
        
        if (entryIndex === -1) {
            throw new Error('Entrada não encontrada para atualização.');
        }
        
        allEntries[entryIndex] = {
            ...allEntries[entryIndex],
            processNumber: processNumber,
            ctm: ctm,
            contributor: contributor,
            subjectId: parseInt(subjectId),
            subjectText: subject.texto,
            observation: observation
        };
        
        saveToLocalStorage();
        
        if (isFirebaseInitialized && window.firebaseFunctions && isOnline && allEntries[entryIndex].firebaseKey) {
            try {
                const { ref, update } = window.firebaseFunctions;
                const entryRef = ref(database, `gluos_entries/${allEntries[entryIndex].firebaseKey}`);
                await update(entryRef, {
                    processNumber: processNumber,
                    ctm: ctm,
                    contributor: contributor,
                    subjectId: parseInt(subjectId),
                    subjectText: subject.texto,
                    observation: observation
                });
                debugLog('Entry updated in Firebase successfully');
            } catch (firebaseError) {
                console.error('Firebase update failed:', firebaseError);
                showToast('Entrada atualizada localmente (Firebase indisponível)', 'warning');
            }
        }
        
        hideEditModal();
        showSuccessModal('Entrada atualizada com sucesso!');
        loadDatabaseTable();
        
        debugLog('Entry updated successfully:', allEntries[entryIndex]);
        
    } catch (error) {
        console.error('Error updating entry:', error);
        const editError = document.getElementById('edit-error');
        if (editError) {
            editError.textContent = error.message || 'Erro ao atualizar entrada.';
            editError.classList.remove('hidden');
        }
    } finally {
        setButtonLoading('save-edit-btn', false);
    }
}

// ===== EXCLUSÃO DE ENTRADA =====
function showDeleteModal(entryId) {
    debugLog('Showing delete modal for entry:', entryId);
    
    const entry = allEntries.find(e => (e.firebaseKey || e.id.toString()) === entryId.toString());
    if (!entry) {
        showError('Entrada não encontrada.');
        return;
    }
    
    if (!currentUser || entry.server !== currentUser || currentUser === 'Admin') {
        showError('Você não tem permissão para excluir esta entrada.');
        return;
    }
    
    document.getElementById('delete-process-info').textContent = entry.processNumber;
    document.getElementById('delete-subject-info').textContent = entry.subjectText;
    
    document.getElementById('confirm-delete-btn').setAttribute('data-entry-id', entryId);
    
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
    }
}

function hideDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.classList.add('hidden');
    }
}

async function handleConfirmDelete() {
    const deleteBtn = document.getElementById('confirm-delete-btn');
    const entryId = deleteBtn.getAttribute('data-entry-id');
    
    if (!entryId) {
        showError('ID da entrada não encontrado.');
        return;
    }
    
    setButtonLoading('confirm-delete-btn', true);
    
    try {
        const entryIndex = allEntries.findIndex(e => 
            (e.firebaseKey || e.id.toString()) === entryId.toString()
        );
        
        if (entryIndex === -1) {
            throw new Error('Entrada não encontrada.');
        }
        
        const entry = allEntries[entryIndex];
        
        if (entry.server !== currentUser || currentUser === 'Admin') {
            throw new Error('Você não tem permissão para excluir esta entrada.');
        }
        
        allEntries.splice(entryIndex, 1);
        saveToLocalStorage();
        
        if (isFirebaseInitialized && window.firebaseFunctions && isOnline && entry.firebaseKey) {
            try {
                const { ref, remove } = window.firebaseFunctions;
                const entryRef = ref(database, `gluos_entries/${entry.firebaseKey}`);
                await remove(entryRef);
                debugLog('Entry deleted from Firebase successfully');
            } catch (firebaseError) {
                console.error('Firebase delete failed:', firebaseError);
                showToast('Entrada excluída localmente (Firebase indisponível)', 'warning');
            }
        }
        
        hideDeleteModal();
        showSuccessModal('Entrada excluída com sucesso!');
        loadDatabaseTable();
        
        debugLog('Entry deleted successfully:', { id: entryId });
        
    } catch (error) {
        console.error('Error deleting entry:', error);
        showError(error.message || 'Erro ao excluir entrada.');
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
    showToast(message, 'error');
}

function handleLogout() {
    debugLog('Logging out');
    currentUser = null;
    currentEditingEntry = null;
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = 'Bem-vindo!';
    }
    
    const newEntryBtn = document.getElementById('new-entry-btn');
    const personalReportBtn = document.getElementById('personal-report-btn');
    
    if (newEntryBtn) {
        newEntryBtn.style.display = 'inline-flex';
    }
    
    if (personalReportBtn) {
        personalReportBtn.classList.add('hidden');
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
    debugLog('Populating subject select');
    
    const select = document.getElementById('subject-select');
    if (!select) {
        debugLog('Subject select element not found!');
        return;
    }
    
    // Garantir que o select funcione
    select.style.pointerEvents = 'auto';
    select.style.zIndex = '1000';
    select.disabled = false;
    
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

function populateEditSubjectSelect() {
    debugLog('Populating edit subject select');
    
    const select = document.getElementById('edit-subject-select');
    if (!select) {
        debugLog('Edit subject select element not found!');
        return;
    }
    
    // Garantir que o select funcione
    select.style.pointerEvents = 'auto';
    select.disabled = false;
    
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
    
    debugLog(`Edit subject select populated with ${GLUOS_DATA.assuntos.length} options`);
}

function populateFilterSelects() {
    debugLog('Populating filter selects');
    
    const serverSelect = document.getElementById('filter-server');
    if (serverSelect) {
        serverSelect.style.pointerEvents = 'auto';
        serverSelect.disabled = false;
        
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
        subjectSelect.style.pointerEvents = 'auto';
        subjectSelect.disabled = false;
        
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

// ===== FUNÇÕES GLOBAIS =====
window.showEditModal = showEditModal;
window.showDeleteModal = showDeleteModal;

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

debugLog('GLUOS Firebase application loaded with FIXED connectivity and dropdown solution');
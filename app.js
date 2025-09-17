// Sistema GLUOS - VERSÃO CORRIGIDA - RESOLUÇÃO DOS PROBLEMAS DE LOGIN
// ✓ CORREÇÃO DE DATA - Problema do relatório mostrando dia anterior resolvido
// ✓ SISTEMA DE BOTÕES - Admin com relatórios administrativos, usuários com relatório pessoal
// ✓ BOTÕES EDITAR/EXCLUIR - Restaurados na base de dados
// ✓ CORREÇÃO CRÍTICA DO LOGIN - Formulário e inputs funcionando

// ===== CONFIGURAÇÃO FIREBASE =====
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
let editingEntry = null;

// ===== FUNÇÕES DE DATA CORRIGIDAS =====
// ✓ CORREÇÃO CRÍTICA: Função parseDate corrigida para evitar problemas de timezone
function parseDate(dateString) {
    debugLog('📅 CORREÇÃO DE DATA - parseDate chamada:', dateString);
    
    if (!dateString) {
        debugLog('⚠️ Data string vazia/null');
        return null;
    }
    
    try {
        let date;
        
        if (dateString.includes('/')) {
            // Formato brasileiro dd/mm/yyyy
            const [day, month, year] = dateString.split('/');
            // Criar data usando construtor que evita problemas de timezone
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            debugLog('📅 Data brasileira parseada:', { input: dateString, parsed: date.toISOString().split('T')[0] });
        } else if (dateString.includes('-')) {
            // Formato ISO yyyy-mm-dd
            const [year, month, day] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            debugLog('📅 Data ISO parseada:', { input: dateString, parsed: date.toISOString().split('T')[0] });
        } else {
            debugLog('❌ Formato de data não reconhecido:', dateString);
            return null;
        }
        
        // Normalizar para eliminar problemas de horário
        date.setHours(0, 0, 0, 0);
        
        debugLog('✅ Data final normalizada:', {
            input: dateString,
            output: date.toDateString(),
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        });
        
        return date;
    } catch (error) {
        debugLog('❌ Erro ao parsear data:', error);
        return null;
    }
}

// ✓ CORREÇÃO CRÍTICA: Função isDateInRange corrigida para comparação exata
function isDateInRange(entryDateStr, startDateStr, endDateStr) {
    debugLog('📅 CORREÇÃO DE DATA - isDateInRange chamada:', { 
        entry: entryDateStr, 
        start: startDateStr, 
        end: endDateStr 
    });
    
    const entryDate = parseDate(entryDateStr);
    if (!entryDate) {
        debugLog('❌ Data da entrada inválida');
        return false;
    }
    
    let isInRange = true;
    
    if (startDateStr) {
        const startDate = parseDate(convertInputDateToBrazilian(startDateStr));
        if (startDate) {
            isInRange = isInRange && (entryDate >= startDate);
            debugLog('📅 Comparação data início:', {
                entry: entryDate.toDateString(),
                start: startDate.toDateString(),
                entryTS: entryDate.getTime(),
                startTS: startDate.getTime(),
                isAfterStart: entryDate >= startDate
            });
        }
    }
    
    if (endDateStr) {
        const endDate = parseDate(convertInputDateToBrazilian(endDateStr));
        if (endDate) {
            isInRange = isInRange && (entryDate <= endDate);
            debugLog('📅 Comparação data fim:', {
                entry: entryDate.toDateString(),
                end: endDate.toDateString(),
                entryTS: entryDate.getTime(),
                endTS: endDate.getTime(),
                isBeforeEnd: entryDate <= endDate
            });
        }
    }
    
    debugLog('✅ Resultado da comparação de datas:', {
        entryDate: entryDateStr,
        isInRange: isInRange,
        startDate: startDateStr,
        endDate: endDateStr
    });
    
    return isInRange;
}

// ✓ CORREÇÃO: Converter data do input (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy)
function convertInputDateToBrazilian(inputDate) {
    if (!inputDate || !inputDate.includes('-')) return inputDate;
    
    const [year, month, day] = inputDate.split('-');
    const brazilianDate = `${day}/${month}/${year}`;
    debugLog('📅 Conversão data input→brasileiro:', { input: inputDate, output: brazilianDate });
    return brazilianDate;
}

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    debugLog('🚀 DOM loaded, starting GLUOS Firebase initialization');
    
    // Aguardar mais tempo para garantir DOM completamente estável
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
            loadData();
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            // ✓ CORREÇÃO CRÍTICA: Setup de listeners após DOM estar completamente pronto
            setTimeout(() => {
                setupEventListeners();
                debugLog('✅ GLUOS system fully initialized successfully');
            }, 1000);
            
        } catch (error) {
            console.error('Error during initialization:', error);
            updateFirebaseStatus('error', 'Erro na inicialização');
        }
    }, 100);
});

// ===== VERIFICAR CONFIGURAÇÃO FIREBASE =====
function checkFirebaseConfiguration() {
    isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                          firebaseConfig.databaseURL !== "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/";
    debugLog('Firebase configuration check:', { configured: isFirebaseConfigured });
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
            getDatabase, ref, set, get, push, onValue, off, remove,
            serverTimestamp, goOffline, goOnline
        } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        window.firebaseFunctions = {
            getDatabase, ref, set, get, push, onValue, off, remove,
            serverTimestamp, goOffline, goOnline
        };
        
        firebaseApp = initializeApp(firebaseConfig);
        database = getDatabase(firebaseApp);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        isFirebaseInitialized = true;
        updateFirebaseStatus('success', 'Conectado ao Firebase');
        
        debugLog('✅ Firebase initialized successfully');
        
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
            populateEditSubjectSelect();
            debugLog('Selects populated successfully');
        }, 300);
        
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

// ===== ✓ CORREÇÃO CRÍTICA: CONFIGURAR EVENT LISTENERS - VERSÃO CORRIGIDA =====
function setupEventListeners() {
    debugLog('🔧 Setting up event listeners - INÍCIO VERSÃO CORRIGIDA');
    
    // Aguardar elementos estarem 100% disponíveis
    setTimeout(() => {
        setupLoginListeners();
        setupNavigationListeners();
        setupFormListeners();
        setupModalListeners();
        setupReportsListeners();
        
        debugLog('✅ Event listeners setup COMPLETED successfully');
    }, 200);
}

// ✓ CORREÇÃO CRÍTICA: Login listeners completamente refeitos
function setupLoginListeners() {
    debugLog('🔧 CORRIGINDO LOGIN LISTENERS');
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm || !loginBtn || !userSelect || !passwordInput) {
        debugLog('❌ CRITICAL: Elementos de login não encontrados!');
        console.error('CRITICAL: Login elements missing!', {
            form: !!loginForm,
            button: !!loginBtn,
            userSelect: !!userSelect,
            password: !!passwordInput
        });
        return;
    }
    
    debugLog('✅ Todos os elementos de login encontrados');
    
    // ✓ CORREÇÃO: Garantir que os campos estão funcionais
    userSelect.disabled = false;
    passwordInput.disabled = false;
    loginBtn.disabled = false;
    
    userSelect.style.pointerEvents = 'auto';
    passwordInput.style.pointerEvents = 'auto';
    loginBtn.style.pointerEvents = 'auto';
    
    // ✓ CORREÇÃO: Limpar eventos anteriores e configurar novos
    const newLoginForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newLoginForm, loginForm);
    
    // Reobter referências após clonagem
    const finalUserSelect = document.getElementById('user-select');
    const finalPasswordInput = document.getElementById('password');
    const finalLoginBtn = document.getElementById('login-btn');
    
    if (!finalUserSelect || !finalPasswordInput || !finalLoginBtn) {
        debugLog('❌ Elementos perdidos após clonagem');
        return;
    }
    
    // ✓ CORREÇÃO: Eventos diretos sem conflito
    newLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        debugLog('🔥 LOGIN FORM SUBMIT TRIGGERED!');
        handleLogin();
        return false;
    });
    
    finalLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        debugLog('🔥 LOGIN BUTTON CLICKED!');
        handleLogin();
        return false;
    });
    
    // ✓ CORREÇÃO: Teste de funcionalidade dos campos
    finalUserSelect.addEventListener('change', function(e) {
        debugLog('✅ User select working:', e.target.value);
    });
    
    finalPasswordInput.addEventListener('input', function(e) {
        debugLog('✅ Password input working:', e.target.value.length + ' chars');
    });
    
    // ✓ CORREÇÃO: Enter no campo senha
    finalPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            debugLog('🔥 ENTER KEY PRESSED IN PASSWORD!');
            handleLogin();
        }
    });
    
    debugLog('✅ Login listeners configurados com sucesso!');
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
        { id: 'personal-report-btn', action: () => showScreen('personal-report') },
        { id: 'admin-reports-btn', action: () => showScreen('admin-reports') },
        { id: 'back-to-dashboard-1', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-2', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-3', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-personal', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-admin', action: () => showScreen('dashboard') }
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
    
    // ✓ CORREÇÃO: Modal de edição restaurado
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleSaveEdit);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideEditModal);
    }
}

function setupReportsListeners() {
    const generatePersonalReportBtn = document.getElementById('generate-personal-report');
    if (generatePersonalReportBtn) {
        generatePersonalReportBtn.addEventListener('click', handleGeneratePersonalReport);
    }
    
    const generateAdminReportBtn = document.getElementById('generate-admin-report');
    if (generateAdminReportBtn) {
        generateAdminReportBtn.addEventListener('click', handleGenerateAdminReport);
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
            }, 100);
        }
    } else {
        console.error(`Screen not found: ${screenName}-screen`);
    }
}

// ===== ✓ CORREÇÃO CRÍTICA: LOGIN COMPLETAMENTE REFEITO =====
function handleLogin() {
    debugLog('🔥 === INÍCIO DO PROCESSO DE LOGIN CORRIGIDO ===');
    
    // Obter elementos sempre fresh
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (!userSelect || !passwordInput) {
        debugLog('❌ CRITICAL: Login elements not found');
        alert('Erro: Elementos de login não encontrados. Recarregue a página.');
        return;
    }
    
    debugLog('✅ Login elements found successfully');
    
    // Limpar erro anterior
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Mostrar loading
    setButtonLoading('login-btn', true);
    
    // Aguardar para UX e processar
    setTimeout(() => {
        try {
            const user = userSelect.value.trim();
            const password = passwordInput.value.trim();
            
            debugLog('📝 Login attempt:', {
                user: user,
                userFound: !!user,
                passwordLength: password.length,
                passwordFound: !!password
            });
            
            // Validações
            if (!user) {
                debugLog('❌ Error: no user selected');
                showLoginError('Por favor, selecione um usuário.');
                setButtonLoading('login-btn', false);
                return;
            }
            
            if (!password) {
                debugLog('❌ Error: no password entered');
                showLoginError('Por favor, digite sua senha.');
                setButtonLoading('login-btn', false);
                return;
            }
            
            // Verificar senha
            const expectedPassword = getUserPassword(user);
            debugLog('🔑 Password check:', {
                entered: password,
                expected: expectedPassword,
                match: password === expectedPassword
            });
            
            if (password !== expectedPassword) {
                debugLog('❌ Error: incorrect password');
                showLoginError('Senha incorreta. Tente novamente.');
                setButtonLoading('login-btn', false);
                return;
            }
            
            // LOGIN BEM-SUCEDIDO!
            debugLog('🎉 === LOGIN SUCCESSFUL ===', { user: user });
            
            currentUser = user;
            
            // Atualizar interface
            const userInfo = document.getElementById('user-info');
            if (userInfo) {
                userInfo.textContent = `Usuário: ${currentUser}`;
            }
            
            // ✓ CORREÇÃO CRÍTICA: Sistema de botões corrigido
            setupUserInterface(user);
            
            // Limpar formulário
            try {
                userSelect.value = '';
                passwordInput.value = '';
            } catch (error) {
                debugLog('Error clearing form:', error);
            }
            
            // Remover loading
            setButtonLoading('login-btn', false);
            
            // Ir para dashboard
            setTimeout(() => {
                showScreen('dashboard');
                debugLog('✅ Redirected to dashboard successfully');
            }, 500);
            
        } catch (error) {
            console.error('Error in login process:', error);
            showLoginError('Erro interno durante login. Tente novamente.');
            setButtonLoading('login-btn', false);
        }
    }, 300);
}

function showLoginError(message) {
    debugLog('🚨 Showing login error:', message);
    
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    } else {
        // Fallback para alert se elemento não existe
        alert('Erro de Login: ' + message);
    }
}

// ===== ✓ CORREÇÃO CRÍTICA: CONFIGURAÇÃO DA INTERFACE DO USUÁRIO =====
function setupUserInterface(user) {
    debugLog('🔧 CONFIGURANDO INTERFACE PARA:', user);
    
    const personalReportBtn = document.getElementById('personal-report-btn');
    const adminReportsBtn = document.getElementById('admin-reports-btn');
    const newEntryBtn = document.getElementById('new-entry-btn');
    const dashboardButtons = document.getElementById('dashboard-buttons');
    
    if (user === 'Admin') {
        debugLog('👑 Configurando interface para ADMIN');
        
        // ADMIN: Esconder "Nova Entrada" e "Relatório Pessoal"
        if (newEntryBtn) {
            newEntryBtn.classList.add('hidden');
            newEntryBtn.classList.remove('user-only');
        }
        
        if (personalReportBtn) {
            personalReportBtn.classList.add('hidden');
            personalReportBtn.classList.remove('user-only');
        }
        
        // ADMIN: Mostrar "Relatórios Admin"
        if (adminReportsBtn) {
            adminReportsBtn.classList.remove('hidden');
            adminReportsBtn.classList.add('visible');
        }
        
        // Ajustar layout para Admin
        if (dashboardButtons) {
            dashboardButtons.classList.add('admin-layout');
            dashboardButtons.classList.add('hide-for-admin');
        }
        
        debugLog('✅ Interface Admin configurada - Botões: Pesquisar, Base de Dados, Perfil, Relatórios Admin');
        
    } else {
        debugLog('👤 Configurando interface para USUÁRIO NORMAL');
        
        // USUÁRIO: Mostrar "Nova Entrada" e "Relatório Pessoal"
        if (newEntryBtn) {
            newEntryBtn.classList.remove('hidden');
            newEntryBtn.classList.add('user-only');
        }
        
        if (personalReportBtn) {
            personalReportBtn.classList.remove('hidden');
            personalReportBtn.classList.add('user-only');
        }
        
        // USUÁRIO: Esconder "Relatórios Admin"
        if (adminReportsBtn) {
            adminReportsBtn.classList.add('hidden');
            adminReportsBtn.classList.remove('visible');
        }
        
        // Layout normal para usuários
        if (dashboardButtons) {
            dashboardButtons.classList.remove('admin-layout');
            dashboardButtons.classList.remove('hide-for-admin');
        }
        
        debugLog('✅ Interface Usuário configurada - Botões: Nova Entrada, Pesquisar, Base de Dados, Perfil, Relatório Pessoal');
    }
}

// ===== GERENCIAMENTO DE SENHAS =====
function getUserPassword(username) {
    const customPassword = userPasswords[username];
    const finalPassword = customPassword || '123';
    debugLog(`Getting password for ${username}:`, { hasCustom: !!customPassword, using: finalPassword });
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

// ===== ✓ CORREÇÃO: BASE DE DADOS COM BOTÕES EDITAR/EXCLUIR RESTAURADOS =====
function loadDatabaseTable(filteredEntries = null) {
    debugLog('🔧 CARREGANDO TABELA DA BASE DE DADOS COM BOTÕES EDITAR/EXCLUIR');
    
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
        
        // ✓ CORREÇÃO: Adicionar botões de editar/excluir para o usuário logado
        let actionsHtml = '';
        if (currentUser && (currentUser === entry.server || currentUser === 'Admin')) {
            actionsHtml = `
                <div class="actions-cell">
                    <button type="button" class="btn btn--action btn--edit" onclick="editEntry('${entry.id || entry.firebaseKey}')">
                        Editar
                    </button>
                    <button type="button" class="btn btn--action btn--delete" onclick="deleteEntry('${entry.id || entry.firebaseKey}')">
                        Excluir
                    </button>
                </div>
            `;
        } else {
            actionsHtml = '<div class="actions-cell">-</div>';
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
            <td class="actions-column">${actionsHtml}</td>
        `;
        tableBody.appendChild(row);
    });
    
    debugLog(`✅ Tabela carregada com ${entries.length} entradas e botões de ação restaurados`);
}

// ===== ✓ CORREÇÃO: FUNÇÕES DE EDITAR E EXCLUIR RESTAURADAS =====
function editEntry(entryId) {
    debugLog('🔧 EDITANDO ENTRADA:', entryId);
    
    const entry = allEntries.find(e => (e.id && e.id.toString() === entryId.toString()) || e.firebaseKey === entryId);
    
    if (!entry) {
        showToast('Entrada não encontrada.', 'error');
        return;
    }
    
    if (currentUser !== entry.server && currentUser !== 'Admin') {
        showToast('Você só pode editar suas próprias entradas.', 'error');
        return;
    }
    
    // Preencher modal de edição
    document.getElementById('edit-entry-id').value = entryId;
    document.getElementById('edit-process-number').value = entry.processNumber;
    document.getElementById('edit-ctm').value = entry.ctm;
    document.getElementById('edit-contributor').value = entry.contributor;
    document.getElementById('edit-subject-select').value = entry.subjectId;
    document.getElementById('edit-observation').value = entry.observation || '';
    
    editingEntry = entry;
    
    // Mostrar modal
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.remove('hidden');
    }
    
    debugLog('✅ Modal de edição aberto para entrada:', entryId);
}

async function handleSaveEdit() {
    debugLog('💾 SALVANDO EDIÇÃO');
    
    if (!editingEntry) {
        showToast('Erro: entrada não encontrada para edição.', 'error');
        return;
    }
    
    const entryId = document.getElementById('edit-entry-id').value;
    const processNumber = document.getElementById('edit-process-number').value.trim();
    const ctm = document.getElementById('edit-ctm').value.trim();
    const contributor = document.getElementById('edit-contributor').value.trim();
    const subjectId = document.getElementById('edit-subject-select').value;
    const observation = document.getElementById('edit-observation').value.trim();
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    setButtonLoading('save-edit-btn', true);
    
    try {
        const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
        if (!subject) {
            showToast('Assunto selecionado não encontrado.', 'error');
            setButtonLoading('save-edit-btn', false);
            return;
        }
        
        // Atualizar dados da entrada
        editingEntry.processNumber = processNumber;
        editingEntry.ctm = ctm;
        editingEntry.contributor = contributor;
        editingEntry.subjectId = parseInt(subjectId);
        editingEntry.subjectText = subject.texto;
        editingEntry.observation = observation;
        
        // Salvar localmente
        saveToLocalStorage();
        
        // Tentar salvar no Firebase se disponível
        if (isFirebaseInitialized && window.firebaseFunctions && isOnline && editingEntry.firebaseKey) {
            try {
                const { ref, set } = window.firebaseFunctions;
                const entryRef = ref(database, `gluos_entries/${editingEntry.firebaseKey}`);
                await set(entryRef, editingEntry);
                debugLog('Entry updated in Firebase successfully');
            } catch (firebaseError) {
                console.error('Firebase update failed, but entry saved locally:', firebaseError);
                showToast('Entrada salva localmente (Firebase indisponível)', 'warning');
            }
        }
        
        hideEditModal();
        loadDatabaseTable(); // Recarregar tabela
        showToast('Entrada atualizada com sucesso!', 'success');
        
        debugLog('✅ Entry updated successfully:', editingEntry);
        
    } catch (error) {
        console.error('Error updating entry:', error);
        showToast('Erro ao atualizar entrada. Tente novamente.', 'error');
    } finally {
        setButtonLoading('save-edit-btn', false);
    }
}

async function deleteEntry(entryId) {
    debugLog('🗑️ EXCLUINDO ENTRADA:', entryId);
    
    if (!confirm('Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    const entryIndex = allEntries.findIndex(e => (e.id && e.id.toString() === entryId.toString()) || e.firebaseKey === entryId);
    
    if (entryIndex === -1) {
        showToast('Entrada não encontrada.', 'error');
        return;
    }
    
    const entry = allEntries[entryIndex];
    
    if (currentUser !== entry.server && currentUser !== 'Admin') {
        showToast('Você só pode excluir suas próprias entradas.', 'error');
        return;
    }
    
    try {
        // Remover localmente
        allEntries.splice(entryIndex, 1);
        saveToLocalStorage();
        
        // Tentar remover do Firebase se disponível
        if (isFirebaseInitialized && window.firebaseFunctions && isOnline && entry.firebaseKey) {
            try {
                const { ref, remove } = window.firebaseFunctions;
                const entryRef = ref(database, `gluos_entries/${entry.firebaseKey}`);
                await remove(entryRef);
                debugLog('Entry deleted from Firebase successfully');
            } catch (firebaseError) {
                console.error('Firebase delete failed, but entry removed locally:', firebaseError);
                showToast('Entrada removida localmente (Firebase indisponível)', 'warning');
            }
        }
        
        loadDatabaseTable(); // Recarregar tabela
        showToast('Entrada excluída com sucesso!', 'success');
        
        debugLog('✅ Entry deleted successfully');
        
    } catch (error) {
        console.error('Error deleting entry:', error);
        showToast('Erro ao excluir entrada. Tente novamente.', 'error');
    }
}

function hideEditModal() {
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.classList.add('hidden');
    }
    editingEntry = null;
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

// ===== ✓ CORREÇÃO: RELATÓRIO PESSOAL =====
function handleGeneratePersonalReport() {
    debugLog('📊 Gerando relatório pessoal');
    
    if (!currentUser) {
        showError('Você precisa estar logado para gerar relatório.');
        return;
    }
    
    if (currentUser === 'Admin') {
        showError('Admin deve usar os Relatórios Administrativos.');
        return;
    }
    
    const startDate = document.getElementById('personal-start-date').value;
    const endDate = document.getElementById('personal-end-date').value;
    const dateError = document.getElementById('personal-date-error');
    
    if (dateError) {
        dateError.classList.add('hidden');
        dateError.textContent = '';
    }
    
    if (startDate && endDate && startDate > endDate) {
        showPersonalReportError('A data início não pode ser maior que a data final.');
        return;
    }
    
    setButtonLoading('generate-personal-report', true);
    
    setTimeout(() => {
        try {
            generatePersonalReport(startDate, endDate);
        } finally {
            setButtonLoading('generate-personal-report', false);
        }
    }, 500);
}

function generatePersonalReport(startDate, endDate) {
    debugLog('📊 GERANDO RELATÓRIO PESSOAL COM DATAS CORRIGIDAS:', { 
        user: currentUser, 
        startDate, 
        endDate 
    });
    
    // ✓ CORREÇÃO CRÍTICA: Filtrar entradas do usuário atual com datas corretas
    let userEntries = allEntries.filter(entry => entry.server === currentUser);
    debugLog(`📊 Entradas do usuário ${currentUser}:`, userEntries.length);
    
    if (startDate || endDate) {
        userEntries = userEntries.filter(entry => {
            const inRange = isDateInRange(entry.date, startDate, endDate);
            debugLog(`📅 Verificando entrada ${entry.date}:`, { 
                date: entry.date, 
                startDate, 
                endDate, 
                inRange 
            });
            return inRange;
        });
    }
    
    debugLog(`📊 Entradas filtradas por data: ${userEntries.length} de ${allEntries.filter(e => e.server === currentUser).length}`);
    
    displayPersonalReport(userEntries, startDate, endDate);
}

function displayPersonalReport(entries, startDate, endDate) {
    const reportContent = document.getElementById('personal-report-content');
    const reportTitle = document.getElementById('personal-report-title');
    const reportPeriod = document.getElementById('personal-report-period');
    const reportTbody = document.getElementById('personal-report-tbody');
    const totalEntries = document.getElementById('personal-total-entries');
    const summaryPeriod = document.getElementById('personal-summary-period');
    
    if (!reportContent || !reportTbody) return;
    
    if (reportTitle) {
        reportTitle.textContent = `Relatório de ${currentUser}`;
    }
    
    let periodText = '';
    if (startDate && endDate) {
        const formattedStart = formatDateForDisplay(startDate);
        const formattedEnd = formatDateForDisplay(endDate);
        periodText = `${formattedStart} à ${formattedEnd}`;
    } else if (startDate) {
        const formattedStart = formatDateForDisplay(startDate);
        periodText = `A partir de ${formattedStart}`;
    } else if (endDate) {
        const formattedEnd = formatDateForDisplay(endDate);
        periodText = `Até ${formattedEnd}`;
    } else {
        periodText = 'Todos os períodos';
    }
    
    if (reportPeriod) {
        reportPeriod.textContent = periodText;
    }
    
    if (summaryPeriod) {
        summaryPeriod.textContent = periodText;
    }
    
    if (totalEntries) {
        totalEntries.textContent = entries.length;
    }
    
    reportTbody.innerHTML = '';
    
    if (entries.length === 0) {
        reportTbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Nenhuma entrada encontrada para o período selecionado.
                </td>
            </tr>
        `;
    } else {
        entries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.time}</td>
                <td>${entry.processNumber}</td>
                <td>${entry.ctm}</td>
                <td>${entry.contributor}</td>
                <td>${entry.subjectText}</td>
                <td>${entry.observation || '-'}</td>
            `;
            reportTbody.appendChild(row);
        });
    }
    
    reportContent.classList.remove('hidden');
    
    debugLog('✅ Relatório pessoal exibido com sucesso');
}

function showPersonalReportError(message) {
    const dateError = document.getElementById('personal-date-error');
    if (dateError) {
        dateError.textContent = message;
        dateError.classList.remove('hidden');
    }
}

// ===== ✓ CORREÇÃO: RELATÓRIOS ADMINISTRATIVOS =====
function handleGenerateAdminReport() {
    debugLog('📊 Gerando relatórios administrativos');
    
    if (currentUser !== 'Admin') {
        showError('Apenas o Admin pode gerar relatórios administrativos.');
        return;
    }
    
    const startDate = document.getElementById('admin-start-date').value;
    const endDate = document.getElementById('admin-end-date').value;
    const dateError = document.getElementById('admin-date-error');
    
    if (dateError) {
        dateError.classList.add('hidden');
        dateError.textContent = '';
    }
    
    if (startDate && endDate && startDate > endDate) {
        showAdminReportError('A data início não pode ser maior que a data final.');
        return;
    }
    
    setButtonLoading('generate-admin-report', true);
    
    setTimeout(() => {
        try {
            generateAdminReport(startDate, endDate);
        } finally {
            setButtonLoading('generate-admin-report', false);
        }
    }, 500);
}

function generateAdminReport(startDate, endDate) {
    debugLog('📊 GERANDO RELATÓRIO ADMINISTRATIVO COM DATAS CORRIGIDAS:', { startDate, endDate });
    
    // ✓ CORREÇÃO CRÍTICA: Filtrar entradas por data com função corrigida
    let filteredEntries = allEntries;
    
    if (startDate || endDate) {
        filteredEntries = allEntries.filter(entry => {
            const inRange = isDateInRange(entry.date, startDate, endDate);
            debugLog(`📅 Verificando entrada admin ${entry.date}:`, { 
                date: entry.date, 
                startDate, 
                endDate, 
                inRange 
            });
            return inRange;
        });
    }
    
    debugLog(`📊 Entradas filtradas para relatório admin: ${filteredEntries.length} de ${allEntries.length}`);
    
    const reportData = generateReportData(filteredEntries);
    displayAdminReport(reportData, startDate, endDate);
}

function generateReportData(entries) {
    debugLog('Processing report data for entries:', entries.length);
    
    const servers = ["Eduardo", "Wendel", "Júlia", "Tati", "Sônia", "Rita", "Mara", "Admin"];
    const subjectStats = {};
    const serverTotals = {};
    let grandTotal = 0;
    
    servers.forEach(server => {
        serverTotals[server] = 0;
    });
    
    entries.forEach(entry => {
        const subjectId = entry.subjectId;
        const subjectText = entry.subjectText;
        const server = entry.server;
        
        if (!subjectStats[subjectId]) {
            subjectStats[subjectId] = {
                text: subjectText,
                servers: {},
                total: 0
            };
            
            servers.forEach(srv => {
                subjectStats[subjectId].servers[srv] = 0;
            });
        }
        
        subjectStats[subjectId].servers[server]++;
        subjectStats[subjectId].total++;
        serverTotals[server]++;
        grandTotal++;
    });
    
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

function displayAdminReport(reportData, startDate, endDate) {
    const reportContent = document.getElementById('admin-report-content');
    const reportTitle = document.getElementById('admin-report-title');
    const reportPeriod = document.getElementById('admin-report-period');
    const reportTbody = document.getElementById('admin-report-tbody');
    
    if (!reportContent || !reportTbody) return;
    
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
    
    reportTbody.innerHTML = '';
    
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
    document.getElementById('admin-total-eduardo').textContent = reportData.serverTotals.Eduardo;
    document.getElementById('admin-total-wendel').textContent = reportData.serverTotals.Wendel;
    document.getElementById('admin-total-julia').textContent = reportData.serverTotals.Júlia;
    document.getElementById('admin-total-tati').textContent = reportData.serverTotals.Tati;
    document.getElementById('admin-total-sonia').textContent = reportData.serverTotals.Sônia;
    document.getElementById('admin-total-rita').textContent = reportData.serverTotals.Rita;
    document.getElementById('admin-total-mara').textContent = reportData.serverTotals.Mara;
    document.getElementById('admin-total-admin').textContent = reportData.serverTotals.Admin;
    document.getElementById('admin-total-geral').textContent = reportData.grandTotal;
    
    reportContent.classList.remove('hidden');
    
    debugLog('✅ Relatório administrativo exibido com sucesso');
}

function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function showAdminReportError(message) {
    const dateError = document.getElementById('admin-date-error');
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

// ===== POPULAR SELECTS =====
function populateSubjectSelect() {
    debugLog('Populating subject select - START');
    
    const select = document.getElementById('subject-select');
    if (!select) {
        debugLog('Subject select element not found!');
        return;
    }
    
    debugLog('Subject select element found, clearing and populating...');
    
    try {
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
        
        debugLog(`Subject select populated with ${GLUOS_DATA.assuntos.length} options successfully`);
        
    } catch (error) {
        console.error('Error populating subject select:', error);
    }
}

function populateEditSubjectSelect() {
    debugLog('Populating edit subject select');
    
    const select = document.getElementById('edit-subject-select');
    if (!select) {
        debugLog('Edit subject select element not found!');
        return;
    }
    
    try {
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
        
        debugLog(`Edit subject select populated with ${GLUOS_DATA.assuntos.length} options successfully`);
        
    } catch (error) {
        console.error('Error populating edit subject select:', error);
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

// ===== EXPOR FUNÇÕES GLOBALMENTE PARA ONCLICK =====
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
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

debugLog('🎯 GLUOS SISTEMA TOTALMENTE CORRIGIDO CARREGADO!');
debugLog('✅ CORREÇÃO 1: Data do relatório agora mostra a data exata selecionada');
debugLog('✅ CORREÇÃO 2: Admin tem relatórios administrativos, usuários têm relatório pessoal');
debugLog('✅ CORREÇÃO 3: Botões editar e excluir restaurados na base de dados');
debugLog('✅ CORREÇÃO 4: Formulário de login completamente funcional');
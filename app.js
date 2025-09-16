// Sistema GLUOS - Gerência de Licenciamento de Uso e Ocupação do Solo

// Dados da aplicação
const GLUOS_DATA = {
    usuarios: ["Eduardo", "Wendel", "Júlia", "Tati", "Sônia", "Rita", "Mara"],
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

// Estado da aplicação
let currentUser = null;
let allEntries = [];

// Elementos DOM
let screens = {};
let elements = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing GLUOS system...');
    initializeElements();
    initializeApp();
    setupEventListeners();
    loadData();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// Inicializar referências de elementos
function initializeElements() {
    screens = {
        login: document.getElementById('login-screen'),
        dashboard: document.getElementById('dashboard-screen'),
        newEntry: document.getElementById('new-entry-screen'),
        search: document.getElementById('search-screen'),
        database: document.getElementById('database-screen')
    };
    
    elements = {
        loginForm: document.getElementById('login-form'),
        userSelect: document.getElementById('user-select'),
        password: document.getElementById('password'),
        loginError: document.getElementById('login-error'),
        userInfo: document.getElementById('user-info'),
        datetimeInfo: document.getElementById('datetime-info')
    };
    
    console.log('Elements initialized:', Object.keys(elements).length, 'elements found');
}

// Inicialização da aplicação
function initializeApp() {
    console.log('Initializing app...');
    populateSubjectSelect();
    populateFilterSelects();
    showScreen('login');
    console.log('App initialized successfully');
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', function(e) {
            console.log('Login form submitted');
            handleLogin(e);
        });
        console.log('Login form listener added');
    }
    
    // Dashboard navigation
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const newEntryBtn = document.getElementById('new-entry-btn');
    if (newEntryBtn) {
        newEntryBtn.addEventListener('click', () => {
            console.log('New entry button clicked');
            showScreen('newEntry');
        });
    }
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            console.log('Search button clicked');
            showScreen('search');
        });
    }
    
    const databaseBtn = document.getElementById('database-btn');
    if (databaseBtn) {
        databaseBtn.addEventListener('click', () => {
            console.log('Database button clicked');
            showScreen('database');
            loadDatabaseTable();
        });
    }
    
    // Botões de voltar
    const backButtons = [
        { id: 'back-to-dashboard-1', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-2', action: () => showScreen('dashboard') },
        { id: 'back-to-dashboard-3', action: () => showScreen('dashboard') }
    ];
    
    backButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.action);
        }
    });
    
    // Nova entrada
    const newEntryForm = document.getElementById('new-entry-form');
    if (newEntryForm) {
        newEntryForm.addEventListener('submit', handleNewEntry);
    }
    
    const subjectNumber = document.getElementById('subject-number');
    if (subjectNumber) {
        subjectNumber.addEventListener('input', handleSubjectNumberChange);
    }
    
    const subjectSelect = document.getElementById('subject-select');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', handleSubjectSelectChange);
    }
    
    // Pesquisa
    const searchSubmit = document.getElementById('search-submit');
    if (searchSubmit) {
        searchSubmit.addEventListener('click', handleSearch);
    }
    
    const searchProcess = document.getElementById('search-process');
    if (searchProcess) {
        searchProcess.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Filtros da base de dados
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', applyDatabaseFilters);
    }
    
    const clearFilters = document.getElementById('clear-filters');
    if (clearFilters) {
        clearFilters.addEventListener('click', clearDatabaseFilters);
    }
    
    // Modal
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    console.log('Event listeners setup completed');
}

// Gerenciamento de telas
function showScreen(screenName) {
    console.log('Showing screen:', screenName);
    
    // Esconder todas as telas
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Mostrar tela solicitada
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        console.log('Screen', screenName, 'is now active');
    } else {
        console.error('Screen not found:', screenName);
    }
}

// Login
function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login...');
    
    const user = elements.userSelect.value;
    const password = elements.password.value;
    
    console.log('Login attempt - User:', user, 'Password length:', password.length);
    
    // Limpar mensagem de erro anterior
    if (elements.loginError) {
        elements.loginError.classList.add('hidden');
        elements.loginError.textContent = '';
    }
    
    // Validações
    if (!user || user === '') {
        console.log('No user selected');
        showError('Por favor, selecione um usuário.');
        return false;
    }
    
    if (password !== '123') {
        console.log('Invalid password');
        showError('Senha incorreta. Use: 123');
        return false;
    }
    
    // Login bem-sucedido
    console.log('Login successful for user:', user);
    currentUser = user;
    
    // Atualizar informações do usuário
    if (elements.userInfo) {
        elements.userInfo.textContent = `Usuário: ${currentUser}`;
    }
    
    // Limpar formulário
    elements.loginForm.reset();
    
    // Ir para dashboard
    showScreen('dashboard');
    
    return true;
}

function showError(message) {
    console.log('Showing error:', message);
    if (elements.loginError) {
        elements.loginError.textContent = message;
        elements.loginError.classList.remove('hidden');
    } else {
        alert(message); // Fallback se elemento não existe
    }
}

function handleLogout() {
    console.log('Logging out...');
    currentUser = null;
    showScreen('login');
}

// Atualizar data/hora
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
    
    if (elements.datetimeInfo) {
        elements.datetimeInfo.textContent = dateTimeString;
    }
}

// Popular select de assuntos
function populateSubjectSelect() {
    const select = document.getElementById('subject-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecione o assunto --</option>';
    
    GLUOS_DATA.assuntos.forEach(assunto => {
        const option = document.createElement('option');
        option.value = assunto.id;
        option.textContent = `${assunto.id} - ${assunto.texto}`;
        select.appendChild(option);
    });
    
    console.log('Subject select populated with', GLUOS_DATA.assuntos.length, 'options');
}

// Popular selects de filtro
function populateFilterSelects() {
    // Filtro de servidor
    const serverSelect = document.getElementById('filter-server');
    if (serverSelect) {
        serverSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            serverSelect.appendChild(option);
        });
    }
    
    // Filtro de assunto
    const subjectSelect = document.getElementById('filter-subject');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Todos</option>';
        GLUOS_DATA.assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = `${assunto.id} - ${assunto.texto}`;
            subjectSelect.appendChild(option);
        });
    }
}

// Manipulação do campo número do assunto
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

// Nova entrada
function handleNewEntry(e) {
    e.preventDefault();
    console.log('Handling new entry...');
    
    const processNumber = document.getElementById('process-number').value.trim();
    const ctm = document.getElementById('ctm').value.trim();
    const contributor = document.getElementById('contributor').value.trim();
    const subjectId = document.getElementById('subject-select').value;
    
    if (!processNumber || !ctm || !contributor || !subjectId) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const subject = GLUOS_DATA.assuntos.find(a => a.id == subjectId);
    const now = new Date();
    
    const entry = {
        id: Date.now(),
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR'),
        server: currentUser,
        processNumber: processNumber,
        ctm: ctm,
        contributor: contributor,
        subjectId: parseInt(subjectId),
        subjectText: subject.texto,
        timestamp: now.getTime()
    };
    
    allEntries.unshift(entry);
    saveData();
    
    showSuccessModal('Entrada salva com sucesso!');
    document.getElementById('new-entry-form').reset();
    
    console.log('New entry saved:', entry);
}

// Pesquisa
function handleSearch() {
    const processNumber = document.getElementById('search-process').value.trim();
    
    if (!processNumber) {
        alert('Por favor, digite um número de processo para pesquisar.');
        return;
    }
    
    const results = allEntries.filter(entry => 
        entry.processNumber.toLowerCase().includes(processNumber.toLowerCase())
    );
    
    displaySearchResults(results, processNumber);
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
                <td colspan="6" class="text-center">
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
        `;
        tableBody.appendChild(row);
    });
    
    resultsContainer.classList.remove('hidden');
}

// Base de dados
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
                <td colspan="7" class="text-center">
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
        `;
        tableBody.appendChild(row);
    });
}

// Filtros
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

// Modal
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

// Persistência de dados
function saveData() {
    try {
        localStorage.setItem('gluos_entries', JSON.stringify(allEntries));
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem('gluos_entries');
        if (savedData) {
            allEntries = JSON.parse(savedData);
            // Ordenar por timestamp decrescente (mais recente primeiro)
            allEntries.sort((a, b) => b.timestamp - a.timestamp);
            console.log('Data loaded successfully:', allEntries.length, 'entries');
        } else {
            console.log('No saved data found');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        allEntries = [];
    }
}
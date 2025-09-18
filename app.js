// Sistema GLUOS - Versão Simplificada com Login Corrigido


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

const DEBUG_MODE = true;

// Dados da aplicação
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
        {id: 10, texto: "Solicitação de Desarquivamento de Processo"}
    ]
};

// Estado global
let currentUser = null;

function testFirebaseConnection() {
    const testRef = ref(database, '.info/connected');
    onValue(testRef, (snapshot) => {
        isConnected = snapshot.val();
        if (isConnected) {
            updateFirebaseStatus('success', 'Conectado ao Firebase');
            loadEntriesFromFirebase();   // <- mantém esta linha
        } else {
            updateFirebaseStatus('error', 'Desconectado do Firebase');
        }
    });
}

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[GLUOS] ${message}`, data || '');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    debugLog('Sistema iniciando...');
    
    updateFirebaseStatus('warning', 'Modo Demo');
    setupEventListeners();
    showScreen('login');
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    debugLog('Sistema inicializado com sucesso!');
});

function setupEventListeners() {
    debugLog('Configurando event listeners...');
    
    // LOGIN - forma mais direta possível
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = function(e) {
            e.preventDefault();
            debugLog('Botão de login clicado!');
            doLogin();
            return false;
        };
        debugLog('Listener do botão login configurado');
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            debugLog('Formulário submetido!');
            doLogin();
            return false;
        };
        debugLog('Listener do formulário configurado');
    }
    
    // Enter na senha
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                debugLog('Enter pressionado na senha!');
                doLogin();
            }
        };
        debugLog('Listener da senha configurado');
    }
    
    // Navegação
    setupNavigation();
    
    debugLog('Todos os event listeners configurados!');
}

function doLogin() {
    debugLog('=== EXECUTANDO LOGIN ===');
    
    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    debugLog('Elementos encontrados:', {
        userSelect: !!userSelect,
        passwordInput: !!passwordInput,
        loginError: !!loginError
    });
    
    if (!userSelect || !passwordInput) {
        debugLog('ERRO: Elementos não encontrados!');
        alert('Erro interno: elementos não encontrados');
        return;
    }
    
    const user = userSelect.value;
    const password = passwordInput.value;
    
    debugLog('Dados do login:', {
        user: user,
        password: password,
        userLength: user ? user.length : 0,
        passwordLength: password ? password.length : 0
    });
    
    // Limpar erro anterior
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Validação
    if (!user || user.trim() === '') {
        debugLog('ERRO: Usuário não selecionado');
        showLoginError('Por favor, selecione um usuário.');
        return;
    }
    
    if (!password || password.trim() === '') {
        debugLog('ERRO: Senha vazia');
        showLoginError('Por favor, digite sua senha.');
        return;
    }
    
    // Validar senha (sempre "123" para demo)
    if (password.trim() !== '123') {
        debugLog('ERRO: Senha incorreta');
        showLoginError('Senha incorreta. Use "123" para todos os usuários.');
        return;
    }
    
    // Validar usuário válido
    if (!GLUOS_DATA.usuarios.includes(user.trim())) {
        debugLog('ERRO: Usuário inválido');
        showLoginError('Usuário inválido.');
        return;
    }
    
    // LOGIN BEM-SUCEDIDO!
    debugLog('=== LOGIN BEM-SUCEDIDO ===', { usuario: user.trim() });
    
    currentUser = user.trim();
    
    // Atualizar interface
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Usuário: ${currentUser}`;
        debugLog('User info atualizado');
    }
    
    // Limpar formulário
    userSelect.value = '';
    passwordInput.value = '';
    
    // Ir para dashboard
    showScreen('dashboard');
    debugLog('Redirecionado para dashboard');
}

function showLoginError(message) {
    debugLog('Mostrando erro de login:', message);
    
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    } else {
        alert('Erro: ' + message);
    }
}

function setupNavigation() {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            debugLog('Logout clicado');
            currentUser = null;
            const userInfo = document.getElementById('user-info');
            if (userInfo) userInfo.textContent = 'Bem-vindo!';
            showScreen('login');
        };
    }
    
    // Botões do dashboard
    const newEntryBtn = document.getElementById('new-entry-btn');
    if (newEntryBtn) {
        newEntryBtn.onclick = function() {
            debugLog('Nova entrada clicado');
            showScreen('new-entry');
        };
    }
    
    const personalReportBtn = document.getElementById('personal-report-btn');
    if (personalReportBtn) {
        personalReportBtn.onclick = function() {
            debugLog('Relatório pessoal clicado');
            showScreen('personal-report');
            setupPersonalReportDates();
        };
    }
    
    const adminReportBtn = document.getElementById('admin-report-btn');
    if (adminReportBtn) {
        adminReportBtn.onclick = function() {
            debugLog('Relatório admin clicado');
            showScreen('admin-report');
            setupAdminReportDates();
        };
    }
    
    const databaseBtn = document.getElementById('database-btn');
    if (databaseBtn) {
        databaseBtn.onclick = function() {
            debugLog('Base de dados clicado');
            showScreen('database');
            loadDatabaseTable();
        };
    }
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.onclick = function() {
            debugLog('Pesquisa clicado');
            showScreen('search');
        };
    }
    
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.onclick = function() {
            debugLog('Perfil clicado');
            showProfileModal();
        };
    }
    
    // Botões de voltar
    const backButtons = [
        'back-to-dashboard-1',
        'back-to-dashboard-2', 
        'back-to-dashboard-3',
        'back-to-dashboard-report',
        'back-to-dashboard-admin'
    ];
    
    backButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = function() {
                debugLog('Voltar ao dashboard clicado');
                showScreen('dashboard');
            };
        }
    });
    
    // Relatórios
    const generatePersonalBtn = document.getElementById('generate-personal-report');
    if (generatePersonalBtn) {
        generatePersonalBtn.onclick = function() {
            debugLog('Gerar relatório pessoal clicado');
            handleGeneratePersonalReport();
        };
    }
    
    const generateAdminBtn = document.getElementById('generate-admin-report');
    if (generateAdminBtn) {
        generateAdminBtn.onclick = function() {
            debugLog('Gerar relatório admin clicado');
            handleGenerateAdminReport();
        };
    }
    
    // Modais
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.onclick = function() {
            hideModal();
        };
    }
    
    const cancelProfile = document.getElementById('cancel-profile');
    if (cancelProfile) {
        cancelProfile.onclick = function() {
            hideProfileModal();
        };
    }
    
    debugLog('Navegação configurada');
}

function showScreen(screenName) {
    debugLog(`Mudando para tela: ${screenName}`);
    
    // Ocultar todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar tela alvo
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        debugLog(`Tela ${screenName} ativada`);
        
        // Configurar dashboard baseado no usuário
        if (screenName === 'dashboard') {
            updateDashboardForUser();
        }
    } else {
        debugLog(`ERRO: Tela ${screenName}-screen não encontrada`);
    }
}

function updateDashboardForUser() {
    debugLog('Atualizando dashboard para usuário:', currentUser);
    
    const newEntryBtn = document.getElementById('new-entry-btn');
    const personalReportBtn = document.getElementById('personal-report-btn');
    const adminReportBtn = document.getElementById('admin-report-btn');
    
    if (currentUser === 'Admin') {
        // ADMIN: apenas Relatórios Admin visível
        if (newEntryBtn) {
            newEntryBtn.style.display = 'none';
            debugLog('Nova Entrada ocultado para Admin');
        }
        if (personalReportBtn) {
            personalReportBtn.style.display = 'none';
            debugLog('Relatório Pessoal ocultado para Admin');
        }
        if (adminReportBtn) {
            adminReportBtn.style.display = 'flex';
            debugLog('Relatórios Admin mostrado para Admin');
        }
    } else {
        // USUÁRIOS NORMAIS: Nova Entrada e Relatório Pessoal visíveis
        if (newEntryBtn) {
            newEntryBtn.style.display = 'flex';
            debugLog('Nova Entrada mostrado para usuário normal');
        }
        if (personalReportBtn) {
            personalReportBtn.style.display = 'flex';
            debugLog('Relatório Pessoal mostrado para usuário normal');
        }
        if (adminReportBtn) {
            adminReportBtn.style.display = 'none';
            debugLog('Relatórios Admin ocultado para usuário normal');
        }
    }
}

// Relatório Pessoal
function setupPersonalReportDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startInput = document.getElementById('report-date-start');
    const endInput = document.getElementById('report-date-end');
    
    if (startInput) startInput.value = firstDay.toISOString().split('T')[0];
    if (endInput) endInput.value = today.toISOString().split('T')[0];
    
    debugLog('Datas do relatório pessoal configuradas');
}

function handleGeneratePersonalReport() {
    debugLog('Gerando relatório pessoal...');
    
    if (!currentUser) {
        alert('Você precisa estar logado.');
        return;
    }
    
    const startDate = document.getElementById('report-date-start')?.value;
    const endDate = document.getElementById('report-date-end')?.value;
    
    if (!startDate || !endDate) {
        alert('Preencha as datas.');
        return;
    }
    
    generatePersonalReport(startDate, endDate);
}

function generatePersonalReport(startDate, endDate) {
    debugLog('Processando relatório pessoal:', { startDate, endDate, currentUser });
    
    // Filtrar entradas do usuário atual
    const userEntries = allEntries.filter(entry => entry.server === currentUser);
    debugLog('Entradas do usuário:', userEntries.length);
    
    // Contar por assunto
    const subjectCount = {};
    userEntries.forEach(entry => {
        if (!subjectCount[entry.subjectId]) {
            subjectCount[entry.subjectId] = {
                id: entry.subjectId,
                text: entry.subjectText,
                count: 0
            };
        }
        subjectCount[entry.subjectId].count++;
    });
    
    const totalEntries = userEntries.length;
    const reportData = Object.values(subjectCount).map(subject => ({
        ...subject,
        percentage: totalEntries > 0 ? ((subject.count / totalEntries) * 100).toFixed(1) : 0
    }));
    
    reportData.sort((a, b) => b.count - a.count);
    
    displayPersonalReport(reportData, totalEntries, startDate, endDate);
}

function displayPersonalReport(reportData, totalEntries, startDate, endDate) {
    debugLog('Exibindo relatório pessoal');
    
    // Atualizar cabeçalho
    const reportUserName = document.getElementById('report-user-name');
    const reportPeriod = document.getElementById('report-period');
    const reportTotalEntries = document.getElementById('report-total-entries');
    
    if (reportUserName) reportUserName.textContent = currentUser;
    if (reportPeriod) reportPeriod.textContent = `${formatDateBR(startDate)} a ${formatDateBR(endDate)}`;
    if (reportTotalEntries) reportTotalEntries.textContent = totalEntries;
    
    // Atualizar tabela
    const tableBody = document.querySelector('#personal-report-table tbody');
    const grandTotal = document.getElementById('report-grand-total');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        if (reportData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">
                        Nenhum registro encontrado.
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
    }
    
    if (grandTotal) grandTotal.textContent = totalEntries;
    
    // Mostrar resultados
    const resultsContainer = document.getElementById('personal-report-results');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
    
    debugLog('Relatório pessoal exibido');
}

// Relatório Admin
function setupAdminReportDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startInput = document.getElementById('admin-date-start');
    const endInput = document.getElementById('admin-date-end');
    
    if (startInput) startInput.value = firstDay.toISOString().split('T')[0];
    if (endInput) endInput.value = today.toISOString().split('T')[0];
    
    debugLog('Datas do relatório admin configuradas');
}

function handleGenerateAdminReport() {
    debugLog('Gerando relatório admin...');
    
    if (currentUser !== 'Admin') {
        alert('Apenas administradores podem gerar relatórios administrativos.');
        return;
    }
    
    const startDate = document.getElementById('admin-date-start')?.value;
    const endDate = document.getElementById('admin-date-end')?.value;
    
    if (!startDate || !endDate) {
        alert('Preencha as datas.');
        return;
    }
    
    generateAdminReport(startDate, endDate);
}

function generateAdminReport(startDate, endDate) {
    debugLog('Processando relatório admin:', { startDate, endDate });
    
    // Usar todas as entradas (admin vê tudo)
    const entries = allEntries;
    
    // Criar matriz: [assunto][usuário] = quantidade
    const reportMatrix = {};
    const userTotals = {};
    const subjectTotals = {};
    let grandTotal = 0;
    
    // Inicializar totais
    GLUOS_DATA.usuarios.forEach(user => {
        userTotals[user] = 0;
    });
    
    // Processar entradas
    entries.forEach(entry => {
        const subjectId = entry.subjectId;
        const user = entry.server;
        
        if (!reportMatrix[subjectId]) {
            reportMatrix[subjectId] = {
                id: subjectId,
                text: entry.subjectText,
                users: {}
            };
            subjectTotals[subjectId] = 0;
        }
        
        if (!reportMatrix[subjectId].users[user]) {
            reportMatrix[subjectId].users[user] = 0;
        }
        
        reportMatrix[subjectId].users[user]++;
        subjectTotals[subjectId]++;
        userTotals[user]++;
        grandTotal++;
    });
    
    // Converter e ordenar
    const reportData = Object.values(reportMatrix).map(subject => ({
        ...subject,
        total: subjectTotals[subject.id],
        percentage: grandTotal > 0 ? ((subjectTotals[subject.id] / grandTotal) * 100).toFixed(1) : 0
    }));
    
    reportData.sort((a, b) => b.total - a.total);
    
    debugLog('Dados do relatório admin processados:', { reportData, userTotals, grandTotal });
    
    displayAdminReport(reportData, userTotals, grandTotal, startDate, endDate);
}

function displayAdminReport(reportData, userTotals, grandTotal, startDate, endDate) {
    debugLog('Exibindo relatório admin');
    
    // Atualizar cabeçalho
    const adminReportPeriod = document.getElementById('admin-report-period');
    const adminReportTotalEntries = document.getElementById('admin-report-total-entries');
    const adminReportUser = document.getElementById('admin-report-user');
    
    if (adminReportPeriod) adminReportPeriod.textContent = `${formatDateBR(startDate)} a ${formatDateBR(endDate)}`;
    if (adminReportTotalEntries) adminReportTotalEntries.textContent = grandTotal;
    if (adminReportUser) adminReportUser.textContent = currentUser;
    
    // Criar cabeçalho da tabela
    const tableHeader = document.getElementById('admin-table-header');
    if (tableHeader) {
        tableHeader.innerHTML = '';
        
        // Coluna Serviço
        const serviceHeader = document.createElement('th');
        serviceHeader.textContent = 'Serviço';
        serviceHeader.style.textAlign = 'left';
        serviceHeader.style.minWidth = '300px';
        tableHeader.appendChild(serviceHeader);
        
        // Colunas dos usuários
        GLUOS_DATA.usuarios.forEach(user => {
            const userHeader = document.createElement('th');
            userHeader.textContent = user;
            userHeader.style.textAlign = 'center';
            userHeader.style.minWidth = '80px';
            tableHeader.appendChild(userHeader);
        });
        
        // Coluna TOTAL
        const totalHeader = document.createElement('th');
        totalHeader.textContent = 'TOTAL';
        totalHeader.style.textAlign = 'center';
        totalHeader.style.minWidth = '80px';
        tableHeader.appendChild(totalHeader);
        
        // Coluna %
        const percentHeader = document.createElement('th');
        percentHeader.textContent = '%';
        percentHeader.style.textAlign = 'center';
        percentHeader.style.minWidth = '60px';
        tableHeader.appendChild(percentHeader);
    }
    
    // Preencher corpo da tabela
    const tableBody = document.getElementById('admin-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        
        if (reportData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="${GLUOS_DATA.usuarios.length + 3}" class="text-center">
                    Nenhum registro encontrado.
                </td>
            `;
            tableBody.appendChild(emptyRow);
        } else {
            reportData.forEach(subject => {
                const row = document.createElement('tr');
                
                // Coluna do serviço
                const serviceCell = document.createElement('td');
                serviceCell.textContent = subject.text;
                serviceCell.style.textAlign = 'left';
                row.appendChild(serviceCell);
                
                // Colunas dos usuários
                GLUOS_DATA.usuarios.forEach(user => {
                    const userCell = document.createElement('td');
                    const count = subject.users[user] || 0;
                    userCell.textContent = count;
                    userCell.style.textAlign = 'center';
                    if (count > 0) userCell.style.fontWeight = 'bold';
                    row.appendChild(userCell);
                });
                
                // Coluna TOTAL
                const totalCell = document.createElement('td');
                totalCell.textContent = subject.total;
                totalCell.style.textAlign = 'center';
                totalCell.style.fontWeight = 'bold';
                row.appendChild(totalCell);
                
                // Coluna %
                const percentCell = document.createElement('td');
                percentCell.textContent = subject.percentage + '%';
                percentCell.style.textAlign = 'center';
                row.appendChild(percentCell);
                
                tableBody.appendChild(row);
            });
        }
    }
    
    // Rodapé da tabela (totais)
    const tableFooter = document.getElementById('admin-table-footer');
    if (tableFooter) {
        tableFooter.innerHTML = '';
        
        // TOTAL GERAL
        const totalLabelCell = document.createElement('th');
        totalLabelCell.textContent = 'TOTAL GERAL';
        totalLabelCell.style.textAlign = 'left';
        tableFooter.appendChild(totalLabelCell);
        
        // Totais por usuário
        GLUOS_DATA.usuarios.forEach(user => {
            const userTotalCell = document.createElement('th');
            userTotalCell.textContent = userTotals[user];
            userTotalCell.style.textAlign = 'center';
            tableFooter.appendChild(userTotalCell);
        });
        
        // Total geral
        const grandTotalCell = document.createElement('th');
        grandTotalCell.textContent = grandTotal;
        grandTotalCell.style.textAlign = 'center';
        tableFooter.appendChild(grandTotalCell);
        
        // 100%
        const percentTotalCell = document.createElement('th');
        percentTotalCell.textContent = '100%';
        percentTotalCell.style.textAlign = 'center';
        tableFooter.appendChild(percentTotalCell);
    }
    
    // Mostrar resultados
    const resultsContainer = document.getElementById('admin-report-results');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
    }
    
    debugLog('Relatório admin exibido com sucesso');
}

// Base de dados
function loadDatabaseTable() {
    debugLog('Carregando tabela da base de dados');
    
    const tableBody = document.querySelector('#database-table tbody');
    const totalRecords = document.getElementById('total-records');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (totalRecords) {
        totalRecords.textContent = `${allEntries.length} registro(s)`;
    }
    
    allEntries.forEach(entry => {
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
    
    debugLog('Base de dados carregada');
}

// Modais
function showProfileModal() {
    const modal = document.getElementById('profile-modal');
    const username = document.getElementById('profile-username');
    
    if (username) username.textContent = currentUser;
    if (modal) modal.classList.remove('hidden');
    
    debugLog('Modal de perfil aberto');
}

function hideProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

function hideModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.add('hidden');
}

// Utilitários
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
        syncText.textContent = status === 'success' ? 'Sincronizado' : 'Local';
    }
}

function formatDateBR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
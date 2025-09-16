// Variáveis globais
let currentFile = null;
let extractedLeads = [];

// Elementos DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const resultsContainer = document.getElementById('resultsContainer');
const totalLeads = document.getElementById('totalLeads');
const downloadSection = document.getElementById('downloadSection');
const processingModal = document.getElementById('processingModal');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload area drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click na área de upload (exceto no botão)
    uploadArea.addEventListener('click', (e) => {
        // Evitar que o clique no botão abra o seletor duas vezes
        if (e.target.classList.contains('upload-btn') || e.target.closest('.upload-btn')) {
            return;
        }
        fileInput.click();
    });

    // Botão de upload específico
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que o evento borbulhe para a área de upload
            fileInput.click();
        });
    }

    // File input change
    fileInput.addEventListener('change', handleFileSelect);
}

// Drag and Drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// File selection handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Process file
async function processFile(file) {
    // Validar tipo de arquivo
    if (!isValidFileType(file)) {
        showNotification('Por favor, selecione um arquivo CSV ou TXT válido.', 'error');
        return;
    }

    currentFile = file;
    showFileInfo(file);
    showProcessingModal();

    try {
        const text = await readFileAsText(file);
        const leads = extractPhoneNumbers(text);
        
        extractedLeads = leads;
        displayLeads(leads);
        showDownloadSection();
        
        showNotification(`${leads.length} números de telefone extraídos com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        showNotification('Erro ao processar o arquivo. Verifique se o formato está correto.', 'error');
    } finally {
        hideProcessingModal();
    }
}

// Validar tipo de arquivo
function isValidFileType(file) {
    const validTypes = ['text/csv', 'text/plain', 'application/csv'];
    const validExtensions = ['.csv', '.txt'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
    );
    
    return hasValidType || hasValidExtension;
}

// Ler arquivo como texto
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'UTF-8');
    });
}

// Extrair números de telefone
function extractPhoneNumbers(text) {
    const lines = text.split('\n');
    const phoneNumbers = [];
    
    // Detectar se é CSV ou TXT
    const isCSV = text.includes(',') || text.includes(';');
    
    lines.forEach((line, index) => {
        if (!line.trim()) return;
        
        let phoneNumber = '';
        
        if (isCSV) {
            // Processar CSV
            const columns = parseCSVLine(line);
            phoneNumber = findPhoneColumn(columns);
        } else {
            // Processar TXT - assumir que cada linha é um número
            phoneNumber = line.trim();
        }
        
        if (phoneNumber) {
            const cleanedNumber = cleanPhoneNumber(phoneNumber);
            if (isValidPhoneNumber(cleanedNumber)) {
                phoneNumbers.push(cleanedNumber);
            }
        }
    });
    
    return [...new Set(phoneNumbers)]; // Remover duplicatas
}

// Parsear linha CSV
function parseCSVLine(line) {
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            columns.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    columns.push(current.trim());
    return columns;
}

// Encontrar coluna de telefone
function findPhoneColumn(columns) {
    const phoneKeywords = ['phone', 'telefone', 'celular', 'mobile', 'whatsapp', 'numero', 'number'];
    
    // Procurar por cabeçalho
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i].toLowerCase();
        if (phoneKeywords.some(keyword => column.includes(keyword))) {
            return columns[i];
        }
    }
    
    // Se não encontrar cabeçalho, procurar por padrão de número
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (containsPhoneNumber(column)) {
            return column;
        }
    }
    
    // Se nada for encontrado, retornar a primeira coluna
    return columns[0];
}

// Verificar se contém número de telefone
function containsPhoneNumber(text) {
    const phonePattern = /[\+]?[0-9\s\-\(\)]{8,}/;
    return phonePattern.test(text);
}

// Limpar número de telefone
function cleanPhoneNumber(phoneNumber) {
    // Remover aspas e espaços extras
    let cleaned = phoneNumber.replace(/['"]/g, '').trim();
    
    // Remover TODOS os caracteres não numéricos, incluindo o +
    cleaned = cleaned.replace(/\D/g, '');
    
    return cleaned;
}

// Validar número de telefone
function isValidPhoneNumber(phoneNumber) {
    // Deve ter pelo menos 8 dígitos
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
}

// Mostrar informações do arquivo
function showFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Exibir leads
function displayLeads(leads) {
    resultsContainer.innerHTML = '';
    
    if (leads.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Nenhum número de telefone válido encontrado no arquivo</p>
            </div>
        `;
        return;
    }
    
    leads.forEach((lead, index) => {
        const leadElement = document.createElement('div');
        leadElement.className = 'lead-item';
        leadElement.innerHTML = `
            <span class="lead-number">${lead}</span>
            <span class="lead-index">${index + 1}</span>
        `;
        resultsContainer.appendChild(leadElement);
    });
    
    totalLeads.textContent = leads.length;
}

// Mostrar seção de download
function showDownloadSection() {
    downloadSection.style.display = 'block';
}

// Remover arquivo
function removeFile() {
    currentFile = null;
    extractedLeads = [];
    
    fileInput.value = '';
    fileInfo.style.display = 'none';
    downloadSection.style.display = 'none';
    
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Faça upload de um arquivo para ver os leads extraídos</p>
        </div>
    `;
    
    totalLeads.textContent = '0';
}

// Download dos leads
function downloadLeads() {
    if (extractedLeads.length === 0) {
        showNotification('Nenhum lead para download', 'error');
        return;
    }
    
    const format = document.querySelector('input[name="format"]:checked').value;
    const content = formatLeadsForDownload(extractedLeads, format);
    const filename = `leads_extraidos_${new Date().toISOString().split('T')[0]}.${format}`;
    
    downloadFile(content, filename, format === 'csv' ? 'text/csv' : 'text/plain');
    showNotification(`Arquivo ${filename} baixado com sucesso!`, 'success');
}

// Formatar leads para download
function formatLeadsForDownload(leads, format) {
    if (format === 'csv') {
// Removido o cabeçalho "Phone Number"
        return leads.join('\n');
    } else {
        return leads.join('\n');
    }
}

// Download de arquivo
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// Mostrar modal de processamento
function showProcessingModal() {
    processingModal.style.display = 'flex';
}

// Esconder modal de processamento
function hideProcessingModal() {
    processingModal.style.display = 'none';
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

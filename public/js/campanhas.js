// Campanhas Manager - Gerenciamento de campanhas e números de telefone
class CampanhasManager {
    constructor() {
        this.campaigns = [];
        this.currentFile = null;
        this.initializeEventListeners();
        this.loadCampaigns();
    }

    initializeEventListeners() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const campaignForm = document.getElementById('campaignForm');

        // Drag and drop events
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // Click events
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Form submission
        campaignForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCampaign();
        });
    }

    handleFile(file) {
        // Validar tipo de arquivo
        if (!file.name.toLowerCase().endsWith('.txt')) {
            this.showNotification('Por favor, selecione um arquivo TXT válido.', 'error');
            return;
        }

        // Validar tamanho (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showNotification('O arquivo é muito grande. Tamanho máximo permitido: 5MB', 'error');
            return;
        }

        this.currentFile = file;
        this.showFileInfo(file);
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async saveCampaign() {
        const campaignName = document.getElementById('campaignName').value.trim();
        
        if (!campaignName) {
            this.showNotification('Por favor, digite o nome da campanha.', 'error');
            return;
        }

        if (!this.currentFile) {
            this.showNotification('Por favor, selecione um arquivo TXT.', 'error');
            return;
        }

        // Verificar se já existe uma campanha com esse nome
        if (this.campaigns.some(campaign => campaign.name.toLowerCase() === campaignName.toLowerCase())) {
            this.showNotification('Já existe uma campanha com esse nome.', 'error');
            return;
        }

        this.showProcessingModal();

        try {
            const text = await this.readFileAsText(this.currentFile);
            const phoneNumbers = this.extractPhoneNumbers(text);
            
            if (phoneNumbers.length === 0) {
                this.showNotification('Nenhum número de telefone válido encontrado no arquivo.', 'error');
                this.hideProcessingModal();
                return;
            }

            const campaign = {
                id: Date.now().toString(),
                name: campaignName,
                phoneNumbers: phoneNumbers,
                createdAt: new Date().toISOString(),
                totalNumbers: phoneNumbers.length
            };

            // Salvar no servidor primeiro
            await this.saveCampaignToServer(campaign);
            
            // Adicionar à lista local após sucesso
            this.campaigns.push(campaign);
            this.displayCampaigns();
            this.resetForm();
            
            this.showNotification(`Campanha "${campaignName}" criada com sucesso! ${phoneNumbers.length} números adicionados.`, 'success');
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
            this.showNotification('Erro ao processar o arquivo. Tente novamente.', 'error');
        } finally {
            this.hideProcessingModal();
        }
    }

    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file, 'UTF-8');
        });
    }

    extractPhoneNumbers(text) {
        const lines = text.split('\n');
        const phoneNumbers = [];
        
        lines.forEach(line => {
            if (!line.trim()) return;
            
            const cleanedNumber = this.cleanPhoneNumber(line.trim());
            if (this.isValidPhoneNumber(cleanedNumber)) {
                phoneNumbers.push(cleanedNumber);
            }
        });
        
        // Remover duplicatas
        return [...new Set(phoneNumbers)];
    }

    cleanPhoneNumber(phoneNumber) {
        // Remover aspas e espaços extras
        let cleaned = phoneNumber.replace(/['"]/g, '').trim();
        
        // Remover TODOS os caracteres não numéricos
        cleaned = cleaned.replace(/\D/g, '');
        
        return cleaned;
    }

    isValidPhoneNumber(phoneNumber) {
        // Deve ter pelo menos 8 dígitos
        const digits = phoneNumber.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15;
    }

    async saveCampaignToServer(campaign) {
        try {
            // Salvar no servidor via API
            const response = await fetch('/api/campanhas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: campaign.name,
                    phoneNumbers: campaign.phoneNumbers
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar campanha');
            }

            const result = await response.json();
            console.log('Campanha salva no servidor:', result);
            return result;
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
            throw error;
        }
    }

    async loadCampaigns() {
        try {
            const response = await fetch('/api/campanhas');
            if (!response.ok) {
                throw new Error('Erro ao carregar campanhas');
            }
            
            this.campaigns = await response.json();
            this.displayCampaigns();
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            this.campaigns = [];
            this.displayCampaigns();
        }
    }

    displayCampaigns() {
        const campaignsList = document.getElementById('campaignsList');
        const totalCampaigns = document.getElementById('totalCampaigns');

        totalCampaigns.textContent = this.campaigns.length;

        if (this.campaigns.length === 0) {
            campaignsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma campanha criada ainda</p>
                </div>
            `;
            return;
        }

        campaignsList.innerHTML = this.campaigns.map(campaign => `
            <div class="campaign-item" data-campaign-id="${campaign.id}">
                <div class="campaign-header">
                    <span class="campaign-name">${campaign.name}</span>
                    <div class="campaign-actions">
                        <button class="action-btn" onclick="viewCampaign('${campaign.id}')" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="downloadCampaign('${campaign.id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteCampaign('${campaign.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="campaign-info">
                    <span><i class="fas fa-phone"></i> ${campaign.totalNumbers} números</span>
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(campaign.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    resetForm() {
        document.getElementById('campaignName').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        this.currentFile = null;
    }

    showProcessingModal() {
        const modal = document.getElementById('processingModal');
        modal.style.display = 'flex';
    }

    hideProcessingModal() {
        const modal = document.getElementById('processingModal');
        modal.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
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

    async deleteCampaign(campaignId) {
        if (!confirm('Tem certeza que deseja excluir esta campanha?')) {
            return;
        }

        try {
            const response = await fetch(`/api/campanhas/${campaignId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir campanha');
            }

            // Remover da lista local
            this.campaigns = this.campaigns.filter(campaign => campaign.id !== campaignId);
            this.displayCampaigns();
            this.showNotification('Campanha excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir campanha:', error);
            this.showNotification('Erro ao excluir campanha.', 'error');
        }
    }

    downloadCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        const content = campaign.phoneNumbers.join('\n');
        const filename = `${campaign.name.replace(/[^a-zA-Z0-9]/g, '_')}_numeros.txt`;
        
        this.downloadFile(content, filename, 'text/plain');
        this.showNotification(`Arquivo ${filename} baixado com sucesso!`, 'success');
    }

    viewCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        // Criar modal para visualizar números
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px; color: #ffffff;">
                    <i class="fas fa-list"></i> ${campaign.name}
                </h3>
                <div style="margin-bottom: 15px; color: #b8b8b8;">
                    <i class="fas fa-phone"></i> ${campaign.totalNumbers} números | 
                    <i class="fas fa-calendar"></i> ${this.formatDate(campaign.createdAt)}
                </div>
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; background: rgba(15,15,35,0.5);">
                    ${campaign.phoneNumbers.map((number, index) => `
                        <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffffff;">${this.formatPhoneNumber(number)}</span>
                            <span style="color: #666; font-size: 0.8rem;">#${index + 1}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="campanhasManager.downloadCampaign('${campaign.id}')" style="background: #00d4ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button onclick="this.closest('.modal').remove()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    formatPhoneNumber(number) {
        const cleanNumber = number.replace(/\D/g, '');
        
        if (cleanNumber.length === 13) {
            // +55 (XX) 9XXXX-XXXX
            return `+${cleanNumber.substring(0, 2)} (${cleanNumber.substring(2, 4)}) ${cleanNumber.substring(4, 9)}-${cleanNumber.substring(9)}`;
        } else if (cleanNumber.length === 12) {
            // +55 (XX) XXXX-XXXX
            return `+${cleanNumber.substring(0, 2)} (${cleanNumber.substring(2, 4)}) ${cleanNumber.substring(4, 8)}-${cleanNumber.substring(8)}`;
        } else if (cleanNumber.length === 11) {
            // (XX) 9XXXX-XXXX
            return `(${cleanNumber.substring(0, 2)}) ${cleanNumber.substring(2, 7)}-${cleanNumber.substring(7)}`;
        } else if (cleanNumber.length === 10) {
            // (XX) XXXX-XXXX
            return `(${cleanNumber.substring(0, 2)}) ${cleanNumber.substring(2, 6)}-${cleanNumber.substring(6)}`;
        }
        
        return number;
    }

    downloadFile(content, filename, mimeType) {
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
}

// Funções globais
function removeFile() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    campanhasManager.currentFile = null;
}

function viewCampaign(campaignId) {
    campanhasManager.viewCampaign(campaignId);
}

function downloadCampaign(campaignId) {
    campanhasManager.downloadCampaign(campaignId);
}

function deleteCampaign(campaignId) {
    campanhasManager.deleteCampaign(campaignId);
}

// Inicializar quando o DOM estiver pronto
let campanhasManager;
document.addEventListener('DOMContentLoaded', () => {
    campanhasManager = new CampanhasManager();
});

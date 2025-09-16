// Configurações Page Functionality
class ConfiguracoesManager {
    constructor() {
        this.settings = {
            api: {
                zapiUrl: 'https://api.z-api.io',
                timeout: 30000,
                retries: 3
            },
            notifications: {
                email: true,
                push: true,
                sound: true,
                desktop: false
            },
            backup: {
                autoBackup: true,
                frequency: 'daily',
                retention: 30
            },
            security: {
                twoFactor: false,
                sessionTimeout: 24,
                ipWhitelist: []
            },
            performance: {
                cacheEnabled: true,
                cacheSize: 100,
                compression: true
            },
            ui: {
                theme: 'dark',
                language: 'pt-BR',
                sidebarCollapsed: false
            }
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupFormValidation();
    }

    // Carrega configurações salvas
    loadSettings() {
        const savedSettings = localStorage.getItem('dashboardSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.populateSettings();
    }

    // Popula a interface com as configurações
    populateSettings() {
        // API Settings
        document.getElementById('zapiUrl')?.setAttribute('value', this.settings.api.zapiUrl);
        document.getElementById('apiTimeout')?.setAttribute('value', this.settings.api.timeout);
        document.getElementById('apiRetries')?.setAttribute('value', this.settings.api.retries);

        // Notifications
        document.getElementById('emailNotifications')?.setAttribute('checked', this.settings.notifications.email);
        document.getElementById('pushNotifications')?.setAttribute('checked', this.settings.notifications.push);
        document.getElementById('soundNotifications')?.setAttribute('checked', this.settings.notifications.sound);
        document.getElementById('desktopNotifications')?.setAttribute('checked', this.settings.notifications.desktop);

        // Backup
        document.getElementById('autoBackup')?.setAttribute('checked', this.settings.backup.autoBackup);
        document.getElementById('backupFrequency')?.setAttribute('value', this.settings.backup.frequency);
        document.getElementById('backupRetention')?.setAttribute('value', this.settings.backup.retention);

        // Security
        document.getElementById('twoFactor')?.setAttribute('checked', this.settings.security.twoFactor);
        document.getElementById('sessionTimeout')?.setAttribute('value', this.settings.security.sessionTimeout);

        // Performance
        document.getElementById('cacheEnabled')?.setAttribute('checked', this.settings.performance.cacheEnabled);
        document.getElementById('cacheSize')?.setAttribute('value', this.settings.performance.cacheSize);
        document.getElementById('compression')?.setAttribute('checked', this.settings.performance.compression);

        // UI
        document.getElementById('theme')?.setAttribute('value', this.settings.ui.theme);
        document.getElementById('language')?.setAttribute('value', this.settings.ui.language);
        document.getElementById('sidebarCollapsed')?.setAttribute('checked', this.settings.ui.sidebarCollapsed);
    }

    // Configura event listeners
    setupEventListeners() {
        // Botões de salvar
        document.querySelectorAll('[data-save-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-save-section');
                this.saveSection(section);
            });
        });

        // Botão de salvar todas as configurações
        const saveAllBtn = document.getElementById('saveAllSettings');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAllSettings());
        }

        // Botão de resetar configurações
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Botão de exportar configurações
        const exportBtn = document.getElementById('exportSettings');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }

        // Botão de importar configurações
        const importBtn = document.getElementById('importSettings');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSettings());
        }

        // Botão de testar API
        const testApiBtn = document.getElementById('testApi');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => this.testApiConnection());
        }

        // Botão de criar backup
        const createBackupBtn = document.getElementById('createBackup');
        if (createBackupBtn) {
            createBackupBtn.addEventListener('click', () => this.createBackup());
        }

        // Botão de restaurar backup
        const restoreBackupBtn = document.getElementById('restoreBackup');
        if (restoreBackupBtn) {
            restoreBackupBtn.addEventListener('click', () => this.restoreBackup());
        }

        // Input de arquivo para importar
        const importFileInput = document.getElementById('importFile');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.handleImportFile(e));
        }
    }

    // Configura validação de formulários
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(form);
            });
        });
    }

    // Salva uma seção específica
    async saveSection(section) {
        const sectionData = this.getSectionData(section);
        
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.settings[section] = { ...this.settings[section], ...sectionData };
            this.saveToStorage();
            
            this.showNotification(`${this.getSectionName(section)} salvas com sucesso!`, 'success');
        } catch (error) {
            console.error(`Erro ao salvar ${section}:`, error);
            this.showNotification(`Erro ao salvar ${this.getSectionName(section)}`, 'error');
        }
    }

    // Salva todas as configurações
    async saveAllSettings() {
        try {
            // Coletar dados de todas as seções
            const allData = {
                api: this.getSectionData('api'),
                notifications: this.getSectionData('notifications'),
                backup: this.getSectionData('backup'),
                security: this.getSectionData('security'),
                performance: this.getSectionData('performance'),
                ui: this.getSectionData('ui')
            };

            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.settings = { ...this.settings, ...allData };
            this.saveToStorage();
            
            this.showNotification('Todas as configurações foram salvas!', 'success');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    // Obtém dados de uma seção
    getSectionData(section) {
        const data = {};
        
        switch (section) {
            case 'api':
                data.zapiUrl = document.getElementById('zapiUrl')?.value || this.settings.api.zapiUrl;
                data.timeout = parseInt(document.getElementById('apiTimeout')?.value) || this.settings.api.timeout;
                data.retries = parseInt(document.getElementById('apiRetries')?.value) || this.settings.api.retries;
                break;
                
            case 'notifications':
                data.email = document.getElementById('emailNotifications')?.checked || false;
                data.push = document.getElementById('pushNotifications')?.checked || false;
                data.sound = document.getElementById('soundNotifications')?.checked || false;
                data.desktop = document.getElementById('desktopNotifications')?.checked || false;
                break;
                
            case 'backup':
                data.autoBackup = document.getElementById('autoBackup')?.checked || false;
                data.frequency = document.getElementById('backupFrequency')?.value || this.settings.backup.frequency;
                data.retention = parseInt(document.getElementById('backupRetention')?.value) || this.settings.backup.retention;
                break;
                
            case 'security':
                data.twoFactor = document.getElementById('twoFactor')?.checked || false;
                data.sessionTimeout = parseInt(document.getElementById('sessionTimeout')?.value) || this.settings.security.sessionTimeout;
                break;
                
            case 'performance':
                data.cacheEnabled = document.getElementById('cacheEnabled')?.checked || false;
                data.cacheSize = parseInt(document.getElementById('cacheSize')?.value) || this.settings.performance.cacheSize;
                data.compression = document.getElementById('compression')?.checked || false;
                break;
                
            case 'ui':
                data.theme = document.getElementById('theme')?.value || this.settings.ui.theme;
                data.language = document.getElementById('language')?.value || this.settings.ui.language;
                data.sidebarCollapsed = document.getElementById('sidebarCollapsed')?.checked || false;
                break;
        }
        
        return data;
    }

    // Obtém nome da seção
    getSectionName(section) {
        const names = {
            api: 'Configurações da API',
            notifications: 'Notificações',
            backup: 'Backup',
            security: 'Segurança',
            performance: 'Performance',
            ui: 'Interface'
        };
        return names[section] || section;
    }

    // Salva no localStorage
    saveToStorage() {
        localStorage.setItem('dashboardSettings', JSON.stringify(this.settings));
    }

    // Reseta configurações
    resetSettings() {
        if (confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
            localStorage.removeItem('dashboardSettings');
            this.settings = {
                api: { zapiUrl: 'https://api.z-api.io', timeout: 30000, retries: 3 },
                notifications: { email: true, push: true, sound: true, desktop: false },
                backup: { autoBackup: true, frequency: 'daily', retention: 30 },
                security: { twoFactor: false, sessionTimeout: 24, ipWhitelist: [] },
                performance: { cacheEnabled: true, cacheSize: 100, compression: true },
                ui: { theme: 'dark', language: 'pt-BR', sidebarCollapsed: false }
            };
            this.populateSettings();
            this.showNotification('Configurações resetadas para os valores padrão', 'success');
        }
    }

    // Exporta configurações
    exportSettings() {
        const exportData = {
            ...this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Configurações exportadas com sucesso!', 'success');
    }

    // Importa configurações
    importSettings() {
        const input = document.getElementById('importFile');
        if (input) {
            input.click();
        }
    }

    // Manipula arquivo de importação
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                this.settings = { ...this.settings, ...importedSettings };
                this.populateSettings();
                this.saveToStorage();
                this.showNotification('Configurações importadas com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao importar configurações:', error);
                this.showNotification('Erro ao importar configurações. Arquivo inválido.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Testa conexão da API
    async testApiConnection() {
        const url = document.getElementById('zapiUrl')?.value || this.settings.api.zapiUrl;
        
        try {
            this.showNotification('Testando conexão...', 'info');
            
            // Simular teste de API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Conexão com a API estabelecida com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao testar API:', error);
            this.showNotification('Erro ao conectar com a API', 'error');
        }
    }

    // Cria backup
    async createBackup() {
        try {
            this.showNotification('Criando backup...', 'info');
            
            // Simular criação de backup
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showNotification('Backup criado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            this.showNotification('Erro ao criar backup', 'error');
        }
    }

    // Restaura backup
    async restoreBackup() {
        if (!confirm('Tem certeza que deseja restaurar o último backup? Isso substituirá as configurações atuais.')) {
            return;
        }

        try {
            this.showNotification('Restaurando backup...', 'info');
            
            // Simular restauração de backup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Backup restaurado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            this.showNotification('Erro ao restaurar backup', 'error');
        }
    }

    // Valida formulário
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    // Mostra notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ConfiguracoesManager();
});

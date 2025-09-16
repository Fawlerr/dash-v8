// Administração Page Functionality
class AdministracaoManager {
    constructor() {
        this.stats = {
            system: {
                uptime: '7 dias, 12 horas',
                cpu: 45,
                memory: 68,
                disk: 32,
                network: 125
            },
            instances: {
                total: 2,
                active: 1,
                inactive: 1,
                errors: 0
            },
            messages: {
                sent: 1250,
                received: 890,
                failed: 12,
                pending: 5
            },
            users: {
                total: 1,
                active: 1,
                inactive: 0,
                lastLogin: '2 minutos atrás'
            }
        };
        
        this.init();
    }

    init() {
        this.loadSystemStats();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    // Carrega estatísticas do sistema
    async loadSystemStats() {
        try {
            // Simular carregamento de dados reais
            await this.updateSystemStats();
            this.updateInstancesStats();
            this.updateMessagesStats();
            this.updateUsersStats();
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            this.showNotification('Erro ao carregar estatísticas do sistema', 'error');
        }
    }

    // Atualiza estatísticas do sistema
    updateSystemStats() {
        // CPU
        const cpuElement = document.getElementById('cpuUsage');
        if (cpuElement) {
            cpuElement.textContent = `${this.stats.system.cpu}%`;
            this.updateProgressBar('cpuProgress', this.stats.system.cpu);
        }

        // Memória
        const memoryElement = document.getElementById('memoryUsage');
        if (memoryElement) {
            memoryElement.textContent = `${this.stats.system.memory}%`;
            this.updateProgressBar('memoryProgress', this.stats.system.memory);
        }

        // Disco
        const diskElement = document.getElementById('diskUsage');
        if (diskElement) {
            diskElement.textContent = `${this.stats.system.disk}%`;
            this.updateProgressBar('diskProgress', this.stats.system.disk);
        }

        // Rede
        const networkElement = document.getElementById('networkUsage');
        if (networkElement) {
            networkElement.textContent = `${this.stats.system.network} MB/s`;
            this.updateProgressBar('networkProgress', Math.min(this.stats.system.network / 2, 100));
        }

        // Uptime
        const uptimeElement = document.getElementById('systemUptime');
        if (uptimeElement) {
            uptimeElement.textContent = this.stats.system.uptime;
        }
    }

    // Atualiza estatísticas das instâncias
    updateInstancesStats() {
        const elements = {
            totalInstances: document.getElementById('totalInstances'),
            activeInstances: document.getElementById('activeInstances'),
            inactiveInstances: document.getElementById('inactiveInstances'),
            errorInstances: document.getElementById('errorInstances')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                const value = this.stats.instances[key.replace('Instances', '').toLowerCase()];
                elements[key].textContent = value;
            }
        });
    }

    // Atualiza estatísticas de mensagens
    updateMessagesStats() {
        const elements = {
            messagesSent: document.getElementById('messagesSent'),
            messagesReceived: document.getElementById('messagesReceived'),
            messagesFailed: document.getElementById('messagesFailed'),
            messagesPending: document.getElementById('messagesPending')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                const value = this.stats.messages[key.replace('messages', '').toLowerCase()];
                elements[key].textContent = value;
            }
        });
    }

    // Atualiza estatísticas de usuários
    updateUsersStats() {
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            activeUsers: document.getElementById('activeUsers'),
            inactiveUsers: document.getElementById('inactiveUsers'),
            lastLogin: document.getElementById('lastLogin')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                const value = this.stats.users[key.replace('Users', '').toLowerCase()];
                elements[key].textContent = value;
            }
        });
    }

    // Atualiza barra de progresso
    updateProgressBar(id, percentage) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // Mudar cor baseada na porcentagem
            if (percentage > 80) {
                progressBar.className = 'h-2 bg-red-500 rounded-full transition-all duration-500';
            } else if (percentage > 60) {
                progressBar.className = 'h-2 bg-yellow-500 rounded-full transition-all duration-500';
            } else {
                progressBar.className = 'h-2 bg-green-500 rounded-full transition-all duration-500';
            }
        }
    }

    // Configura event listeners
    setupEventListeners() {
        // Botão de atualizar estatísticas
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAllStats());
        }

        // Botão de reiniciar sistema
        const restartBtn = document.getElementById('restartSystem');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartSystem());
        }

        // Botão de limpar cache
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        // Botão de exportar logs
        const exportLogsBtn = document.getElementById('exportLogs');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => this.exportLogs());
        }

        // Botão de gerenciar usuários
        const manageUsersBtn = document.getElementById('manageUsers');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => this.showUserManagement());
        }

        // Botão de gerenciar instâncias
        const manageInstancesBtn = document.getElementById('manageInstances');
        if (manageInstancesBtn) {
            manageInstancesBtn.addEventListener('click', () => this.showInstanceManagement());
        }

        // Botão de backup completo
        const fullBackupBtn = document.getElementById('fullBackup');
        if (fullBackupBtn) {
            fullBackupBtn.addEventListener('click', () => this.createFullBackup());
        }

        // Botão de monitoramento
        const monitoringBtn = document.getElementById('toggleMonitoring');
        if (monitoringBtn) {
            monitoringBtn.addEventListener('click', () => this.toggleMonitoring());
        }
    }

    // Inicia atualizações em tempo real
    startRealTimeUpdates() {
        // Atualizar estatísticas a cada 30 segundos
        setInterval(() => {
            this.updateSystemStats();
        }, 30000);

        // Atualizar logs a cada 10 segundos
        setInterval(() => {
            this.updateSystemLogs();
        }, 10000);
    }

    // Atualiza logs do sistema
    updateSystemLogs() {
        const logsContainer = document.getElementById('systemLogs');
        if (!logsContainer) return;

        const newLogs = this.generateRandomLogs();
        const existingLogs = logsContainer.querySelectorAll('.log-entry');
        
        // Manter apenas os últimos 50 logs
        if (existingLogs.length >= 50) {
            existingLogs[0].remove();
        }

        // Adicionar novos logs
        newLogs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry p-2 border-l-4 ${
                log.type === 'error' ? 'border-red-500 bg-red-900/20' :
                log.type === 'warning' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-green-500 bg-green-900/20'
            } mb-2 rounded-r`;
            
            logElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-sm font-mono">${log.timestamp}</span>
                    <span class="text-xs px-2 py-1 rounded ${
                        log.type === 'error' ? 'bg-red-600' :
                        log.type === 'warning' ? 'bg-yellow-600' :
                        'bg-green-600'
                    }">${log.type.toUpperCase()}</span>
                </div>
                <div class="text-sm mt-1">${log.message}</div>
            `;
            
            logsContainer.appendChild(logElement);
        });

        // Scroll para o final
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    // Gera logs aleatórios para demonstração
    generateRandomLogs() {
        const logTypes = ['info', 'warning', 'error'];
        const messages = [
            'Sistema iniciado com sucesso',
            'Nova instância conectada',
            'Mensagem enviada com sucesso',
            'Erro de conexão com API',
            'Backup automático concluído',
            'Usuário logado no sistema',
            'Cache limpo automaticamente',
            'Alerta de uso de memória',
            'Sincronização de dados concluída',
            'Erro de validação de dados'
        ];

        const logs = [];
        const numLogs = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numLogs; i++) {
            logs.push({
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                type: logTypes[Math.floor(Math.random() * logTypes.length)],
                message: messages[Math.floor(Math.random() * messages.length)]
            });
        }

        return logs;
    }

    // Atualiza todas as estatísticas
    async refreshAllStats() {
        try {
            this.showNotification('Atualizando estatísticas...', 'info');
            
            // Simular atualização
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Atualizar dados com valores aleatórios
            this.stats.system.cpu = Math.floor(Math.random() * 100);
            this.stats.system.memory = Math.floor(Math.random() * 100);
            this.stats.system.disk = Math.floor(Math.random() * 100);
            this.stats.system.network = Math.floor(Math.random() * 200);
            
            this.loadSystemStats();
            this.showNotification('Estatísticas atualizadas!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
            this.showNotification('Erro ao atualizar estatísticas', 'error');
        }
    }

    // Reinicia o sistema
    async restartSystem() {
        if (!confirm('Tem certeza que deseja reiniciar o sistema? Isso pode causar interrupção temporária dos serviços.')) {
            return;
        }

        try {
            this.showNotification('Reiniciando sistema...', 'info');
            
            // Simular reinicialização
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showNotification('Sistema reiniciado com sucesso!', 'success');
            this.loadSystemStats();
        } catch (error) {
            console.error('Erro ao reiniciar sistema:', error);
            this.showNotification('Erro ao reiniciar sistema', 'error');
        }
    }

    // Limpa o cache
    async clearCache() {
        try {
            this.showNotification('Limpando cache...', 'info');
            
            // Simular limpeza de cache
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Cache limpo com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            this.showNotification('Erro ao limpar cache', 'error');
        }
    }

    // Exporta logs
    exportLogs() {
        const logs = document.querySelectorAll('.log-entry');
        const logData = Array.from(logs).map(log => {
            const timestamp = log.querySelector('.text-sm.font-mono').textContent;
            const type = log.querySelector('.text-xs').textContent;
            const message = log.querySelector('.text-sm.mt-1').textContent;
            return { timestamp, type, message };
        });

        const exportData = {
            logs: logData,
            exportDate: new Date().toISOString(),
            totalLogs: logs.length
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Logs exportados com sucesso!', 'success');
    }

    // Mostra gerenciamento de usuários
    showUserManagement() {
        this.showNotification('Funcionalidade de gerenciamento de usuários em desenvolvimento', 'info');
    }

    // Mostra gerenciamento de instâncias
    showInstanceManagement() {
        this.showNotification('Redirecionando para gerenciamento de instâncias...', 'info');
        setTimeout(() => {
            window.location.href = '/instances';
        }, 1000);
    }

    // Cria backup completo
    async createFullBackup() {
        try {
            this.showNotification('Criando backup completo...', 'info');
            
            // Simular backup completo
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            this.showNotification('Backup completo criado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            this.showNotification('Erro ao criar backup completo', 'error');
        }
    }

    // Alterna monitoramento
    toggleMonitoring() {
        const btn = document.getElementById('toggleMonitoring');
        const isMonitoring = btn.textContent.includes('Parar');
        
        if (isMonitoring) {
            btn.textContent = 'Iniciar Monitoramento';
            btn.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors';
            this.showNotification('Monitoramento parado', 'info');
        } else {
            btn.textContent = 'Parar Monitoramento';
            btn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors';
            this.showNotification('Monitoramento iniciado', 'success');
        }
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
    new AdministracaoManager();
});

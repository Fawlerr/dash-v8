// Perfil Page Functionality
class PerfilManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupFormValidation();
    }

    // Carrega dados do usuário
    async loadUserData() {
        try {
            // Dados simulados do usuário (sem autenticação)
            const userData = {
                username: 'admin',
                role: 'Administrador',
                loginTime: new Date().toISOString()
            };
            this.populateUserData(userData);
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.showNotification('Erro ao carregar dados do usuário', 'error');
        }
    }

    // Popula os dados do usuário na interface
    populateUserData(user) {
        // Atualizar informações básicas
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = user.username || 'admin';
        });
        
        document.querySelectorAll('.user-role').forEach(el => {
            el.textContent = user.role || 'Administrador';
        });

        // Atualizar data de login
        const loginTime = new Date(user.loginTime || Date.now());
        document.querySelectorAll('.login-time').forEach(el => {
            el.textContent = loginTime.toLocaleString('pt-BR');
        });

        // Atualizar estatísticas (simuladas)
        this.updateUserStats();
    }

    // Atualiza estatísticas do usuário
    updateUserStats() {
        const stats = {
            totalSessions: Math.floor(Math.random() * 50) + 10,
            lastActivity: '2 minutos atrás',
            totalInstances: Math.floor(Math.random() * 5) + 1,
            messagesSent: Math.floor(Math.random() * 1000) + 100
        };

        document.querySelectorAll('.stat-value').forEach((el, index) => {
            const values = Object.values(stats);
            if (values[index]) {
                el.textContent = values[index];
            }
        });
    }

    // Configura event listeners
    setupEventListeners() {
        // Botão de editar perfil
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode());
        }

        // Botão de salvar perfil
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        // Botão de cancelar edição
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Botão de alterar senha
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }

        // Botão de salvar senha
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        // Botão de fechar modal de senha
        const closePasswordModal = document.getElementById('closePasswordModal');
        if (closePasswordModal) {
            closePasswordModal.addEventListener('click', () => this.hideChangePasswordModal());
        }

        // Botão de encerrar sessões
        const endSessionsBtn = document.getElementById('endSessionsBtn');
        if (endSessionsBtn) {
            endSessionsBtn.addEventListener('click', () => this.endAllSessions());
        }

        // Botão de exportar dados
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUserData());
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

    // Alterna modo de edição
    toggleEditMode() {
        const editMode = document.querySelector('.edit-mode');
        const viewMode = document.querySelector('.view-mode');
        
        if (editMode && viewMode) {
            editMode.classList.toggle('hidden');
            viewMode.classList.toggle('hidden');
        }
    }

    // Salva perfil
    async saveProfile() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Perfil atualizado com sucesso!', 'success');
            this.toggleEditMode();
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            this.showNotification('Erro ao salvar perfil', 'error');
        }
    }

    // Cancela edição
    cancelEdit() {
        this.toggleEditMode();
        // Recarregar dados originais
        this.loadUserData();
    }

    // Mostra modal de alteração de senha
    showChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Esconde modal de alteração de senha
    hideChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.add('hidden');
            // Limpar formulário
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    // Altera senha
    async changePassword() {
        const form = document.getElementById('changePasswordForm');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validação básica
        if (data.newPassword !== data.confirmPassword) {
            this.showNotification('As senhas não coincidem', 'error');
            return;
        }

        if (data.newPassword.length < 6) {
            this.showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        try {
            // Simular alteração de senha
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Senha alterada com sucesso!', 'success');
            this.hideChangePasswordModal();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            this.showNotification('Erro ao alterar senha', 'error');
        }
    }

    // Encerra todas as sessões
    async endAllSessions() {
        if (!confirm('Tem certeza que deseja encerrar todas as outras sessões?')) {
            return;
        }

        try {
            // Simular encerramento de sessões
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Todas as outras sessões foram encerradas', 'success');
            this.updateUserStats();
        } catch (error) {
            console.error('Erro ao encerrar sessões:', error);
            this.showNotification('Erro ao encerrar sessões', 'error');
        }
    }

    // Exporta dados do usuário
    exportUserData() {
        const userData = {
            username: 'admin',
            role: 'Administrador',
            exportDate: new Date().toISOString(),
            data: {
                profile: 'Dados do perfil',
                sessions: 'Histórico de sessões',
                preferences: 'Preferências do usuário'
            }
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Dados exportados com sucesso!', 'success');
    }

    // Valida formulário
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
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
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new PerfilManager();
});

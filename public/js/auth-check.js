// ===== SISTEMA DE VERIFICAÇÃO DE AUTENTICAÇÃO =====

// Configurações
const AUTH_CONFIG = {
    loginUrl: '/login',
    apiUrl: '/api/auth/verify',
    tokenKey: 'authToken'
};

// Verificar se o usuário está autenticado
async function checkAuthentication() {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    
    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        const response = await fetch(AUTH_CONFIG.apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            // Token inválido ou expirado
            clearAuthData();
            redirectToLogin();
            return false;
        }

        const data = await response.json();
        if (data.success) {
            // Usuário autenticado
            updateUserInfo(data.user);
            return true;
        } else {
            clearAuthData();
            redirectToLogin();
            return false;
        }
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        clearAuthData();
        redirectToLogin();
        return false;
    }
}

// Redirecionar para página de login
function redirectToLogin() {
    // Evitar loop infinito se já estiver na página de login
    if (window.location.pathname !== AUTH_CONFIG.loginUrl) {
        window.location.href = AUTH_CONFIG.loginUrl;
    }
}

// Limpar dados de autenticação
function clearAuthData() {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    // Remover cookie também
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// Atualizar informações do usuário na interface
function updateUserInfo(user) {
    // Atualizar nome do usuário na sidebar se existir
    const userElement = document.querySelector('.user-info');
    if (userElement && user.username) {
        userElement.textContent = user.username;
    }
}

// Função de logout
async function logout() {
    try {
        // Chamar endpoint de logout (opcional)
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        // Limpar dados locais
        clearAuthData();
        
        // Mostrar notificação de logout
        showNotification('Logout realizado com sucesso!', 'success');
        
        // Redirecionar para login após um breve delay
        setTimeout(() => {
            window.location.href = AUTH_CONFIG.loginUrl;
        }, 1000);
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Verificar se já existe uma notificação
    const existingNotification = document.querySelector('.auth-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'auth-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4757' : '#00d4ff'};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 500;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Adicionar animação CSS se não existir
    if (!document.querySelector('#auth-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Interceptar cliques em links para verificar autenticação
function setupLinkProtection() {
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = new URL(link.href);
            const currentDomain = window.location.origin;
            
            // Se for um link interno
            if (url.origin === currentDomain) {
                const path = url.pathname;
                
                // Páginas que precisam de autenticação
                const protectedPaths = [
                    '/dashboard',
                    '/instances',
                    '/code',
                    '/templates',
                    '/campanhas',
                    '/mensagens-automaticas',
                    '/leads-extractor',
                    '/logs'
                ];
                
                // Verificar se a página precisa de autenticação
                if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
                    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
                    if (!token) {
                        e.preventDefault();
                        showNotification('Você precisa estar logado para acessar esta página', 'error');
                        setTimeout(() => {
                            window.location.href = AUTH_CONFIG.loginUrl;
                        }, 1500);
                    }
                }
            }
        }
    });
}

// Configurar botão de logout na sidebar
function setupLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn, [data-logout]');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Confirmar logout
            if (confirm('Tem certeza que deseja sair?')) {
                logout();
            }
        });
    }
}

// Inicializar sistema de autenticação
function initAuthSystem() {
    // Verificar autenticação ao carregar a página
    checkAuthentication().then(isAuthenticated => {
        if (isAuthenticated) {
            // Configurar proteção de links
            setupLinkProtection();
            
            // Configurar botão de logout
            setupLogoutButton();
        }
    });
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

// Exportar funções para uso global
window.authCheck = {
    checkAuthentication,
    logout,
    clearAuthData,
    showNotification
};

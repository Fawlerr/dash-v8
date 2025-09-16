// Sidebar Loader - Carrega a sidebar dinamicamente em todas as páginas
class SidebarLoader {
    constructor() {
        this.sidebarLoaded = false;
        this.currentPage = this.getCurrentPage();
    }

    // Detecta a página atual baseada na URL
    getCurrentPage() {
        const path = window.location.pathname;
        
        // Verificar rotas com e sem .html
        if (path.includes('dashboard') || path === '/' || path === '/dashboard') return 'dashboard';
        if (path.includes('instances')) return 'instances';
        if (path.includes('code')) return 'code';
        if (path.includes('templates')) return 'templates';
        if (path.includes('campanhas')) return 'campanhas';
        if (path.includes('mensagens-automaticas')) return 'mensagens-automaticas';
        if (path.includes('leads-extractor')) return 'leads-extractor';
        if (path.includes('logs')) return 'logs';
        if (path.includes('perfil')) return 'perfil';
        if (path.includes('configuracoes')) return 'configuracoes';
        if (path.includes('administracao')) return 'administracao';
        
        return 'dashboard';
    }

    // Carrega a sidebar
    async loadSidebar() {
        if (this.sidebarLoaded) return;

        try {
            const response = await fetch('/components/sidebar.html');
            if (!response.ok) {
                throw new Error('Erro ao carregar sidebar');
            }
            
            const sidebarHTML = await response.text();
            
            // Inserir a sidebar no início do body
            document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
            
            // Adicionar classe ao main-content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.classList.add('main-content-shifted');
            }
            
            this.sidebarLoaded = true;
            this.initializeSidebar();
            this.initializeIcons();
            this.highlightCurrentPage();
            
            console.log('Sidebar carregada com sucesso');
        } catch (error) {
            console.error('Erro ao carregar sidebar:', error);
        }
    }

    // Inicializa funcionalidades da sidebar
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const closeSidebarBtn = document.getElementById('closeSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (!sidebar) return;

        // Toggle sidebar no mobile
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                sidebarOverlay.classList.toggle('show');
            });
        }

        // Fechar sidebar
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            });
        }

        // Fechar sidebar ao clicar no overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            });
        }

        // Fechar sidebar ao clicar em um link (mobile)
        const sidebarLinks = sidebar.querySelectorAll('nav a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show');
                    sidebarOverlay.classList.remove('show');
                }
            });
        });

        // Fechar sidebar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            }
        });

        // Ajustar sidebar baseado no tamanho da tela
        const handleResize = () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Executar uma vez no carregamento
    }

    // Inicializa ícones Lucide
    async initializeIcons() {
        try {
            await waitForLucide();
            lucide.createIcons();
        } catch (error) {
            console.error('Erro ao inicializar ícones:', error);
        }
    }

    // Destaca a página atual na sidebar
    highlightCurrentPage() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Remove destaque de todos os links
        const allLinks = sidebar.querySelectorAll('nav a');
        allLinks.forEach(link => {
            link.classList.remove('bg-gray-800', 'text-white');
            const icon = link.querySelector('i');
            if (icon) {
                icon.classList.remove('text-white');
                icon.classList.add('text-gray-400');
            }
        });

        // Destaca a página atual
        const currentPageMap = {
            'dashboard': '/dashboard',
            'instances': '/instances',
            'code': '/code',
            'templates': '/templates',
            'campanhas': '/campanhas',
            'mensagens-automaticas': '/mensagens-automaticas',
            'leads-extractor': '/leads-extractor',
            'logs': '/logs',
            'perfil': '/perfil',
            'configuracoes': '/configuracoes',
            'administracao': '/administracao'
        };

        const currentPath = currentPageMap[this.currentPage];
        
        if (currentPath) {
            const currentLink = sidebar.querySelector(`nav a[href="${currentPath}"]`);
            
            if (currentLink) {
                currentLink.classList.add('bg-gray-800', 'text-white');
                const icon = currentLink.querySelector('i');
                if (icon) {
                    icon.classList.remove('text-gray-400');
                    icon.classList.add('text-white');
                }
            }
        }
    }
}

// Função para aguardar o Lucide estar disponível
function waitForLucide() {
    return new Promise((resolve) => {
        if (typeof lucide !== 'undefined') {
            resolve();
        } else {
            const checkLucide = setInterval(() => {
                if (typeof lucide !== 'undefined') {
                    clearInterval(checkLucide);
                    resolve();
                }
            }, 100);
        }
    });
}

// Inicializar sidebar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLoader = new SidebarLoader();
    sidebarLoader.loadSidebar();
});

// Exportar para uso global
window.SidebarLoader = SidebarLoader;

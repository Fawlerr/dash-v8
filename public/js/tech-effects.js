// ===== SCRIPT DE EFEITOS TECNOLÓGICOS =====

class TechEffects {
    constructor() {
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isInitialized = false;
    }

    // Inicializa todos os efeitos
    init() {
        if (this.isInitialized) return;
        
        this.createParallaxLayers();
        // this.createParticles(); // Removido para melhor performance
        this.initMouseEffects();
        this.initScrollEffects();
        this.initTypingEffects();
        this.initCounters();
        
        this.isInitialized = true;
        console.log('🚀 Efeitos tecnológicos inicializados!');
    }

    // Cria camadas de parallax simplificadas
    createParallaxLayers() {
        const body = document.body;
        
        // Adiciona classes necessárias
        body.classList.add('parallax-container', 'smooth-scroll');
        
        // Cria apenas background principal e grid simples
        const bg = document.createElement('div');
        bg.className = 'parallax-bg';
        body.insertBefore(bg, body.firstChild);
        
        // Cria grid tecnológico simplificado
        const grid = document.createElement('div');
        grid.className = 'tech-grid';
        body.insertBefore(grid, body.firstChild);
    }

    // Sistema de partículas removido para melhor performance

    // Efeitos de mouse
    initMouseEffects() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.updateMouseEffects();
        });
        
        // Efeito de cursor personalizado
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('button, a, .hover-glow, .hover-float')) {
                document.body.style.cursor = 'pointer';
            }
        });
    }

    // Atualiza efeitos baseados na posição do mouse (simplificado)
    updateMouseEffects() {
        // Efeitos de mouse simplificados para melhor performance
        // Apenas aplica efeitos básicos sem cálculos complexos
    }

    // Efeitos de scroll simplificados
    initScrollEffects() {
        // Efeitos de scroll simplificados para melhor performance
        // Apenas fade in básico sem parallax complexo
        const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
            }
        });
    }

    // Efeitos de digitação
    initTypingEffects() {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid #8b5cf6';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Remove cursor após terminar
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            // Inicia o efeito quando o elemento estiver visível
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter();
                        observer.unobserve(element);
                    }
                });
            });
            
            observer.observe(element);
        });
    }

    // Efeitos de contador animado
    initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const start = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = Math.floor(progress * target);
                counter.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            requestAnimationFrame(updateCounter);
        };
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Adiciona efeitos aos botões
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn, .action-btn');
        
        buttons.forEach(button => {
            button.classList.add('tech-btn', 'hover-glow');
            
            // Efeito de ripple
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // Adiciona efeitos aos cards
    enhanceCards() {
        const cards = document.querySelectorAll('.stat-card, .instance-card, .template-card, .flow-block');
        
        cards.forEach((card, index) => {
            card.classList.add('glass-card', 'hover-float', 'fade-in-up');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Adiciona efeitos à sidebar (sem neon)
    enhanceSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Apenas adiciona efeitos sutis, sem neon
            const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
            sidebarItems.forEach(item => {
                // Remove qualquer classe de hover-glow que possa ter sido aplicada
                item.classList.remove('hover-glow');
            });
        }
    }

    // Adiciona efeitos aos headers
    enhanceHeaders() {
        const headers = document.querySelectorAll('h1, h2, h3');
        
        headers.forEach(header => {
            if (header.textContent.includes('Dashboard') || 
                header.textContent.includes('Instâncias') ||
                header.textContent.includes('Templates')) {
                
            }
            header.classList.add('tech-text');
        });
    }

    // Aplica todos os aprimoramentos
    enhanceAll() {
        this.enhanceButtons();
        this.enhanceCards();
        this.enhanceSidebar();
        this.enhanceHeaders();
    }
}

// Adiciona animação de ripple
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// Injeta CSS de ripple
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Inicializa efeitos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const techEffects = new TechEffects();
    
    // Pequeno delay para garantir que tudo esteja carregado
    setTimeout(() => {
        techEffects.init();
        techEffects.enhanceAll();
    }, 100);
});

// Exporta para uso global
window.TechEffects = TechEffects;

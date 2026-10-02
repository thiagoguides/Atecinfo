async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar ${filePath}: Status ${response.status}`);
        }
        
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error('Erro na inclusão de componente:', error);
    }
}

// Helper para manipular Cookies (Caso prefira usar Cookies)
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Inicializa a lógica e os eventos do Tema
function initTheme() {
    // 1. Lê a preferência salva
    const savedTheme = getCookie('theme') || localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    // Aplica a classe inicial no <html>
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Função interna para alternar o tema
    function toggleTheme() {
        const willBeDark = !document.documentElement.classList.contains('dark');
        
        if (willBeDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setCookie('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setCookie('theme', 'light');
        }
    }

    // 2. Localiza os botões de Desktop e Mobile
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeToggleMobileBtn = document.getElementById('themeToggleMobile');

    // 3. Adiciona o evento de clique nos botões existentes
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleMobileBtn) {
        themeToggleMobileBtn.addEventListener('click', toggleTheme);
    }
}

// Carrega todos os módulos na ordem e inicializa os scripts correspondentes
document.addEventListener("DOMContentLoaded", async () => {

    // 1. Carrega os componentes HTML sequencialmente
    await loadComponent("informativo", "/components/Informativo.html");
    await loadComponent("catalogo", "/components/Catalogo.html");
    await loadComponent("demonstracao", "/components/demonstracao.html");
    await loadComponent("comodidade", "/components/comodidade.html");
    await loadComponent("contato", "/components/Contato.html");
    await loadComponent("rodape", "/components/rodape.html");
    await loadComponent("menuTopo", "/components/menuTopo.html");
    await loadComponent("topo", "/components/topo.html");

    // 2. Inicializa o Tema APÓS o carregamento de todos os componentes (menuTopo incluído)
    initTheme();

    // 3. Inicializa os demais módulos
    if (typeof initInformativo === 'function') {
        initInformativo();
    }
    if (typeof initApp === 'function') {
        initApp();
    }
    if (typeof initTopoDinamico === 'function') {
        initTopoDinamico();
    }
});
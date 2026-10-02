// 1. Aplica o Tema Escuro/Claro imediatamente (Anti-Flicker com Padrão Dark)
(function () {
    function getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    }

    const savedTheme = getCookie('theme') || localStorage.getItem('theme');

    // Se o usuário escolheu explicitamente 'light', remove o dark.
    // Caso contrário (se salvou 'dark' ou se NÃO TIVER NENHUM COOKIE/STORAGE), ativa o dark por padrão.
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
})();

// 2. Configura o Tailwind (Cores da marca + Modo Escuro por classe)
tailwind = window.tailwind || {};
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                studio: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'sans-serif'],
            }
        }
    }
};
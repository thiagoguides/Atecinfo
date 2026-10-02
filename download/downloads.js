// Variável que armazenará os dados carregados do JSON
let downloadsData = [];

// Lista de Categorias / Tags de Filtro
const categories = [
    { id: "todas", label: "Todas" },
    { id: "Básico para Windows", label: "Básico para Windows" },
    { id: "Limpeza", label: "Limpeza" },
    { id: "autoral", label: "Autoral" },
    { id: "Scripts", label: "Scripts" },
    { id: "documentos", label: "Documentos" },
    { id: "Editor", label: "Editores" },
    { id: "outros", label: "Outros" }
];

let currentCategory = "todas";
let searchQuery = "";

// Função para buscar os dados do arquivo JSON
async function fetchDownloadsData() {
    try {
        const response = await fetch('/download/dados.json');
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        downloadsData = await response.json();
        renderDownloads();
    } catch (error) {
        console.error("Erro ao carregar o arquivo de downloads:", error);
        const grid = document.getElementById("downloadsGrid");
        if (grid) {
            grid.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold py-8">Erro ao carregar a lista de downloads.</p>`;
        }
    }
}

// Inicialização das funções
document.addEventListener("DOMContentLoaded", () => {
    renderCategoryButtons();
    fetchDownloadsData();

    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            if (clearSearch) clearSearch.classList.toggle("hidden", searchQuery === "");
            renderDownloads();
        });
    }

    if (clearSearch) {
        clearSearch.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            searchQuery = "";
            clearSearch.classList.add("hidden");
            renderDownloads();
        });
    }
});

// Renderizar os botões de filtro por categoria
function renderCategoryButtons() {
    const container = document.getElementById("categoryContainer");
    if (!container) return;

    container.innerHTML = categories.map(cat => {
        const isActive = cat.id === currentCategory;
        const activeClasses = isActive 
            ? "bg-brand-600 text-white shadow-sm border-brand-600" 
            : "bg-white dark:bg-studio-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400";

        return `
            <button 
                onclick="filterCategory('${cat.id}')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeClasses}">
                ${cat.label}
            </button>
        `;
    }).join('');
}

// Mudar de categoria
function filterCategory(catId) {
    currentCategory = catId;
    renderCategoryButtons();
    renderDownloads();
}

// Renderizar os Cards de Programas
function renderDownloads() {
    const grid = document.getElementById("downloadsGrid");
    const noResults = document.getElementById("noResults");
    const resultsCount = document.getElementById("resultsCount");

    if (!grid) return;

    // Filtragem por Tag e Busca
    const filtered = downloadsData.filter(item => {
        // FILTRO POR TAG:
        // Se for "todas", aceita todos. Caso contrário, verifica se a tag existe no array de tags do item.
        const matchesCategory = currentCategory === "todas" || 
            (Array.isArray(item.tags) && item.tags.some(tag => 
                tag.toLowerCase() === currentCategory.toLowerCase() ||
                (currentCategory.toLowerCase() === "editor" && tag.toLowerCase() === "editores")
            ));
        
        const matchesSearch = searchQuery === "" || 
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery) ||
            (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchQuery)));

        return matchesCategory && matchesSearch;
    });

    // Atualizar contador
    if (resultsCount) {
        resultsCount.textContent = `Exibindo ${filtered.length} programa(s)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = "";
        if (noResults) noResults.classList.remove("hidden");
        return;
    }

    if (noResults) noResults.classList.add("hidden");

    // Construção dos Cards de Download
    grid.innerHTML = filtered.map(item => `
        <div class="bg-white dark:bg-studio-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:border-brand-500/50 dark:hover:border-brand-400/50 hover:shadow-lg transition-all group custom-shadow-sm">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-studio-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        <i class="${item.icon} ${item.iconColor}"></i>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-studio-700 text-slate-600 dark:text-slate-300">
                        ${item.category}
                    </span>
                </div>

                <h3 class="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    ${item.title}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ${item.description}
                </p>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <a href="${item.downloadUrl}" target="_blank" download class="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-800 shadow-sm transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-download"></i> Baixar Instalador
                </a>
            </div>
        </div>
    `).join('');
}
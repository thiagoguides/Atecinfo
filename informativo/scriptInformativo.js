// scriptInformativo.js

let todosOsPosts = [];
let tagAtiva = 'todas';

// Esta função será chamada pelo load.js LOGO APÓS o HTML ser inserido na tela
async function initInformativo() {
    // Adiciona o ouvinte para o botão voltar/avançar do navegador
    window.removeEventListener('popstate', gerenciarRota);
    window.addEventListener('popstate', gerenciarRota);

    await carregarDadosEGerenciarRota();
}

async function carregarDadosEGerenciarRota() {
    try {
        const response = await fetch('/informativo/posts.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ao carregar JSON: ${response.status}`);
        }

        todosOsPosts = await response.json();
        todosOsPosts.sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));

        // Agora que os dados e o HTML existem na tela, chamamos a rota
        gerenciarRota();

    } catch (error) {
        console.error("Erro ao carregar os informativos:", error);
    }
}

function gerenciarRota() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        exibirPostCompleto(postId);
    } else {
        exibirListagem();
    }
}

function abrirPost(id, event) {
    if (event) event.preventDefault();
    
    // Pega o caminho atual (ex: /informativo ou /informativo/index.html) e adiciona ?id=
    const novaUrl = `${window.location.pathname}?id=${id}`;
    history.pushState({ id: id }, '', novaUrl);

    exibirPostCompleto(id);
}

function voltarParaListagem(event) {
    if (event) event.preventDefault();

    history.pushState({}, '', window.location.pathname);
    exibirListagem();
}

// --- MODO LISTAGEM ---
function exibirListagem() {
    document.title = "Informativos & Dicas Tech - A TEC INFO";

    const viewPost = document.getElementById('viewPost');
    const viewListagem = document.getElementById('viewListagem');

    if (viewPost) viewPost.classList.add('hidden');
    if (viewListagem) viewListagem.classList.remove('hidden');

    renderizarTags();
    renderizarCards(todosOsPosts);

    const inputBusca = document.getElementById('inputBusca');
    if (inputBusca) {
        inputBusca.removeEventListener('input', filtrarPosts);
        inputBusca.addEventListener('input', filtrarPosts);
    }
}

function renderizarTags() {
    const container = document.getElementById('containerTags');
    if (!container) return;

    const setTags = new Set();
    todosOsPosts.forEach(post => post.tags?.forEach(t => setTags.add(t.toLowerCase())));

    let html = `
        <button onclick="filtrarPorTag('todas')" 
                class="tag-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${tagAtiva === 'todas' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white dark:bg-studio-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-studio-700'}">
            # Todas
        </button>
    `;

    setTags.forEach(tag => {
        html += `
            <button onclick="filtrarPorTag('${tag}')" 
                    class="tag-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${tagAtiva === tag ? 'bg-brand-600 text-white shadow-sm' : 'bg-white dark:bg-studio-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-studio-700'}">
                #${tag}
            </button>
        `;
    });

    container.innerHTML = html;
}

function filtrarPorTag(tag) {
    tagAtiva = tag;
    renderizarTags();
    filtrarPosts();
}

function filtrarPosts() {
    const termo = document.getElementById('inputBusca')?.value.toLowerCase().trim() || '';

    const resultado = todosOsPosts.filter(post => {
        const bateTexto = post.titulo.toLowerCase().includes(termo) || 
                         post.resumoHome.toLowerCase().includes(termo) ||
                         post.tags.some(t => t.toLowerCase().includes(termo));
        
        const bateTag = tagAtiva === 'todas' || post.tags.some(t => t.toLowerCase() === tagAtiva);

        return bateTexto && bateTag;
    });

    renderizarCards(resultado);
}

function renderizarCards(posts) {
    const grid = document.getElementById('gridPosts');
    const noResults = document.getElementById('noResults');

    if (!grid) return;

    if (posts.length === 0) {
        grid.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');

    grid.innerHTML = posts.map(post => `
        <article class="bg-white dark:bg-studio-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden custom-shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
                <div class="h-48 overflow-hidden relative cursor-pointer" onclick="abrirPost('${post.id}', event)">
                    <img src="${post.imagemCapa}" alt="${post.titulo}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    
                    <span class="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-studio-800/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-colors duration-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        ${post.categoria}
                    </span>
                </div>
                <div class="p-6">
                    <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 mb-2">
                        <span><i class="fa-regular fa-calendar mr-1"></i>${formatarData(post.dataPublicacao)}</span>
                        <span>•</span>
                        <span><i class="fa-regular fa-clock mr-1"></i>${post.tempoLeitura}</span>
                    </div>
                    <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug mb-3">
                        <a href="/informativo?id=${post.id}" onclick="abrirPost('${post.id}', event)" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                            ${post.titulo}
                        </a>
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                        ${post.resumoHome}
                    </p>
                </div>
            </div>
            <div class="px-6 pb-6 pt-0 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between mt-auto">
                <div class="flex flex-wrap gap-1 mt-3">
                    ${post.tags.slice(0, 3).map(t => `<span class="text-[10px] font-medium text-slate-400 dark:text-slate-500">#${t}</span>`).join(' ')}
                </div>
                <a href="/informativo?id=${post.id}" onclick="abrirPost('${post.id}', event)" class="mt-3 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-white dark:hover:text-slate-300 inline-flex items-center gap-1 shrink-0 transition-colors">
                    Ler Post <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
            </div>
        </article>
    `).join('');
}

// --- MODO POST COMPLETO ---
async function exibirPostCompleto(id) {
    const post = todosOsPosts.find(p => String(p.id) === String(id));

    if (!post) {
        console.warn(`Post com ID '${id}' não foi localizado.`);
        // Mantém na mesma página sem a query string se o ID não existir
        history.replaceState({}, '', window.location.pathname);
        exibirListagem();
        return;
    }

    document.title = `${post.titulo} - A TEC INFO`;

    const elCategoria = document.getElementById('postCategoria');
    const elTempo = document.getElementById('postTempo');
    const elTitulo = document.getElementById('postTitulo');
    const elSubtitulo = document.getElementById('postSubtitulo');
    const elImagem = document.getElementById('postImagemCapa');

    if (elCategoria) elCategoria.innerText = post.categoria;
    if (elTempo) elTempo.innerText = post.tempoLeitura;
    if (elTitulo) elTitulo.innerText = post.titulo;
    if (elSubtitulo) elSubtitulo.innerText = post.subtitulo;
    if (elImagem) elImagem.src = post.imagemCapa;

    try {
        const res = await fetch(post.arquivoConteudo);
        if (!res.ok) throw new Error(`Falha ao buscar: ${post.arquivoConteudo}`);
        const htmlConteudo = await res.text();
        const containerConteudo = document.getElementById('postConteudoHtml');
        if (containerConteudo) containerConteudo.innerHTML = htmlConteudo;
    } catch (e) {
        console.error(e);
        const containerConteudo = document.getElementById('postConteudoHtml');
        if (containerConteudo) {
            containerConteudo.innerHTML = `<p class="text-red-500 font-bold text-center py-6">Erro ao carregar o conteúdo do post.</p>`;
        }
    }

    const viewListagem = document.getElementById('viewListagem');
    const viewPost = document.getElementById('viewPost');

    if (viewListagem) viewListagem.classList.add('hidden');
    if (viewPost) viewPost.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatarData(dataIso) {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}
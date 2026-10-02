// Altere o caminho dos JSONs se necessário
const JSON_URL = '/informativo/posts.json';
const DESTAQUES_URL = '/destaques.json';

// Mapeamento de cores para as badges de categoria (com suporte a Dark Mode)
const tagColors = {
    'Prevenção': 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
    'Hardware': 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'Emergência': 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    'Dicas': 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
};

// Variáveis globais
let globalPosts = [];
let listaDestaques = [];
let destaqueIndexAtual = 0;
let destaqueTimer = null;
const cacheHtmlDestaques = {};

function initApp() {

    // --- Mobile Drawer ---
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const menuIcon = document.getElementById('menuIcon');
    const mLinks = document.querySelectorAll('.m-link');

    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            const hidden = mobileDrawer.classList.toggle('hidden');
            if (menuIcon) menuIcon.className = hidden ? 'fa-solid fa-bars text-2xl' : 'fa-solid fa-xmark text-2xl';
        });

        mLinks.forEach(l => l.addEventListener('click', () => {
            mobileDrawer.classList.add('hidden');
            if (menuIcon) menuIcon.className = 'fa-solid fa-bars text-2xl';
        }));
    }

    // --- Photo Slider ---
    const slides = document.querySelectorAll('.slide-item');
    const thumbs = document.querySelectorAll('.thumb-btn');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    let currentSlide = 0;

    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.opacity = i === index ? '1' : '0';
            });
            thumbs.forEach((thumb, i) => {
                if (i === index) {
                    thumb.classList.add('border-brand-600', 'dark:border-brand-500');
                    thumb.classList.remove('border-transparent', 'opacity-60');
                } else {
                    thumb.classList.remove('border-brand-600', 'dark:border-brand-500');
                    thumb.classList.add('border-transparent', 'opacity-60');
                }
            });
            currentSlide = index;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let idx = currentSlide - 1;
                if (idx < 0) idx = slides.length - 1;
                showSlide(idx);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let idx = (currentSlide + 1) % slides.length;
                showSlide(idx);
            });
        }

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.getAttribute('data-index'));
                showSlide(idx);
            });
        });
    }

    // --- Tabbed Services Filter ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    if (tabBtns.length > 0 && serviceCards.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');

                tabBtns.forEach(b => {
                    b.className = 'tab-btn px-5 py-2.5 rounded-xl font-display font-bold text-xs bg-white dark:bg-studio-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-studio-700 transition-colors';
                });
                btn.className = 'tab-btn px-5 py-2.5 rounded-xl font-display font-bold text-xs bg-brand-600 text-white shadow-sm';

                serviceCards.forEach(card => {
                    const cat = card.getAttribute('data-cat');
                    if (target === 'todos' || cat === target) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Quick Quote Calculator ---
    const calcDevice = document.getElementById('calcDevice');
    const calcService = document.getElementById('calcService');
    const calcVal = document.getElementById('calcVal');

    if (calcDevice && calcService && calcVal) {
        const rates = {
            'notebook': { 'limpeza': 'R$ 150 - R$ 220', 'formatacao': 'R$ 120 - R$ 180', 'placa': 'R$ 280 - R$ 520', 'tela': 'R$ 380 - R$ 750' },
            'macbook': { 'limpeza': 'R$ 250 - R$ 380', 'formatacao': 'R$ 180 - R$ 280', 'placa': 'R$ 550 - R$ 1.200', 'tela': 'R$ 900 - R$ 2.100' },
            'pcgamer': { 'limpeza': 'R$ 180 - R$ 290', 'formatacao': 'R$ 120 - R$ 200', 'placa': 'R$ 220 - R$ 480', 'tela': 'N/A' }
        };

        function updateCalc() {
            const dev = calcDevice.value;
            const srv = calcService.value;
            if (rates[dev] && rates[dev][srv]) {
                calcVal.textContent = rates[dev][srv];
            }
        }

        calcDevice.addEventListener('change', updateCalc);
        calcService.addEventListener('change', updateCalc);
    }

    // --- News Reader Modal Event Listeners ---
    const newsModal = document.getElementById('newsModal');
    const closeModal = document.getElementById('closeModal');

    if (newsModal) {
        if (closeModal) {
            closeModal.addEventListener('click', () => newsModal.classList.add('hidden'));
        }
        newsModal.addEventListener('click', (e) => {
            if (e.target === newsModal) newsModal.classList.add('hidden');
        });
    }

    // --- Contact Form Dispatch ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cName')?.value || '';
            const phone = document.getElementById('cPhone')?.value || '';
            const device = document.getElementById('cDevice')?.value || '';
            const mode = document.getElementById('cMode')?.value || '';
            const desc = document.getElementById('cDesc')?.value || '';

            let msg = `*SOLICITAÇÃO DE AGENDAMENTO - A TEC INFO*\n\n`;
            msg += `👤 *Nome:* ${name}\n`;
            msg += `📞 *WhatsApp:* ${phone}\n`;
            msg += `💻 *Equipamento:* ${device}\n`;
            msg += `🚚 *Modalidade:* ${mode}\n`;
            msg += `📝 *Sintomas:* ${desc}\n`;

            window.open(`https://wa.me/5543984051934?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }

    // Carrega notícias do JSON
    carregarUltimosInformativos();

    // Inicializa o Carrossel Dinâmico do Topo
    initTopoDinamico();
}

// --- LÓGICA DO CARROSSEL DINÂMICO DO TOPO (BANNERS) ---

async function initTopoDinamico() {
    try {
        const response = await fetch(DESTAQUES_URL);
        if (!response.ok) throw new Error("Erro ao carregar destaques.json");

        const dados = await response.json();
        if (!dados || dados.length === 0) return;

        // Embaralha para exibição aleatória
        listaDestaques = dados.sort(() => Math.random() - 0.5);

        // Renderiza os indicadores com base na quantidade calculada no JSON
        renderizarIndicadores();

        // Exibe o primeiro item
        await carregarEExibirDestaque(0);

        // Configura ouvintes de eventos de clique e hover
        configurarEventosDestaque();

    } catch (error) {
        console.error("Erro no módulo topoDinamico:", error);
    }
}

function renderizarIndicadores() {
    const container = document.getElementById('destaqueIndicadores');
    if (!container) return;

    container.innerHTML = listaDestaques.map((_, index) => `
        <button onclick="mudarDestaqueManual(${index})" class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-studio-700/60 overflow-hidden focus:outline-none transition-all cursor-pointer" data-destaque-indicator="${index}">
            <div class="progresso-bar h-full bg-brand-600 dark:bg-brand-500 w-0 transition-all duration-300"></div>
        </button>
    `).join('');
}

async function carregarEExibirDestaque(index) {
    if (listaDestaques.length === 0) return;

    destaqueIndexAtual = index;
    const itemInfo = listaDestaques[destaqueIndexAtual];
    const wrapper = document.getElementById('destaqueHtmlWrapper');

    if (!wrapper) return;

    // Transição fade-out
    wrapper.classList.add('opacity-0');

    try {
        let htmlConteudo = cacheHtmlDestaques[itemInfo.htmlPath];

        if (!htmlConteudo) {
            const res = await fetch(itemInfo.htmlPath);
            if (!res.ok) throw new Error(`Falha ao buscar ${itemInfo.htmlPath}`);
            htmlConteudo = await res.text();
            cacheHtmlDestaques[itemInfo.htmlPath] = htmlConteudo;
        }

        setTimeout(() => {
            // Injeta o HTML do destaque
            wrapper.innerHTML = htmlConteudo;

            // Atualiza barra de indicadores
            atualizarIndicadoresVisuais();

            // Transição fade-in
            wrapper.classList.remove('opacity-0');

            // Agenda a troca automática pelo tempo individual do item
            agendarProximoDestaque(itemInfo.tempoDuracao || 6000);
        }, 300);

    } catch (err) {
        console.error("Erro ao carregar o conteúdo do destaque:", err);
    }
}

function atualizarIndicadoresVisuais() {
    const indicadores = document.querySelectorAll('#destaqueIndicadores [data-destaque-indicator]');
    indicadores.forEach((btn, idx) => {
        const bar = btn.querySelector('.progresso-bar');
        if (idx === destaqueIndexAtual) {
            if (bar) bar.style.width = '100%';
        } else {
            if (bar) bar.style.width = '0%';
        }
    });
}

function agendarProximoDestaque(tempoMs) {
    clearTimeout(destaqueTimer);
    destaqueTimer = setTimeout(() => {
        let proximoIndex = (destaqueIndexAtual + 1) % listaDestaques.length;
        carregarEExibirDestaque(proximoIndex);
    }, tempoMs);
}

function mudarDestaqueManual(index) {
    clearTimeout(destaqueTimer);
    carregarEExibirDestaque(index);
}

function configurarEventosDestaque() {
    const btnNext = document.getElementById('btnDestaqueNext');
    const btnPrev = document.getElementById('btnDestaquePrev');
    const heroSection = document.getElementById('inicio');

    if (btnNext) {
        btnNext.onclick = () => {
            let idx = (destaqueIndexAtual + 1) % listaDestaques.length;
            mudarDestaqueManual(idx);
        };
    }

    if (btnPrev) {
        btnPrev.onclick = () => {
            let idx = (destaqueIndexAtual - 1 + listaDestaques.length) % listaDestaques.length;
            mudarDestaqueManual(idx);
        };
    }

    // Pausa a rotação enquanto o ponteiro do mouse estiver sobre a seção
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => clearTimeout(destaqueTimer));
        heroSection.addEventListener('mouseleave', () => {
            const tempo = listaDestaques[destaqueIndexAtual]?.tempoDuracao || 6000;
            agendarProximoDestaque(tempo);
        });
    }
}

// --- CARREGAMENTO DE INFORMATIVOS/NOTÍCIAS ---

async function carregarUltimosInformativos() {
    const container = document.getElementById('grid-noticias');
    if (!container) return;

    try {
        const response = await fetch(JSON_URL);
        const data = await response.json();

        globalPosts = data.posts || data;

        // Ordena por ID decrescente e pega os 3 últimos
        const ultimosPosts = [...globalPosts]
            .sort((a, b) => Number(b.id) - Number(a.id))
            .slice(0, 3);

        container.innerHTML = ultimosPosts.map(post => {
            const tagStyle = tagColors[post.categoria] || 'bg-slate-100 dark:bg-studio-800 text-slate-800 dark:text-slate-200';
            const postLink = `/informativo/?id=${post.id}`;

            return `
                <article class="bg-white dark:bg-studio-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden custom-shadow-sm hover:shadow-md transition-all flex flex-col">
                    <a href="${postLink}" class="block overflow-hidden">
                        <img src="${post.imagemCapa}" alt="${post.titulo}" class="h-48 w-full object-cover hover:scale-105 transition-transform duration-300">
                    </a>

                    <div class="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 mb-3">
                                <span class="${tagStyle} font-bold px-2 py-0.5 rounded">${post.categoria}</span>
                                <span><i class="fa-regular fa-clock"></i> ${post.tempoLeitura} leitura</span>
                            </div>

                            <h3 class="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug">
                                <a href="${postLink}" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    ${post.titulo}
                                </a>
                            </h3>

                            <p class="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                                ${post.resumoHome}
                            </p>
                        </div>

                        <a href="${postLink}" class="inline-flex items-center gap-1 font-display font-bold text-xs text-brand-600 hover:text-brand-700 dark:text-white dark:hover:text-slate-300 mt-4 transition-colors">
                            Ler artigo completo <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');

    } catch (erro) {
        console.error('Erro ao carregar o arquivo JSON de notícias:', erro);
    }
}

// Função executada ao clicar no modal
function abrirModalPost(id) {
    const newsModal = document.getElementById('newsModal');
    const modalBody = document.getElementById('modalBody');
    if (!newsModal || !modalBody) return;

    const post = globalPosts.find(p => String(p.id) === String(id));
    if (!post) return;

    const tagStyle = tagColors[post.categoria] || 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300';

    modalBody.innerHTML = `
        <span class="px-2.5 py-1 rounded ${tagStyle} font-bold text-xs uppercase">${post.categoria}</span>
        <h3 class="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-2">${post.titulo}</h3>
        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mt-4">${post.conteudo || post.resumo}</p>
        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end mt-6">
            <a href="#contato" id="modalCta" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors">Falar com Técnico</a>
        </div>
    `;

    newsModal.classList.remove('hidden');

    const modalCta = document.getElementById('modalCta');
    if (modalCta) {
        modalCta.addEventListener('click', () => newsModal.classList.add('hidden'));
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', initApp);
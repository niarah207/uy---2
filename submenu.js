// submenu.js — comportamento do cabeçalho em TODAS as páginas (Updated Yesterday)
//   1) Menu hambúrguer (telas menores)
//   2) Botão de tema claro/escuro
//   3) Submenus "Sumário", "Segmentos" e "Explorar" (desktop: hover/clique; mobile: sanfona)
//
// Tudo fica neste arquivo de propósito: o cabeçalho é o mesmo em todo o site e este
// arquivo já é carregado por todas as páginas.

// ----------------------------------------------------------------------
// 1) MENU HAMBÚRGUER
// ----------------------------------------------------------------------
(function () {
    var btn = document.getElementById('btn-hamburguer');
    var menu = document.getElementById('menu-mobile');
    var overlay = document.getElementById('overlay-menu-mobile');
    if (!btn || !menu || !overlay) return;

    function abrirMenu() {
        menu.classList.add('aberto');
        overlay.classList.add('aberto');
        btn.classList.add('ativo');
        btn.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-bloqueado');
    }

    function fecharMenu() {
        menu.classList.remove('aberto');
        overlay.classList.remove('aberto');
        btn.classList.remove('ativo');
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-bloqueado');
    }

    btn.addEventListener('click', function () {
        if (menu.classList.contains('aberto')) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    });

    overlay.addEventListener('click', fecharMenu);

    // Fecha ao tocar em um link de verdade (os botões "sanfona" não fecham o menu).
    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', fecharMenu);
    });

    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape') fecharMenu();
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 992) fecharMenu();
    });
})();

// ----------------------------------------------------------------------
// 2) TEMA CLARO / ESCURO
// A escolha fica salva no navegador (chave "uy-tema") e é aplicada em todas as páginas
// pelo pequeno script do <head>, então o tema continua ao navegar.
// Ao trocar o modo, dispara o evento "uy:tema" — o scroll-reveal.js escuta esse evento
// para que as animações de entrada também apareçam no novo modo.
// ----------------------------------------------------------------------
(function () {
    var raiz = document.documentElement;
    var botao = document.getElementById('btn-tema');
    if (!botao) return;

    function aplicar(escuro) {
        var mudou = raiz.classList.contains('tema-escuro') !== escuro;
        raiz.classList.toggle('tema-escuro', escuro);
        botao.setAttribute('aria-pressed', escuro ? 'true' : 'false');
        botao.setAttribute('aria-label', escuro ? 'Ativar modo claro' : 'Ativar modo escuro');
        if (mudou) {
            document.dispatchEvent(new CustomEvent('uy:tema', { detail: { escuro: escuro } }));
        }
    }

    function lerSalvo() {
        try {
            return localStorage.getItem('uy-tema') !== 'claro';
        } catch (e) {
            return raiz.classList.contains('tema-escuro');
        }
    }

    aplicar(lerSalvo());

    botao.addEventListener('click', function () {
        var escuro = !raiz.classList.contains('tema-escuro');
        aplicar(escuro);
        try { localStorage.setItem('uy-tema', escuro ? 'escuro' : 'claro'); } catch (e) {}
    });

    // Mantém o tema sincronizado ao voltar para a página (botão "voltar") ou entre abas.
    window.addEventListener('pageshow', function () { aplicar(lerSalvo()); });
    window.addEventListener('storage', function (e) { if (e.key === 'uy-tema') aplicar(lerSalvo()); });
})();

// ----------------------------------------------------------------------
// 3) SUBMENUS
// ----------------------------------------------------------------------
(function () {
    var itens = document.querySelectorAll('.item-submenu, .item-submenu-mobile');

    function fechar(item) {
        item.classList.remove('aberto');
        var b = item.querySelector('button');
        if (b) b.setAttribute('aria-expanded', 'false');
    }

    itens.forEach(function (item) {
        var botao = item.querySelector('button');
        if (!botao) return;
        botao.addEventListener('click', function (e) {
            e.stopPropagation();
            var abrir = !item.classList.contains('aberto');
            itens.forEach(fechar);
            if (abrir) {
                item.classList.add('aberto');
                botao.setAttribute('aria-expanded', 'true');
            }
        });
        // No desktop, o hover já abre o submenu; ao tirar o mouse, fecha também o estado por clique.
        if (item.classList.contains('item-submenu')) {
            item.addEventListener('mouseleave', function () { fechar(item); });
        }
    });

    document.addEventListener('click', function () { itens.forEach(fechar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') itens.forEach(fechar); });

    // Marca a página atual dentro do submenu (e o botão "Explorar" como ativo).
    var atual = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.submenu a, .submenu-mobile a').forEach(function (a) {
        var alvo = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
        if (alvo && alvo === atual) {
            if ((a.getAttribute('href') || '').indexOf('#') === -1) a.setAttribute('aria-current', 'page');
            var pai = a.closest('.item-submenu, .item-submenu-mobile');
            var b = pai && pai.querySelector('button, a.link-submenu');
            if (b) b.classList.add('ativo');
        }
    });
})();

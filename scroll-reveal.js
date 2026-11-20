// scroll-reveal.js — Animações de entrada ao rolar a página (Updated Yesterday)
//
// Como funciona:
// - Cada elemento marcado (revelar, revelar-esquerda, revelar-direita,
//   revelar-cima, revelar-cascata) anima UMA vez por carregamento da página.
//   Ao recarregar, o efeito acontece de novo.
// - A animação NUNCA bloqueia a rolagem: é apenas visual.
// - Se a pessoa rolar rápido, as animações ficam bem mais curtas para que o
//   conteúdo apareça quase imediatamente, sem sensação de travamento.
// - Ao trocar entre modo claro e escuro, os elementos que estão na tela repetem
//   a animação de entrada no novo modo, e os que ainda não apareceram continuam
//   esperando a vez normalmente (o evento "uy:tema" vem do tema.js).
// - As animações são @keyframes no style.css (não dependem de "transition"), então
//   nenhuma outra regra de estilo — nem a troca de tema — consegue desligá-las.
(function () {
    // Avisa o <head> que este script carregou (senão o plano B mostra tudo sem animação).
    window.__uyReveal = true;

    var raiz = document.documentElement;
    var SELETOR = '.revelar, .revelar-esquerda, .revelar-direita, .revelar-cima, .revelar-cascata';
    var elementos = [].slice.call(document.querySelectorAll(SELETOR));
    if (!elementos.length) return;

    // Plano B já foi acionado (script demorou demais) ou a pessoa prefere menos movimento:
    // nada fica escondido, então não há o que animar.
    var semMovimento = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!raiz.classList.contains('js-reveal') || semMovimento || !('IntersectionObserver' in window)) {
        elementos.forEach(function (el) { el.classList.add('ativo', 'rev-instante'); });
        return;
    }

    // Repetir a animação dos elementos visíveis quando o tema muda (true/false).
    var REPETIR_AO_TROCAR_TEMA = true;

    // Durações: normal x rolagem rápida
    var DUR_NORMAL = '0.7s';
    var DUR_RAPIDA = '0.2s';
    var PASSO_NORMAL = '0.07s';
    var PASSO_RAPIDO = '0.02s';

    // ----------------------------------------------------------------------
    // Detecção de velocidade de rolagem
    // ----------------------------------------------------------------------
    var ultimoY = window.pageYOffset;
    var ultimoTempo = Date.now();
    var rapido = false;
    var voltarAoNormal;

    function aplicarVelocidade(estaRapido) {
        if (estaRapido === rapido) return;
        rapido = estaRapido;
        raiz.style.setProperty('--duracao-revelar', rapido ? DUR_RAPIDA : DUR_NORMAL);
        raiz.style.setProperty('--passo-cascata', rapido ? PASSO_RAPIDO : PASSO_NORMAL);
    }

    function medirRolagem() {
        var agora = Date.now();
        var y = window.pageYOffset;
        var tempo = agora - ultimoTempo;

        if (tempo > 0) {
            // pixels por milissegundo; acima de ~1.4 px/ms a rolagem é considerada rápida
            var velocidade = Math.abs(y - ultimoY) / tempo;
            if (velocidade > 1.4) {
                aplicarVelocidade(true);
                clearTimeout(voltarAoNormal);
                voltarAoNormal = setTimeout(function () { aplicarVelocidade(false); }, 400);
            }
        }

        ultimoY = y;
        ultimoTempo = agora;
    }

    window.addEventListener('scroll', medirRolagem, { passive: true });

    // ----------------------------------------------------------------------
    // Revelação dos elementos
    // ----------------------------------------------------------------------
    var observer = new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('ativo');
            obs.unobserve(entrada.target); // anima só uma vez por carregamento
        });
    }, {
        // Começa um pouco antes de entrar totalmente na tela, para que o
        // elemento já esteja visível quando a pessoa chegar nele.
        threshold: 0,
        rootMargin: '0px 0px -12% 0px'
    });

    elementos.forEach(function (el) {
        var caixa = el.getBoundingClientRect();
        if (caixa.bottom < 0) {
            // Já ficou para trás (recarregou no meio da página ou entrou por âncora):
            // aparece direto, sem animar fora da tela.
            el.classList.add('ativo', 'rev-instante');
        } else if (caixa.top < window.innerHeight * 0.9) {
            // Já está na tela: anima na entrada da página.
            el.classList.add('ativo');
        } else {
            observer.observe(el);
        }
    });

    // ----------------------------------------------------------------------
    // Troca de tema: a animação reaparece no novo modo
    // ----------------------------------------------------------------------
    document.addEventListener('uy:tema', function () {
        if (!REPETIR_AO_TROCAR_TEMA) return;

        var altura = window.innerHeight;
        var visiveis = elementos.filter(function (el) {
            if (!el.classList.contains('ativo')) return false;
            var caixa = el.getBoundingClientRect();
            return caixa.bottom > 0 && caixa.top < altura;
        });
        if (!visiveis.length) return;

        // Volta ao estado "escondido" e, no quadro seguinte, anima de novo.
        visiveis.forEach(function (el) { el.classList.remove('ativo', 'rev-instante'); });
        void raiz.offsetWidth; // força o navegador a registrar o estado escondido
        requestAnimationFrame(function () {
            visiveis.forEach(function (el) { el.classList.add('ativo'); });
        });
    });
})();

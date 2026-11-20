// carrossel.js — carrossel de imagens de fundo do hero (Sobre Nós, Segmentos e Blog)
// Só o fundo desliza; o texto fica parado. Usa os elementos [data-bl-carrossel], .bl-trilho
// e .bl-controles do hero. Pausa ao passar o mouse/foco, e não roda com "reduzir movimento".
(function () {
    var hero = document.querySelector('[data-bl-carrossel]');
    if (!hero) return;
    var trilho = hero.querySelector('.bl-trilho');
    var slides = [].slice.call(trilho.children);
    var total = slides.length;
    var controles = document.querySelector('.bl-controles');
    if (total < 2) { if (controles) controles.style.display = 'none'; return; }

    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var INTERVALO = 6000, VELOC = '.9s cubic-bezier(.65,0,.35,1)';
    var pos = 0, timer = null, pausado = false, ocupado = false;

    // clone do 1º slide no fim → o loop continua sempre para o mesmo lado, sem "voltar correndo"
    var clone = slides[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    trilho.appendChild(clone);

    var pontos = controles.querySelector('.bl-pontos');
    slides.forEach(function (s, i) {
        s.setAttribute('role', 'group');
        s.setAttribute('aria-roledescription', 'slide');
        s.setAttribute('aria-label', (i + 1) + ' de ' + total);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bl-ponto';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Ir para imagem ' + (i + 1));
        b.addEventListener('click', function () { ir(i); reiniciar(); });
        pontos.appendChild(b);
    });

    function marcar() {
        var atual = pos % total;
        [].forEach.call(pontos.children, function (b, i) {
            b.classList.toggle('ativo', i === atual);
            b.setAttribute('aria-selected', i === atual ? 'true' : 'false');
        });
    }
    function mover(animar) {
        trilho.style.transition = animar ? 'transform ' + VELOC : 'none';
        trilho.style.transform = 'translateX(' + (-pos * 100) + '%)';
    }
    function ir(n) {
        if (ocupado) return;
        ocupado = true;
        pos = n;
        mover(true);
        marcar();
    }
    trilho.addEventListener('transitionend', function (e) {
        if (e.target !== trilho) return;
        if (pos >= total) { pos = 0; mover(false); }
        ocupado = false;
    });
    function proximo() { ir(pos + 1); }
    function anterior() {
        if (ocupado) return;
        if (pos === 0) { pos = total; mover(false); void trilho.offsetWidth; }
        ir(pos - 1);
    }

    function parar() { clearInterval(timer); timer = null; }
    function iniciar() {
        if (reduzir || pausado || timer) return;
        timer = setInterval(proximo, INTERVALO);
    }
    function reiniciar() { parar(); iniciar(); }

    controles.querySelector('.bl-proximo').addEventListener('click', function () { proximo(); reiniciar(); });
    controles.querySelector('.bl-anterior').addEventListener('click', function () { anterior(); reiniciar(); });

    [hero, controles].forEach(function (el) {
        el.addEventListener('mouseenter', function () { pausado = true; parar(); });
        el.addEventListener('mouseleave', function () { pausado = false; iniciar(); });
        el.addEventListener('focusin', function () { pausado = true; parar(); });
        el.addEventListener('focusout', function () { pausado = false; iniciar(); });
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? parar() : iniciar(); });

    // arrastar no celular
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 45) { dx < 0 ? proximo() : anterior(); reiniciar(); }
    }, { passive: true });

    marcar();
    iniciar();
})();

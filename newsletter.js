// newsletter.js — envio do formulário de newsletter do rodapé (Updated Yesterday)
// O rodapé é igual em todas as páginas; este script cuida do envio sem recarregar a página.
(function () {
    var form = document.getElementById('sib-form');
    var successMsg = document.getElementById('success-message');
    var errorMsg = document.getElementById('error-message');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (successMsg) successMsg.style.display = 'none';
        if (errorMsg) errorMsg.style.display = 'none';

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        }).then(function (resposta) {
            if (resposta.ok) {
                if (successMsg) successMsg.style.display = 'block';
                form.reset();
            } else if (errorMsg) {
                errorMsg.style.display = 'block';
            }
        }).catch(function () {
            if (errorMsg) errorMsg.style.display = 'block';
        });
    });
})();

(function () {
    const $ = (id) => document.getElementById(id);
    const el = {
        form: $('form'), texto: $('texto'), modo: $('modo'), duracao: $('duracao'), cps: $('cps'),
        intervalo: $('intervalo'), maxCar: $('maxCar'), res: $('resultado'), stats: $('stats'),
        contador: $('contador'), baixar: $('baixar'), copiar: $('copiar'), limpar: $('limpar'),
        abrir: $('abrir'), arquivo: $('arquivo'), toast: $('toast'),
        campoDuracao: $('campoDuracao'), campoCps: $('campoCps')
    };
    const CAMPOS = ['modo', 'duracao', 'cps', 'intervalo', 'maxCar'];

    /* ---------- Conversão ---------- */
    function formatarTempo(s) {
        const total = Math.round(s * 1000);
        const h = Math.floor(total / 3600000);
        const m = Math.floor((total % 3600000) / 60000);
        const seg = Math.floor((total % 60000) / 1000);
        const ms = total % 1000;
        const p = (n, t = 2) => String(n).padStart(t, '0');
        return `${p(h)}:${p(m)}:${p(seg)},${p(ms, 3)}`;
    }

    // Quebra o texto em frases, mantendo a pontuação.
    function dividirFrases(texto) {
        return (texto.replace(/\s+/g, ' ').trim().match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)/g) || [])
            .map((f) => f.trim()).filter(Boolean);
    }

    // Frase maior que o limite: corta na última vírgula/espaço possível.
    function cortarFrase(frase, max) {
        const partes = [];
        while (frase.length > max) {
            let corte = frase.lastIndexOf(',', max);
            if (corte < max * 0.4) corte = frase.lastIndexOf(' ', max);
            if (corte <= 0) corte = max;
            partes.push(frase.slice(0, corte + 1).trim());
            frase = frase.slice(corte + 1).trim();
        }
        if (frase) partes.push(frase);
        return partes;
    }

    function criarBlocos(texto, max) {
        const blocos = [];
        let atual = '';
        for (const frase of dividirFrases(texto)) {
            for (const parte of cortarFrase(frase, max)) {
                if (atual && (atual + ' ' + parte).length > max) {
                    blocos.push(atual);
                    atual = parte;
                } else {
                    atual = atual ? atual + ' ' + parte : parte;
                }
            }
        }
        if (atual) blocos.push(atual);
        return blocos;
    }

    function converter(texto, cfg) {
        const blocos = criarBlocos(texto, cfg.max);
        let t = 0;
        const partes = blocos.map((txt, i) => {
            const dur = cfg.modo === 'auto' ? Math.max(1.5, txt.length / cfg.cps) : cfg.duracao;
            const bloco = `${i + 1}\n${formatarTempo(t)} --> ${formatarTempo(t + dur)}\n${txt}`;
            t += dur + (i < blocos.length - 1 ? cfg.intervalo : 0);
            return bloco;
        });
        return { srt: partes.join('\n\n'), blocos: blocos.length, total: t };
    }

    function formatarDuracao(s) {
        const m = Math.floor(s / 60), seg = Math.round(s % 60);
        return m ? `${m} min ${seg} s` : `${seg} s`;
    }

    /* ---------- Interface ---------- */
    let toastTimer;
    function aviso(msg) {
        el.toast.textContent = msg;
        el.toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1800);
    }

    function atualizarContador() {
        const t = el.texto.value.trim();
        const palavras = t ? t.split(/\s+/).length : 0;
        el.contador.textContent = `${el.texto.value.length} caracteres · ${palavras} palavras`;
    }

    function atualizarModo() {
        const auto = el.modo.value === 'auto';
        el.campoDuracao.classList.toggle('hidden', auto);
        el.campoCps.classList.toggle('hidden', !auto);
    }

    function mostrarResultado(visivel) {
        [el.baixar, el.copiar, el.limpar].forEach((b) => b.classList.toggle('hidden', !visivel));
    }

    function lerConfig() {
        return {
            modo: el.modo.value,
            duracao: parseFloat(el.duracao.value) || 30,
            cps: parseFloat(el.cps.value) || 15,
            intervalo: Math.max(0, parseFloat(el.intervalo.value) || 0),
            max: Math.max(50, parseInt(el.maxCar.value, 10) || 500)
        };
    }

    el.form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!el.texto.value.trim()) { aviso('Cole um roteiro para converter.'); return; }
        const r = converter(el.texto.value, lerConfig());
        el.res.textContent = r.srt;
        el.stats.innerHTML = `<span><b>${r.blocos}</b> blocos</span><span>Duração total: <b>${formatarDuracao(r.total)}</b></span>`;
        mostrarResultado(true);
        salvar();
    });

    el.baixar.addEventListener('click', () => {
        const srt = el.res.textContent;
        if (!srt) return;
        const blob = new Blob(['\ufeff' + srt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'legendas.srt';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        aviso('Arquivo baixado.');
    });

    el.copiar.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(el.res.textContent); aviso('SRT copiado.'); }
        catch (e) { aviso('Não foi possível copiar. Selecione o texto manualmente.'); }
    });

    el.limpar.addEventListener('click', () => {
        el.texto.value = ''; el.res.textContent = ''; el.stats.innerHTML = '';
        mostrarResultado(false); atualizarContador(); el.texto.focus();
    });

    el.abrir.addEventListener('click', () => el.arquivo.click());
    el.arquivo.addEventListener('change', () => {
        const f = el.arquivo.files[0];
        if (!f) return;
        const leitor = new FileReader();
        leitor.onload = () => { el.texto.value = leitor.result; atualizarContador(); aviso('Arquivo carregado.'); };
        leitor.readAsText(f, 'UTF-8');
        el.arquivo.value = '';
    });

    el.texto.addEventListener('input', atualizarContador);
    el.modo.addEventListener('change', () => { atualizarModo(); salvar(); });

    /* ---------- Preferências ---------- */
    function salvar() {
        try {
            const cfg = {};
            CAMPOS.forEach((c) => (cfg[c] = el[c].value));
            localStorage.setItem('srt-config', JSON.stringify(cfg));
        } catch (e) { }
    }
    function carregar() {
        try {
            const cfg = JSON.parse(localStorage.getItem('srt-config') || 'null');
            if (cfg) CAMPOS.forEach((c) => { if (cfg[c] !== undefined) el[c].value = cfg[c]; });
        } catch (e) { }
    }

    carregar();
    atualizarModo();
    atualizarContador();
})();
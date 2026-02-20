// ============================================
// SISTEMA DE PIZZARIA RODÍZIO - FUNCIONALIDADES
// ============================================

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    setInterval(atualizarTimers, 1000);
});

function inicializarSistema() {
    if (!localStorage.getItem('sistemaRodizio')) {
        const dadosIniciais = {
            configuracoes: { sabores: [], garcons: [] },
            noiteAtual: {
                data: new Date().toLocaleDateString('pt-BR'),
                horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                pedidos: []
            },
            historico: []
        };
        localStorage.setItem('sistemaRodizio', JSON.stringify(dadosIniciais));
    }
    
    document.getElementById('dataAtual').textContent = 
        new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    carregarSabores();
    carregarGarcons();
    carregarSaboresSelect();
    atualizarFila();
}

// ============================================
// RESET DO SISTEMA
// ============================================
function novaNoite() {
    if (confirm('Iniciar nova noite?\nOs pedidos atuais serão arquivados no histórico.')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        
        if (sistema.noiteAtual.pedidos.length > 0) {
            sistema.historico.push({
                data: sistema.noiteAtual.data,
                pedidos: [...sistema.noiteAtual.pedidos]
            });
        }
        
        sistema.noiteAtual = {
            data: new Date().toLocaleDateString('pt-BR'),
            horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pedidos: []
        };
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        atualizarFila();
        alert('Nova noite iniciada!');
    }
}

function resetarSistema() {
    if (confirm('⚠️ RESETAR SISTEMA?\nTodos os dados serão perdidos!')) {
        localStorage.removeItem('sistemaRodizio');
        inicializarSistema();
        alert('Sistema resetado!');
    }
}

// ============================================
// SABORES
// ============================================
function adicionarSabor() {
    const nome = document.getElementById('nomeSabor').value.trim();
    const tipo = document.getElementById('tipoSaborConfig').value;
    
    if (!nome) {
        alert('Digite o nome do sabor');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    sistema.configuracoes.sabores.push({
        id: Date.now(),
        nome: nome,
        tipo: tipo
    });
    
    sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('nomeSabor').value = '';
    carregarSabores();
    carregarSaboresSelect();
}

function carregarSabores() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaSabores');
    
    lista.innerHTML = sistema.configuracoes.sabores.map(sabor => `
        <div class="item-lista">
            <span class="item-info">
                ${sabor.nome}
                <span class="tipo-badge tipo-${sabor.tipo}">${sabor.tipo}</span>
            </span>
            <div class="item-acoes">
                <button class="btn-editar" onclick="editarSabor(${sabor.id})">EDITAR</button>
                <button class="btn-excluir" onclick="excluirSabor(${sabor.id})">EXCLUIR</button>
            </div>
        </div>
    `).join('');
}

function editarSabor(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const sabor = sistema.configuracoes.sabores.find(s => s.id === id);
    const novoNome = prompt('Novo nome:', sabor.nome);
    
    if (novoNome && novoNome.trim()) {
        sabor.nome = novoNome.trim();
        sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarSabores();
        carregarSaboresSelect();
    }
}

function excluirSabor(id) {
    if (confirm('Excluir este sabor?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.sabores = sistema.configuracoes.sabores.filter(s => s.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarSabores();
        carregarSaboresSelect();
    }
}

// ============================================
// GARÇONS
// ============================================
function adicionarGarcom() {
    const nome = document.getElementById('nomeGarcom').value.trim();
    
    if (!nome) {
        alert('Digite o nome do garçom');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    sistema.configuracoes.garcons.push({
        id: Date.now(),
        nome: nome
    });
    
    sistema.configuracoes.garcons.sort((a, b) => a.nome.localeCompare(b.nome));
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('nomeGarcom').value = '';
    carregarGarcons();
    carregarGarconsSelect();
}

function carregarGarcons() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaGarcons');
    
    lista.innerHTML = sistema.configuracoes.garcons.map(garcom => `
        <div class="item-lista">
            <span class="item-info">${garcom.nome}</span>
            <div class="item-acoes">
                <button class="btn-editar" onclick="editarGarcom(${garcom.id})">EDITAR</button>
                <button class="btn-excluir" onclick="excluirGarcom(${garcom.id})">EXCLUIR</button>
            </div>
        </div>
    `).join('');
}

function editarGarcom(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const garcom = sistema.configuracoes.garcons.find(g => g.id === id);
    const novoNome = prompt('Novo nome:', garcom.nome);
    
    if (novoNome && novoNome.trim()) {
        garcom.nome = novoNome.trim();
        sistema.configuracoes.garcons.sort((a, b) => a.nome.localeCompare(b.nome));
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarGarcons();
        carregarGarconsSelect();
    }
}

function excluirGarcom(id) {
    if (confirm('Excluir este garçom?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.garcons = sistema.configuracoes.garcons.filter(g => g.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarGarcons();
        carregarGarconsSelect();
    }
}

// ============================================
// SELECTS
// ============================================
function carregarSaboresSelect() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const tipo = document.getElementById('tipoSabor')?.value;
    
    if (tipo) {
        const sabores = sistema.configuracoes.sabores
            .filter(s => s.tipo === tipo)
            .sort((a, b) => a.nome.localeCompare(b.nome));
        
        const select = document.getElementById('saborPedido');
        select.innerHTML = '<option value="">SELECIONE</option>' +
            sabores.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
    }
}

function carregarGarconsSelect() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const garcons = [...sistema.configuracoes.garcons].sort((a, b) => a.nome.localeCompare(b.nome));
    
    const select = document.getElementById('garcomPedido');
    select.innerHTML = '<option value="">SELECIONE</option>' +
        garcons.map(g => `<option value="${g.id}">${g.nome}</option>`).join('');
}

// ============================================
// PEDIDOS
// ============================================
function criarPedido() {
    const tipo = document.getElementById('tipoSabor').value;
    const saborId = document.getElementById('saborPedido').value;
    const garcomId = document.getElementById('garcomPedido').value;
    const mesa = document.getElementById('mesaPedido').value;
    
    if (!tipo || !saborId || !garcomId || !mesa) {
        alert('Preencha todos os campos');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const sabor = sistema.configuracoes.sabores.find(s => s.id == saborId);
    const garcom = sistema.configuracoes.garcons.find(g => g.id == garcomId);
    
    sistema.noiteAtual.pedidos.push({
        id: Date.now(),
        tipo: tipo,
        sabor: sabor.nome,
        garcom: garcom.nome,
        mesa: parseInt(mesa),
        dataHora: new Date().toISOString(),
        status: 'pendente',
        tempoPreparo: null
    });
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('tipoSabor').value = '';
    document.getElementById('saborPedido').innerHTML = '<option value="">SELECIONE</option>';
    atualizarFila();
}

function liberarPedido(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const pedido = sistema.noiteAtual.pedidos.find(p => p.id === id);
    
    if (pedido) {
        pedido.status = 'concluido';
        pedido.tempoPreparo = Math.floor((new Date() - new Date(pedido.dataHora)) / 60000);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        atualizarFila();
    }
}

// ============================================
// FILA DE PEDIDOS
// ============================================
let filtroAtual = 'todos';

function filtrarPedidos(filtro) {
    filtroAtual = filtro;
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('ativo');
    });
    event.target.classList.add('ativo');
    
    atualizarFila();
}

function getAlerta(minutos) {
    if (minutos >= 10) return { cor: '#ff4444', emoji: '🔥', texto: 'CRÍTICO', classe: 'critico' };
    if (minutos >= 5) return { cor: '#ffaa00', emoji: '⚠️', texto: 'ATENÇÃO', classe: 'alerta' };
    return { cor: '#27ae60', emoji: '✅', texto: 'NORMAL', classe: 'normal' };
}

function atualizarFila() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    let pedidos = [...sistema.noiteAtual.pedidos];
    
    if (filtroAtual === 'pendentes') {
        pedidos = pedidos.filter(p => p.status === 'pendente');
    } else if (filtroAtual === 'concluidos') {
        pedidos = pedidos.filter(p => p.status === 'concluido');
    }
    
    pedidos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    
    const lista = document.getElementById('listaPedidos');
    lista.innerHTML = pedidos.map(p => {
        const minutos = Math.floor((new Date() - new Date(p.dataHora)) / 60000);
        const alerta = getAlerta(minutos);
        
        return `
            <div class="pedido-card ${p.status === 'concluido' ? 'concluido' : ''}" 
                 ${p.status === 'pendente' ? `data-tempo="${alerta.classe}"` : ''}>
                <div class="pedido-header">
                    <span class="pedido-tipo tipo-${p.tipo}">${p.tipo}</span>
                    <span class="pedido-timer" style="color: ${p.status === 'pendente' ? alerta.cor : '#27ae60'}">
                        ${p.status === 'pendente' ? alerta.emoji + ' ' + minutos + ' min' : '✅ ' + p.tempoPreparo + ' min'}
                    </span>
                </div>
                <div class="pedido-info">
                    <p><strong>${p.sabor}</strong></p>
                    <p>Garçom: ${p.garcom} | Mesa: ${p.mesa}</p>
                    ${p.status === 'pendente' && minutos >= 5 ? 
                        `<p style="color: ${alerta.cor}; font-weight: bold;">${alerta.emoji} ${alerta.texto}</p>` : ''}
                </div>
                ${p.status === 'pendente' ? 
                    `<button class="btn-liberar" onclick="liberarPedido(${p.id})">PEDIDO LIBERADO</button>` : ''}
            </div>
        `;
    }).join('');
}

function atualizarTimers() {
    if (document.getElementById('abaPedidos').classList.contains('ativa')) {
        atualizarFila();
    }
}

// ============================================
// RELATÓRIOS
// ============================================
function encerrarNoite() {
    if (confirm('Encerrar a noite?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        
        sistema.historico.push({
            data: sistema.noiteAtual.data,
            pedidos: [...sistema.noiteAtual.pedidos]
        });
        
        sistema.noiteAtual = {
            data: new Date().toLocaleDateString('pt-BR'),
            horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pedidos: []
        };
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarRelatorio();
        alert('Noite encerrada!');
    }
}

function carregarRelatorio() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const pedidos = sistema.noiteAtual.pedidos;
    
    // Totais
    document.getElementById('totaisNoite').innerHTML = `
        <div class="card-total"><h3>TOTAL</h3><div class="valor">${pedidos.length}</div></div>
        <div class="card-total"><h3>CONCLUÍDOS</h3><div class="valor">${pedidos.filter(p => p.status === 'concluido').length}</div></div>
        <div class="card-total"><h3>PENDENTES</h3><div class="valor">${pedidos.filter(p => p.status === 'pendente').length}</div></div>
    `;
    
    // Tempo médio
    const tempos = pedidos.filter(p => p.tempoPreparo).map(p => p.tempoPreparo);
    const tempoMedio = tempos.length ? Math.round(tempos.reduce((a,b) => a + b, 0) / tempos.length) : 0;
    document.getElementById('tempoMedio').textContent = tempoMedio;
    
    // Top sabores
    const contagemSabores = {};
    pedidos.forEach(p => contagemSabores[p.sabor] = (contagemSabores[p.sabor] || 0) + 1);
    
    document.getElementById('topSabores').innerHTML = Object.entries(contagemSabores)
        .sort((a,b) => b[1] - a[1])
        .slice(0,5)
        .map(([sabor, qtd], i) => `
            <div class="ranking-item">
                <span class="ranking-posicao">${i+1}</span>
                <span class="ranking-nome">${sabor}</span>
                <span class="ranking-valor">${qtd}</span>
            </div>
        `).join('');
    
    // Ranking garçons
    const contagemGarcons = {};
    pedidos.forEach(p => contagemGarcons[p.garcom] = (contagemGarcons[p.garcom] || 0) + 1);
    
    document.getElementById('rankingGarcons').innerHTML = Object.entries(contagemGarcons)
        .sort((a,b) => b[1] - a[1])
        .map(([garcom, qtd], i) => `
            <div class="ranking-item">
                <span class="ranking-posicao">${i+1}</span>
                <span class="ranking-nome">${garcom}</span>
                <span class="ranking-valor">${qtd}</span>
            </div>
        `).join('');
}

// ============================================
// GRÁFICO
// ============================================
function criarGrafico(pedidos) {
    const ctx = document.getElementById('graficoPedidos').getContext('2d');
    
    const porHora = {};
    pedidos.forEach(p => {
        const hora = new Date(p.dataHora).getHours() + 'h';
        porHora[hora] = (porHora[hora] || 0) + 1;
    });
    
    Chart.getChart('graficoPedidos')?.destroy();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(porHora).sort(),
            datasets: [{
                data: Object.values(porHora),
                borderColor: '#E67E22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// ============================================
// BACKUP
// ============================================
function exportarDados() {
    const dados = localStorage.getItem('sistemaRodizio');
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function importarDados() {
    const file = document.getElementById('importarArquivo').files[0];
    if (!file) { alert('Selecione um arquivo'); return; }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            localStorage.setItem('sistemaRodizio', e.target.result);
            alert('Dados importados!');
            window.location.reload();
        } catch { alert('Arquivo inválido'); }
    };
    reader.readAsText(file);
}

// ============================================
// NAVEGAÇÃO
// ============================================
function mostrarAba(nome) {
    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('ativa'));
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    
    event.target.classList.add('ativa');
    document.getElementById('aba' + nome.charAt(0).toUpperCase() + nome.slice(1)).classList.add('ativa');
    
    if (nome === 'relatorios') carregarRelatorio();
    if (nome === 'pedidos') atualizarFila();
}

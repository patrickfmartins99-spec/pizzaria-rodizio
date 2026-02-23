// ============================================
// SISTEMA DE PIZZARIA RODÍZIO - VERSÃO COM RELATÓRIOS HISTÓRICOS
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
            configuracoes: { 
                sabores: [], 
                garcons: [] 
            },
            noiteAtual: {
                data: new Date().toLocaleDateString('pt-BR'),
                horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                pedidos: [],
                totalPedidos: 0,
                tempoMedio: 0
            },
            historico: [] // Aqui ficam todas as noites anteriores
        };
        localStorage.setItem('sistemaRodizio', JSON.stringify(dadosIniciais));
    }
    
    // Atualizar data no header
    const dataAtual = new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('dataAtual').textContent = dataAtual;
    
    // Carregar todos os dados
    carregarSabores();
    carregarGarcons();
    carregarGarconsSelect();
    atualizarFila();
}

// ============================================
// FUNÇÕES DE RESET
// ============================================
function novaNoite() {
    if (confirm('Iniciar nova noite?\nOs pedidos atuais serão arquivados no histórico.')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        
        // Calcular estatísticas da noite que está encerrando
        if (sistema.noiteAtual.pedidos.length > 0) {
            const estatisticasNoite = calcularEstatisticasNoite(sistema.noiteAtual.pedidos);
            
            // Adicionar noite ao histórico com todas as estatísticas
            sistema.historico.push({
                data: sistema.noiteAtual.data,
                horaInicio: sistema.noiteAtual.horaInicio,
                horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                pedidos: [...sistema.noiteAtual.pedidos],
                totalPedidos: sistema.noiteAtual.pedidos.length,
                tempoMedio: estatisticasNoite.tempoMedio,
                topSabores: estatisticasNoite.topSabores,
                rankingGarcons: estatisticasNoite.rankingGarcons
            });
        }
        
        // Criar nova noite
        sistema.noiteAtual = {
            data: new Date().toLocaleDateString('pt-BR'),
            horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pedidos: [],
            totalPedidos: 0,
            tempoMedio: 0
        };
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        atualizarFila();
        
        // Se estiver na aba de relatórios, mostrar o histórico
        if (document.getElementById('abaRelatorios').classList.contains('ativa')) {
            carregarRelatorioGeral();
        }
        
        alert('✅ Nova noite iniciada! Histórico atualizado.');
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
// CALCULAR ESTATÍSTICAS DE UMA NOITE
// ============================================
function calcularEstatisticasNoite(pedidos) {
    // Calcular tempo médio
    const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido' && p.tempoPreparo);
    const tempos = pedidosConcluidos.map(p => p.tempoPreparo);
    const tempoMedio = tempos.length > 0 
        ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) 
        : 0;
    
    // Calcular top sabores
    const contagemSabores = {};
    pedidos.forEach(p => {
        contagemSabores[p.sabor] = (contagemSabores[p.sabor] || 0) + 1;
    });
    
    const topSabores = Object.entries(contagemSabores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sabor, qtd]) => ({ sabor, qtd }));
    
    // Calcular ranking garçons
    const contagemGarcons = {};
    pedidos.forEach(p => {
        contagemGarcons[p.garcom] = (contagemGarcons[p.garcom] || 0) + 1;
    });
    
    const rankingGarcons = Object.entries(contagemGarcons)
        .sort((a, b) => b[1] - a[1])
        .map(([garcom, qtd]) => ({ garcom, qtd }));
    
    return {
        tempoMedio,
        topSabores,
        rankingGarcons,
        totalPedidos: pedidos.length
    };
}

// ============================================
// RELATÓRIOS - VERSÃO CORRIGIDA
// ============================================
function encerrarNoite() {
    if (confirm('Encerrar a noite atual?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        
        // Calcular estatísticas antes de encerrar
        const estatisticas = calcularEstatisticasNoite(sistema.noiteAtual.pedidos);
        
        // Adicionar ao histórico
        sistema.historico.push({
            data: sistema.noiteAtual.data,
            horaInicio: sistema.noiteAtual.horaInicio,
            horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pedidos: [...sistema.noiteAtual.pedidos],
            totalPedidos: sistema.noiteAtual.pedidos.length,
            tempoMedio: estatisticas.tempoMedio,
            topSabores: estatisticas.topSabores,
            rankingGarcons: estatisticas.rankingGarcons
        });
        
        // Criar nova noite vazia
        sistema.noiteAtual = {
            data: new Date().toLocaleDateString('pt-BR'),
            horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            pedidos: [],
            totalPedidos: 0,
            tempoMedio: 0
        };
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        // Mostrar relatório da noite encerrada
        carregarRelatorioGeral();
        
        alert(`✅ Noite encerrada!\nTotal de pedidos: ${estatisticas.totalPedidos}\nTempo médio: ${estatisticas.tempoMedio} min`);
    }
}

function carregarRelatorioGeral() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    // Calcular estatísticas da noite atual
    const estatisticasAtual = calcularEstatisticasNoite(sistema.noiteAtual.pedidos);
    
    // Calcular estatísticas do histórico (todas as noites)
    let todosPedidos = [];
    let todasEstatisticas = {
        totalPedidos: 0,
        totalTempos: [],
        totalSabores: {},
        totalGarcons: {},
        noitesRegistradas: sistema.historico.length
    };
    
    // Processar histórico
    sistema.historico.forEach(noite => {
        todasEstatisticas.totalPedidos += noite.pedidos.length;
        
        noite.pedidos.forEach(p => {
            // Para tempo médio geral
            if (p.tempoPreparo) {
                todasEstatisticas.totalTempos.push(p.tempoPreparo);
            }
            
            // Para top sabores geral
            todasEstatisticas.totalSabores[p.sabor] = (todasEstatisticas.totalSabores[p.sabor] || 0) + 1;
            
            // Para ranking garçons geral
            todasEstatisticas.totalGarcons[p.garcom] = (todasEstatisticas.totalGarcons[p.garcom] || 0) + 1;
        });
    });
    
    // Adicionar pedidos da noite atual nas estatísticas gerais
    sistema.noiteAtual.pedidos.forEach(p => {
        todasEstatisticas.totalPedidos++;
        
        if (p.tempoPreparo) {
            todasEstatisticas.totalTempos.push(p.tempoPreparo);
        }
        
        todasEstatisticas.totalSabores[p.sabor] = (todasEstatisticas.totalSabores[p.sabor] || 0) + 1;
        todasEstatisticas.totalGarcons[p.garcom] = (todasEstatisticas.totalGarcons[p.garcom] || 0) + 1;
    });
    
    // Calcular tempo médio geral
    const tempoMedioGeral = todasEstatisticas.totalTempos.length > 0
        ? Math.round(todasEstatisticas.totalTempos.reduce((a, b) => a + b, 0) / todasEstatisticas.totalTempos.length)
        : 0;
    
    // ATUALIZAR TELA - TOTAIS
    document.getElementById('totaisNoite').innerHTML = `
        <div class="card-total">
            <h3>NOITE ATUAL</h3>
            <div class="valor">${sistema.noiteAtual.pedidos.length}</div>
            <small>${estatisticasAtual.tempoMedio} min médio</small>
        </div>
        <div class="card-total">
            <h3>HISTÓRICO</h3>
            <div class="valor">${todasEstatisticas.totalPedidos}</div>
            <small>${sistema.historico.length} noites</small>
        </div>
        <div class="card-total">
            <h3>MÉDIA GERAL</h3>
            <div class="valor">${tempoMedioGeral} min</div>
            <small>por pedido</small>
        </div>
    `;
    
    // ATUALIZAR TEMPO MÉDIO DA NOITE ATUAL
    document.getElementById('tempoMedio').textContent = estatisticasAtual.tempoMedio;
    
    // CRIAR GRÁFICO COMPARATIVO
    criarGraficoComparativo(sistema);
    
    // ATUALIZAR TOP 5 SABORES (GERAL)
    const topSaboresGeral = Object.entries(todasEstatisticas.totalSabores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    document.getElementById('topSabores').innerHTML = topSaboresGeral.length > 0 
        ? topSaboresGeral.map(([sabor, qtd], i) => `
            <div class="ranking-item">
                <span class="ranking-posicao">${i+1}</span>
                <span class="ranking-nome">${sabor}</span>
                <span class="ranking-valor">${qtd} pedidos</span>
            </div>
        `).join('')
        : '<p style="text-align: center; color: var(--text-light);">Nenhum dado histórico</p>';
    
    // ATUALIZAR RANKING DE GARÇONS (GERAL)
    const rankingGarconsGeral = Object.entries(todasEstatisticas.totalGarcons)
        .sort((a, b) => b[1] - a[1]);
    
    document.getElementById('rankingGarcons').innerHTML = rankingGarconsGeral.length > 0
        ? rankingGarconsGeral.map(([garcom, qtd], i) => `
            <div class="ranking-item">
                <span class="ranking-posicao">${i+1}</span>
                <span class="ranking-nome">${garcom}</span>
                <span class="ranking-valor">${qtd} pedidos</span>
            </div>
        `).join('')
        : '<p style="text-align: center; color: var(--text-light);">Nenhum dado histórico</p>';
    
    // ATUALIZAR ESTATÍSTICAS GERAIS
    document.getElementById('estatisticasGerais').innerHTML = `
        <div class="card-total">
            <h3>TOTAL ACUMULADO</h3>
            <div class="valor">${todasEstatisticas.totalPedidos}</div>
        </div>
        <div class="card-total">
            <h3>MÉDIA POR NOITE</h3>
            <div class="valor">${sistema.historico.length > 0 ? Math.round(todasEstatisticas.totalPedidos / (sistema.historico.length + 1)) : todasEstatisticas.totalPedidos}</div>
        </div>
        <div class="card-total">
            <h3>NOITES REGISTRADAS</h3>
            <div class="valor">${sistema.historico.length + 1}</div>
        </div>
    `;
}

function criarGraficoComparativo(sistema) {
    const ctx = document.getElementById('graficoPedidos').getContext('2d');
    
    // Preparar dados para o gráfico
    const labels = [];
    const dadosPedidos = [];
    const dadosTempoMedio = [];
    
    // Adicionar noites do histórico
    sistema.historico.forEach((noite, index) => {
        labels.push(`Noite ${index + 1}`);
        dadosPedidos.push(noite.totalPedidos || noite.pedidos.length);
        dadosTempoMedio.push(noite.tempoMedio || 0);
    });
    
    // Adicionar noite atual
    labels.push('Atual');
    dadosPedidos.push(sistema.noiteAtual.pedidos.length);
    
    const temposAtuais = sistema.noiteAtual.pedidos
        .filter(p => p.tempoPreparo)
        .map(p => p.tempoPreparo);
    const tempoMedioAtual = temposAtuais.length > 0
        ? Math.round(temposAtuais.reduce((a, b) => a + b, 0) / temposAtuais.length)
        : 0;
    dadosTempoMedio.push(tempoMedioAtual);
    
    // Destruir gráfico anterior
    Chart.getChart('graficoPedidos')?.destroy();
    
    // Criar novo gráfico com duas linhas
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pedidos por Noite',
                    data: dadosPedidos,
                    borderColor: '#8B5A2B',
                    backgroundColor: 'rgba(139, 90, 43, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Tempo Médio (min)',
                    data: dadosTempoMedio,
                    borderColor: '#E9C46A',
                    backgroundColor: 'rgba(233, 196, 106, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade de Pedidos'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Tempo Médio (min)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
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
    carregarSaboresSelectAtual();
    
    alert('✅ Sabor cadastrado com sucesso!');
}

function carregarSabores() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaSabores');
    
    if (!lista) return;
    
    if (sistema.configuracoes.sabores.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #8B7A6A;">Nenhum sabor cadastrado</p>';
        return;
    }
    
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
    
    if (!sabor) return;
    
    const novoNome = prompt('Editar nome do sabor:', sabor.nome);
    if (novoNome && novoNome.trim()) {
        sabor.nome = novoNome.trim();
        sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarSabores();
        carregarSaboresSelectAtual();
        alert('✅ Sabor atualizado!');
    }
}

function excluirSabor(id) {
    if (confirm('Excluir este sabor?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.sabores = sistema.configuracoes.sabores.filter(s => s.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarSabores();
        carregarSaboresSelectAtual();
        alert('✅ Sabor excluído!');
    }
}

// ============================================
// FUNÇÕES DO SELECT DE SABORES
// ============================================
function carregarSaboresPorTipo() {
    const tipo = document.getElementById('tipoSabor').value;
    carregarSaboresSelect(tipo);
}

function carregarSaboresSelect(tipo) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const selectSabores = document.getElementById('saborPedido');
    
    if (!selectSabores) return;
    
    if (!tipo) {
        selectSabores.innerHTML = '<option value="">SELECIONE UM TIPO</option>';
        return;
    }
    
    const saboresFiltrados = sistema.configuracoes.sabores
        .filter(s => s.tipo === tipo)
        .sort((a, b) => a.nome.localeCompare(b.nome));
    
    if (saboresFiltrados.length === 0) {
        selectSabores.innerHTML = '<option value="">NENHUM SABOR</option>';
        return;
    }
    
    selectSabores.innerHTML = '<option value="">SELECIONE</option>' +
        saboresFiltrados.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

function carregarSaboresSelectAtual() {
    const tipoAtual = document.getElementById('tipoSabor').value;
    if (tipoAtual) {
        carregarSaboresSelect(tipoAtual);
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
    alert('✅ Garçom cadastrado com sucesso!');
}

function carregarGarcons() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaGarcons');
    
    if (!lista) return;
    
    if (sistema.configuracoes.garcons.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #8B7A6A;">Nenhum garçom cadastrado</p>';
        return;
    }
    
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

function carregarGarconsSelect() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const select = document.getElementById('garcomPedido');
    
    if (!select) return;
    
    const garconsOrdenados = [...sistema.configuracoes.garcons].sort((a, b) => a.nome.localeCompare(b.nome));
    
    if (garconsOrdenados.length === 0) {
        select.innerHTML = '<option value="">NENHUM GARÇOM</option>';
        return;
    }
    
    select.innerHTML = '<option value="">SELECIONE</option>' +
        garconsOrdenados.map(g => `<option value="${g.id}">${g.nome}</option>`).join('');
}

function editarGarcom(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const garcom = sistema.configuracoes.garcons.find(g => g.id === id);
    
    if (!garcom) return;
    
    const novoNome = prompt('Editar nome do garçom:', garcom.nome);
    if (novoNome && novoNome.trim()) {
        garcom.nome = novoNome.trim();
        sistema.configuracoes.garcons.sort((a, b) => a.nome.localeCompare(b.nome));
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarGarcons();
        carregarGarconsSelect();
        alert('✅ Garçom atualizado!');
    }
}

function excluirGarcom(id) {
    if (confirm('Excluir este garçom?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.garcons = sistema.configuracoes.garcons.filter(g => g.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarGarcons();
        carregarGarconsSelect();
        alert('✅ Garçom excluído!');
    }
}

// ============================================
// PEDIDOS
// ============================================
function criarPedido() {
    const tipo = document.getElementById('tipoSabor').value;
    const saborId = document.getElementById('saborPedido').value;
    const garcomId = document.getElementById('garcomPedido').value;
    const mesa = document.getElementById('mesaPedido').value;
    
    if (!tipo) {
        alert('Selecione o tipo');
        return;
    }
    
    if (!saborId) {
        alert('Selecione o sabor');
        return;
    }
    
    if (!garcomId) {
        alert('Selecione o garçom');
        return;
    }
    
    if (!mesa) {
        alert('Digite o número da mesa');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const sabor = sistema.configuracoes.sabores.find(s => s.id == saborId);
    const garcom = sistema.configuracoes.garcons.find(g => g.id == garcomId);
    
    if (!sabor || !garcom) {
        alert('Erro ao buscar dados');
        return;
    }
    
    const novoPedido = {
        id: Date.now(),
        tipo: tipo,
        sabor: sabor.nome,
        saborId: parseInt(saborId),
        garcom: garcom.nome,
        garcomId: parseInt(garcomId),
        mesa: parseInt(mesa),
        dataHora: new Date().toISOString(),
        status: 'pendente',
        tempoPreparo: null
    };
    
    sistema.noiteAtual.pedidos.push(novoPedido);
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('tipoSabor').value = '';
    document.getElementById('saborPedido').innerHTML = '<option value="">SELECIONE UM TIPO</option>';
    
    atualizarFila();
    alert('✅ Pedido criado com sucesso!');
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
    if (minutos >= 10) return { cor: '#BC6C25', emoji: '🔥', texto: 'CRÍTICO', classe: 'critico' };
    if (minutos >= 5) return { cor: '#E76F51', emoji: '⚠️', texto: 'ATENÇÃO', classe: 'alerta' };
    return { cor: '#2F6B4A', emoji: '✅', texto: 'NORMAL', classe: 'normal' };
}

function atualizarFila() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaPedidos');
    
    if (!lista) return;
    
    let pedidos = [...sistema.noiteAtual.pedidos];
    
    if (filtroAtual === 'pendentes') {
        pedidos = pedidos.filter(p => p.status === 'pendente');
    } else if (filtroAtual === 'concluidos') {
        pedidos = pedidos.filter(p => p.status === 'concluido');
    }
    
    pedidos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    
    if (pedidos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; padding: 40px; color: #8B7A6A;">Nenhum pedido na fila</p>';
        return;
    }
    
    lista.innerHTML = pedidos.map(p => {
        const minutos = Math.floor((new Date() - new Date(p.dataHora)) / 60000);
        const alerta = getAlerta(minutos);
        
        return `
            <div class="pedido-card ${p.status === 'concluido' ? 'concluido' : ''}" 
                 ${p.status === 'pendente' ? `data-tempo="${alerta.classe}"` : ''}>
                <div class="pedido-header">
                    <span class="pedido-tipo tipo-${p.tipo}">${p.tipo}</span>
                    <span class="pedido-timer" style="color: ${p.status === 'pendente' ? alerta.cor : '#2F6B4A'}">
                        ${p.status === 'pendente' ? alerta.emoji + ' ' + minutos + ' min' : '✅ ' + p.tempoPreparo + ' min'}
                    </span>
                </div>
                <div class="pedido-info">
                    <p><strong>${p.sabor}</strong></p>
                    <p>Garçom: ${p.garcom} | Mesa: ${p.mesa}</p>
                    ${p.status === 'pendente' && minutos >= 5 ? 
                        `<p style="color: ${alerta.cor}; font-weight: bold; margin-top: 8px;">
                            ${alerta.emoji} ${alerta.texto}
                        </p>` : ''}
                </div>
                ${p.status === 'pendente' ? 
                    `<button class="btn-liberar" onclick="liberarPedido(${p.id})">PEDIDO LIBERADO</button>` : ''}
            </div>
        `;
    }).join('');
}

function atualizarTimers() {
    if (document.getElementById('abaPedidos')?.classList.contains('ativa')) {
        atualizarFila();
    }
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
    a.download = `backup-pizzaria-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function importarDados() {
    const file = document.getElementById('importarArquivo').files[0];
    
    if (!file) {
        alert('Selecione um arquivo');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            localStorage.setItem('sistemaRodizio', e.target.result);
            alert('✅ Dados importados com sucesso!');
            window.location.reload();
        } catch {
            alert('❌ Arquivo inválido');
        }
    };
    reader.readAsText(file);
}

// ============================================
// NAVEGAÇÃO ENTRE ABAS
// ============================================
function mostrarAba(nomeAba) {
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.classList.remove('ativa');
    });
    
    document.querySelectorAll('.aba-conteudo').forEach(aba => {
        aba.classList.remove('ativa');
    });
    
    event.target.classList.add('ativa');
    document.getElementById('aba' + nomeAba.charAt(0).toUpperCase() + nomeAba.slice(1)).classList.add('ativa');
    
    if (nomeAba === 'relatorios') {
        carregarRelatorioGeral();
    }
    
    if (nomeAba === 'pedidos') {
        atualizarFila();
        carregarGarconsSelect();
    }
}
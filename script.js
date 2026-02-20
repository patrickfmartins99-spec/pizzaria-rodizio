// ============================================
// SISTEMA DE PIZZARIA RODÍZIO - VERSÃO COMPLETA
// Funcionalidades: Reset, Ordem Alfabética, Alertas de Tempo, Filtros Reorganizados
// ============================================

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    configurarAtualizacaoTimer();
});

function inicializarSistema() {
    let sistema = localStorage.getItem('sistemaRodizio');
    
    if (!sistema) {
        const dadosIniciais = {
            configuracoes: {
                sabores: [],
                garcons: []
            },
            noiteAtual: {
                data: new Date().toISOString().split('T')[0],
                horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                horaFim: null,
                pedidos: []
            },
            historicoNoites: []
        };
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(dadosIniciais));
    }
    
    document.getElementById('dataAtual').textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    carregarSabores();
    carregarGarcons();
    carregarSaboresPorTipo();
    atualizarFilaPedidos();
}

// ============================================
// FUNÇÕES DE RESET
// ============================================

function novaNoite() {
    if (!confirm('🆕 Iniciar nova noite?\n\nOs pedidos atuais serão movidos para o histórico.\nCadastros de sabores e garçons serão mantidos.')) {
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    // Finaliza a noite atual se houver pedidos
    if (sistema.noiteAtual.pedidos.length > 0) {
        sistema.noiteAtual.horaFim = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Adiciona ao histórico
        sistema.historicoNoites.push({ ...sistema.noiteAtual });
    }
    
    // Cria nova noite (mantém configurações)
    sistema.noiteAtual = {
        data: new Date().toISOString().split('T')[0],
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        pedidos: []
    };
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    alert('✅ Nova noite iniciada! Cadastros mantidos.');
    
    // Atualiza interfaces
    atualizarFilaPedidos();
    if (document.getElementById('abaRelatorios').classList.contains('ativa')) {
        carregarRelatorioNoite();
    }
}

function resetarSistema() {
    if (!confirm('⚠️ RESETAR SISTEMA COMPLETO ⚠️\n\nTODOS os dados serão perdidos:\n• Sabores cadastrados\n• Garçons cadastrados\n• Histórico de noites\n• Pedidos atuais\n\nTem certeza?')) {
        return;
    }
    
    // Segunda confirmação para segurança
    const confirmacao = prompt('Digite "RESETAR" para confirmar a exclusão total de todos os dados:');
    if (confirmacao !== 'RESETAR') {
        alert('Operação cancelada.');
        return;
    }
    
    const dadosIniciais = {
        configuracoes: {
            sabores: [],
            garcons: []
        },
        noiteAtual: {
            data: new Date().toISOString().split('T')[0],
            horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            horaFim: null,
            pedidos: []
        },
        historicoNoites: []
    };
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(dadosIniciais));
    
    alert('🔄 Sistema resetado! Todos os dados foram apagados.');
    
    // Recarrega tudo
    carregarSabores();
    carregarGarcons();
    carregarSaboresPorTipo();
    atualizarFilaPedidos();
    
    // Se estiver na aba de relatórios, atualiza
    if (document.getElementById('abaRelatorios').classList.contains('ativa')) {
        carregarRelatorioNoite();
    }
}

// ============================================
// FUNÇÕES DE CONFIGURAÇÕES - SABORES (COM ORDEM ALFABÉTICA)
// ============================================

function adicionarSabor() {
    const nome = document.getElementById('nomeSabor').value.trim();
    const tipo = document.getElementById('tipoSaborConfig').value;
    
    if (!nome) {
        alert('Digite o nome do sabor');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    const novoSabor = {
        id: Date.now(),
        nome: nome,
        tipo: tipo
    };
    
    sistema.configuracoes.sabores.push(novoSabor);
    
    // Ordena sabores alfabeticamente
    sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('nomeSabor').value = '';
    
    carregarSabores();
    carregarSaboresPorTipo();
}

function carregarSabores() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const listaSabores = document.getElementById('listaSabores');
    
    // Garante ordem alfabética
    const saboresOrdenados = [...sistema.configuracoes.sabores].sort((a, b) => a.nome.localeCompare(b.nome));
    
    listaSabores.innerHTML = '';
    
    saboresOrdenados.forEach(sabor => {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.innerHTML = `
            <div class="item-info">
                <strong>${sabor.nome}</strong> <span class="tipo-badge tipo-${sabor.tipo}">${sabor.tipo}</span>
            </div>
            <div class="item-acoes">
                <button class="btn-editar" onclick="editarSabor(${sabor.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirSabor(${sabor.id})">Excluir</button>
            </div>
        `;
        listaSabores.appendChild(item);
    });
}

function editarSabor(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const sabor = sistema.configuracoes.sabores.find(s => s.id === id);
    
    const novoNome = prompt('Digite o novo nome do sabor:', sabor.nome);
    if (novoNome && novoNome.trim()) {
        sabor.nome = novoNome.trim();
        
        // Reordena após edição
        sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarSabores();
        carregarSaboresPorTipo();
    }
}

function excluirSabor(id) {
    if (confirm('Tem certeza que deseja excluir este sabor?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.sabores = sistema.configuracoes.sabores.filter(s => s.id !== id);
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarSabores();
        carregarSaboresPorTipo();
    }
}

// ============================================
// FUNÇÕES DE CONFIGURAÇÕES - GARÇONS (COM ORDEM ALFABÉTICA)
// ============================================

function adicionarGarcom() {
    const nome = document.getElementById('nomeGarcom').value.trim();
    
    if (!nome) {
        alert('Digite o nome do garçom');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    const novoGarcom = {
        id: Date.now(),
        nome: nome
    };
    
    sistema.configuracoes.garcons.push(novoGarcom);
    
    // Ordena garçons alfabeticamente
    sistema.configuracoes.garcons.sort((a, b) => a.nome.localeCompare(b.nome));
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('nomeGarcom').value = '';
    
    carregarGarcons();
}

function carregarGarcons() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const listaGarcons = document.getElementById('listaGarcons');
    
    // Garante ordem alfabética
    const garconsOrdenados = [...sistema.configuracoes.garcons].sort((a, b) => a.nome.localeCompare(b.nome));
    
    listaGarcons.innerHTML = '';
    
    garconsOrdenados.forEach(garcom => {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.innerHTML = `
            <div class="item-info">
                <strong>${garcom.nome}</strong>
            </div>
            <div class="item-acoes">
                <button class="btn-editar" onclick="editarGarcom(${garcom.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirGarcom(${garcom.id})">Excluir</button>
            </div>
        `;
        listaGarcons.appendChild(item);
    });
    
    carregarSelectGarcons();
}

function carregarSelectGarcons() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const select = document.getElementById('garcomPedido');
    
    // Garçons ordenados para o select
    const garconsOrdenados = [...sistema.configuracoes.garcons].sort((a, b) => a.nome.localeCompare(b.nome));
    
    select.innerHTML = '<option value="">Selecione</option>';
    
    garconsOrdenados.forEach(garcom => {
        const option = document.createElement('option');
        option.value = garcom.id;
        option.textContent = garcom.nome;
        select.appendChild(option);
    });
}

function editarGarcom(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const garcom = sistema.configuracoes.garcons.find(g => g.id === id);
    
    const novoNome = prompt('Digite o novo nome do garçom:', garcom.nome);
    if (novoNome && novoNome.trim()) {
        garcom.nome = novoNome.trim();
        
        // Reordena após edição
        sistema.configuracoes.garcons.sort((a, b) => a.nome.localeCompare(b.nome));
        
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarGarcons();
    }
}

function excluirGarcom(id) {
    if (confirm('Tem certeza que deseja excluir este garçom?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.garcons = sistema.configuracoes.garcons.filter(g => g.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        carregarGarcons();
    }
}

// ============================================
// FUNÇÕES DE PEDIDOS (COM SABORES ORDENADOS)
// ============================================

function carregarSaboresPorTipo() {
    const tipo = document.getElementById('tipoSabor').value;
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const selectSabores = document.getElementById('saborPedido');
    
    selectSabores.innerHTML = '<option value="">Selecione um sabor</option>';
    
    if (tipo) {
        // Filtra e ordena alfabeticamente
        const saboresFiltrados = sistema.configuracoes.sabores
            .filter(s => s.tipo === tipo)
            .sort((a, b) => a.nome.localeCompare(b.nome));
        
        saboresFiltrados.forEach(sabor => {
            const option = document.createElement('option');
            option.value = sabor.id;
            option.textContent = sabor.nome;
            selectSabores.appendChild(option);
        });
    }
}

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
    
    const novoPedido = {
        id: Date.now(),
        tipo: tipo,
        sabor: sabor.nome,
        saborId: parseInt(saborId),
        garcomId: parseInt(garcomId),
        mesa: parseInt(mesa),
        dataHora: new Date().toISOString(),
        tempoPreparo: null,
        status: 'pendente'
    };
    
    sistema.noiteAtual.pedidos.push(novoPedido);
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    document.getElementById('tipoSabor').value = '';
    document.getElementById('saborPedido').innerHTML = '<option value="">Selecione um sabor</option>';
    
    atualizarFilaPedidos();
}

function liberarPedido(id) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const pedido = sistema.noiteAtual.pedidos.find(p => p.id === id);
    
    if (pedido && pedido.status === 'pendente') {
        pedido.status = 'concluido';
        pedido.tempoPreparo = calcularTempoPreparo(pedido.dataHora);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        atualizarFilaPedidos();
    }
}

function calcularTempoPreparo(dataHoraInicio) {
    const inicio = new Date(dataHoraInicio);
    const fim = new Date();
    const diffMs = fim - inicio;
    const diffMin = Math.floor(diffMs / 60000);
    return diffMin;
}

// ============================================
// FUNÇÕES DE TEMPO E ALERTAS
// ============================================

function formatarTempo(dataHoraInicio) {
    const inicio = new Date(dataHoraInicio);
    const agora = new Date();
    const diffMs = agora - inicio;
    const diffMin = Math.floor(diffMs / 60000);
    const diffSec = Math.floor((diffMs % 60000) / 1000);
    
    return {
        texto: `${diffMin}:${diffSec.toString().padStart(2, '0')}`,
        minutos: diffMin
    };
}

function getAlertaTempo(minutos) {
    if (minutos >= 10) {
        return {
            cor: '#ff4444',
            bg: '#ffeeee',
            emoji: '🔥',
            texto: 'CRÍTICO'
        };
    } else if (minutos >= 5) {
        return {
            cor: '#ffaa00',
            bg: '#fff3e0',
            emoji: '⚠️',
            texto: 'ATENÇÃO'
        };
    } else {
        return {
            cor: '#27ae60',
            bg: '#e8f5e9',
            emoji: '✅',
            texto: 'Normal'
        };
    }
}

// ============================================
// FILA DE PEDIDOS (COM FILTROS REORGANIZADOS)
// ============================================

let filtroAtual = 'todos'; // Agora padrão é 'todos'

function filtrarPedidos(filtro) {
    filtroAtual = filtro;
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('ativo');
    });
    event.target.classList.add('ativo');
    
    atualizarFilaPedidos();
}

function atualizarFilaPedidos() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const listaPedidos = document.getElementById('listaPedidos');
    
    let pedidosFiltrados = sistema.noiteAtual.pedidos;
    
    if (filtroAtual === 'pendentes') {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'pendente');
    } else if (filtroAtual === 'concluidos') {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'concluido');
    }
    // 'todos' não filtra
    
    // Ordena por data (mais recentes primeiro)
    pedidosFiltrados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    
    listaPedidos.innerHTML = '';
    
    pedidosFiltrados.forEach(pedido => {
        const garcom = sistema.configuracoes.garcons.find(g => g.id === pedido.garcomId);
        const nomeGarcom = garcom ? garcom.nome : 'Não identificado';
        
        const tempo = formatarTempo(pedido.dataHora);
        const alerta = getAlertaTempo(tempo.minutos);
        
        const card = document.createElement('div');
        card.className = `pedido-card ${pedido.status === 'concluido' ? 'concluido' : ''}`;
        
        // Estilo especial para pedidos atrasados
        if (pedido.status === 'pendente' && tempo.minutos >= 5) {
            card.style.borderLeft = `6px solid ${alerta.cor}`;
            card.style.backgroundColor = alerta.bg;
        }
        
        const tempoDecorrido = pedido.status === 'pendente' ? 
            `${alerta.emoji} ${tempo.texto}` : 
            (pedido.tempoPreparo ? `✅ ${pedido.tempoPreparo} min` : '');
        
        card.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-tipo tipo-${pedido.tipo}">${pedido.tipo}</span>
                <span class="pedido-timer" style="color: ${alerta.cor}; font-weight: bold;" data-id="${pedido.id}">
                    ${tempoDecorrido}
                </span>
            </div>
            <div class="pedido-info">
                <p><strong>${pedido.sabor}</strong></p>
                <p>Garçom: ${nomeGarcom} | Mesa: ${pedido.mesa}</p>
                ${pedido.status === 'pendente' && tempo.minutos >= 5 ? 
                    `<p style="color: ${alerta.cor}; font-weight: bold; margin-top: 8px;">
                        ${alerta.emoji} ${alerta.texto} - ${tempo.minutos} minutos
                    </p>` : ''}
            </div>
            ${pedido.status === 'pendente' ? `
                <div class="pedido-actions">
                    <button class="btn-liberar" onclick="liberarPedido(${pedido.id})">
                        ✓ Pedido Liberado
                    </button>
                </div>
            ` : ''}
        `;
        
        listaPedidos.appendChild(card);
    });
}

function configurarAtualizacaoTimer() {
    setInterval(() => {
        if (document.getElementById('abaPedidos').classList.contains('ativa')) {
            atualizarFilaPedidos();
        }
    }, 1000);
}

// ============================================
// RELATÓRIOS E ESTATÍSTICAS
// ============================================

function encerrarNoite() {
    if (!confirm('Tem certeza que deseja encerrar a noite? Os pedidos atuais serão salvos no histórico.')) {
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    // Finaliza a noite atual
    sistema.noiteAtual.horaFim = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Adiciona ao histórico
    sistema.historicoNoites.push({ ...sistema.noiteAtual });
    
    // Cria nova noite
    sistema.noiteAtual = {
        data: new Date().toISOString().split('T')[0],
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        pedidos: []
    };
    
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    alert('Noite encerrada com sucesso!');
    
    atualizarFilaPedidos();
    carregarRelatorioNoite();
}

function carregarRelatorioNoite() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const pedidos = sistema.noiteAtual.pedidos;
    
    // Totais da noite
    const totalPedidos = pedidos.length;
    const concluidos = pedidos.filter(p => p.status === 'concluido').length;
    const pendentes = pedidos.filter(p => p.status === 'pendente').length;
    
    document.getElementById('totaisNoite').innerHTML = `
        <div class="card-total">
            <h3>Total Pedidos</h3>
            <div class="valor">${totalPedidos}</div>
        </div>
        <div class="card-total">
            <h3>Concluídos</h3>
            <div class="valor">${concluidos}</div>
        </div>
        <div class="card-total">
            <h3>Pendentes</h3>
            <div class="valor">${pendentes}</div>
        </div>
    `;
    
    // Tempo médio
    const tempos = pedidos.filter(p => p.tempoPreparo).map(p => p.tempoPreparo);
    const tempoMedio = tempos.length ? 
        Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
    document.getElementById('tempoMedio').textContent = tempoMedio;
    
    // Gráfico
    criarGraficoPedidos(pedidos);
    
    // Top 5 sabores (ordenados por quantidade)
    const contagemSabores = {};
    pedidos.forEach(p => {
        contagemSabores[p.sabor] = (contagemSabores[p.sabor] || 0) + 1;
    });
    
    const topSabores = Object.entries(contagemSabores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    document.getElementById('topSabores').innerHTML = topSabores.map(([sabor, qtd], index) => `
        <div class="ranking-item">
            <span class="ranking-posicao">${index + 1}</span>
            <span class="ranking-nome">${sabor}</span>
            <span class="ranking-valor">${qtd} pedidos</span>
        </div>
    `).join('');
    
    // Ranking de garçons
    const contagemGarcons = {};
    pedidos.forEach(p => {
        const garcom = sistema.configuracoes.garcons.find(g => g.id === p.garcomId);
        const nomeGarcom = garcom ? garcom.nome : 'Não identificado';
        contagemGarcons[nomeGarcom] = (contagemGarcons[nomeGarcom] || 0) + 1;
    });
    
    const rankingGarcons = Object.entries(contagemGarcons)
        .sort((a, b) => b[1] - a[1]);
    
    document.getElementById('rankingGarcons').innerHTML = rankingGarcons.map(([garcom, qtd], index) => `
        <div class="ranking-item">
            <span class="ranking-posicao">${index + 1}</span>
            <span class="ranking-nome">${garcom}</span>
            <span class="ranking-valor">${qtd} pedidos</span>
        </div>
    `).join('');
    
    // Estatísticas gerais
    const historico = sistema.historicoNoites || [];
    const totalGeralPedidos = historico.reduce((acc, noite) => acc + (noite.pedidos?.length || 0), 0) + totalPedidos;
    const totalGeralTempos = [];
    
    historico.forEach(noite => {
        noite.pedidos?.forEach(p => {
            if (p.tempoPreparo) totalGeralTempos.push(p.tempoPreparo);
        });
    });
    pedidos.forEach(p => {
        if (p.tempoPreparo) totalGeralTempos.push(p.tempoPreparo);
    });
    
    const tempoMedioGeral = totalGeralTempos.length ? 
        Math.round(totalGeralTempos.reduce((a, b) => a + b, 0) / totalGeralTempos.length) : 0;
    
    document.getElementById('estatisticasGerais').innerHTML = `
        <div class="card-total">
            <h3>Total Geral</h3>
            <div class="valor">${totalGeralPedidos}</div>
        </div>
        <div class="card-total">
            <h3>Tempo Médio Geral</h3>
            <div class="valor">${tempoMedioGeral} min</div>
        </div>
        <div class="card-total">
            <h3>Noites Registradas</h3>
            <div class="valor">${historico.length + 1}</div>
        </div>
    `;
}

function criarGraficoPedidos(pedidos) {
    const ctx = document.getElementById('graficoPedidos').getContext('2d');
    
    // Agrupa pedidos por hora
    const pedidosPorHora = {};
    pedidos.forEach(p => {
        const hora = new Date(p.dataHora).getHours() + 'h';
        pedidosPorHora[hora] = (pedidosPorHora[hora] || 0) + 1;
    });
    
    const labels = Object.keys(pedidosPorHora).sort();
    const dados = labels.map(label => pedidosPorHora[label]);
    
    // Destrói gráfico anterior se existir
    Chart.getChart('graficoPedidos')?.destroy();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pedidos por Hora',
                data: dados,
                borderColor: '#E67E22',
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });
}

// ============================================
// BACKUP (IMPORTAR/EXPORTAR)
// ============================================

function exportarDados() {
    const dados = localStorage.getItem('sistemaRodizio');
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pizzaria-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function importarDados() {
    const input = document.getElementById('importarArquivo');
    const file = input.files[0];
    
    if (!file) {
        alert('Selecione um arquivo');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            // Validação básica da estrutura
            if (!dados.configuracoes || !dados.noiteAtual || !dados.historicoNoites) {
                throw new Error('Arquivo inválido');
            }
            
            localStorage.setItem('sistemaRodizio', JSON.stringify(dados));
            alert('Dados importados com sucesso!');
            
            // Recarrega a página para atualizar tudo
            window.location.reload();
        } catch (error) {
            alert('Erro ao importar arquivo: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// ============================================
// NAVEGAÇÃO ENTRE ABAS
// ============================================

function mostrarAba(nomeAba) {
    // Remove classe ativa de todas as abas
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.classList.remove('ativa');
    });
    
    // Esconde todos os conteúdos
    document.querySelectorAll('.aba-conteudo').forEach(aba => {
        aba.classList.remove('ativa');
    });
    
    // Ativa a aba clicada
    event.target.classList.add('ativa');
    document.getElementById(`aba${nomeAba.charAt(0).toUpperCase() + nomeAba.slice(1)}`).classList.add('ativa');
    
    // Carrega dados específicos da aba
    if (nomeAba === 'relatorios') {
        carregarRelatorioNoite();
    }
                }

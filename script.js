// ============================================
// SISTEMA DE PIZZARIA RODÍZIO - VERSÃO CORRIGIDA
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
                pedidos: []
            },
            historico: []
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
// SABORES - FUNÇÕES PRINCIPAIS
// ============================================
function adicionarSabor() {
    const nome = document.getElementById('nomeSabor').value.trim();
    const tipo = document.getElementById('tipoSaborConfig').value;
    
    if (!nome) {
        alert('Digite o nome do sabor');
        return;
    }
    
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    
    // Adicionar novo sabor
    sistema.configuracoes.sabores.push({
        id: Date.now(),
        nome: nome,
        tipo: tipo
    });
    
    // Ordenar alfabeticamente
    sistema.configuracoes.sabores.sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Salvar no localStorage
    localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
    
    // Limpar campo
    document.getElementById('nomeSabor').value = '';
    
    // Recarregar listas
    carregarSabores(); // Atualiza a lista de configuração
    carregarSaboresSelectAtual(); // Atualiza o select de pedidos
    
    alert('Sabor cadastrado com sucesso!');
}

function carregarSabores() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaSabores');
    
    if (!lista) return;
    
    if (sistema.configuracoes.sabores.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #7F8C8D;">Nenhum sabor cadastrado</p>';
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
        alert('Sabor atualizado!');
    }
}

function excluirSabor(id) {
    if (confirm('Excluir este sabor?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.sabores = sistema.configuracoes.sabores.filter(s => s.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarSabores();
        carregarSaboresSelectAtual();
        alert('Sabor excluído!');
    }
}

// ============================================
// FUNÇÕES DO SELECT DE SABORES NO PEDIDO
// ============================================

// Função principal que carrega sabores no select baseado no tipo selecionado
function carregarSaboresPorTipo() {
    const tipo = document.getElementById('tipoSabor').value;
    carregarSaboresSelect(tipo);
}

// Função que popula o select de sabores
function carregarSaboresSelect(tipo) {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const selectSabores = document.getElementById('saborPedido');
    
    if (!selectSabores) return;
    
    // Se não tiver tipo selecionado, mostra opção padrão
    if (!tipo) {
        selectSabores.innerHTML = '<option value="">SELECIONE UM TIPO</option>';
        return;
    }
    
    // Filtrar sabores pelo tipo selecionado
    const saboresFiltrados = sistema.configuracoes.sabores
        .filter(s => s.tipo === tipo)
        .sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Se não houver sabores do tipo selecionado
    if (saboresFiltrados.length === 0) {
        selectSabores.innerHTML = '<option value="">NENHUM SABOR CADASTRADO</option>';
        return;
    }
    
    // Montar as opções do select
    selectSabores.innerHTML = '<option value="">SELECIONE O SABOR</option>' +
        saboresFiltrados.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

// Função para recarregar o select mantendo o tipo atual selecionado
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
    alert('Garçom cadastrado com sucesso!');
}

function carregarGarcons() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const lista = document.getElementById('listaGarcons');
    
    if (!lista) return;
    
    if (sistema.configuracoes.garcons.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #7F8C8D;">Nenhum garçom cadastrado</p>';
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
        alert('Garçom atualizado!');
    }
}

function excluirGarcom(id) {
    if (confirm('Excluir este garçom?')) {
        const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
        sistema.configuracoes.garcons = sistema.configuracoes.garcons.filter(g => g.id !== id);
        localStorage.setItem('sistemaRodizio', JSON.stringify(sistema));
        
        carregarGarcons();
        carregarGarconsSelect();
        alert('Garçom excluído!');
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
    
    // Limpar formulário
    document.getElementById('tipoSabor').value = '';
    document.getElementById('saborPedido').innerHTML = '<option value="">SELECIONE UM TIPO</option>';
    
    atualizarFila();
    alert('Pedido criado com sucesso!');
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
        lista.innerHTML = '<p style="text-align: center; padding: 40px; color: #7F8C8D;">Nenhum pedido na fila</p>';
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
                    <span class="pedido-timer" style="color: ${p.status === 'pendente' ? alerta.cor : '#27ae60'}">
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
        carregarRelatorioNoite();
        alert('Noite encerrada!');
    }
}

function carregarRelatorioNoite() {
    const sistema = JSON.parse(localStorage.getItem('sistemaRodizio'));
    const pedidos = sistema.noiteAtual.pedidos;
    
    // Totais
    const totaisDiv = document.getElementById('totaisNoite');
    if (totaisDiv) {
        totaisDiv.innerHTML = `
            <div class="card-total">
                <h3>TOTAL PEDIDOS</h3>
                <div class="valor">${pedidos.length}</div>
            </div>
            <div class="card-total">
                <h3>CONCLUÍDOS</h3>
                <div class="valor">${pedidos.filter(p => p.status === 'concluido').length}</div>
            </div>
            <div class="card-total">
                <h3>PENDENTES</h3>
                <div class="valor">${pedidos.filter(p => p.status === 'pendente').length}</div>
            </div>
        `;
    }
    
    // Tempo médio
    const tempos = pedidos.filter(p => p.tempoPreparo).map(p => p.tempoPreparo);
    const tempoMedio = tempos.length ? Math.round(tempos.reduce((a,b) => a + b, 0) / tempos.length) : 0;
    const tempoMedioSpan = document.getElementById('tempoMedio');
    if (tempoMedioSpan) tempoMedioSpan.textContent = tempoMedio;
    
    // Top sabores
    const contagemSabores = {};
    pedidos.forEach(p => contagemSabores[p.sabor] = (contagemSabores[p.sabor] || 0) + 1);
    
    const topSaboresDiv = document.getElementById('topSabores');
    if (topSaboresDiv) {
        const top5 = Object.entries(contagemSabores)
            .sort((a,b) => b[1] - a[1])
            .slice(0,5);
        
        topSaboresDiv.innerHTML = top5.map(([sabor, qtd], i) => `
            <div class="ranking-item">
                <span class="ranking-posicao">${i+1}</span>
                <span class="ranking-nome">${sabor}</span>
                <span class="ranking-valor">${qtd}</span>
            </div>
        `).join('');
    }
    
    // Ranking garçons
    const contagemGarcons = {};
    pedidos.forEach(p => contagemGarcons[p.garcom] = (contagemGarcons[p.garcom] || 0) + 1);
    
    const rankingGarconsDiv = document.getElementById('rankingGarcons');
    if (rankingGarconsDiv) {
        rankingGarconsDiv.innerHTML = Object.entries(contagemGarcons)
            .sort((a,b) => b[1] - a[1])
            .map(([garcom, qtd], i) => `
                <div class="ranking-item">
                    <span class="ranking-posicao">${i+1}</span>
                    <span class="ranking-nome">${garcom}</span>
                    <span class="ranking-valor">${qtd}</span>
                </div>
            `).join('');
    }
    
    // Estatísticas gerais
    const historico = sistema.historico || [];
    const totalGeral = historico.reduce((acc, noite) => acc + (noite.pedidos?.length || 0), 0) + pedidos.length;
    
    const estatisticasDiv = document.getElementById('estatisticasGerais');
    if (estatisticasDiv) {
        estatisticasDiv.innerHTML = `
            <div class="card-total">
                <h3>TOTAL GERAL</h3>
                <div class="valor">${totalGeral}</div>
            </div>
            <div class="card-total">
                <h3>NOITES</h3>
                <div class="valor">${historico.length + 1}</div>
            </div>
        `;
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
            alert('Dados importados com sucesso!');
            window.location.reload();
        } catch {
            alert('Arquivo inválido');
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
        carregarRelatorioNoite();
    }
    
    if (nomeAba === 'pedidos') {
        atualizarFila();
        carregarGarconsSelect();
    }
                                      }

let tamanho = 3;
let tamanhoTabuleiroPx = 400;
let estadoTabuleiro = [];
let intervaloCronometro = null;
let segundosDecorridos = 0;
let jogoAtivo = false;

const tabuleiroPuzzle = document.getElementById('tabuleiroPuzzle');
const exibicaoCronometro = document.getElementById('exibicaoCronometro');
const modalResultado = document.getElementById('modalResultado');
const tituloModal = document.getElementById('tituloModal');
const mensagemModal = document.getElementById('mensagemModal');

inicializarJogo();

function inicializarJogo() {
    clearInterval(intervaloCronometro);
    segundosDecorridos = 0;
    exibicaoCronometro.textContent = "00:00";
    jogoAtivo = false;
    
    gerarTabuleiroComSolucao();
    renderizarTabuleiro();
}

function mudarDificuldade(novoTamanho, elementoBotao) {
    tamanho = novoTamanho;
    
    document.querySelectorAll('.botoes-dificuldade .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    elementoBotao.classList.add('ativo');
    
    inicializarJogo();
}

function gerarTabuleiroComSolucao() {
    const totalPecas = tamanho * tamanho;
    estadoTabuleiro = [];
    
    for (let i = 1; i < totalPecas; i++) {
        estadoTabuleiro.push(i);
    }
    estadoTabuleiro.push(0);

    let indiceVazio = totalPecas - 1;
    const movimentosEmbaralhar = tamanho * tamanho * 25;

    for (let i = 0; i < movimentosEmbaralhar; i++) {
        const movimentosValidos = obterMovimentosValidos(indiceVazio);
        const movimentoAleatorio = movimentosValidos[Math.floor(Math.random() * movimentosValidos.length)];
        
        estadoTabuleiro[indiceVazio] = estadoTabuleiro[movimentoAleatorio];
        estadoTabuleiro[movimentoAleatorio] = 0;
        indiceVazio = movimentoAleatorio;
    }
}

function obterMovimentosValidos(indice) {
    const movimentos = [];
    const linha = Math.floor(indice / tamanho);
    const coluna = indice % tamanho;

    if (linha > 0) movimentos.push(indice - tamanho);
    if (linha < tamanho - 1) movimentos.push(indice + tamanho);
    if (coluna > 0) movimentos.push(indice - 1);
    if (coluna < tamanho - 1) movimentos.push(indice + 1);

    return movimentos;
}

function renderizarTabuleiro() {
    tabuleiroPuzzle.innerHTML = '';
    tabuleiroPuzzle.style.gridTemplateColumns = `repeat(${tamanho}, 1fr)`;
    tabuleiroPuzzle.style.gridTemplateRows = `repeat(${tamanho}, 1fr)`;
    
    tabuleiroPuzzle.style.width = `${tamanhoTabuleiroPx}px`;
    tabuleiroPuzzle.style.height = `${tamanhoTabuleiroPx}px`;

    const tamanhoPeca = (tamanhoTabuleiroPx - (tamanho * 5)) / tamanho;

    estadoTabuleiro.forEach((valor, indice) => {
        const peca = document.createElement('div');
        peca.style.width = `${tamanhoPeca}px`;
        peca.style.height = `${tamanhoPeca}px`;

        if (valor === 0) {
            peca.className = 'peca-puzzle vazia';
        } else {
            peca.className = 'peca-puzzle';
            peca.textContent = valor;
            peca.addEventListener('click', () => moverPeca(indice));
        }
        tabuleiroPuzzle.appendChild(peca);
    });
}

function iniciarCronometro() {
    jogoAtivo = true;
    intervaloCronometro = setInterval(() => {
        segundosDecorridos++;
        const minutos = String(Math.floor(segundosDecorridos / 60)).padStart(2, '0');
        const segundos = String(segundosDecorridos % 60).padStart(2, '0');
        exibicaoCronometro.textContent = `${minutos}:${segundos}`;
    }, 1000);
}

function moverPeca(indice) {
    if (!jogoAtivo) {
        iniciarCronometro();
    }

    const indiceVazio = estadoTabuleiro.indexOf(0);
    const movimentosValidos = obterMovimentosValidos(indiceVazio);

    if (movimentosValidos.includes(indice)) {
        estadoTabuleiro[indiceVazio] = estadoTabuleiro[indice];
        estadoTabuleiro[indice] = 0;
        renderizarTabuleiro();
        verificarCondicaoVitoria();
    }
}

function verificarCondicaoVitoria() {
    const totalPecas = tamanho * tamanho;
    
    for (let i = 0; i < totalPecas - 1; i++) {
        if (estadoTabuleiro[i] !== i + 1) return;
    }
    
    if (estadoTabuleiro[totalPecas - 1] === 0) {
        gerenciarVitoria();
    }
}

function gerenciarVitoria() {
    clearInterval(intervaloCronometro);
    jogoAtivo = false;

    if (segundosDecorridos < 80) {
        tituloModal.textContent = "🏆 Parabéns!";
        mensagemModal.innerHTML = `Você ganhou 5% de desconto!<br><br>Seu tempo total foi: <strong>${exibicaoCronometro.textContent}</strong>`;
    } else {
        tituloModal.textContent = "Muito Bem!";
        mensagemModal.innerHTML = `Parabéns por completar o level, mas não foi desta vez.<br><br>Seu tempo total foi: <strong>${exibicaoCronometro.textContent}</strong>`;
    }

    modalResultado.style.display = 'flex';
}

function fecharModal() {
    modalResultado.style.display = 'none';
    inicializarJogo();
}
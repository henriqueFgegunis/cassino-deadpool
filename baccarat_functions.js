// Funções para o jogo de Baccarat

// Constantes
const BACCARAT_SUITS = ['♠', '♥', '♦', '♣'];
const BACCARAT_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BACCARAT_CARD_VALUES = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 0,
  'J': 0,
  'Q': 0,
  'K': 0
};

// Variáveis do jogo
let baccaratDeck = [];
let playerBaccaratHand = [];
let bankerBaccaratHand = [];
let baccaratGameStage = 'WAITING'; // WAITING, BETTING, DEALING, RESULT
let selectedBaccaratBet = null; // 'player', 'banker', 'tie'
let baccaratResult = null; // 'player', 'banker', 'tie'

// Inicializar o jogo de Baccarat
function initBaccarat() {
  // Resetar variáveis
  baccaratDeck = createBaccaratDeck();
  playerBaccaratHand = [];
  bankerBaccaratHand = [];
  baccaratGameStage = 'WAITING';
  selectedBaccaratBet = null;
  baccaratResult = null;
  
  // Atualizar a interface
  updateBaccaratUI();
  
  // Habilitar os botões de aposta
  document.getElementById('player-bet-btn').disabled = false;
  document.getElementById('banker-bet-btn').disabled = false;
  document.getElementById('tie-bet-btn').disabled = false;
  document.getElementById('deal-baccarat-btn').disabled = true;
  
  // Limpar as cartas na mesa
  document.getElementById('player-baccarat-hand').innerHTML = '';
  document.getElementById('banker-baccarat-hand').innerHTML = '';
  
  // Mostrar mensagem inicial
  document.getElementById('baccarat-message').textContent = 'Selecione sua aposta: Jogador, Banqueiro ou Empate';
}

// Criar e embaralhar o baralho de Baccarat
function createBaccaratDeck() {
  const deck = [];
  // No Baccarat, geralmente são usados 8 baralhos
  for (let d = 0; d < 8; d++) {
    for (const suit of BACCARAT_SUITS) {
      for (const value of BACCARAT_VALUES) {
        deck.push({ suit, value });
      }
    }
  }
  
  // Embaralhar o baralho
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

// Selecionar aposta no Baccarat
function selectBaccaratBet(bet) {
  if (baccaratGameStage !== 'WAITING') return;
  
  selectedBaccaratBet = bet;
  
  // Atualizar a interface
  document.getElementById('player-bet-btn').classList.remove('selected');
  document.getElementById('banker-bet-btn').classList.remove('selected');
  document.getElementById('tie-bet-btn').classList.remove('selected');
  
  document.getElementById(`${bet}-bet-btn`).classList.add('selected');
  
  // Habilitar o botão de distribuir
  document.getElementById('deal-baccarat-btn').disabled = false;
  
  // Mostrar mensagem
  document.getElementById('baccarat-message').textContent = `Aposta selecionada: ${getBaccaratBetName(bet)}. Clique em "Distribuir" para iniciar.`;
}

// Distribuir cartas no Baccarat
function dealBaccarat() {
  const betAmount = parseFloat(document.getElementById('baccarat-bet-amount').value);
  if (betAmount <= 0) {
    showNotification('O valor da aposta deve ser maior que zero', 'error');
    return;
  }
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para realizar esta aposta', 'error');
    return;
  }
  
  // Deduzir a aposta do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação como pendente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Baccarat',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Mudar o estágio do jogo
  baccaratGameStage = 'DEALING';
  
  // Desabilitar os botões de aposta
  document.getElementById('player-bet-btn').disabled = true;
  document.getElementById('banker-bet-btn').disabled = true;
  document.getElementById('tie-bet-btn').disabled = true;
  document.getElementById('deal-baccarat-btn').disabled = true;
  document.getElementById('baccarat-bet-amount').disabled = true;
  
  // Distribuir as cartas iniciais
  playerBaccaratHand = [baccaratDeck.pop(), baccaratDeck.pop()];
  bankerBaccaratHand = [baccaratDeck.pop(), baccaratDeck.pop()];
  
  // Atualizar a interface
  updateBaccaratUI();
  
  // Mostrar mensagem
  document.getElementById('baccarat-message').textContent = 'Distribuindo cartas...';
  
  // Verificar se precisa de uma terceira carta
  setTimeout(() => {
    const playerScore = calculateBaccaratScore(playerBaccaratHand);
    const bankerScore = calculateBaccaratScore(bankerBaccaratHand);
    
    document.getElementById('baccarat-message').textContent = `Jogador: ${playerScore}, Banqueiro: ${bankerScore}`;
    
    // Regras para a terceira carta
    let playerDrawsThird = false;
    let bankerDrawsThird = false;
    
    // Se alguma mão tem 8 ou 9, é um "natural" e ninguém recebe mais cartas
    if (playerScore >= 8 || bankerScore >= 8) {
      // Nenhuma carta adicional
    } else {
      // Jogador recebe terceira carta se tiver 0-5
      if (playerScore <= 5) {
        playerDrawsThird = true;
      }
      
      // Regras complexas para o banqueiro receber terceira carta
      if (!playerDrawsThird) {
        // Se o jogador não recebeu terceira carta, banqueiro recebe se tiver 0-5
        if (bankerScore <= 5) {
          bankerDrawsThird = true;
        }
      } else {
        // Se o jogador recebeu terceira carta, depende do valor da terceira carta do jogador
        const playerThirdCard = baccaratDeck.pop();
        playerBaccaratHand.push(playerThirdCard);
        const playerThirdCardValue = BACCARAT_CARD_VALUES[playerThirdCard.value];
        
        if (bankerScore <= 2) {
          bankerDrawsThird = true;
        } else if (bankerScore === 3 && playerThirdCardValue !== 8) {
          bankerDrawsThird = true;
        } else if (bankerScore === 4 && (playerThirdCardValue >= 2 && playerThirdCardValue <= 7)) {
          bankerDrawsThird = true;
        } else if (bankerScore === 5 && (playerThirdCardValue >= 4 && playerThirdCardValue <= 7)) {
          bankerDrawsThird = true;
        } else if (bankerScore === 6 && (playerThirdCardValue === 6 || playerThirdCardValue === 7)) {
          bankerDrawsThird = true;
        }
      }
      
      // Distribuir terceira carta para o banqueiro se necessário
      if (bankerDrawsThird) {
        bankerBaccaratHand.push(baccaratDeck.pop());
      }
    }
    
    // Atualizar a interface
    updateBaccaratUI();
    
    // Determinar o resultado
    setTimeout(determineBaccaratResult, 1000);
  }, 1500);
}

// Atualizar a interface do Baccarat
function updateBaccaratUI() {
  // Atualizar as cartas do jogador
  const playerHandElement = document.getElementById('player-baccarat-hand');
  playerHandElement.innerHTML = '';
  playerBaccaratHand.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('baccarat-card');
    cardElement.innerHTML = getBaccaratCardHTML(card);
    playerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as cartas do banqueiro
  const bankerHandElement = document.getElementById('banker-baccarat-hand');
  bankerHandElement.innerHTML = '';
  bankerBaccaratHand.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('baccarat-card');
    cardElement.innerHTML = getBaccaratCardHTML(card);
    bankerHandElement.appendChild(cardElement);
  });
  
  // Atualizar os pontos
  if (playerBaccaratHand.length > 0) {
    const playerScore = calculateBaccaratScore(playerBaccaratHand);
    document.getElementById('player-score').textContent = playerScore;
  } else {
    document.getElementById('player-score').textContent = '0';
  }
  
  if (bankerBaccaratHand.length > 0) {
    const bankerScore = calculateBaccaratScore(bankerBaccaratHand);
    document.getElementById('banker-score').textContent = bankerScore;
  } else {
    document.getElementById('banker-score').textContent = '0';
  }
  
  // Destacar a aposta selecionada
  if (selectedBaccaratBet) {
    document.getElementById('player-bet-area').classList.remove('selected');
    document.getElementById('banker-bet-area').classList.remove('selected');
    document.getElementById('tie-bet-area').classList.remove('selected');
    
    document.getElementById(`${selectedBaccaratBet}-bet-area`).classList.add('selected');
  }
  
  // Destacar o resultado
  if (baccaratResult) {
    document.getElementById('player-result').classList.remove('winner');
    document.getElementById('banker-result').classList.remove('winner');
    document.getElementById('tie-result').classList.remove('winner');
    
    document.getElementById(`${baccaratResult}-result`).classList.add('winner');
  }
}

// Determinar o resultado do Baccarat
function determineBaccaratResult() {
  const playerScore = calculateBaccaratScore(playerBaccaratHand);
  const bankerScore = calculateBaccaratScore(bankerBaccaratHand);
  
  if (playerScore > bankerScore) {
    baccaratResult = 'player';
  } else if (bankerScore > playerScore) {
    baccaratResult = 'banker';
  } else {
    baccaratResult = 'tie';
  }
  
  // Atualizar a interface
  updateBaccaratUI();
  
  // Mostrar mensagem
  document.getElementById('baccarat-message').textContent = `Resultado: ${getBaccaratBetName(baccaratResult)} vence! (${playerScore} vs ${bankerScore})`;
  
  // Verificar se o jogador ganhou
  const betAmount = parseFloat(document.getElementById('baccarat-bet-amount').value);
  let playerWins = selectedBaccaratBet === baccaratResult;
  let winAmount = 0;
  
  if (playerWins) {
    // Calcular o valor do ganho
    if (selectedBaccaratBet === 'player') {
      winAmount = betAmount * 2; // Pagamento 1:1
    } else if (selectedBaccaratBet === 'banker') {
      winAmount = betAmount * 1.95; // Pagamento 0.95:1 (comissão de 5%)
    } else if (selectedBaccaratBet === 'tie') {
      winAmount = betAmount * 9; // Pagamento 8:1
    }
    
    // Adicionar o ganho ao saldo
    userBalance += winAmount;
    updateBalanceDisplay();
    
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Baccarat',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Baccarat!`, 'success');
  } else {
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Baccarat',
      amount: betAmount,
      status: 'Perdida'
    });
    
    showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Baccarat.`, 'error');
  }
  
  // Habilitar o botão de nova rodada
  document.getElementById('new-baccarat-btn').disabled = false;
  
  // Mudar o estágio do jogo
  baccaratGameStage = 'RESULT';
}

// Iniciar nova rodada de Baccarat
function newBaccaratRound() {
  // Resetar variáveis
  playerBaccaratHand = [];
  bankerBaccaratHand = [];
  baccaratGameStage = 'WAITING';
  selectedBaccaratBet = null;
  baccaratResult = null;
  
  // Atualizar a interface
  updateBaccaratUI();
  
  // Habilitar os botões de aposta
  document.getElementById('player-bet-btn').disabled = false;
  document.getElementById('banker-bet-btn').disabled = false;
  document.getElementById('tie-bet-btn').disabled = false;
  document.getElementById('deal-baccarat-btn').disabled = true;
  document.getElementById('new-baccarat-btn').disabled = true;
  document.getElementById('baccarat-bet-amount').disabled = false;
  
  // Limpar as cartas na mesa
  document.getElementById('player-baccarat-hand').innerHTML = '';
  document.getElementById('banker-baccarat-hand').innerHTML = '';
  
  // Mostrar mensagem inicial
  document.getElementById('baccarat-message').textContent = 'Selecione sua aposta: Jogador, Banqueiro ou Empate';
  
  // Remover destaques
  document.getElementById('player-bet-area').classList.remove('selected');
  document.getElementById('banker-bet-area').classList.remove('selected');
  document.getElementById('tie-bet-area').classList.remove('selected');
  document.getElementById('player-result').classList.remove('winner');
  document.getElementById('banker-result').classList.remove('winner');
  document.getElementById('tie-result').classList.remove('winner');
}

// Calcular a pontuação no Baccarat
function calculateBaccaratScore(hand) {
  let score = 0;
  
  for (const card of hand) {
    score += BACCARAT_CARD_VALUES[card.value];
  }
  
  // No Baccarat, apenas o último dígito conta
  return score % 10;
}

// Obter o HTML da carta de Baccarat
function getBaccaratCardHTML(card) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return `
    <div class="card-value ${isRed ? 'red' : 'black'}">${card.value}</div>
    <div class="card-suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
  `;
}

// Obter o nome da aposta no Baccarat
function getBaccaratBetName(bet) {
  switch (bet) {
    case 'player': return 'Jogador';
    case 'banker': return 'Banqueiro';
    case 'tie': return 'Empate';
    default: return '';
  }
}

// Script para o Cassino Deadpool

// Variáveis globais
let userBalance = 0;
let currentGame = null;
let selectedBet = null;
let transactions = [];
let isLoggedIn = false;
let username = '';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o menu mobile
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('toggle');
    });
  }

  // Inicializar o modal de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', openModal);
  }

  // Verificar se há um usuário logado no localStorage
  const savedUser = localStorage.getItem('deadpoolCasinoUser');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    isLoggedIn = true;
    username = user.name;
    userBalance = user.balance;
    updateBalanceDisplay();
    showNotification(`Bem-vindo de volta, ${username}!`, 'success');
  }

  // Carregar transações do localStorage
  const savedTransactions = localStorage.getItem('deadpoolCasinoTransactions');
  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
    updateTransactionHistory();
  }

  // Adicionar algumas transações de exemplo se não houver nenhuma
  if (transactions.length === 0) {
    addSampleTransactions();
  }

  // Efeito de flip no cartão de crédito
  const creditCard = document.getElementById('credit-card');
  if (creditCard) {
    creditCard.addEventListener('click', function() {
      this.classList.toggle('flipped');
    });
  }

  // Formatar inputs de cartão
  const cardNumber = document.getElementById('card-number');
  if (cardNumber) {
    cardNumber.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 0) {
        value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
      }
      e.target.value = value;
    });
  }

  const expiryDate = document.getElementById('expiry-date');
  if (expiryDate) {
    expiryDate.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  // Adicionar efeito de hover nos cards de jogos
  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.game-image img').style.transform = 'scale(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelector('.game-image img').style.transform = 'scale(1)';
    });
  });
});

// Funções para o sistema de autenticação
function openModal() {
  document.getElementById('auth-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(c => c.classList.remove('active'));
  
  document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(`${tab}-tab`).classList.add('active');
}

function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    showNotification('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  // Simulação de login bem-sucedido
  isLoggedIn = true;
  username = email.split('@')[0];
  userBalance = 100; // Saldo inicial para novos usuários
  
  // Salvar no localStorage
  localStorage.setItem('deadpoolCasinoUser', JSON.stringify({
    name: username,
    email: email,
    balance: userBalance
  }));
  
  updateBalanceDisplay();
  closeModal();
  showNotification(`Login realizado com sucesso! Bem-vindo, ${username}!`, 'success');
}

function register() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  
  if (!name || !email || !password || !confirm) {
    showNotification('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  if (password !== confirm) {
    showNotification('As senhas não coincidem', 'error');
    return;
  }
  
  // Simulação de registro bem-sucedido
  isLoggedIn = true;
  username = name;
  userBalance = 200; // Bônus de boas-vindas
  
  // Salvar no localStorage
  localStorage.setItem('deadpoolCasinoUser', JSON.stringify({
    name: name,
    email: email,
    balance: userBalance
  }));
  
  updateBalanceDisplay();
  closeModal();
  showNotification('Registro realizado com sucesso! Você ganhou R$ 200 de bônus!', 'success');
  
  // Adicionar transação de bônus
  addTransaction({
    date: new Date(),
    type: 'Depósito',
    method: 'Bônus',
    amount: 200,
    status: 'Concluído'
  });
}

// Funções para o sistema de depósito e saque
function processDeposit(method) {
  if (!isLoggedIn) {
    showNotification('Faça login para realizar um depósito', 'warning');
    openModal();
    return;
  }
  
  let amount = 0;
  let formValid = true;
  
  if (method === 'card') {
    const cardNumber = document.getElementById('card-number').value;
    const cardHolder = document.getElementById('card-holder').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    amount = parseFloat(document.getElementById('deposit-amount').value);
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv || !amount) {
      formValid = false;
    }
  } else if (method === 'pix') {
    const pixSender = document.getElementById('pix-sender').value;
    amount = parseFloat(document.getElementById('pix-amount').value);
    
    if (!pixSender || !amount) {
      formValid = false;
    }
  }
  
  if (!formValid) {
    showNotification('Por favor, preencha todos os campos corretamente', 'error');
    return;
  }
  
  if (amount <= 0) {
    showNotification('O valor do depósito deve ser maior que zero', 'error');
    return;
  }
  
  // Simulação de processamento de depósito
  showNotification('Processando depósito...', 'info');
  
  setTimeout(() => {
    // Atualizar saldo
    userBalance += amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: 'Depósito',
      method: method === 'card' ? 'Cartão de Crédito' : 'PIX',
      amount: amount,
      status: 'Concluído'
    });
    
    // Limpar formulário
    if (method === 'card') {
      document.getElementById('card-deposit-form').reset();
    } else {
      document.getElementById('pix-deposit-form').reset();
    }
    
    showNotification(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`, 'success');
  }, 2000);
}

function processWithdraw() {
  if (!isLoggedIn) {
    showNotification('Faça login para realizar um saque', 'warning');
    openModal();
    return;
  }
  
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  const pixKey = document.getElementById('pix-key').value;
  const pixKeyType = document.getElementById('pix-key-type').value;
  
  if (!amount || !pixKey) {
    showNotification('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  if (amount <= 0) {
    showNotification('O valor do saque deve ser maior que zero', 'error');
    return;
  }
  
  if (amount > userBalance) {
    showNotification('Saldo insuficiente para realizar este saque', 'error');
    return;
  }
  
  // Simulação de processamento de saque
  showNotification('Processando solicitação de saque...', 'info');
  
  setTimeout(() => {
    // Atualizar saldo
    userBalance -= amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: 'Saque',
      method: 'PIX',
      amount: amount,
      status: 'Em processamento'
    });
    
    // Limpar formulário
    document.getElementById('withdraw-form').reset();
    
    showNotification(`Solicitação de saque de R$ ${amount.toFixed(2)} enviada com sucesso!`, 'success');
  }, 2000);
}

function copyPixCode() {
  const pixCode = document.querySelector('.pix-code input');
  pixCode.select();
  document.execCommand('copy');
  showNotification('Código PIX copiado para a área de transferência!', 'success');
}

// Funções para os jogos
function openGame(game) {
  if (!isLoggedIn) {
    showNotification('Faça login para jogar', 'warning');
    openModal();
    return;
  }
  
  currentGame = game;
  
  // Esconder todos os jogos
  document.querySelectorAll('#game-area > div').forEach(div => {
    div.style.display = 'none';
  });
  
  // Mostrar a área de jogos e o jogo selecionado
  document.getElementById('game-area').style.display = 'block';
  document.getElementById(`${game}-game`).style.display = 'block';
  
  // Inicializar o jogo específico
  switch (game) {
    case 'roulette':
      initRoulette();
      break;
    case 'blackjack':
      initBlackjack();
      break;
    case 'scratch':
      initScratchCard();
      break;
    case 'slots':
      initSlots();
      break;
  }
}

function closeGame() {
  document.getElementById('game-area').style.display = 'none';
  currentGame = null;
}

// Funções para o jogo de roleta
function initRoulette() {
  // Resetar seleção de aposta
  selectedBet = null;
  document.querySelectorAll('.bet-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Resetar posição da bola
  const ball = document.getElementById('roulette-ball');
  if (ball) {
    ball.style.transform = 'translate(-50%, -50%)';
  }
}

function selectBet(element) {
  // Remover seleção anterior
  document.querySelectorAll('.bet-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Selecionar nova aposta
  element.classList.add('selected');
  selectedBet = element.dataset.value;
}

function spinRoulette() {
  if (!selectedBet) {
    showNotification('Selecione uma aposta antes de girar', 'warning');
    return;
  }
  
  const betAmount = parseFloat(document.getElementById('roulette-bet-amount').value);
  
  if (betAmount <= 0) {
    showNotification('O valor da aposta deve ser maior que zero', 'error');
    return;
  }
  
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para realizar esta aposta', 'error');
    return;
  }
  
  // Desabilitar botão durante o giro
  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  
  // Animar a roleta
  const ball = document.getElementById('roulette-ball');
  const wheel = document.querySelector('.roulette-wheel');
  
  wheel.classList.add('spinning');
  
  // Simular movimento da bola
  let angle = 0;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;
  
  const moveBall = setInterval(() => {
    angle += 10;
    const x = centerX + radius * Math.cos(angle * Math.PI / 180);
    const y = centerY + radius * Math.sin(angle * Math.PI / 180);
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
  }, 50);
  
  // Determinar resultado após 3 segundos
  setTimeout(() => {
    clearInterval(moveBall);
    wheel.classList.remove('spinning');
    
    // Gerar resultado aleatório
    const result = Math.floor(Math.random() * 37); // 0-36
    let resultColor = 'green';
    if (result > 0) {
      resultColor = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result) ? 'red' : 'black';
    }
    
    // Verificar se o jogador ganhou
    let won = false;
    let multiplier = 0;
    
    switch (selectedBet) {
      case 'red':
        won = resultColor === 'red';
        multiplier = 2;
        break;
      case 'black':
        won = resultColor === 'black';
        multiplier = 2;
        break;
      case 'green':
        won = resultColor === 'green';
        multiplier = 36;
        break;
      case '1-12':
        won = result >= 1 && result <= 12;
        multiplier = 3;
        break;
      case '13-24':
        won = result >= 13 && result <= 24;
        multiplier = 3;
        break;
      case '25-36':
        won = result >= 25 && result <= 36;
        multiplier = 3;
        break;
      case 'even':
        won = result > 0 && result % 2 === 0;
        multiplier = 2;
        break;
      case 'odd':
        won = result > 0 && result % 2 === 1;
        multiplier = 2;
        break;
      case '1-18':
        won = result >= 1 && result <= 18;
        multiplier = 2;
        break;
    }
    
    // Atualizar saldo
    userBalance -= betAmount;
    
    if (won) {
      const winAmount = betAmount * multiplier;
      userBalance += winAmount;
      showNotification(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
    } else {
      showNotification(`Que pena! Você perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
    }
    
    updateBalanceDisplay();
    
    // Reativar botão
    spinBtn.disabled = false;
  }, 3000);
}

// Funções para o jogo de blackjack
function initBlackjack() {
  // Limpar mãos
  document.getElementById('dealer-hand').innerHTML = '';
  document.getElementById('player-hand').innerHTML = '';
  
  // Resetar pontuações
  document.getElementById('dealer-score').textContent = '0';
  document.getElementById('player-score').textContent = '0';
  
  // Resetar botões
  document.getElementById('deal-btn').disabled = false;
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
}

function dealBlackjack() {
  const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
  
  if (betAmount <= 0) {
    showNotification('O valor da aposta deve ser maior que zero', 'error');
    return;
  }
  
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para realizar esta aposta', 'error');
    return;
  }
  
  // Descontar aposta do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Limpar mãos
  document.getElementById('dealer-hand').innerHTML = '';
  document.getElementById('player-hand').innerHTML = '';
  
  // Distribuir cartas iniciais
  // Dealer recebe uma carta virada para cima e uma para baixo
  addCard('dealer', getRandomCard(), false);
  addCard('dealer', getRandomCard(), true);
  
  // Jogador recebe duas cartas viradas para cima
  addCard('player', getRandomCard(), false);
  addCard('player', getRandomCard(), false);
  
  // Atualizar pontuações
  updateBlackjackScores();
  
  // Verificar se o jogador tem blackjack
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  if (playerScore === 21) {
    // Blackjack! Jogador ganha 1.5x a aposta
    const winAmount = betAmount * 2.5;
    userBalance += winAmount;
    updateBalanceDisplay();
    showNotification(`Blackjack! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
    document.getElementById('deal-btn').disabled = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    return;
  }
  
  // Atualizar botões
  document.getElementById('deal-btn').disabled = true;
  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;
}

function hitBlackjack() {
  // Jogador pede mais uma carta
  addCard('player', getRandomCard(), false);
  
  // Atualizar pontuações
  updateBlackjackScores();
  
  // Verificar se o jogador estourou
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  if (playerScore > 21) {
    showNotification('Você estourou! Perdeu a aposta.', 'error');
    document.getElementById('deal-btn').disabled = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
  }
}

function standBlackjack() {
  // Revelar a carta do dealer
  const dealerHand = document.getElementById('dealer-hand');
  const hiddenCard = dealerHand.querySelector('.card[data-hidden="true"]');
  if (hiddenCard) {
    hiddenCard.dataset.hidden = "false";
    hiddenCard.innerHTML = hiddenCard.dataset.value;
  }
  
  // Atualizar pontuação do dealer
  updateBlackjackScores();
  
  // Dealer pega cartas até ter pelo menos 17 pontos
  let dealerScore = parseInt(document.getElementById('dealer-score').textContent);
  
  const dealerPlay = setInterval(() => {
    if (dealerScore < 17) {
      addCard('dealer', getRandomCard(), false);
      updateBlackjackScores();
      dealerScore = parseInt(document.getElementById('dealer-score').textContent);
    } else {
      clearInterval(dealerPlay);
      determineBlackjackWinner();
    }
  }, 1000);
  
  // Desabilitar botões durante a jogada do dealer
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
}

function determineBlackjackWinner() {
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  const dealerScore = parseInt(document.getElementById('dealer-score').textContent);
  const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
  
  // Determinar o vencedor
  if (dealerScore > 21) {
    // Dealer estourou, jogador ganha
    const winAmount = betAmount * 2;
    userBalance += winAmount;
    showNotification(`Dealer estourou! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
  } else if (playerScore > dealerScore) {
    // Jogador tem pontuação maior, jogador ganha
    const winAmount = betAmount * 2;
    userBalance += winAmount;
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
  } else if (playerScore === dealerScore) {
    // Empate, jogador recupera a aposta
    userBalance += betAmount;
    showNotification('Empate! Sua aposta foi devolvida.', 'info');
  } else {
    // Dealer tem pontuação maior, jogador perde
    showNotification(`Dealer ganhou! Você perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
  }
  
  updateBalanceDisplay();
  
  // Reativar botão de distribuir
  document.getElementById('deal-btn').disabled = false;
}

function getRandomCard() {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];
  
  const randomValue = values[Math.floor(Math.random() * values.length)];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  
  return { value: randomValue, suit: randomSuit };
}

function addCard(player, card, hidden) {
  const hand = document.getElementById(`${player}-hand`);
  
  const cardElement = document.createElement('div');
  cardElement.className = 'card dealing';
  
  if (hidden) {
    cardElement.innerHTML = '?';
    cardElement.dataset.hidden = "true";
    cardElement.dataset.value = `<div class="card-value">${card.value}</div><div class="card-suit">${card.suit}</div>`;
  } else {
    cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit">${card.suit}</div>`;
    cardElement.dataset.hidden = "false";
  }
  
  cardElement.dataset.cardValue = card.value;
  
  // Definir cor da carta baseada no naipe
  if (card.suit === '♥' || card.suit === '♦') {
    cardElement.style.color = 'red';
  }
  
  hand.appendChild(cardElement);
  
  // Remover a classe de animação após a animação terminar
  setTimeout(() => {
    cardElement.classList.remove('dealing');
  }, 500);
}

function updateBlackjackScores() {
  // Calcular pontuação do dealer
  const dealerCards = document.querySelectorAll('#dealer-hand .card[data-hidden="false"]');
  const dealerScore = calculateBlackjackScore(dealerCards);
  document.getElementById('dealer-score').textContent = dealerScore;
  
  // Calcular pontuação do jogador
  const playerCards = document.querySelectorAll('#player-hand .card');
  const playerScore = calculateBlackjackScore(playerCards);
  document.getElementById('player-score').textContent = playerScore;
}

function calculateBlackjackScore(cards) {
  let score = 0;
  let aces = 0;
  
  cards.forEach(card => {
    const value = card.dataset.cardValue;
    
    if (value === 'A') {
      aces++;
      score += 11;
    } else if (value === 'K' || value === 'Q' || value === 'J') {
      score += 10;
    } else {
      score += parseInt(value);
    }
  });
  
  // Ajustar valor dos ases se necessário
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// Funções para o jogo de raspadinha
function initScratchCard() {
  // Resetar a raspadinha
  document.getElementById('scratch-prize').textContent = '?';
  document.getElementById('scratch-overlay').style.display = 'flex';
  document.getElementById('new-card-btn').disabled = true;
}

function newScratchCard() {
  const betAmount = parseFloat(document.getElementById('scratch-bet-amount').value);
  
  if (betAmount <= 0) {
    showNotification('O valor da raspadinha deve ser maior que zero', 'error');
    return;
  }
  
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para comprar esta raspadinha', 'error');
    return;
  }
  
  // Descontar valor da raspadinha
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Resetar a raspadinha
  document.getElementById('scratch-prize').textContent = '?';
  document.getElementById('scratch-overlay').style.display = 'flex';
  document.getElementById('new-card-btn').disabled = true;
  
  // Determinar o prêmio
  const random = Math.random();
  let prize = 0;
  
  if (random < 0.01) {
    // 1% de chance de ganhar 50x
    prize = betAmount * 50;
  } else if (random < 0.05) {
    // 4% de chance de ganhar 10x
    prize = betAmount * 10;
  } else if (random < 0.15) {
    // 10% de chance de ganhar 5x
    prize = betAmount * 5;
  } else if (random < 0.30) {
    // 15% de chance de ganhar 2x
    prize = betAmount * 2;
  } else if (random < 0.50) {
    // 20% de chance de ganhar 1x (recuperar o valor)
    prize = betAmount;
  }
  
  // Armazenar o prêmio para revelar depois
  document.getElementById('scratch-prize').dataset.prize = prize.toFixed(2);
}

function scratchCard() {
  const overlay = document.getElementById('scratch-overlay');
  overlay.style.display = 'none';
  
  const prizeElement = document.getElementById('scratch-prize');
  const prize = parseFloat(prizeElement.dataset.prize || 0);
  
  if (prize > 0) {
    prizeElement.textContent = `R$ ${prize.toFixed(2)}`;
    prizeElement.style.color = 'var(--success-color)';
    
    // Adicionar o prêmio ao saldo
    userBalance += prize;
    updateBalanceDisplay();
    
    showNotification(`Parabéns! Você ganhou R$ ${prize.toFixed(2)}!`, 'success');
  } else {
    prizeElement.textContent = 'Não foi dessa vez!';
    prizeElement.style.color = 'var(--danger-color)';
    
    showNotification('Que pena! Tente novamente.', 'error');
  }
  
  // Habilitar botão para nova raspadinha
  document.getElementById('new-card-btn').disabled = false;
}

// Funções para o jogo de caça-níqueis
function initSlots() {
  // Resetar os rolos
  document.getElementById('reel1').textContent = '7';
  document.getElementById('reel2').textContent = '7';
  document.getElementById('reel3').textContent = '7';
}

function spinSlots() {
  const betAmount = parseFloat(document.getElementById('slots-bet-amount').value);
  
  if (betAmount <= 0) {
    showNotification('O valor da aposta deve ser maior que zero', 'error');
    return;
  }
  
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para realizar esta aposta', 'error');
    return;
  }
  
  // Descontar aposta do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Desabilitar botão durante o giro
  const spinBtn = document.getElementById('spin-slots-btn');
  spinBtn.disabled = true;
  
  // Símbolos possíveis
  const symbols = ['7', 'BAR', 'Cereja', 'Limão', 'Laranja', 'Uva'];
  
  // Animar os rolos
  const reel1 = document.getElementById('reel1');
  const reel2 = document.getElementById('reel2');
  const reel3 = document.getElementById('reel3');
  
  let count1 = 0, count2 = 0, count3 = 0;
  
  const spin1 = setInterval(() => {
    reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    count1++;
    if (count1 > 20) clearInterval(spin1);
  }, 100);
  
  const spin2 = setInterval(() => {
    reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    count2++;
    if (count2 > 30) clearInterval(spin2);
  }, 100);
  
  const spin3 = setInterval(() => {
    reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    count3++;
    if (count3 > 40) {
      clearInterval(spin3);
      checkSlotsResult();
    }
  }, 100);
  
  function checkSlotsResult() {
    // Determinar resultado final
    const result1 = symbols[Math.floor(Math.random() * symbols.length)];
    const result2 = symbols[Math.floor(Math.random() * symbols.length)];
    const result3 = symbols[Math.floor(Math.random() * symbols.length)];
    
    reel1.textContent = result1;
    reel2.textContent = result2;
    reel3.textContent = result3;
    
    // Verificar se o jogador ganhou
    let multiplier = 0;
    
    if (result1 === result2 && result2 === result3) {
      // Três iguais
      if (result1 === '7') {
        multiplier = 50; // Jackpot
      } else if (result1 === 'BAR') {
        multiplier = 20;
      } else {
        multiplier = 10;
      }
    } else if (result1 === result2 || result2 === result3 || result1 === result3) {
      // Dois iguais
      multiplier = 2;
    }
    
    if (multiplier > 0) {
      const winAmount = betAmount * multiplier;
      userBalance += winAmount;
      updateBalanceDisplay();
      showNotification(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
    } else {
      showNotification(`Que pena! Você perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
    }
    
    // Reativar botão
    spinBtn.disabled = false;
  }
}

// Funções utilitárias
function updateBalanceDisplay() {
  document.querySelector('.balance-amount').textContent = `R$ ${userBalance.toFixed(2)}`;
  
  // Salvar no localStorage
  if (isLoggedIn) {
    const savedUser = JSON.parse(localStorage.getItem('deadpoolCasinoUser') || '{}');
    savedUser.balance = userBalance;
    localStorage.setItem('deadpoolCasinoUser', JSON.stringify(savedUser));
  }
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationIcon = notification.querySelector('.notification-icon i');
  
  // Definir ícone baseado no tipo
  switch (type) {
    case 'success':
      notificationIcon.className = 'fas fa-check-circle';
      notification.className = 'notification success';
      break;
    case 'error':
      notificationIcon.className = 'fas fa-times-circle';
      notification.className = 'notification error';
      break;
    case 'warning':
      notificationIcon.className = 'fas fa-exclamation-triangle';
      notification.className = 'notification warning';
      break;
    default:
      notificationIcon.className = 'fas fa-info-circle';
      notification.className = 'notification';
  }
  
  notificationMessage.textContent = message;
  notification.classList.add('show');
  
  // Esconder após 3 segundos
  setTimeout(closeNotification, 3000);
}

function closeNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('show');
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  
  // Limitar a 10 transações
  if (transactions.length > 10) {
    transactions = transactions.slice(0, 10);
  }
  
  // Salvar no localStorage
  localStorage.setItem('deadpoolCasinoTransactions', JSON.stringify(transactions));
  
  // Atualizar a tabela
  updateTransactionHistory();
}

function updateTransactionHistory() {
  const transactionList = document.getElementById('transaction-list');
  if (!transactionList) return;
  
  transactionList.innerHTML = '';
  
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    
    // Formatar data
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${transaction.type}</td>
      <td>${transaction.method}</td>
      <td>R$ ${transaction.amount.toFixed(2)}</td>
      <td>${transaction.status}</td>
    `;
    
    transactionList.appendChild(row);
  });
}

function addSampleTransactions() {
  const now = new Date();
  
  // Adicionar algumas transações de exemplo
  transactions = [
    {
      date: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 horas atrás
      type: 'Depósito',
      method: 'PIX',
      amount: 100,
      status: 'Concluído'
    },
    {
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 dia atrás
      type: 'Depósito',
      method: 'Cartão de Crédito',
      amount: 200,
      status: 'Concluído'
    },
    {
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
      type: 'Saque',
      method: 'PIX',
      amount: 150,
      status: 'Concluído'
    }
  ];
  
  // Salvar no localStorage
  localStorage.setItem('deadpoolCasinoTransactions', JSON.stringify(transactions));
  
  // Atualizar a tabela
  updateTransactionHistory();
}

// Funções para efeitos visuais
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.style.background = 'rgba(0, 0, 0, 0.9)';
  } else {
    header.style.background = 'var(--secondary-color)';
  }
});

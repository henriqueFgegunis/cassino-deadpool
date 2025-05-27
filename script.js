// Script para o Infinity Slots

// === VARIÁVEIS GLOBAIS ===
let userBalance = 0;
let currentGame = null;
let selectedBet = null;
let transactions = [];
let isLoggedIn = false;
let username = '';

// === VARIÁVEIS DO JOGO MINA DE OURO ===
let minesGameActive = false;
let mineLocations = [];
let minesSafeClicks = 0;
const MINES_COUNT = 5;
const GRID_SIZE = 25;
const minesMultipliers = [
  1.15, 1.35, 1.6, 1.9, 2.25, 2.65, 3.1, 3.7, 4.4, 5.2,
  6.1, 7.2, 8.5, 10, 12, 15, 18, 22, 27, 40
]; // Multiplicadores para 1 a 20 cliques seguros

// === INICIALIZAÇÃO ===
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
  const savedUser = localStorage.getItem('infinitySlotsUser');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    isLoggedIn = true;
    username = user.name;
    userBalance = user.balance;
    updateBalanceDisplay();
    showNotification(`Bem-vindo de volta, ${username}!`, 'success');
  }

  // Carregar transações do localStorage
  const savedTransactions = localStorage.getItem('infinitySlotsTransactions');
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

// === SISTEMA DE AUTENTICAÇÃO ===
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
  
  isLoggedIn = true;
  username = email.split('@')[0];
  userBalance = 100; 
  
  localStorage.setItem('infinitySlotsUser', JSON.stringify({
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
  
  isLoggedIn = true;
  username = name;
  userBalance = 200; // Bônus de boas-vindas
  
  localStorage.setItem('infinitySlotsUser', JSON.stringify({
    name: name,
    email: email,
    balance: userBalance
  }));
  
  updateBalanceDisplay();
  closeModal();
  showNotification('Registro realizado com sucesso! Você ganhou R$ 200 de bônus!', 'success');
  
  addTransaction({
    date: new Date(),
    type: 'Depósito',
    method: 'Bônus',
    amount: 200,
    status: 'Concluído'
  });
}

// === DEPÓSITO E SAQUE ===
function processDeposit(method) {
  if (!isLoggedIn) {
    showNotification('Faça login para realizar um depósito', 'warning');
    openModal();
    return;
  }
  
  let amount = 0;
  let formValid = true;
  
  if (method === 'card') {
    amount = parseFloat(document.getElementById('deposit-amount').value);
    if (!document.getElementById('card-number').value || !document.getElementById('card-holder').value || !document.getElementById('expiry-date').value || !document.getElementById('cvv').value || !amount) {
      formValid = false;
    }
  } else if (method === 'pix') {
    amount = parseFloat(document.getElementById('pix-amount').value);
    if (!document.getElementById('pix-sender').value || !amount) {
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
  
  showNotification('Processando depósito...', 'info');
  
  setTimeout(() => {
    userBalance += amount;
    updateBalanceDisplay();
    addTransaction({
      date: new Date(),
      type: 'Depósito',
      method: method === 'card' ? 'Cartão de Crédito' : 'PIX',
      amount: amount,
      status: 'Concluído'
    });
    if (method === 'card') { document.getElementById('card-deposit-form').reset(); } 
    else { document.getElementById('pix-deposit-form').reset(); }
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
  
  showNotification('Processando solicitação de saque...', 'info');
  
  setTimeout(() => {
    userBalance -= amount;
    updateBalanceDisplay();
    addTransaction({
      date: new Date(),
      type: 'Saque',
      method: 'PIX',
      amount: amount,
      status: 'Em processamento'
    });
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

// === CONTROLE GERAL DOS JOGOS ===
function openGame(game) {
  if (!isLoggedIn) {
    showNotification('Faça login para jogar', 'warning');
    openModal();
    return;
  }
  
  currentGame = game;
  document.querySelectorAll('#game-area > div').forEach(div => div.style.display = 'none');
  document.getElementById('game-area').style.display = 'block';
  document.getElementById(`${game}-game`).style.display = 'block';
  document.getElementById('game-area').scrollIntoView({ behavior: 'smooth' });

  switch (game) {
    case 'roulette': initRoulette(); break;
    case 'blackjack': initBlackjack(); break;
    case 'scratch': initScratchCard(); break;
    case 'slots': initSlots(); break;
    case 'poker': initPoker(); break;
    case 'crash': initCrash(); break;
    case 'mines': initMines(); break;
  }
}

function closeGame() {
  document.getElementById('game-area').style.display = 'none';
  currentGame = null;
}

// === JOGO MINA DE OURO ===
function initMines() {
    minesGameActive = false;
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('mine-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleMineCellClick);
        grid.appendChild(cell);
    }
    document.getElementById('start-mines-btn').disabled = false;
    document.getElementById('cashout-mines-btn').disabled = true;
    document.getElementById('mines-bet-amount').disabled = false;
    updateMinesInfo(0);
}

function startMinesGame() {
    const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
    if (betAmount <= 0) {
        showNotification('A aposta deve ser maior que zero.', 'error');
        return;
    }
    if (betAmount > userBalance) {
        showNotification('Saldo insuficiente para esta aposta.', 'error');
        return;
    }

    userBalance -= betAmount;
    updateBalanceDisplay();
    addTransaction({ date: new Date(), type: 'Aposta', method: 'Mina de Ouro', amount: betAmount, status: 'Perdida' }); // Assume perda até ganhar

    minesGameActive = true;
    minesSafeClicks = 0;
    mineLocations = [];
    while (mineLocations.length < MINES_COUNT) {
        const randomPos = Math.floor(Math.random() * GRID_SIZE);
        if (!mineLocations.includes(randomPos)) {
            mineLocations.push(randomPos);
        }
    }

    // Reset visual do grid
    const cells = document.querySelectorAll('.mine-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.className = 'mine-cell';
    });

    document.getElementById('start-mines-btn').disabled = true;
    document.getElementById('cashout-mines-btn').disabled = false;
    document.getElementById('mines-bet-amount').disabled = true;
    updateMinesInfo(minesSafeClicks);
    showNotification('Jogo iniciado! Boa sorte!', 'info');
}

function handleMineCellClick(event) {
    if (!minesGameActive) return;

    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (cell.classList.contains('revealed')) return;

    if (mineLocations.includes(index)) {
        // Acertou a bomba
        cell.classList.add('revealed', 'mine');
        cell.innerHTML = '💣';
        endMinesGame(false);
    } else {
        // Clicou em um lugar seguro
        cell.classList.add('revealed', 'safe');
        cell.innerHTML = '💎';
        minesSafeClicks++;
        updateMinesInfo(minesSafeClicks);
        
        // Verifica se o jogador encontrou todas as joias
        if (minesSafeClicks === GRID_SIZE - MINES_COUNT) {
            endMinesGame(true, true); // Ganhou por completar
        }
    }
}

function cashoutMines() {
    if (!minesGameActive || minesSafeClicks === 0) return;
    endMinesGame(true, false);
}

function endMinesGame(isWinner, completed = false) {
    minesGameActive = false;
    const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
    
    // Revela todas as bombas
    const cells = document.querySelectorAll('.mine-cell');
    mineLocations.forEach(index => {
        if (!cells[index].classList.contains('revealed')) {
            cells[index].classList.add('revealed');
            cells[index].innerHTML = '💣';
        }
    });

    if (isWinner) {
        const multiplier = minesMultipliers[minesSafeClicks - 1];
        const winAmount = betAmount * multiplier;
        userBalance += winAmount;
        updateBalanceDisplay();

        // Atualiza a transação para 'Ganha'
        transactions.shift(); // Remove a transação 'Perdida'
        addTransaction({ date: new Date(), type: 'Aposta', method: 'Mina de Ouro', amount: winAmount, status: 'Ganha' });

        const message = completed ? `Incrível! Você achou todas as joias e ganhou R$ ${winAmount.toFixed(2)}!` : `Você retirou R$ ${winAmount.toFixed(2)} com sucesso!`;
        showNotification(message, 'success');

    } else {
        showNotification(`Você acertou uma bomba e perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
    }

    document.getElementById('start-mines-btn').disabled = false;
    document.getElementById('cashout-mines-btn').disabled = true;
    document.getElementById('mines-bet-amount').disabled = false;
}

function updateMinesInfo(clicks) {
    const multiplierDisplay = document.getElementById('mines-multiplier');
    const nextPrizeDisplay = document.getElementById('mines-next-prize');
    const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);

    if (clicks === 0) {
        multiplierDisplay.textContent = '1.00x';
        nextPrizeDisplay.textContent = `R$ ${(betAmount * minesMultipliers[0]).toFixed(2)}`;
    } else {
        const currentMultiplier = minesMultipliers[clicks - 1];
        multiplierDisplay.textContent = `${currentMultiplier.toFixed(2)}x`;
        if (clicks < GRID_SIZE - MINES_COUNT) {
            const nextMultiplier = minesMultipliers[clicks];
            nextPrizeDisplay.textContent = `R$ ${(betAmount * nextMultiplier).toFixed(2)}`;
        } else {
            nextPrizeDisplay.textContent = 'MAX!';
        }
    }
}


// === DEMAIS JOGOS (LÓGICA EXISTENTE) ===
// ... (O restante do seu código JavaScript para Roleta, Blackjack, etc. continua aqui)
// ... (Para economizar espaço, o código repetido foi omitido, mas ele deve estar aqui no seu arquivo final)
// ...

// Funções para o jogo de roleta
function initRoulette() {
  selectedBet = null;
  document.querySelectorAll('.bet-option').forEach(option => {
    option.classList.remove('selected');
  });
  const ball = document.getElementById('roulette-ball');
  if (ball) {
    ball.style.transform = 'translate(-50%, -50%)';
  }
}

function selectBet(element) {
  document.querySelectorAll('.bet-option').forEach(option => {
    option.classList.remove('selected');
  });
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
  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  setTimeout(() => {
    const result = Math.floor(Math.random() * 37);
    let resultColor = result === 0 ? 'green' : ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result) ? 'red' : 'black');
    let won = false;
    let multiplier = 0;
    switch (selectedBet) {
      case 'red': won = resultColor === 'red'; multiplier = 2; break;
      case 'black': won = resultColor === 'black'; multiplier = 2; break;
      case 'green': won = resultColor === 'green'; multiplier = 36; break;
      case '1-12': won = result >= 1 && result <= 12; multiplier = 3; break;
      case '13-24': won = result >= 13 && result <= 24; multiplier = 3; break;
      case '25-36': won = result >= 25 && result <= 36; multiplier = 3; break;
      case 'even': won = result > 0 && result % 2 === 0; multiplier = 2; break;
      case 'odd': won = result > 0 && result % 2 === 1; multiplier = 2; break;
      case '1-18': won = result >= 1 && result <= 18; multiplier = 2; break;
    }
    if (won) {
      const winAmount = betAmount * multiplier;
      userBalance += winAmount;
      showNotification(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
    } else {
      showNotification(`Que pena! Você perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
    }
    updateBalanceDisplay();
    spinBtn.disabled = false;
  }, 3000);
}

// Funções para o jogo de blackjack
function initBlackjack() {
  document.getElementById('dealer-hand').innerHTML = '';
  document.getElementById('player-hand').innerHTML = '';
  document.getElementById('dealer-score').textContent = '0';
  document.getElementById('player-score').textContent = '0';
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
  userBalance -= betAmount;
  updateBalanceDisplay();
  initBlackjack(); // Limpa a mesa antes de distribuir
  addCard('dealer', getRandomCard(), false);
  addCard('dealer', getRandomCard(), true);
  addCard('player', getRandomCard(), false);
  addCard('player', getRandomCard(), false);
  updateBlackjackScores();
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  if (playerScore === 21) {
    const winAmount = betAmount * 2.5;
    userBalance += winAmount;
    updateBalanceDisplay();
    showNotification(`Blackjack! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
  } else {
    document.getElementById('deal-btn').disabled = true;
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
  }
}

function hitBlackjack() {
  addCard('player', getRandomCard(), false);
  updateBlackjackScores();
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  if (playerScore > 21) {
    showNotification('Você estourou! Perdeu a aposta.', 'error');
    document.getElementById('deal-btn').disabled = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
  }
}

function standBlackjack() {
  const hiddenCard = document.querySelector('#dealer-hand .card[data-hidden="true"]');
  if (hiddenCard) {
    hiddenCard.dataset.hidden = "false";
    hiddenCard.innerHTML = hiddenCard.dataset.value;
  }
  updateBlackjackScores();
  let dealerScore = parseInt(document.getElementById('dealer-score').textContent);
  const playDealer = () => {
    if (dealerScore < 17) {
      addCard('dealer', getRandomCard(), false);
      updateBlackjackScores();
      dealerScore = parseInt(document.getElementById('dealer-score').textContent);
      setTimeout(playDealer, 1000);
    } else {
      determineBlackjackWinner();
    }
  };
  playDealer();
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
}

function determineBlackjackWinner() {
  const playerScore = parseInt(document.getElementById('player-score').textContent);
  const dealerScore = parseInt(document.getElementById('dealer-score').textContent);
  const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
  let winAmount = 0;
  if (dealerScore > 21 || playerScore > dealerScore) {
    winAmount = betAmount * 2;
    userBalance += winAmount;
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
  } else if (playerScore === dealerScore) {
    userBalance += betAmount;
    showNotification('Empate! Sua aposta foi devolvida.', 'info');
  } else {
    showNotification(`Dealer ganhou! Você perdeu R$ ${betAmount.toFixed(2)}.`, 'error');
  }
  updateBalanceDisplay();
  document.getElementById('deal-btn').disabled = false;
}

function getRandomCard() {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];
  return { value: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * suits.length)] };
}

function addCard(player, card, hidden) {
  const hand = document.getElementById(`${player}-hand`);
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  if (hidden) {
    cardElement.innerHTML = '?';
    cardElement.dataset.hidden = "true";
    cardElement.dataset.value = `<div class="card-value">${card.value}</div><div class="card-suit">${card.suit}</div>`;
  } else {
    cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit">${card.suit}</div>`;
    cardElement.dataset.hidden = "false";
  }
  cardElement.dataset.cardValue = card.value;
  if (card.suit === '♥' || card.suit === '♦') cardElement.style.color = 'red';
  hand.appendChild(cardElement);
}

function updateBlackjackScores() {
  document.getElementById('dealer-score').textContent = calculateBlackjackScore(document.querySelectorAll('#dealer-hand .card[data-hidden="false"]'));
  document.getElementById('player-score').textContent = calculateBlackjackScore(document.querySelectorAll('#player-hand .card'));
}

function calculateBlackjackScore(cards) {
  let score = 0, aces = 0;
  cards.forEach(card => {
    const value = card.dataset.cardValue;
    if (value === 'A') { aces++; score += 11; } 
    else if (['K', 'Q', 'J'].includes(value)) { score += 10; } 
    else { score += parseInt(value); }
  });
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

// Funções para o jogo de raspadinha
function initScratchCard() {
  document.getElementById('scratch-prize').textContent = '?';
  document.getElementById('scratch-overlay').style.display = 'flex';
  document.getElementById('new-card-btn').disabled = false;
  document.getElementById('scratch-prize').dataset.prize = '0';
  document.getElementById('scratch-prize').dataset.bought = 'false';
}

function newScratchCard() {
  const betAmount = parseFloat(document.getElementById('scratch-bet-amount').value);
  if (betAmount <= 0) { showNotification('O valor da raspadinha deve ser maior que zero', 'error'); return; }
  if (betAmount > userBalance) { showNotification('Saldo insuficiente para comprar esta raspadinha', 'error'); return; }
  userBalance -= betAmount;
  updateBalanceDisplay();
  initScratchCard();
  document.getElementById('scratch-prize').dataset.bought = 'true';
  showNotification('Nova raspadinha pronta! Raspe para revelar seu prêmio.', 'info');
  let prize = 0;
  const random = Math.random();
  if (random < 0.01) prize = betAmount * 50;
  else if (random < 0.05) prize = betAmount * 10;
  else if (random < 0.15) prize = betAmount * 5;
  else if (random < 0.30) prize = betAmount * 2;
  else if (random < 0.50) prize = betAmount;
  document.getElementById('scratch-prize').dataset.prize = prize.toFixed(2);
  document.getElementById('new-card-btn').disabled = true;
}

function scratchCard() {
  const prizeElement = document.getElementById('scratch-prize');
  if (prizeElement.dataset.bought !== 'true') {
    showNotification('Você precisa comprar uma nova raspadinha primeiro!', 'warning');
    return;
  }
  const overlay = document.getElementById('scratch-overlay');
  if (overlay.style.display === 'none') return;
  overlay.style.display = 'none';
  const prize = parseFloat(prizeElement.dataset.prize || 0);
  if (prize > 0) {
    prizeElement.textContent = `R$ ${prize.toFixed(2)}`;
    prizeElement.style.color = 'var(--success-color)';
    userBalance += prize;
    updateBalanceDisplay();
    showNotification(`Parabéns! Você ganhou R$ ${prize.toFixed(2)}!`, 'success');
  } else {
    prizeElement.textContent = 'Tente de novo!';
    prizeElement.style.color = 'var(--danger-color)';
    showNotification('Que pena! Tente novamente.', 'error');
  }
  document.getElementById('new-card-btn').disabled = false;
  prizeElement.dataset.bought = 'false';
}

// Funções para o jogo de caça-níqueis
function initSlots() {
  document.getElementById('reel1').textContent = '∞';
  document.getElementById('reel2').textContent = '∞';
  document.getElementById('reel3').textContent = '∞';
}

function spinSlots() {
  const betAmount = parseFloat(document.getElementById('slots-bet-amount').value);
  if (betAmount <= 0) { showNotification('O valor da aposta deve ser maior que zero', 'error'); return; }
  if (betAmount > userBalance) { showNotification('Saldo insuficiente para esta aposta', 'error'); return; }
  userBalance -= betAmount;
  updateBalanceDisplay();
  const spinBtn = document.getElementById('spin-slots-btn');
  spinBtn.disabled = true;
  const symbols = ['7', 'BAR', '💎', '🍋', '🍊', '🍇'];
  // Animação e resultado... (código omitido por brevidade, mas deve ser mantido)
  setTimeout(() => {
      const results = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
      document.getElementById('reel1').textContent = results[0];
      document.getElementById('reel2').textContent = results[1];
      document.getElementById('reel3').textContent = results[2];
      let multiplier = 0;
      if (results[0] === results[1] && results[1] === results[2]) {
        if (results[0] === '7') multiplier = 100;
        else if (results[0] === '💎') multiplier = 50;
        else if (results[0] === 'BAR') multiplier = 20;
        else multiplier = 10;
      } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
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
      spinBtn.disabled = false;
  }, 1500);
}

// Funções para jogos "falsos" (em breve)
function initPoker() {
    showNotification('O jogo de Poker está em desenvolvimento e será lançado em breve!', 'info');
}

function initCrash() {
    showNotification('O jogo de Crash está em desenvolvimento e será lançado em breve!', 'info');
}

// === FUNÇÕES UTILITÁRIAS ===
function updateBalanceDisplay() {
  document.querySelector('.balance-amount').textContent = `R$ ${userBalance.toFixed(2)}`;
  if (isLoggedIn) {
    const savedUser = JSON.parse(localStorage.getItem('infinitySlotsUser') || '{}');
    savedUser.balance = userBalance;
    localStorage.setItem('infinitySlotsUser', JSON.stringify(savedUser));
  }
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationIcon = notification.querySelector('.notification-icon i');
  switch (type) {
    case 'success': notificationIcon.className = 'fas fa-check-circle'; notification.className = 'notification success'; break;
    case 'error': notificationIcon.className = 'fas fa-times-circle'; notification.className = 'notification error'; break;
    case 'warning': notificationIcon.className = 'fas fa-exclamation-triangle'; notification.className = 'notification warning'; break;
    default: notificationIcon.className = 'fas fa-info-circle'; notification.className = 'notification';
  }
  notificationMessage.textContent = message;
  notification.classList.add('show');
  setTimeout(closeNotification, 3000);
}

function closeNotification() {
  document.getElementById('notification').classList.remove('show');
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  if (transactions.length > 10) {
    transactions = transactions.slice(0, 10);
  }
  localStorage.setItem('infinitySlotsTransactions', JSON.stringify(transactions));
  updateTransactionHistory();
}

function updateTransactionHistory() {
  const transactionList = document.getElementById('transaction-list');
  if (!transactionList) return;
  transactionList.innerHTML = '';
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    row.innerHTML = `<td>${formattedDate}</td><td>${transaction.type}</td><td>${transaction.method}</td><td>R$ ${transaction.amount.toFixed(2)}</td><td>${transaction.status}</td>`;
    transactionList.appendChild(row);
  });
}

function addSampleTransactions() {
  const now = new Date();
  transactions = [
    { date: new Date(now.getTime() - 7200000), type: 'Depósito', method: 'PIX', amount: 100, status: 'Concluído' },
    { date: new Date(now.getTime() - 86400000), type: 'Depósito', method: 'Cartão de Crédito', amount: 200, status: 'Concluído' },
    { date: new Date(now.getTime() - 172800000), type: 'Saque', method: 'PIX', amount: 150, status: 'Concluído' }
  ];
  localStorage.setItem('infinitySlotsTransactions', JSON.stringify(transactions));
  updateTransactionHistory();
}

// Efeito visual do header
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  header.style.background = (window.scrollY > 50) ? 'rgba(0, 0, 0, 0.9)' : 'var(--secondary-color)';
});
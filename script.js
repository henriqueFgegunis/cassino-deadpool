// Script para o Infinity Slots Casino - Versão 2.0

// Variáveis globais
let userBalance = 0;
let isLoggedIn = false;
let selectedBet = null;
let transactions = [];
let currentGame = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o menu mobile
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
      hamburger.classList.toggle('toggle');
    });
  }
  
  // Inicializar as abas de conteúdo
  const tabLinks = document.querySelectorAll('.nav-links a[data-tab]');
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchContentTab(tabId);
    });
  });
  
  // Inicializar o modal de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  // Inicializar jogos
  initMines();
  initRoulette();
  initBlackjack();
  initScratch();
  initSlots();
  initCrash();
  initPoker();
  initTruco();
  initBaccarat();
});

// Funções de navegação
function switchContentTab(tabId) {
  // Remover classe active de todas as abas
  document.querySelectorAll('.tab-panel').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Adicionar classe active à aba selecionada
  document.getElementById(`${tabId}-tab`).classList.add('active');
  
  // Destacar o link da navegação
  const navLink = document.querySelector(`.nav-links a[data-tab="${tabId}"]`);
  if (navLink) {
    navLink.classList.add('active');
  }
  
  // Fechar o menu mobile se estiver aberto
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  if (navLinks.classList.contains('nav-active')) {
    navLinks.classList.remove('nav-active');
    hamburger.classList.remove('toggle');
  }
}

// Funções de autenticação
function openModal() {
  document.getElementById('auth-modal').style.display = 'block';
  switchAuthTab('login');
}

function closeModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function switchAuthTab(tabId) {
  document.querySelectorAll('.auth-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.modal-tabs .tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(`${tabId}-tab`).classList.add('active');
  document.querySelector(`.modal-tabs .tab[onclick="switchAuthTab('${tabId}')"]`).classList.add('active');
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
  userBalance = 1000; // Saldo inicial
  updateBalanceDisplay();
  
  // Atualizar a interface
  document.getElementById('login-btn').textContent = 'Minha Conta';
  
  // Fechar o modal
  closeModal();
  
  // Mostrar notificação
  showNotification('Login realizado com sucesso!', 'success');
  
  // Adicionar algumas transações de exemplo
  addTransaction({
    date: new Date(),
    type: 'Depósito',
    method: 'PIX',
    amount: 1000,
    status: 'Concluído'
  });
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
  userBalance = 500; // Saldo inicial para novos usuários
  updateBalanceDisplay();
  
  // Atualizar a interface
  document.getElementById('login-btn').textContent = 'Minha Conta';
  
  // Fechar o modal
  closeModal();
  
  // Mostrar notificação
  showNotification('Cadastro realizado com sucesso! Bônus de R$ 500 adicionado.', 'success');
  
  // Adicionar transação de bônus
  addTransaction({
    date: new Date(),
    type: 'Bônus',
    method: 'Cadastro',
    amount: 500,
    status: 'Concluído'
  });
}

// Funções de notificação
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.querySelector('.notification-message');
  const notificationIcon = document.querySelector('.notification-icon i');
  
  // Definir o ícone com base no tipo
  switch (type) {
    case 'success':
      notificationIcon.className = 'fas fa-check-circle';
      break;
    case 'warning':
      notificationIcon.className = 'fas fa-exclamation-triangle';
      break;
    case 'error':
      notificationIcon.className = 'fas fa-times-circle';
      break;
    default:
      notificationIcon.className = 'fas fa-info-circle';
  }
  
  // Definir a mensagem
  notificationMessage.textContent = message;
  
  // Adicionar classes
  notification.className = 'notification';
  notification.classList.add(type);
  notification.classList.add('show');
  
  // Esconder após 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

function closeNotification() {
  document.getElementById('notification').classList.remove('show');
}

// Funções de transação
function addTransaction(transaction) {
  transactions.unshift(transaction); // Adicionar no início do array
  updateTransactionList();
}

function updateTransactionList() {
  const transactionList = document.getElementById('transaction-list');
  if (!transactionList) return;
  
  transactionList.innerHTML = '';
  
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    
    // Formatar a data
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    // Definir a cor do status
    let statusClass = '';
    switch (transaction.status) {
      case 'Concluído':
      case 'Ganha':
        statusClass = 'text-success';
        break;
      case 'Pendente':
        statusClass = 'text-warning';
        break;
      case 'Perdida':
        statusClass = 'text-danger';
        break;
    }
    
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${transaction.type}</td>
      <td>${transaction.method}</td>
      <td>R$ ${transaction.amount.toFixed(2)}</td>
      <td class="${statusClass}">${transaction.status}</td>
    `;
    
    transactionList.appendChild(row);
  });
}

function updateBalanceDisplay() {
  const balanceElement = document.querySelector('.balance-amount');
  if (balanceElement) {
    balanceElement.textContent = `R$ ${userBalance.toFixed(2)}`;
  }
}

// Funções de depósito e saque
function processDeposit(method) {
  if (!isLoggedIn) {
    showNotification('Faça login para realizar um depósito', 'warning');
    openModal();
    return;
  }
  
  let amount;
  let sender;
  
  if (method === 'card') {
    const cardNumber = document.getElementById('card-number').value;
    const cardHolder = document.getElementById('card-holder').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    amount = parseFloat(document.getElementById('deposit-amount').value);
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv || !amount) {
      showNotification('Por favor, preencha todos os campos', 'error');
      return;
    }
    
    if (cardNumber.length < 16) {
      showNotification('Número de cartão inválido', 'error');
      return;
    }
    
    sender = cardHolder;
  } else if (method === 'pix') {
    amount = parseFloat(document.getElementById('pix-amount').value);
    sender = document.getElementById('pix-sender').value;
    
    if (!amount || !sender) {
      showNotification('Por favor, preencha todos os campos', 'error');
      return;
    }
  }
  
  // Simular processamento
  setTimeout(() => {
    // Adicionar ao saldo
    userBalance += amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: 'Depósito',
      method: method === 'card' ? 'Cartão' : 'PIX',
      amount: amount,
      status: 'Concluído'
    });
    
    // Mostrar notificação
    showNotification(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`, 'success');
    
    // Limpar formulário
    if (method === 'card') {
      document.getElementById('card-deposit-form').reset();
    } else {
      document.getElementById('pix-deposit-form').reset();
    }
  }, 1500);
  
  showNotification('Processando depósito...', 'info');
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
  
  if (amount > userBalance) {
    showNotification('Saldo insuficiente para realizar este saque', 'error');
    return;
  }
  
  // Simular processamento
  setTimeout(() => {
    // Deduzir do saldo
    userBalance -= amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: 'Saque',
      method: 'PIX',
      amount: amount,
      status: 'Concluído'
    });
    
    // Mostrar notificação
    showNotification(`Saque de R$ ${amount.toFixed(2)} realizado com sucesso!`, 'success');
    
    // Limpar formulário
    document.getElementById('withdraw-form').reset();
  }, 1500);
  
  showNotification('Processando saque...', 'info');
}

function copyPixCode() {
  const pixCode = document.querySelector('.pix-code input').value;
  navigator.clipboard.writeText(pixCode).then(() => {
    showNotification('Código PIX copiado para a área de transferência', 'success');
  });
}

// Funções de jogos
function openGame(game) {
  if (!isLoggedIn) {
    showNotification('Faça login para jogar', 'warning');
    openModal();
    return;
  }
  
  // Esconder todas as áreas de jogo
  document.querySelectorAll('.game-container').forEach(container => {
    container.style.display = 'none';
  });
  
  // Mostrar a área de jogo selecionada
  document.getElementById(`${game}-game`).style.display = 'block';
  
  // Mostrar a área de jogo
  document.getElementById('game-area').style.display = 'block';
  
  // Definir o jogo atual
  currentGame = game;
  
  // Inicializar o jogo específico
  switch (game) {
    case 'mines':
      resetMinesGame();
      break;
    case 'roulette':
      // Já inicializado
      break;
    case 'blackjack':
      // Já inicializado
      break;
    case 'scratch':
      newScratchCard();
      break;
    case 'slots':
      // Já inicializado
      break;
    case 'crash':
      resetCrashGame();
      break;
    case 'poker':
      initPoker();
      break;
    case 'truco':
      initTruco();
      break;
    case 'baccarat':
      initBaccarat();
      break;
  }
}

function closeGame() {
  document.getElementById('game-area').style.display = 'none';
  currentGame = null;
}

// Funções para o jogo Mina de Ouro
let minesGrid = [];
let minesCount = 5;
let revealedCells = 0;
let minesGameActive = false;
let currentMultiplier = 1;

function initMines() {
  const minesGridElement = document.getElementById('mines-grid');
  if (!minesGridElement) return;
  
  minesGridElement.innerHTML = '';
  
  // Criar a grade 5x5
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add('mine-cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => revealCell(i));
    minesGridElement.appendChild(cell);
  }
}

function resetMinesGame() {
  minesGrid = [];
  revealedCells = 0;
  minesGameActive = false;
  currentMultiplier = 1;
  
  // Resetar a interface
  document.querySelectorAll('.mine-cell').forEach(cell => {
    cell.classList.remove('revealed', 'gem', 'mine');
    cell.innerHTML = '';
  });
  
  document.getElementById('mines-multiplier').textContent = '1.00x';
  document.getElementById('mines-next-prize').textContent = 'R$ 0.00';
  document.getElementById('start-mines-btn').disabled = false;
  document.getElementById('cashout-mines-btn').disabled = true;
}

function startMinesGame() {
  const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
  
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
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Mina de Ouro',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Gerar a grade
  minesGrid = Array(25).fill('gem');
  
  // Colocar as minas aleatoriamente
  let minesPlaced = 0;
  while (minesPlaced < minesCount) {
    const position = Math.floor(Math.random() * 25);
    if (minesGrid[position] !== 'mine') {
      minesGrid[position] = 'mine';
      minesPlaced++;
    }
  }
  
  // Atualizar a interface
  minesGameActive = true;
  document.getElementById('start-mines-btn').disabled = true;
  document.getElementById('cashout-mines-btn').disabled = false;
  document.getElementById('mines-next-prize').textContent = `R$ ${(betAmount * 1.2).toFixed(2)}`;
}

function revealCell(index) {
  if (!minesGameActive) return;
  
  const cell = document.querySelector(`.mine-cell[data-index="${index}"]`);
  
  if (cell.classList.contains('revealed')) return;
  
  const cellType = minesGrid[index];
  
  cell.classList.add('revealed');
  
  if (cellType === 'gem') {
    // Encontrou uma joia
    cell.classList.add('gem');
    cell.innerHTML = '<i class="fas fa-gem"></i>';
    
    revealedCells++;
    
    // Aumentar o multiplicador
    currentMultiplier += 0.2;
    document.getElementById('mines-multiplier').textContent = `${currentMultiplier.toFixed(2)}x`;
    
    // Calcular o próximo prêmio
    const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
    const nextPrize = betAmount * currentMultiplier;
    document.getElementById('mines-next-prize').textContent = `R$ ${nextPrize.toFixed(2)}`;
    
    // Verificar se todas as joias foram encontradas
    if (revealedCells === 25 - minesCount) {
      cashoutMines();
    }
  } else {
    // Encontrou uma mina
    cell.classList.add('mine');
    cell.innerHTML = '<i class="fas fa-bomb"></i>';
    
    // Revelar todas as minas
    minesGrid.forEach((type, i) => {
      if (type === 'mine' && i !== index) {
        const mineCell = document.querySelector(`.mine-cell[data-index="${i}"]`);
        mineCell.classList.add('revealed', 'mine');
        mineCell.innerHTML = '<i class="fas fa-bomb"></i>';
      }
    });
    
    // Fim de jogo
    minesGameActive = false;
    document.getElementById('cashout-mines-btn').disabled = true;
    
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Mina de Ouro',
      amount: betAmount,
      status: 'Perdida'
    });
    
    showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Mina de Ouro`, 'error');
    
    // Habilitar o botão de iniciar
    document.getElementById('start-mines-btn').disabled = false;
  }
}

function cashoutMines() {
  if (!minesGameActive) return;
  
  // Calcular o ganho
  const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
  const winAmount = betAmount * currentMultiplier;
  
  // Adicionar ao saldo
  userBalance += winAmount;
  updateBalanceDisplay();
  
  // Atualizar a transação
  transactions.shift(); // Remove a transação 'Pendente'
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Mina de Ouro',
    amount: winAmount,
    status: 'Ganha'
  });
  
  // Mostrar notificação
  showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Mina de Ouro!`, 'success');
  
  // Revelar todas as minas
  minesGrid.forEach((type, i) => {
    if (type === 'mine') {
      const mineCell = document.querySelector(`.mine-cell[data-index="${i}"]`);
      mineCell.classList.add('revealed', 'mine');
      mineCell.innerHTML = '<i class="fas fa-bomb"></i>';
    }
  });
  
  // Fim de jogo
  minesGameActive = false;
  document.getElementById('cashout-mines-btn').disabled = true;
  document.getElementById('start-mines-btn').disabled = false;
}

// Funções para o jogo Roleta
function initRoulette() {
  // Já inicializado no HTML
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
  
  // Adicionar a transação como perdida inicialmente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Roleta',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Animação da roleta
  const wheel = document.querySelector('.roulette-wheel');
  const ball = document.getElementById('roulette-ball');
  
  wheel.classList.add('spinning');
  
  // Posicionar a bola em um local aleatório na roleta
  setTimeout(() => {
    const angle = Math.random() * 360;
    const radius = 120; // Raio da roleta
    const x = radius * Math.cos(angle * Math.PI / 180);
    const y = radius * Math.sin(angle * Math.PI / 180);
    ball.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    // Determinar o resultado
    const result = Math.floor(Math.random() * 37); // 0-36
    let resultColor = '';
    let resultType = '';
    
    if (result === 0) {
      resultColor = 'green';
    } else if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result)) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }
    
    if (result >= 1 && result <= 18) {
      resultType = '1-18';
    } else if (result >= 19 && result <= 36) {
      resultType = '19-36';
    }
    
    const isEven = result !== 0 && result % 2 === 0;
    
    // Verificar se o jogador ganhou
    let won = false;
    let multiplier = 0;
    
    if (selectedBet === resultColor) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'even' && isEven) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'odd' && !isEven && result !== 0) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === '1-18' && result >= 1 && result <= 18) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === '19-36' && result >= 19 && result <= 36) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === '1-12' && result >= 1 && result <= 12) {
      won = true;
      multiplier = 3;
    } else if (selectedBet === '13-24' && result >= 13 && result <= 24) {
      won = true;
      multiplier = 3;
    } else if (selectedBet === '25-36' && result >= 25 && result <= 36) {
      won = true;
      multiplier = 3;
    }
    
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    
    if (won) {
      const winAmount = betAmount * multiplier;
      userBalance += winAmount;
      updateBalanceDisplay();
      
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Roleta',
        amount: winAmount,
        status: 'Ganha'
      });
      
      showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} na Roleta!`, 'success');
    } else {
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Roleta',
        amount: betAmount,
        status: 'Perdida'
      });
      
      showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} na Roleta.`, 'error');
    }
    
    // Resetar a roleta
    setTimeout(() => {
      wheel.classList.remove('spinning');
      ball.style.transform = 'translate(-50%, -50%)';
      spinBtn.disabled = false;
    }, 2000);
  }, 3000);
}

// Funções para o jogo Blackjack
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let blackjackGameActive = false;

function initBlackjack() {
  // Já inicializado no HTML
}

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  // Embaralhar o baralho
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
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
  
  // Deduzir a aposta do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Blackjack',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Resetar o jogo
  deck = createDeck();
  playerHand = [];
  dealerHand = [];
  blackjackGameActive = true;
  
  // Distribuir as cartas iniciais
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  
  // Atualizar a interface
  updateBlackjackUI();
  
  // Habilitar os botões de jogo
  document.getElementById('deal-btn').disabled = true;
  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;
  
  // Verificar se o jogador tem um blackjack natural
  playerScore = calculateBlackjackScore(playerHand);
  if (playerScore === 21) {
    standBlackjack();
  }
}

function hitBlackjack() {
  if (!blackjackGameActive) return;
  
  // Adicionar uma carta à mão do jogador
  playerHand.push(deck.pop());
  
  // Atualizar a interface
  updateBlackjackUI();
  
  // Verificar se o jogador estourou
  playerScore = calculateBlackjackScore(playerHand);
  if (playerScore > 21) {
    endBlackjackGame(false);
  }
}

function standBlackjack() {
  if (!blackjackGameActive) return;
  
  // Revelar a carta do dealer
  document.querySelector('#dealer-hand .card-back').classList.remove('card-back');
  
  // Dealer pega cartas até ter 17 ou mais
  dealerScore = calculateBlackjackScore(dealerHand);
  while (dealerScore < 17) {
    dealerHand.push(deck.pop());
    dealerScore = calculateBlackjackScore(dealerHand);
  }
  
  // Atualizar a interface
  updateBlackjackUI();
  
  // Determinar o vencedor
  playerScore = calculateBlackjackScore(playerHand);
  
  let playerWins = false;
  
  if (playerScore <= 21) {
    if (dealerScore > 21 || playerScore > dealerScore) {
      playerWins = true;
    } else if (playerScore === dealerScore) {
      // Empate, devolver a aposta
      const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
      userBalance += betAmount;
      updateBalanceDisplay();
      
      // Atualizar a transação
      transactions.shift(); // Remove a transação 'Pendente'
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Blackjack',
        amount: betAmount,
        status: 'Empate'
      });
      
      showNotification('Empate no Blackjack! Aposta devolvida.', 'info');
      
      // Resetar o jogo
      blackjackGameActive = false;
      document.getElementById('deal-btn').disabled = false;
      document.getElementById('hit-btn').disabled = true;
      document.getElementById('stand-btn').disabled = true;
      
      return;
    }
  }
  
  endBlackjackGame(playerWins);
}

function updateBlackjackUI() {
  const playerHandElement = document.getElementById('player-hand');
  const dealerHandElement = document.getElementById('dealer-hand');
  
  playerHandElement.innerHTML = '';
  dealerHandElement.innerHTML = '';
  
  // Mostrar as cartas do jogador
  playerHand.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.innerHTML = getCardHTML(card);
    playerHandElement.appendChild(cardElement);
  });
  
  // Mostrar as cartas do dealer
  dealerHand.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    
    // Esconder a segunda carta do dealer se o jogo estiver ativo
    if (index === 1 && blackjackGameActive) {
      cardElement.classList.add('card-back');
      cardElement.innerHTML = '<div class="card-back-design"></div>';
    } else {
      cardElement.innerHTML = getCardHTML(card);
    }
    
    dealerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as pontuações
  document.getElementById('player-score').textContent = calculateBlackjackScore(playerHand);
  
  if (blackjackGameActive) {
    // Mostrar apenas a pontuação da primeira carta do dealer
    const firstCardValue = getCardValue(dealerHand[0]);
    document.getElementById('dealer-score').textContent = firstCardValue;
  } else {
    document.getElementById('dealer-score').textContent = calculateBlackjackScore(dealerHand);
  }
}

function calculateBlackjackScore(hand) {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }
  
  // Ajustar o valor dos ases se necessário
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

function getCardValue(card) {
  if (card.value === 'A') {
    return 11;
  } else if (['K', 'Q', 'J'].includes(card.value)) {
    return 10;
  } else {
    return parseInt(card.value);
  }
}

function getCardHTML(card) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return `
    <div class="card-value ${isRed ? 'red' : 'black'}">${card.value}</div>
    <div class="card-suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
  `;
}

function endBlackjackGame(playerWins) {
  blackjackGameActive = false;
  
  // Habilitar/desabilitar botões
  document.getElementById('deal-btn').disabled = false;
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
  
  // Atualizar a interface
  updateBlackjackUI();
  
  // Atualizar a transação
  transactions.shift(); // Remove a transação 'Pendente'
  const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
  
  if (playerWins) {
    // Verificar se é um blackjack natural
    const isNaturalBlackjack = playerHand.length === 2 && playerScore === 21;
    const multiplier = isNaturalBlackjack ? 2.5 : 2;
    const winAmount = betAmount * multiplier;
    
    userBalance += winAmount;
    updateBalanceDisplay();
    
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Blackjack',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Blackjack!`, 'success');
  } else {
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Blackjack',
      amount: betAmount,
      status: 'Perdida'
    });
    
    showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Blackjack.`, 'error');
  }
}

// Funções para o jogo Raspadinha
function initScratch() {
  // Já inicializado no HTML
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
  
  // Deduzir o valor da raspadinha do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Raspadinha',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Determinar o prêmio
  const random = Math.random();
  let prize = 0;
  let prizeSymbol = '';
  
  if (random < 0.01) {
    // 1% de chance de ganhar 50x
    prize = betAmount * 50;
    prizeSymbol = '💎💎💎';
  } else if (random < 0.05) {
    // 4% de chance de ganhar 10x
    prize = betAmount * 10;
    prizeSymbol = '💰💰💰';
  } else if (random < 0.15) {
    // 10% de chance de ganhar 5x
    prize = betAmount * 5;
    prizeSymbol = '💰💰';
  } else if (random < 0.35) {
    // 20% de chance de ganhar 2x
    prize = betAmount * 2;
    prizeSymbol = '💰';
  } else {
    // 65% de chance de não ganhar nada
    prize = 0;
    prizeSymbol = '❌';
  }
  
  // Atualizar a interface
  document.getElementById('scratch-prize').textContent = prizeSymbol;
  document.getElementById('scratch-overlay').style.opacity = '1';
  document.getElementById('scratch-overlay').textContent = 'Raspe para revelar';
  
  // Armazenar o prêmio para uso posterior
  document.getElementById('scratch-prize').dataset.prize = prize;
}

function scratchCard() {
  const overlay = document.getElementById('scratch-overlay');
  overlay.style.opacity = '0';
  
  setTimeout(() => {
    // Processar o resultado
    const prize = parseFloat(document.getElementById('scratch-prize').dataset.prize);
    
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    const betAmount = parseFloat(document.getElementById('scratch-bet-amount').value);
    
    if (prize > 0) {
      // Adicionar o prêmio ao saldo
      userBalance += prize;
      updateBalanceDisplay();
      
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Raspadinha',
        amount: prize,
        status: 'Ganha'
      });
      
      showNotification(`Você ganhou R$ ${prize.toFixed(2)} na Raspadinha!`, 'success');
    } else {
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Raspadinha',
        amount: betAmount,
        status: 'Perdida'
      });
      
      showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} na Raspadinha.`, 'error');
    }
  }, 500);
}

// Funções para o jogo Caça-níqueis
const symbols = ['7', '💎', '🍒', '🍋', '🍊', '🍇', '🔔', 'BAR'];
const payouts = {
  '777': 100,
  '💎💎💎': 50,
  '🔔🔔🔔': 25,
  'BARBARBAR': 20,
  '🍒🍒🍒': 15,
  '🍊🍊🍊': 10,
  '🍋🍋🍋': 8,
  '🍇🍇🍇': 5,
  '🍒🍒': 3,
  '🍒': 1
};

function initSlots() {
  // Já inicializado no HTML
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
  
  // Deduzir a aposta do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Caça-níqueis',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Desabilitar o botão durante a animação
  document.getElementById('spin-slots-btn').disabled = true;
  
  // Animação dos rolos
  const reels = document.querySelectorAll('.reel');
  reels.forEach(reel => {
    reel.classList.add('spinning');
  });
  
  // Determinar os resultados
  setTimeout(() => {
    const results = [];
    
    reels.forEach((reel, index) => {
      reel.classList.remove('spinning');
      
      // Selecionar um símbolo aleatório
      const randomIndex = Math.floor(Math.random() * symbols.length);
      const symbol = symbols[randomIndex];
      
      reel.textContent = symbol;
      results.push(symbol);
    });
    
    // Verificar se o jogador ganhou
    const resultString = results.join('');
    let winAmount = 0;
    
    // Verificar combinações exatas
    if (payouts[resultString]) {
      winAmount = betAmount * payouts[resultString];
    } 
    // Verificar combinações parciais
    else if (results[0] === results[1] && results[0] === '🍒') {
      winAmount = betAmount * payouts['🍒🍒'];
    } else if (results[0] === '🍒') {
      winAmount = betAmount * payouts['🍒'];
    }
    
    // Atualizar a transação
    transactions.shift(); // Remove a transação 'Pendente'
    
    if (winAmount > 0) {
      // Adicionar o ganho ao saldo
      userBalance += winAmount;
      updateBalanceDisplay();
      
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Caça-níqueis',
        amount: winAmount,
        status: 'Ganha'
      });
      
      showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Caça-níqueis!`, 'success');
    } else {
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Caça-níqueis',
        amount: betAmount,
        status: 'Perdida'
      });
      
      showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Caça-níqueis.`, 'error');
    }
    
    // Habilitar o botão novamente
    document.getElementById('spin-slots-btn').disabled = false;
  }, 2000);
}

// Funções para o jogo Crash
let crashInterval;
let crashMultiplier = 1.00;
let crashGameActive = false;

function initCrash() {
  // Já inicializado no HTML
}

function resetCrashGame() {
  // Limpar qualquer intervalo existente
  if (crashInterval) {
    clearInterval(crashInterval);
  }
  
  // Resetar variáveis
  crashMultiplier = 1.00;
  crashGameActive = false;
  
  // Atualizar a interface
  document.getElementById('crash-multiplier').textContent = '1.00x';
  document.querySelector('.crash-graph').classList.remove('crashing');
  
  // Habilitar/desabilitar botões
  document.getElementById('start-crash-btn').disabled = false;
  document.getElementById('cashout-crash-btn').disabled = true;
}

function startCrashGame() {
  const betAmount = parseFloat(document.getElementById('crash-bet-amount').value);
  
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
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Crash',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Resetar o multiplicador
  crashMultiplier = 1.00;
  crashGameActive = true;
  
  // Atualizar a interface
  document.getElementById('crash-multiplier').textContent = '1.00x';
  document.querySelector('.crash-graph').classList.remove('crashing');
  
  // Habilitar/desabilitar botões
  document.getElementById('start-crash-btn').disabled = true;
  document.getElementById('cashout-crash-btn').disabled = false;
  
  // Determinar quando o jogo vai "crashar"
  const crashPoint = Math.random() * 10;
  const willCrash = crashPoint < 1 ? 1 : crashPoint; // Mínimo de 1x
  
  // Iniciar o intervalo para aumentar o multiplicador
  crashInterval = setInterval(() => {
    // Aumentar o multiplicador
    crashMultiplier += 0.01;
    
    // Atualizar a interface
    document.getElementById('crash-multiplier').textContent = `${crashMultiplier.toFixed(2)}x`;
    
    // Verificar se chegou ao ponto de crash
    if (crashMultiplier >= willCrash) {
      // Crash!
      clearInterval(crashInterval);
      crashGameActive = false;
      
      document.querySelector('.crash-graph').classList.add('crashing');
      document.getElementById('cashout-crash-btn').disabled = true;
      
      // Atualizar a transação
      transactions.shift(); // Remove a transação 'Pendente'
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Crash',
        amount: betAmount,
        status: 'Perdida'
      });
      
      showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Crash.`, 'error');
      
      // Habilitar o botão de iniciar
      setTimeout(() => {
        document.getElementById('start-crash-btn').disabled = false;
      }, 1500);
    }
  }, 100);
}

function cashoutCrash() {
  if (!crashGameActive) return;
  
  // Parar o jogo
  clearInterval(crashInterval);
  crashGameActive = false;
  
  // Calcular o ganho
  const betAmount = parseFloat(document.getElementById('crash-bet-amount').value);
  const winAmount = betAmount * crashMultiplier;
  
  // Adicionar ao saldo
  userBalance += winAmount;
  updateBalanceDisplay();
  
  // Atualizar a transação
  transactions.shift(); // Remove a transação 'Pendente'
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Crash',
    amount: winAmount,
    status: 'Ganha'
  });
  
  // Mostrar notificação
  showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Crash!`, 'success');
  
  // Habilitar/desabilitar botões
  document.getElementById('start-crash-btn').disabled = false;
  document.getElementById('cashout-crash-btn').disabled = true;
}

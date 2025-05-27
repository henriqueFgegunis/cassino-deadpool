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

  // Efeito de scroll no header
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

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

  // Adicionar animações aos elementos quando eles entram na viewport
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.game-card, .payment-card, .promotion-card');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
        element.classList.add('animate');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Executar uma vez no carregamento
});

// === SISTEMA DE AUTENTICAÇÃO ===
function openModal() {
  document.getElementById('auth-modal').style.display = 'block';
  document.body.style.overflow = 'hidden'; // Impedir rolagem do body
}

function closeModal() {
  document.getElementById('auth-modal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restaurar rolagem do body
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

// === JOGO DE ROLETA ===
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
  
  // Adicionar a transação como perdida inicialmente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Roleta',
    amount: betAmount,
    status: 'Perdida'
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
    
    setTimeout(() => {
      wheel.classList.remove('spinning');
      
      if (won) {
        const winAmount = betAmount * multiplier;
        userBalance += winAmount;
        updateBalanceDisplay();
        
        // Atualizar a transação para 'Ganha'
        transactions.shift(); // Remove a transação 'Perdida'
        addTransaction({
          date: new Date(),
          type: 'Aposta',
          method: 'Roleta',
          amount: winAmount,
          status: 'Ganha'
        });
        
        showNotification(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
      } else {
        showNotification(`Você perdeu! O resultado foi ${result} ${resultColor}.`, 'error');
      }
      
      spinBtn.disabled = false;
    }, 1000);
  }, 2000);
}

// === JOGO DE BLACKJACK ===
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
  
  // Adicionar a transação como perdida inicialmente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Blackjack',
    amount: betAmount,
    status: 'Perdida'
  });
  
  // Limpar as mãos
  document.getElementById('dealer-hand').innerHTML = '';
  document.getElementById('player-hand').innerHTML = '';
  
  // Distribuir as cartas
  const dealerCard1 = getRandomCard();
  const dealerCard2 = getRandomCard();
  const playerCard1 = getRandomCard();
  const playerCard2 = getRandomCard();
  
  // Mostrar apenas a primeira carta do dealer
  addCardToHand('dealer', dealerCard1);
  addCardToHand('dealer', { value: '?', suit: '?' }, true); // Carta virada para baixo
  
  // Mostrar as duas cartas do jogador
  addCardToHand('player', playerCard1);
  addCardToHand('player', playerCard2);
  
  // Calcular pontuações
  const dealerScore = calculateScore([dealerCard1]);
  const playerScore = calculateScore([playerCard1, playerCard2]);
  
  document.getElementById('dealer-score').textContent = dealerScore;
  document.getElementById('player-score').textContent = playerScore;
  
  // Guardar a segunda carta do dealer para revelar depois
  document.getElementById('dealer-hand').dataset.hiddenCard = JSON.stringify(dealerCard2);
  
  // Ativar os botões de jogo
  document.getElementById('deal-btn').disabled = true;
  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;
  
  // Verificar se o jogador tem um blackjack
  if (playerScore === 21) {
    setTimeout(() => {
      standBlackjack();
    }, 1000);
  }
}

function hitBlackjack() {
  const card = getRandomCard();
  addCardToHand('player', card);
  
  const playerHand = getPlayerHand();
  const playerScore = calculateScore(playerHand);
  document.getElementById('player-score').textContent = playerScore;
  
  if (playerScore > 21) {
    // Jogador estourou
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    
    setTimeout(() => {
      showNotification('Você estourou! Perdeu a aposta.', 'error');
      document.getElementById('deal-btn').disabled = false;
    }, 1000);
  } else if (playerScore === 21) {
    // Jogador tem 21, automaticamente ficar
    setTimeout(() => {
      standBlackjack();
    }, 1000);
  }
}

function standBlackjack() {
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
  
  // Revelar a carta escondida do dealer
  const hiddenCardElement = document.querySelector('#dealer-hand .card:nth-child(2)');
  const hiddenCard = JSON.parse(document.getElementById('dealer-hand').dataset.hiddenCard);
  hiddenCardElement.innerHTML = getCardHTML(hiddenCard);
  hiddenCardElement.classList.remove('hidden-card');
  
  let dealerHand = [getCardFromHTML(document.querySelector('#dealer-hand .card:nth-child(1)')), hiddenCard];
  let dealerScore = calculateScore(dealerHand);
  document.getElementById('dealer-score').textContent = dealerScore;
  
  // Dealer pega cartas até ter pelo menos 17
  const drawCard = () => {
    if (dealerScore < 17) {
      setTimeout(() => {
        const card = getRandomCard();
        addCardToHand('dealer', card);
        dealerHand.push(card);
        dealerScore = calculateScore(dealerHand);
        document.getElementById('dealer-score').textContent = dealerScore;
        drawCard();
      }, 700);
    } else {
      // Determinar o vencedor
      setTimeout(() => {
        const playerScore = parseInt(document.getElementById('player-score').textContent);
        const betAmount = parseFloat(document.getElementById('blackjack-bet-amount').value);
        
        if (dealerScore > 21 || playerScore > dealerScore) {
          // Jogador ganha
          let multiplier = (playerScore === 21 && getPlayerHand().length === 2) ? 2.5 : 2; // Blackjack paga 3:2
          const winAmount = betAmount * multiplier;
          userBalance += winAmount;
          updateBalanceDisplay();
          
          // Atualizar a transação para 'Ganha'
          transactions.shift(); // Remove a transação 'Perdida'
          addTransaction({
            date: new Date(),
            type: 'Aposta',
            method: 'Blackjack',
            amount: winAmount,
            status: 'Ganha'
          });
          
          const message = (playerScore === 21 && getPlayerHand().length === 2) ? 
            `Blackjack! Você ganhou R$ ${winAmount.toFixed(2)}!` : 
            `Você ganhou R$ ${winAmount.toFixed(2)}!`;
          showNotification(message, 'success');
        } else if (playerScore === dealerScore) {
          // Empate
          userBalance += betAmount;
          updateBalanceDisplay();
          
          // Atualizar a transação para 'Empate'
          transactions.shift(); // Remove a transação 'Perdida'
          addTransaction({
            date: new Date(),
            type: 'Aposta',
            method: 'Blackjack',
            amount: betAmount,
            status: 'Empate'
          });
          
          showNotification('Empate! Sua aposta foi devolvida.', 'info');
        } else {
          // Dealer ganha
          showNotification('Dealer ganhou! Você perdeu a aposta.', 'error');
        }
        
        document.getElementById('deal-btn').disabled = false;
      }, 1000);
    }
  };
  
  drawCard();
}

function getRandomCard() {
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  
  return { value, suit };
}

function addCardToHand(player, card, hidden = false) {
  const hand = document.getElementById(`${player}-hand`);
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  if (hidden) {
    cardElement.classList.add('hidden-card');
    cardElement.innerHTML = '?';
  } else {
    cardElement.innerHTML = getCardHTML(card);
  }
  cardElement.classList.add('dealing');
  hand.appendChild(cardElement);
}

function getCardHTML(card) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  return `
    <div class="card-value" style="color: ${isRed ? 'red' : 'black'}">${card.value}</div>
    <div class="card-suit" style="color: ${isRed ? 'red' : 'black'}">${card.suit}</div>
  `;
}

function getCardFromHTML(cardElement) {
  const valueElement = cardElement.querySelector('.card-value');
  const suitElement = cardElement.querySelector('.card-suit');
  
  if (!valueElement || !suitElement) return { value: '?', suit: '?' };
  
  return {
    value: valueElement.textContent,
    suit: suitElement.textContent
  };
}

function getPlayerHand() {
  const cards = document.querySelectorAll('#player-hand .card');
  return Array.from(cards).map(card => getCardFromHTML(card));
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  
  cards.forEach(card => {
    if (card.value === 'A') {
      aces++;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10;
    } else if (card.value !== '?') {
      score += parseInt(card.value);
    }
  });
  
  // Ajustar o valor dos ases se necessário
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// === JOGO DE RASPADINHA ===
function initScratchCard() {
  document.getElementById('scratch-prize').textContent = '?';
  document.getElementById('scratch-overlay').style.opacity = '1';
  document.getElementById('scratch-overlay').style.display = 'flex';
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
  
  if (random < 0.01) { // 1% de chance de ganhar 50x
    prize = betAmount * 50;
  } else if (random < 0.05) { // 4% de chance de ganhar 10x
    prize = betAmount * 10;
  } else if (random < 0.15) { // 10% de chance de ganhar 5x
    prize = betAmount * 5;
  } else if (random < 0.30) { // 15% de chance de ganhar 2x
    prize = betAmount * 2;
  } else if (random < 0.50) { // 20% de chance de ganhar 1x (empate)
    prize = betAmount;
  }
  
  // Guardar o prêmio para revelar depois
  document.getElementById('scratch-prize').dataset.prize = prize.toFixed(2);
  
  // Resetar a raspadinha
  initScratchCard();
}

function scratchCard() {
  const overlay = document.getElementById('scratch-overlay');
  const prize = parseFloat(document.getElementById('scratch-prize').dataset.prize || 0);
  
  // Efeito de raspar
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
    document.getElementById('scratch-prize').textContent = prize > 0 ? `R$ ${prize.toFixed(2)}` : 'Não foi dessa vez!';
    
    // Atualizar o saldo e a transação se ganhou
    if (prize > 0) {
      userBalance += prize;
      updateBalanceDisplay();
      
      // Atualizar a transação
      transactions.pop(); // Remove a transação 'Pendente'
      const status = prize > parseFloat(document.getElementById('scratch-bet-amount').value) ? 'Ganha' : 'Empate';
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Raspadinha',
        amount: prize,
        status: status
      });
      
      if (status === 'Ganha') {
        showNotification(`Parabéns! Você ganhou R$ ${prize.toFixed(2)}!`, 'success');
      } else {
        showNotification('Empate! Sua aposta foi devolvida.', 'info');
      }
    } else {
      // Atualizar a transação para 'Perdida'
      transactions.pop(); // Remove a transação 'Pendente'
      addTransaction({
        date: new Date(),
        type: 'Aposta',
        method: 'Raspadinha',
        amount: parseFloat(document.getElementById('scratch-bet-amount').value),
        status: 'Perdida'
      });
      
      showNotification('Não foi dessa vez! Tente novamente.', 'error');
    }
  }, 500);
}

// === JOGO DE CAÇA-NÍQUEIS ===
function initSlots() {
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
  
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação como perdida inicialmente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Caça-níqueis',
    amount: betAmount,
    status: 'Perdida'
  });
  
  const spinBtn = document.getElementById('spin-slots-btn');
  spinBtn.disabled = true;
  
  // Símbolos possíveis
  const symbols = ['7', '💎', '🍒', '🍋', '🍊', '🍇', '⭐'];
  
  // Animação de giro
  const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
  ];
  
  reels.forEach(reel => reel.classList.add('spinning'));
  
  // Determinar os resultados
  const results = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
  
  // Parar os rolos um por um
  setTimeout(() => {
    reels[0].textContent = results[0];
    reels[0].classList.remove('spinning');
    
    setTimeout(() => {
      reels[1].textContent = results[1];
      reels[1].classList.remove('spinning');
      
      setTimeout(() => {
        reels[2].textContent = results[2];
        reels[2].classList.remove('spinning');
        
        // Verificar o resultado
        checkSlotsResult(results, betAmount);
        spinBtn.disabled = false;
      }, 500);
    }, 500);
  }, 1000);
}

function checkSlotsResult(results, betAmount) {
  // Verificar se todos os símbolos são iguais
  const allSame = results[0] === results[1] && results[1] === results[2];
  
  // Verificar se há dois símbolos iguais
  const twoSame = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];
  
  let multiplier = 0;
  
  if (allSame) {
    // Multiplicadores para três símbolos iguais
    switch (results[0]) {
      case '7': multiplier = 50; break;
      case '💎': multiplier = 20; break;
      case '⭐': multiplier = 15; break;
      case '🍇': multiplier = 10; break;
      case '🍊': multiplier = 8; break;
      case '🍋': multiplier = 5; break;
      case '🍒': multiplier = 3; break;
    }
  } else if (twoSame) {
    // Dois símbolos iguais
    multiplier = 1.5;
  }
  
  if (multiplier > 0) {
    const winAmount = betAmount * multiplier;
    userBalance += winAmount;
    updateBalanceDisplay();
    
    // Atualizar a transação para 'Ganha'
    transactions.shift(); // Remove a transação 'Perdida'
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Caça-níqueis',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}!`, 'success');
  } else {
    showNotification('Não foi dessa vez! Tente novamente.', 'error');
  }
}

// === JOGO DE CRASH ===
let crashInterval;
let crashMultiplier = 1.0;
let crashGameActive = false;

function initCrash() {
  document.getElementById('crash-multiplier').textContent = '1.00x';
  document.getElementById('start-crash-btn').disabled = false;
  document.getElementById('cashout-crash-btn').disabled = true;
  crashGameActive = false;
  if (crashInterval) clearInterval(crashInterval);
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
  
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação como perdida inicialmente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Crash',
    amount: betAmount,
    status: 'Perdida'
  });
  
  document.getElementById('start-crash-btn').disabled = true;
  document.getElementById('cashout-crash-btn').disabled = false;
  document.getElementById('crash-bet-amount').disabled = true;
  
  crashMultiplier = 1.0;
  crashGameActive = true;
  
  // Determinar quando o jogo vai "crashar"
  const crashPoint = generateCrashPoint();
  
  // Atualizar o multiplicador
  crashInterval = setInterval(() => {
    crashMultiplier += 0.01;
    document.getElementById('crash-multiplier').textContent = crashMultiplier.toFixed(2) + 'x';
    
    // Verificar se chegou ao ponto de crash
    if (crashMultiplier >= crashPoint) {
      endCrashGame(false);
    }
  }, 100);
}

function cashoutCrash() {
  if (!crashGameActive) return;
  endCrashGame(true);
}

function endCrashGame(cashout) {
  clearInterval(crashInterval);
  crashGameActive = false;
  document.getElementById('start-crash-btn').disabled = false;
  document.getElementById('cashout-crash-btn').disabled = true;
  document.getElementById('crash-bet-amount').disabled = false;
  
  if (cashout) {
    const betAmount = parseFloat(document.getElementById('crash-bet-amount').value);
    const winAmount = betAmount * crashMultiplier;
    userBalance += winAmount;
    updateBalanceDisplay();
    
    // Atualizar a transação para 'Ganha'
    transactions.shift(); // Remove a transação 'Perdida'
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Crash',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Você retirou R$ ${winAmount.toFixed(2)} com sucesso!`, 'success');
  } else {
    document.getElementById('crash-multiplier').innerHTML = `<span style="color: var(--danger-color);">CRASH!</span>`;
    showNotification('Crash! Você perdeu sua aposta.', 'error');
  }
}

function generateCrashPoint() {
  // Algoritmo para gerar o ponto de crash
  // Usando uma distribuição que favorece valores mais baixos
  const r = Math.random();
  return 1 + Math.pow(Math.random() * 10, r);
}

// === JOGO DE POKER ===
function initPoker() {
  // Placeholder para futura implementação
  showNotification('O jogo de Poker estará disponível em breve!', 'info');
}

// === FUNÇÕES UTILITÁRIAS ===
function updateBalanceDisplay() {
  const balanceElement = document.querySelector('.balance-amount');
  if (balanceElement) {
    balanceElement.textContent = `R$ ${userBalance.toFixed(2)}`;
  }
  
  // Atualizar o localStorage
  if (isLoggedIn) {
    const savedUser = JSON.parse(localStorage.getItem('infinitySlotsUser'));
    savedUser.balance = userBalance;
    localStorage.setItem('infinitySlotsUser', JSON.stringify(savedUser));
  }
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  if (transactions.length > 10) {
    transactions.pop();
  }
  
  updateTransactionHistory();
  
  // Atualizar o localStorage
  localStorage.setItem('infinitySlotsTransactions', JSON.stringify(transactions));
}

function updateTransactionHistory() {
  const transactionList = document.getElementById('transaction-list');
  if (!transactionList) return;
  
  transactionList.innerHTML = '';
  
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    
    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(transaction.date).toLocaleDateString('pt-BR');
    
    const typeCell = document.createElement('td');
    typeCell.textContent = transaction.type;
    
    const methodCell = document.createElement('td');
    methodCell.textContent = transaction.method;
    
    const amountCell = document.createElement('td');
    amountCell.textContent = `R$ ${transaction.amount.toFixed(2)}`;
    
    const statusCell = document.createElement('td');
    statusCell.textContent = transaction.status;
    
    if (transaction.status === 'Ganha') {
      statusCell.style.color = 'var(--success-color)';
    } else if (transaction.status === 'Perdida') {
      statusCell.style.color = 'var(--danger-color)';
    } else if (transaction.status === 'Em processamento') {
      statusCell.style.color = 'var(--warning-color)';
    }
    
    row.appendChild(dateCell);
    row.appendChild(typeCell);
    row.appendChild(methodCell);
    row.appendChild(amountCell);
    row.appendChild(statusCell);
    
    transactionList.appendChild(row);
  });
}

function addSampleTransactions() {
  const sampleTransactions = [
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      type: 'Depósito',
      method: 'PIX',
      amount: 100,
      status: 'Concluído'
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
      type: 'Aposta',
      method: 'Roleta',
      amount: 50,
      status: 'Ganha'
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      type: 'Aposta',
      method: 'Blackjack',
      amount: 25,
      status: 'Perdida'
    }
  ];
  
  sampleTransactions.forEach(transaction => {
    addTransaction(transaction);
  });
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = notification.querySelector('.notification-message');
  const notificationIcon = notification.querySelector('.notification-icon i');
  
  notificationMessage.textContent = message;
  
  // Remover classes anteriores
  notification.classList.remove('success', 'error', 'warning', 'info');
  
  // Adicionar a classe correta
  notification.classList.add(type);
  
  // Definir o ícone correto
  switch (type) {
    case 'success':
      notificationIcon.className = 'fas fa-check-circle';
      break;
    case 'error':
      notificationIcon.className = 'fas fa-times-circle';
      break;
    case 'warning':
      notificationIcon.className = 'fas fa-exclamation-triangle';
      break;
    default:
      notificationIcon.className = 'fas fa-info-circle';
  }
  
  // Mostrar a notificação
  notification.classList.add('show');
  
  // Esconder a notificação após 5 segundos
  setTimeout(closeNotification, 5000);
}

function closeNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('show');
}

// Adicionar efeitos de partículas quando disponível
document.addEventListener('DOMContentLoaded', function() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#9d4edd' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#9d4edd',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 1 } },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }
});

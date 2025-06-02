// Script para o Infinity Slots Casino - Versão Simplificada

// Variáveis globais
let userBalance = 0;
let isLoggedIn = false;
let selectedBet = null;
let transactions = [];
let currentGame = null;

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
  // Inicializar o menu mobile
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-active");
      hamburger.classList.toggle("toggle");
    });
  }
  
  // Inicializar as abas de conteúdo
  const tabLinks = document.querySelectorAll(".nav-links a[data-tab]");
  tabLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");
      switchContentTab(tabId);
    });
  });
  
  // Inicializar o modal de login
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  // Inicializar jogos (as funções init serão definidas abaixo)
  // Certifique-se de que os elementos HTML existem antes de chamar init
  if (document.getElementById("mines-game")) initMines();
  if (document.getElementById("roulette-game")) initRoulette();
  if (document.getElementById("blackjack-game")) initBlackjack();
  if (document.getElementById("scratch-game")) initScratch();
  if (document.getElementById("slots-game")) initSlots();
  if (document.getElementById("crash-game")) initCrash();
  if (document.getElementById("poker-game")) initPoker();
  if (document.getElementById("truco-game")) initTruco();
  if (document.getElementById("baccarat-game")) initBaccarat();
  
  // Atualizar exibição do saldo inicial
  updateBalanceDisplay();
});

// Funções de navegação
function switchContentTab(tabId) {
  // Remover classe active de todas as abas de painel
  document.querySelectorAll(".tab-panel").forEach(tab => {
    tab.classList.remove("active");
  });
  
  // Remover classe active de todos os links de navegação
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.remove("active");
  });
  
  // Adicionar classe active à aba de painel selecionada
  const targetTab = document.getElementById(`${tabId}-tab`);
  if (targetTab) {
    targetTab.classList.add("active");
  }
  
  // Destacar o link da navegação correspondente
  const navLink = document.querySelector(`.nav-links a[data-tab="${tabId}"]`);
  if (navLink) {
    navLink.classList.add("active");
  }
  
  // Fechar o menu mobile se estiver aberto
  const navLinks = document.querySelector(".nav-links");
  const hamburger = document.querySelector(".hamburger");
  if (navLinks && hamburger && navLinks.classList.contains("nav-active")) {
    navLinks.classList.remove("nav-active");
    hamburger.classList.remove("toggle");
  }
}

// Funções de autenticação
function openModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.style.display = "block";
    switchAuthTab("login");
  }
}

function closeModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function switchAuthTab(tabId) {
  document.querySelectorAll(".auth-tab-content").forEach(tab => {
    tab.classList.remove("active");
  });
  
  document.querySelectorAll(".modal-tabs .tab").forEach(tab => {
    tab.classList.remove("active");
  });
  
  const targetTabContent = document.getElementById(`${tabId}-tab`);
  if (targetTabContent) {
    targetTabContent.classList.add("active");
  }
  
  const targetTabButton = document.querySelector(`.modal-tabs .tab[onclick="switchAuthTab(\'${tabId}\')"]`);
  if (targetTabButton) {
    targetTabButton.classList.add("active");
  }
}

function login() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  
  if (!emailInput || !passwordInput) return;
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!email || !password) {
    showNotification("Por favor, preencha todos os campos", "error");
    return;
  }
  
  // Simulação de login bem-sucedido
  isLoggedIn = true;
  userBalance = 1000; // Saldo inicial
  updateBalanceDisplay();
  
  // Atualizar a interface
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.textContent = "Minha Conta";
  }
  
  // Fechar o modal
  closeModal();
  
  // Mostrar notificação
  showNotification("Login realizado com sucesso!", "success");
  
  // Adicionar algumas transações de exemplo
  addTransaction({
    date: new Date(),
    type: "Depósito",
    method: "PIX",
    amount: 1000,
    status: "Concluído"
  });
}

function register() {
  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm");
  
  if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  
  if (!name || !email || !password || !confirm) {
    showNotification("Por favor, preencha todos os campos", "error");
    return;
  }
  
  if (password !== confirm) {
    showNotification("As senhas não coincidem", "error");
    return;
  }
  
  // Simulação de registro bem-sucedido
  isLoggedIn = true;
  userBalance = 500; // Saldo inicial para novos usuários
  updateBalanceDisplay();
  
  // Atualizar a interface
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.textContent = "Minha Conta";
  }
  
  // Fechar o modal
  closeModal();
  
  // Mostrar notificação
  showNotification("Cadastro realizado com sucesso! Bônus de R$ 500 adicionado.", "success");
  
  // Adicionar transação de bônus
  addTransaction({
    date: new Date(),
    type: "Bônus",
    method: "Cadastro",
    amount: 500,
    status: "Concluído"
  });
}

// Funções de notificação
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const notificationMessage = document.querySelector(".notification-message");
  const notificationIcon = document.querySelector(".notification-icon i"); // Ícone foi removido do HTML, adaptar ou remover
  
  if (!notification || !notificationMessage) return;

  // Definir a mensagem
  notificationMessage.textContent = message;
  
  // Adicionar classes
  notification.className = "notification"; // Reset classes
  notification.classList.add(type);
  notification.classList.add("show");
  
  // Esconder após 5 segundos
  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}

function closeNotification() {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.classList.remove("show");
  }
}

// Funções de transação
function addTransaction(transaction) {
  transactions.unshift(transaction); // Adicionar no início do array
  updateTransactionList();
}

function updateTransactionList() {
  const transactionList = document.getElementById("transaction-list");
  if (!transactionList) return;
  
  transactionList.innerHTML = "";
  
  transactions.forEach(transaction => {
    const row = document.createElement("tr");
    
    // Formatar a data
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    
    // Definir a cor do status (usando classes CSS definidas em style.css)
    let statusClass = "";
    switch (transaction.status.toLowerCase()) {
      case "concluído":
      case "ganha":
        statusClass = "status-success";
        break;
      case "pendente":
        statusClass = "status-warning";
        break;
      case "perdida":
        statusClass = "status-error";
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
  const balanceElement = document.querySelector(".balance-amount");
  if (balanceElement) {
    balanceElement.textContent = `R$ ${userBalance.toFixed(2)}`;
  }
}

// Funções de depósito e saque
function processDeposit(method) {
  if (!isLoggedIn) {
    showNotification("Faça login para realizar um depósito", "warning");
    openModal();
    return;
  }
  
  let amountInput, formElement;
  let sender = "Usuário"; // Default sender
  
  if (method === "card") {
    const cardNumberInput = document.getElementById("card-number");
    const cardHolderInput = document.getElementById("card-holder");
    const expiryDateInput = document.getElementById("expiry-date");
    const cvvInput = document.getElementById("cvv");
    amountInput = document.getElementById("deposit-amount");
    formElement = document.getElementById("card-deposit-form");

    if (!cardNumberInput || !cardHolderInput || !expiryDateInput || !cvvInput || !amountInput || !formElement) return;

    const cardNumber = cardNumberInput.value;
    const cardHolder = cardHolderInput.value;
    const expiryDate = expiryDateInput.value;
    const cvv = cvvInput.value;
    const amount = parseFloat(amountInput.value);
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv || !amount) {
      showNotification("Por favor, preencha todos os campos do cartão", "error");
      return;
    }
    
    if (cardNumber.length < 16) { // Simple validation
      showNotification("Número de cartão inválido", "error");
      return;
    }
    sender = cardHolder;

  } else if (method === "pix") {
    amountInput = document.getElementById("pix-amount");
    const senderInput = document.getElementById("pix-sender");
    formElement = document.getElementById("pix-deposit-form");

    if (!amountInput || !senderInput || !formElement) return;

    const amount = parseFloat(amountInput.value);
    sender = senderInput.value;
    
    if (!amount || !sender) {
      showNotification("Por favor, preencha o valor e o nome do remetente PIX", "error");
      return;
    }
  } else {
      return; // Invalid method
  }

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
      showNotification("Valor de depósito inválido", "error");
      return;
  }
  
  // Simular processamento
  showNotification("Processando depósito...", "info");
  setTimeout(() => {
    // Adicionar ao saldo
    userBalance += amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: "Depósito",
      method: method === "card" ? "Cartão" : "PIX",
      amount: amount,
      status: "Concluído"
    });
    
    // Mostrar notificação
    showNotification(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`, "success");
    
    // Limpar formulário
    if (formElement) {
        formElement.reset();
    }
  }, 1500);
}

function processWithdraw() {
  if (!isLoggedIn) {
    showNotification("Faça login para realizar um saque", "warning");
    openModal();
    return;
  }
  
  const amountInput = document.getElementById("withdraw-amount");
  const pixKeyInput = document.getElementById("pix-key");
  const formElement = document.getElementById("withdraw-form");

  if (!amountInput || !pixKeyInput || !formElement) return;

  const amount = parseFloat(amountInput.value);
  const pixKey = pixKeyInput.value;
  
  if (isNaN(amount) || amount <= 0 || !pixKey) {
    showNotification("Por favor, preencha o valor e a chave PIX", "error");
    return;
  }
  
  if (amount > userBalance) {
    showNotification("Saldo insuficiente para realizar este saque", "error");
    return;
  }
  
  // Simular processamento
  showNotification("Processando saque...", "info");
  setTimeout(() => {
    // Deduzir do saldo
    userBalance -= amount;
    updateBalanceDisplay();
    
    // Adicionar à lista de transações
    addTransaction({
      date: new Date(),
      type: "Saque",
      method: "PIX",
      amount: amount,
      status: "Concluído"
    });
    
    // Mostrar notificação
    showNotification(`Saque de R$ ${amount.toFixed(2)} realizado com sucesso!`, "success");
    
    // Limpar formulário
    formElement.reset();
  }, 1500);
}

function copyPixCode() {
  const pixCodeInput = document.querySelector(".pix-code input");
  if (!pixCodeInput) return;
  const pixCode = pixCodeInput.value;
  navigator.clipboard.writeText(pixCode).then(() => {
    showNotification("Código PIX copiado para a área de transferência", "success");
  }).catch(err => {
      showNotification("Erro ao copiar código PIX", "error");
  });
}

// Funções de jogos
function openGame(game) {
  if (!isLoggedIn) {
    showNotification("Faça login para jogar", "warning");
    openModal();
    return;
  }
  
  // Esconder todas as áreas de jogo
  document.querySelectorAll(".game-container").forEach(container => {
    container.style.display = "none";
  });
  
  // Mostrar a área de jogo selecionada
  const gameContainer = document.getElementById(`${game}-game`);
  if (gameContainer) {
      gameContainer.style.display = "block";
  }
  
  // Mostrar a área principal de jogo
  const gameArea = document.getElementById("game-area");
  if (gameArea) {
      gameArea.style.display = "block";
  }
  
  // Definir o jogo atual
  currentGame = game;
  
  // Inicializar o jogo específico (as funções init devem resetar o estado do jogo)
  switch (game) {
    case "mines":
      if (typeof initMines === "function") initMines();
      break;
    case "roulette":
      if (typeof initRoulette === "function") initRoulette();
      break;
    case "blackjack":
      if (typeof initBlackjack === "function") initBlackjack();
      break;
    case "scratch":
      if (typeof initScratch === "function") initScratch();
      break;
    case "slots":
      if (typeof initSlots === "function") initSlots();
      break;
    case "crash":
      if (typeof initCrash === "function") initCrash();
      break;
    case "poker":
      if (typeof initPoker === "function") initPoker();
      break;
    case "truco":
      if (typeof initTruco === "function") initTruco();
      break;
    case "baccarat":
      if (typeof initBaccarat === "function") initBaccarat();
      break;
  }
}

function closeGame() {
  const gameArea = document.getElementById("game-area");
  if (gameArea) {
      gameArea.style.display = "none";
  }
  currentGame = null;
}

// --- Funções do Jogo Mina de Ouro --- 
let minesGrid = [];
let minesCount = 5;
let revealedCells = 0;
let minesGameActive = false;
let currentMinesMultiplier = 1;
let minesBetAmount = 1;

function initMines() {
  const minesGridElement = document.getElementById("mines-grid");
  if (!minesGridElement) return;
  
  minesGridElement.innerHTML = "";
  
  // Criar a grade 5x5
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.classList.add("mine-cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => revealCell(i));
    minesGridElement.appendChild(cell);
  }
  resetMinesGame(); // Resetar estado ao inicializar
}

function resetMinesGame() {
  minesGrid = [];
  revealedCells = 0;
  minesGameActive = false;
  currentMinesMultiplier = 1;
  
  // Resetar a interface
  document.querySelectorAll(".mine-cell").forEach(cell => {
    cell.classList.remove("revealed", "gem", "mine");
    cell.innerHTML = "";
    cell.style.pointerEvents = "auto"; // Re-enable clicks
  });
  
  const multiplierEl = document.getElementById("mines-multiplier");
  const nextPrizeEl = document.getElementById("mines-next-prize");
  const startBtn = document.getElementById("start-mines-btn");
  const cashoutBtn = document.getElementById("cashout-mines-btn");

  if (multiplierEl) multiplierEl.textContent = "1.00x";
  if (nextPrizeEl) nextPrizeEl.textContent = "R$ 0.00";
  if (startBtn) startBtn.disabled = false;
  if (cashoutBtn) cashoutBtn.disabled = true;
}

function startMinesGame() {
  const betAmountInput = document.getElementById("mines-bet-amount");
  if (!betAmountInput) return;
  minesBetAmount = parseFloat(betAmountInput.value);
  
  if (isNaN(minesBetAmount) || minesBetAmount <= 0) {
    showNotification("O valor da aposta deve ser maior que zero", "error");
    return;
  }
  
  if (minesBetAmount > userBalance) {
    showNotification("Saldo insuficiente para realizar esta aposta", "error");
    return;
  }
  
  // Deduzir a aposta do saldo
  userBalance -= minesBetAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação
  addTransaction({
    date: new Date(),
    type: "Aposta",
    method: "Mina de Ouro",
    amount: minesBetAmount,
    status: "Pendente"
  });
  
  // Gerar a grade
  minesGrid = Array(25).fill("gem");
  
  // Colocar as minas aleatoriamente
  let minesPlaced = 0;
  while (minesPlaced < minesCount) {
    const position = Math.floor(Math.random() * 25);
    if (minesGrid[position] !== "mine") {
      minesGrid[position] = "mine";
      minesPlaced++;
    }
  }
  
  // Atualizar a interface
  resetMinesGame(); // Limpa a grade visualmente antes de começar
  minesGameActive = true;
  document.getElementById("start-mines-btn").disabled = true;
  document.getElementById("cashout-mines-btn").disabled = false;
  document.getElementById("mines-next-prize").textContent = `R$ ${(minesBetAmount * 1.2).toFixed(2)}`; // Exemplo de próximo prêmio
}

function revealCell(index) {
  if (!minesGameActive) return;
  
  const cell = document.querySelector(`.mine-cell[data-index="${index}"]`);
  
  if (!cell || cell.classList.contains("revealed")) return;
  
  const cellType = minesGrid[index];
  
  cell.classList.add("revealed");
  cell.style.pointerEvents = "none"; // Disable click after reveal
  
  if (cellType === "gem") {
    // Encontrou uma joia
    cell.classList.add("gem");
    cell.innerHTML = "💎"; // Usar emoji ou classe CSS para ícone
    
    revealedCells++;
    
    // Aumentar o multiplicador (exemplo simples)
    currentMinesMultiplier = calculateMinesMultiplier(revealedCells);
    document.getElementById("mines-multiplier").textContent = `${currentMinesMultiplier.toFixed(2)}x`;
    
    // Calcular o próximo prêmio
    const nextPrize = minesBetAmount * currentMinesMultiplier;
    document.getElementById("mines-next-prize").textContent = `R$ ${nextPrize.toFixed(2)}`;
    
    // Verificar se todas as joias foram encontradas
    if (revealedCells === 25 - minesCount) {
        showNotification("Você encontrou todas as joias!", "success");
        cashoutMines();
    }
  } else {
    // Encontrou uma mina
    cell.classList.add("mine");
    cell.innerHTML = "💣"; // Usar emoji ou classe CSS para ícone
    
    // Revelar todas as minas
    minesGrid.forEach((type, i) => {
      if (type === "mine") {
        const mineCell = document.querySelector(`.mine-cell[data-index="${i}"]`);
        if (mineCell && !mineCell.classList.contains("revealed")) {
            mineCell.classList.add("revealed", "mine");
            mineCell.innerHTML = "💣";
            mineCell.style.pointerEvents = "none";
        }
      }
    });
    
    // Fim de jogo
    minesGameActive = false;
    document.getElementById("cashout-mines-btn").disabled = true;
    showNotification("Você encontrou uma mina! Fim de jogo.", "error");
    
    // Atualizar transação para perdida
    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Mina de Ouro" && t.status === "Pendente");
    if (pendingTransactionIndex !== -1) {
        transactions[pendingTransactionIndex].status = "Perdida";
        updateTransactionList();
    }
  }
}

function calculateMinesMultiplier(gemsFound) {
    // Fórmula de exemplo para multiplicador - ajuste conforme necessário
    if (gemsFound === 0) return 1;
    return parseFloat((1 + gemsFound * 0.2).toFixed(2)); 
}

function cashoutMines() {
  if (!minesGameActive) return;
  
  const winAmount = minesBetAmount * currentMinesMultiplier;
  
  // Adicionar ganho ao saldo
  userBalance += winAmount;
  updateBalanceDisplay();
  
  // Atualizar transação
  const pendingTransactionIndex = transactions.findIndex(t => t.method === "Mina de Ouro" && t.status === "Pendente");
  if (pendingTransactionIndex !== -1) {
      transactions[pendingTransactionIndex].status = "Ganha";
      transactions[pendingTransactionIndex].amount = winAmount; // Atualiza o valor ganho
      updateTransactionList();
  } else {
      // Adiciona uma nova transação se a pendente não for encontrada (improvável)
      addTransaction({
          date: new Date(),
          type: "Ganho",
          method: "Mina de Ouro",
          amount: winAmount,
          status: "Ganha"
      });
  }
  
  showNotification(`Você retirou R$ ${winAmount.toFixed(2)}!`, "success");
  
  // Finalizar o jogo
  minesGameActive = false;
  document.getElementById("start-mines-btn").disabled = false;
  document.getElementById("cashout-mines-btn").disabled = true;
  
  // Revelar minas restantes (opcional)
   minesGrid.forEach((type, i) => {
      if (type === "mine") {
        const mineCell = document.querySelector(`.mine-cell[data-index="${i}"]`);
        if (mineCell && !mineCell.classList.contains("revealed")) {
            mineCell.classList.add("revealed", "mine");
            mineCell.innerHTML = "💣";
            mineCell.style.pointerEvents = "none";
        }
      }
    });
}

// --- Funções do Jogo Roleta --- 
let rouletteBetAmount = 1;
let selectedRouletteBet = null;
let isSpinning = false;
const rouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]; // Ordem da roleta europeia
const numberColors = {
    0: "green", 1: "red", 2: "black", 3: "red", 4: "black", 5: "red", 6: "black", 7: "red", 8: "black", 9: "red", 10: "black", 11: "black", 12: "red", 13: "black", 14: "red", 15: "black", 16: "red", 17: "black", 18: "red", 19: "red", 20: "black", 21: "red", 22: "black", 23: "red", 24: "black", 25: "red", 26: "black", 27: "red", 28: "black", 29: "black", 30: "red", 31: "black", 32: "red", 33: "black", 34: "red", 35: "black", 36: "red"
};

function initRoulette() {
    // Resetar estado visual e lógico
    selectedRouletteBet = null;
    isSpinning = false;
    const resultEl = document.getElementById("roulette-result");
    const spinBtn = document.getElementById("spin-roulette-btn");
    const wheel = document.getElementById("roulette-wheel");

    if(resultEl) resultEl.textContent = "Faça sua aposta";
    if(spinBtn) spinBtn.disabled = true;
    if(wheel) wheel.style.transform = "rotate(0deg)";

    document.querySelectorAll(".roulette-betting .bet-option").forEach(btn => {
        btn.classList.remove("selected");
        btn.disabled = false;
    });
    const betInput = document.getElementById("roulette-bet-amount");
    if(betInput) betInput.disabled = false;
}

function selectRouletteBet(betType) {
    if (isSpinning) return;
    selectedRouletteBet = betType;
    
    // Atualizar UI para mostrar seleção
    document.querySelectorAll(".roulette-betting .bet-option").forEach(btn => {
        btn.classList.remove("selected");
    });
    const selectedBtn = document.querySelector(`.roulette-betting .bet-option[data-bet="${betType}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add("selected");
    }
    
    // Habilitar botão de girar
    document.getElementById("spin-roulette-btn").disabled = false;
}

function spinRoulette() {
    if (isSpinning || !selectedRouletteBet) return;

    const betAmountInput = document.getElementById("roulette-bet-amount");
    if (!betAmountInput) return;
    rouletteBetAmount = parseFloat(betAmountInput.value);

    if (isNaN(rouletteBetAmount) || rouletteBetAmount <= 0) {
        showNotification("Valor da aposta inválido", "error");
        return;
    }

    if (rouletteBetAmount > userBalance) {
        showNotification("Saldo insuficiente", "error");
        return;
    }

    isSpinning = true;
    userBalance -= rouletteBetAmount;
    updateBalanceDisplay();
    addTransaction({
        date: new Date(),
        type: "Aposta",
        method: "Roleta",
        amount: rouletteBetAmount,
        status: "Pendente"
    });

    // Desabilitar controles durante o giro
    document.getElementById("spin-roulette-btn").disabled = true;
    document.querySelectorAll(".roulette-betting .bet-option").forEach(btn => btn.disabled = true);
    betAmountInput.disabled = true;
    document.getElementById("roulette-result").textContent = "Girando...";

    // Simular giro
    const wheel = document.getElementById("roulette-wheel");
    const landingNumberIndex = Math.floor(Math.random() * rouletteNumbers.length);
    const landingNumber = rouletteNumbers[landingNumberIndex];
    const degreesPerNumber = 360 / rouletteNumbers.length;
    const randomOffset = Math.random() * degreesPerNumber - (degreesPerNumber / 2);
    const totalRotation = 360 * 5 + (degreesPerNumber * landingNumberIndex * -1) + randomOffset; // 5 voltas + posição final

    wheel.style.transition = "transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)";
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    // Após a animação
    setTimeout(() => {
        isSpinning = false;
        document.getElementById("roulette-result").textContent = `Número: ${landingNumber} (${numberColors[landingNumber]})`;
        
        // Verificar resultado da aposta
        checkRouletteWin(landingNumber);

        // Reabilitar controles para nova rodada
        initRoulette(); // Reseta para o estado inicial

    }, 5100); // Tempo um pouco maior que a animação
}

function checkRouletteWin(winningNumber) {
    let playerWins = false;
    let payoutMultiplier = 0;
    const color = numberColors[winningNumber];
    const isOdd = winningNumber % 2 !== 0;
    const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
    const isLow = winningNumber >= 1 && winningNumber <= 18;
    const isHigh = winningNumber >= 19 && winningNumber <= 36;

    switch (selectedRouletteBet) {
        case "red": playerWins = color === "red"; payoutMultiplier = 2; break;
        case "black": playerWins = color === "black"; payoutMultiplier = 2; break;
        case "green": playerWins = color === "green"; payoutMultiplier = 36; break;
        case "odd": playerWins = isOdd; payoutMultiplier = 2; break;
        case "even": playerWins = isEven; payoutMultiplier = 2; break;
        case "1-18": playerWins = isLow; payoutMultiplier = 2; break;
        case "19-36": playerWins = isHigh; payoutMultiplier = 2; break;
        // Adicionar apostas em números específicos se desejar
    }

    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Roleta" && t.status === "Pendente");
    let winAmount = 0;

    if (playerWins) {
        winAmount = rouletteBetAmount * payoutMultiplier;
        userBalance += winAmount;
        updateBalanceDisplay();
        showNotification(`Você ganhou R$ ${winAmount.toFixed(2)}!`, "success");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Ganha";
            transactions[pendingTransactionIndex].amount = winAmount; // Atualiza para o valor ganho
        }
    } else {
        showNotification("Você perdeu a aposta.", "error");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Perdida";
        }
    }
    updateTransactionList();
}

// --- Funções do Jogo Blackjack --- 
let blackjackDeck = [];
let playerBlackjackHand = [];
let dealerBlackjackHand = [];
let blackjackBetAmount = 1;
let blackjackGameActive = false;

const BJ_SUITS = ["♠", "♥", "♦", "♣"];
const BJ_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getCardValue(card) {
    if (["J", "Q", "K"].includes(card.value)) return 10;
    if (card.value === "A") return 11; // Ace pode ser 1 ou 11
    return parseInt(card.value);
}

function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    hand.forEach(card => {
        value += getCardValue(card);
        if (card.value === "A") aceCount++;
    });
    // Ajustar valor do Ás se necessário
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
}

function createBlackjackDeck() {
    const deck = [];
    for (let i = 0; i < 4; i++) { // Usar 4 baralhos
        BJ_SUITS.forEach(suit => {
            BJ_VALUES.forEach(value => {
                deck.push({ suit, value });
            });
        });
    }
    // Embaralhar
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function initBlackjack() {
    blackjackDeck = createBlackjackDeck();
    playerBlackjackHand = [];
    dealerBlackjackHand = [];
    blackjackGameActive = false;

    document.getElementById("player-hand").innerHTML = "";
    document.getElementById("dealer-hand").innerHTML = "";
    document.getElementById("player-score").textContent = "0";
    document.getElementById("dealer-score").textContent = "0";
    document.getElementById("blackjack-message").textContent = "Faça sua aposta e clique em Distribuir";
    
    document.getElementById("deal-blackjack-btn").disabled = false;
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("blackjack-bet-amount").disabled = false;
}

function dealBlackjack() {
    const betInput = document.getElementById("blackjack-bet-amount");
    if (!betInput) return;
    blackjackBetAmount = parseFloat(betInput.value);

    if (isNaN(blackjackBetAmount) || blackjackBetAmount <= 0) {
        showNotification("Valor da aposta inválido", "error");
        return;
    }
    if (blackjackBetAmount > userBalance) {
        showNotification("Saldo insuficiente", "error");
        return;
    }

    userBalance -= blackjackBetAmount;
    updateBalanceDisplay();
    addTransaction({
        date: new Date(),
        type: "Aposta",
        method: "Blackjack",
        amount: blackjackBetAmount,
        status: "Pendente"
    });

    initBlackjack(); // Reseta o jogo antes de distribuir
    blackjackGameActive = true;
    betInput.disabled = true;
    document.getElementById("deal-blackjack-btn").disabled = true;
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;

    // Distribuir cartas
    playerBlackjackHand.push(blackjackDeck.pop());
    dealerBlackjackHand.push(blackjackDeck.pop());
    playerBlackjackHand.push(blackjackDeck.pop());
    dealerBlackjackHand.push(blackjackDeck.pop());

    updateBlackjackUI(true); // Esconder segunda carta do dealer

    const playerScore = calculateHandValue(playerBlackjackHand);
    if (playerScore === 21) {
        document.getElementById("blackjack-message").textContent = "Blackjack! Você ganhou!";
        endBlackjackGame(true, true);
    } else {
        document.getElementById("blackjack-message").textContent = "Sua vez: Peça carta ou Mantenha";
    }
}

function updateBlackjackUI(hideDealerCard = false) {
    const playerHandEl = document.getElementById("player-hand");
    const dealerHandEl = document.getElementById("dealer-hand");
    playerHandEl.innerHTML = "";
    dealerHandEl.innerHTML = "";

    playerBlackjackHand.forEach(card => playerHandEl.appendChild(createCardElement(card)));
    dealerBlackjackHand.forEach((card, index) => {
        if (index === 1 && hideDealerCard) {
            dealerHandEl.appendChild(createCardElement(card, true)); // Carta virada
        } else {
            dealerHandEl.appendChild(createCardElement(card));
        }
    });

    document.getElementById("player-score").textContent = calculateHandValue(playerBlackjackHand);
    // Só mostra o score real do dealer no final
    if (!hideDealerCard) {
        document.getElementById("dealer-score").textContent = calculateHandValue(dealerBlackjackHand);
    } else {
         document.getElementById("dealer-score").textContent = getCardValue(dealerBlackjackHand[0]); // Mostra só a primeira
    }
}

function createCardElement(card, isHidden = false) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    if (isHidden) {
        cardDiv.classList.add("card-back");
        cardDiv.innerHTML = 
            `<div class="card-back-design"></div>`;
    } else {
        const isRed = ["♥", "♦"].includes(card.suit);
        cardDiv.innerHTML = `
            <div class="card-value ${isRed ? "red" : "black"}">${card.value}</div>
            <div class="card-suit ${isRed ? "red" : "black"}">${card.suit}</div>
        `;
    }
    return cardDiv;
}

function hit() {
    if (!blackjackGameActive) return;
    playerBlackjackHand.push(blackjackDeck.pop());
    updateBlackjackUI(true);
    const playerScore = calculateHandValue(playerBlackjackHand);
    if (playerScore > 21) {
        document.getElementById("blackjack-message").textContent = "Você estourou! Dealer vence.";
        endBlackjackGame(false);
    } else if (playerScore === 21) {
        stand(); // Jogador atingiu 21, passa a vez
    }
}

function stand() {
    if (!blackjackGameActive) return;
    blackjackGameActive = false; // Fim do turno do jogador
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;

    // Revelar carta do dealer e jogar
    updateBlackjackUI(false);
    let dealerScore = calculateHandValue(dealerBlackjackHand);
    
    // Dealer deve pedir carta até 17 ou mais
    while (dealerScore < 17) {
        dealerBlackjackHand.push(blackjackDeck.pop());
        dealerScore = calculateHandValue(dealerBlackjackHand);
        updateBlackjackUI(false);
    }

    // Determinar vencedor
    const playerScore = calculateHandValue(playerBlackjackHand);
    if (dealerScore > 21) {
        document.getElementById("blackjack-message").textContent = "Dealer estourou! Você ganhou!";
        endBlackjackGame(true);
    } else if (dealerScore > playerScore) {
        document.getElementById("blackjack-message").textContent = "Dealer vence!";
        endBlackjackGame(false);
    } else if (playerScore > dealerScore) {
        document.getElementById("blackjack-message").textContent = "Você ganhou!";
        endBlackjackGame(true);
    } else {
        document.getElementById("blackjack-message").textContent = "Empate!";
        endBlackjackGame(false, false, true); // Empate
    }
}

function endBlackjackGame(playerWins, isBlackjack = false, isPush = false) {
    blackjackGameActive = false;
    document.getElementById("deal-blackjack-btn").disabled = false;
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("blackjack-bet-amount").disabled = false;

    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Blackjack" && t.status === "Pendente");
    let winAmount = 0;

    if (isPush) {
        // Empate, devolver aposta
        userBalance += blackjackBetAmount;
        updateBalanceDisplay();
        showNotification("Empate! Aposta devolvida.", "info");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Empate";
            transactions[pendingTransactionIndex].amount = 0; // Valor ganho é 0
        }
    } else if (playerWins) {
        winAmount = isBlackjack ? blackjackBetAmount * 2.5 : blackjackBetAmount * 2; // Pagamento 3:2 para Blackjack
        userBalance += winAmount;
        updateBalanceDisplay();
        showNotification(`Você ganhou R$ ${winAmount.toFixed(2)}!`, "success");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Ganha";
            transactions[pendingTransactionIndex].amount = winAmount;
        }
    } else {
        showNotification("Você perdeu a aposta.", "error");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Perdida";
        }
    }
    updateTransactionList();
}

// --- Funções do Jogo Raspadinha --- 
let scratchCardPrize = 0;
let scratchBetAmount = 1;
let scratchCtx = null;
let isScratching = false;
let scratchCardRevealed = false;

function initScratch() {
    const canvas = document.getElementById("scratch-card-overlay");
    if (!canvas) return;
    scratchCtx = canvas.getContext("2d");
    newScratchCard(); // Prepara a primeira raspadinha

    // Event listeners para raspar
    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", endScratch);
    canvas.addEventListener("mouseleave", endScratch);
    // Touch events
    canvas.addEventListener("touchstart", startScratch, { passive: true });
    canvas.addEventListener("touchmove", scratch, { passive: true });
    canvas.addEventListener("touchend", endScratch);
}

function newScratchCard() {
    const betInput = document.getElementById("scratch-bet-amount");
    if (!betInput) return;
    scratchBetAmount = parseFloat(betInput.value);

    if (isNaN(scratchBetAmount) || scratchBetAmount <= 0) {
        showNotification("Valor da aposta inválido", "error");
        return;
    }
    if (scratchBetAmount > userBalance) {
        showNotification("Saldo insuficiente", "error");
        return;
    }

    userBalance -= scratchBetAmount;
    updateBalanceDisplay();
    addTransaction({
        date: new Date(),
        type: "Aposta",
        method: "Raspadinha",
        amount: scratchBetAmount,
        status: "Pendente"
    });

    // Determinar prêmio (simulação)
    const winProbability = 0.3; // 30% de chance de ganhar
    if (Math.random() < winProbability) {
        scratchCardPrize = scratchBetAmount * (Math.floor(Math.random() * 5) + 2); // Ganho de 2x a 6x
    } else {
        scratchCardPrize = 0;
    }

    // Atualizar UI
    document.getElementById("scratch-card-prize").textContent = `R$ ${scratchCardPrize.toFixed(2)}`;
    document.getElementById("scratch-message").textContent = "Raspe para revelar seu prêmio!";
    document.getElementById("new-scratch-btn").disabled = true;
    scratchCardRevealed = false;

    // Redesenhar a camada de raspagem
    if (scratchCtx) {
        const canvas = scratchCtx.canvas;
        scratchCtx.globalCompositeOperation = "source-over"; // Reset composite operation
        scratchCtx.fillStyle = "#777"; // Cor da camada de raspagem
        scratchCtx.fillRect(0, 0, canvas.width, canvas.height);
        // Adicionar texto sobre a camada
        scratchCtx.fillStyle = "#fff";
        scratchCtx.font = "bold 20px sans-serif";
        scratchCtx.textAlign = "center";
        scratchCtx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2);
    }
}

function getScratchPos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startScratch(e) {
    if (scratchCardRevealed) return;
    isScratching = true;
    scratch(e); // Começa a raspar imediatamente
}

function scratch(e) {
    if (!isScratching || scratchCardRevealed || !scratchCtx) return;
    e.preventDefault(); // Prevenir scroll em touch
    const pos = getScratchPos(scratchCtx.canvas, e);
    
    // Configurar o "pincel" de raspagem
    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.beginPath();
    scratchCtx.arc(pos.x, pos.y, 20, 0, Math.PI * 2, false); // Raio da raspagem
    scratchCtx.fill();

    // Verificar quanto foi raspado (aproximado)
    checkScratchCompletion();
}

function endScratch() {
    isScratching = false;
}

function checkScratchCompletion() {
    if (!scratchCtx || scratchCardRevealed) return;
    const canvas = scratchCtx.canvas;
    const imageData = scratchCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Contar pixels transparentes (alpha = 0)
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparentPixels++;
        }
    }

    const totalPixels = canvas.width * canvas.height;
    const revealedPercentage = (transparentPixels / totalPixels) * 100;

    if (revealedPercentage > 70) { // Considerar revelado se mais de 70% foi raspado
        revealScratchCard();
    }
}

function revealScratchCard() {
    if (scratchCardRevealed) return;
    scratchCardRevealed = true;
    isScratching = false; // Parar de raspar

    // Limpar completamente a camada de raspagem
    if (scratchCtx) {
        const canvas = scratchCtx.canvas;
        scratchCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Atualizar saldo e transação
    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Raspadinha" && t.status === "Pendente");
    if (scratchCardPrize > 0) {
        userBalance += scratchCardPrize;
        updateBalanceDisplay();
        showNotification(`Você ganhou R$ ${scratchCardPrize.toFixed(2)}!`, "success");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Ganha";
            transactions[pendingTransactionIndex].amount = scratchCardPrize;
        }
    } else {
        showNotification("Não foi dessa vez! Tente novamente.", "error");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Perdida";
        }
    }
    updateTransactionList();

    document.getElementById("scratch-message").textContent = scratchCardPrize > 0 ? `Prêmio: R$ ${scratchCardPrize.toFixed(2)}` : "Sem prêmio.";
    document.getElementById("new-scratch-btn").disabled = false;
}

// --- Funções do Jogo Caça-níqueis --- 
const slotSymbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "🔔", "💰"];
let slotsBetAmount = 1;
let isSpinningSlots = false;

function initSlots() {
    // Resetar rolos
    document.getElementById("reel1").textContent = "?";
    document.getElementById("reel2").textContent = "?";
    document.getElementById("reel3").textContent = "?";
    document.getElementById("slots-message").textContent = "Faça sua aposta e gire!";
    document.getElementById("spin-slots-btn").disabled = false;
    isSpinningSlots = false;
}

function spinSlots() {
    if (isSpinningSlots) return;

    const betInput = document.getElementById("slots-bet-amount");
    if (!betInput) return;
    slotsBetAmount = parseFloat(betInput.value);

    if (isNaN(slotsBetAmount) || slotsBetAmount <= 0) {
        showNotification("Valor da aposta inválido", "error");
        return;
    }
    if (slotsBetAmount > userBalance) {
        showNotification("Saldo insuficiente", "error");
        return;
    }

    isSpinningSlots = true;
    userBalance -= slotsBetAmount;
    updateBalanceDisplay();
    addTransaction({
        date: new Date(),
        type: "Aposta",
        method: "Caça-níqueis",
        amount: slotsBetAmount,
        status: "Pendente"
    });

    document.getElementById("spin-slots-btn").disabled = true;
    document.getElementById("slots-message").textContent = "Girando...";

    const reels = [document.getElementById("reel1"), document.getElementById("reel2"), document.getElementById("reel3")];
    let spinCount = 0;
    const maxSpins = 15 + Math.floor(Math.random() * 10); // Número aleatório de "giros" visuais
    const finalSymbols = [
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
    ];

    const spinInterval = setInterval(() => {
        reels.forEach((reel, index) => {
            if (spinCount < maxSpins - (index * 3)) { // Parar rolos sequencialmente
                reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            } else {
                reel.textContent = finalSymbols[index];
            }
        });
        spinCount++;
        if (spinCount >= maxSpins + 5) { // Parar após todos os rolos definidos
            clearInterval(spinInterval);
            checkSlotsWin(finalSymbols);
            isSpinningSlots = false;
            document.getElementById("spin-slots-btn").disabled = false;
        }
    }, 100);
}

function checkSlotsWin(symbols) {
    let winMultiplier = 0;
    const [s1, s2, s3] = symbols;

    // Regras de premiação (exemplo)
    if (s1 === s2 && s2 === s3) {
        if (s1 === "💰") winMultiplier = 50;
        else if (s1 === "⭐") winMultiplier = 20;
        else if (s1 === "🔔") winMultiplier = 15;
        else if (s1 === "🍉") winMultiplier = 10;
        else winMultiplier = 5; // Para frutas iguais
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        if ((s1 === "🍒" && s2 === "🍒") || (s2 === "🍒" && s3 === "🍒") || (s1 === "🍒" && s3 === "🍒")) {
             winMultiplier = 2; // Duas cerejas pagam
        }
    } else if (symbols.includes("🍒")) {
         winMultiplier = 1; // Uma cereja paga
    }

    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Caça-níqueis" && t.status === "Pendente");
    if (winMultiplier > 0) {
        const winAmount = slotsBetAmount * winMultiplier;
        userBalance += winAmount;
        updateBalanceDisplay();
        document.getElementById("slots-message").textContent = `Você ganhou R$ ${winAmount.toFixed(2)}!`;
        showNotification(`Você ganhou R$ ${winAmount.toFixed(2)}!`, "success");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Ganha";
            transactions[pendingTransactionIndex].amount = winAmount;
        }
    } else {
        document.getElementById("slots-message").textContent = "Sem sorte! Tente novamente.";
        showNotification("Você perdeu a aposta.", "error");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Perdida";
        }
    }
    updateTransactionList();
}

// --- Funções do Jogo Crash --- 
let crashBetAmount = 1;
let crashMultiplier = 1.00;
let crashGameActive = false;
let crashInterval = null;
let hasCashedOut = false;

function initCrash() {
    resetCrashGame();
}

function resetCrashGame() {
    crashMultiplier = 1.00;
    crashGameActive = false;
    hasCashedOut = false;
    if (crashInterval) clearInterval(crashInterval);

    document.getElementById("crash-multiplier").textContent = "1.00x";
    document.getElementById("crash-message").textContent = "Faça sua aposta e inicie o jogo";
    document.getElementById("start-crash-btn").disabled = false;
    document.getElementById("cashout-crash-btn").disabled = true;
    document.getElementById("crash-bet-amount").disabled = false;
    document.getElementById("crash-graph").classList.remove("crashing");
}

function startCrashGame() {
    const betInput = document.getElementById("crash-bet-amount");
    if (!betInput) return;
    crashBetAmount = parseFloat(betInput.value);

    if (isNaN(crashBetAmount) || crashBetAmount <= 0) {
        showNotification("Valor da aposta inválido", "error");
        return;
    }
    if (crashBetAmount > userBalance) {
        showNotification("Saldo insuficiente", "error");
        return;
    }

    resetCrashGame(); // Garante que o estado está limpo
    crashGameActive = true;
    hasCashedOut = false;
    userBalance -= crashBetAmount;
    updateBalanceDisplay();
    addTransaction({
        date: new Date(),
        type: "Aposta",
        method: "Crash",
        amount: crashBetAmount,
        status: "Pendente"
    });

    document.getElementById("start-crash-btn").disabled = true;
    document.getElementById("cashout-crash-btn").disabled = false;
    document.getElementById("crash-bet-amount").disabled = true;
    document.getElementById("crash-message").textContent = "Multiplicador subindo...";

    // Simular aumento do multiplicador
    crashInterval = setInterval(() => {
        // Lógica de crash (exemplo simples)
        const crashChance = 0.01 * Math.pow(crashMultiplier, 1.1); // Chance aumenta com multiplicador
        if (Math.random() < crashChance) {
            crashGame();
        } else {
            crashMultiplier += 0.01 * Math.pow(crashMultiplier, 0.5); // Aumento desacelera
            document.getElementById("crash-multiplier").textContent = `${crashMultiplier.toFixed(2)}x`;
        }
    }, 100);
}

function crashGame() {
    if (!crashGameActive) return; // Evitar crash duplo
    clearInterval(crashInterval);
    crashGameActive = false;
    document.getElementById("cashout-crash-btn").disabled = true;
    document.getElementById("start-crash-btn").disabled = false; // Habilitar para nova rodada
    document.getElementById("crash-bet-amount").disabled = false;
    document.getElementById("crash-graph").classList.add("crashing");
    document.getElementById("crash-message").textContent = `Crash! Multiplicador parou em ${crashMultiplier.toFixed(2)}x`;

    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Crash" && t.status === "Pendente");
    if (!hasCashedOut) {
        showNotification("Você não retirou a tempo!", "error");
        if (pendingTransactionIndex !== -1) {
            transactions[pendingTransactionIndex].status = "Perdida";
        }
    } // Se já retirou, a transação foi atualizada em cashoutCrash
    updateTransactionList();
}

function cashoutCrash() {
    if (!crashGameActive || hasCashedOut) return;
    hasCashedOut = true;
    clearInterval(crashInterval); // Para o aumento do multiplicador
    document.getElementById("cashout-crash-btn").disabled = true;
    // Botão de iniciar será habilitado quando o jogo crashar ou resetar

    const winAmount = crashBetAmount * crashMultiplier;
    userBalance += winAmount;
    updateBalanceDisplay();

    const pendingTransactionIndex = transactions.findIndex(t => t.method === "Crash" && t.status === "Pendente");
    if (pendingTransactionIndex !== -1) {
        transactions[pendingTransactionIndex].status = "Ganha";
        transactions[pendingTransactionIndex].amount = winAmount;
    }
    updateTransactionList();

    document.getElementById("crash-message").textContent = `Você retirou em ${crashMultiplier.toFixed(2)}x! Ganhou R$ ${winAmount.toFixed(2)}`;
    showNotification(`Você retirou R$ ${winAmount.toFixed(2)}!`, "success");
    
    // O jogo continua até crashar para outros jogadores (simulado)
    // Mas para este jogador, a rodada acabou
    // Poderia adicionar um delay e depois chamar resetCrashGame()
    setTimeout(resetCrashGame, 3000); // Resetar após 3 segundos
}

// --- Funções do Jogo Poker --- 
// (Código de poker_functions.js será inserido aqui)

// --- Funções do Jogo Truco --- 
// (Código de truco_functions.js será inserido aqui)

// --- Funções do Jogo Baccarat --- 
// (Código de baccarat_functions.js será inserido aqui)



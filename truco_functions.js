// Funções para o jogo de Truco

// Constantes
const TRUCO_SUITS = ['♦', '♥', '♣', '♠'];
const TRUCO_VALUES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const TRUCO_CARD_STRENGTH = {
  '3': 10,
  '2': 9,
  'A': 8,
  'K': 7,
  'J': 6,
  'Q': 5,
  '7': 4,
  '6': 3,
  '5': 2,
  '4': 1
};

// Variáveis do jogo
let trucoDeck = [];
let playerTrucoHand = [];
let dealerTrucoHand = [];
let tableCards = [];
let trucoGameStage = 'WAITING'; // WAITING, ROUND1, ROUND2, ROUND3
let trucoPoints = { player: 0, dealer: 0 };
let roundWinner = null;
let currentTrucoValue = 1; // Valor inicial da rodada (1 ponto)
let playerTurn = true;
let vira = null; // Carta virada que define a manilha
let manilhaValue = null; // Valor da manilha

// Inicializar o jogo de Truco
function initTruco() {
  // Resetar variáveis
  trucoDeck = createTrucoDeck();
  playerTrucoHand = [];
  dealerTrucoHand = [];
  tableCards = [];
  trucoGameStage = 'WAITING';
  trucoPoints = { player: 0, dealer: 0 };
  roundWinner = null;
  currentTrucoValue = 1;
  playerTurn = true;
  vira = null;
  manilhaValue = null;
  
  // Atualizar a interface
  updateTrucoUI();
  
  // Habilitar o botão de iniciar
  document.getElementById('start-truco-btn').disabled = false;
  document.getElementById('truco-btn').disabled = true;
  document.getElementById('play-card-btn').disabled = true;
  document.getElementById('fold-truco-btn').disabled = true;
  
  // Limpar as cartas na mesa
  document.getElementById('player-truco-hand').innerHTML = '';
  document.getElementById('dealer-truco-hand').innerHTML = '';
  document.getElementById('table-cards').innerHTML = '';
  document.getElementById('vira-card').innerHTML = '';
  
  // Mostrar mensagem inicial
  document.getElementById('truco-message').textContent = 'Clique em "Iniciar Jogo" para começar';
  
  // Atualizar o placar
  updateTrucoScore();
}

// Criar e embaralhar o baralho de Truco
function createTrucoDeck() {
  const deck = [];
  for (const suit of TRUCO_SUITS) {
    for (const value of TRUCO_VALUES) {
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

// Iniciar o jogo de Truco
function startTrucoGame() {
  const betAmount = parseFloat(document.getElementById('truco-bet-amount').value);
  if (betAmount <= 0) {
    showNotification('O valor da aposta deve ser maior que zero', 'error');
    return;
  }
  if (betAmount > userBalance) {
    showNotification('Saldo insuficiente para realizar esta aposta', 'error');
    return;
  }
  
  // Deduzir a aposta inicial do saldo
  userBalance -= betAmount;
  updateBalanceDisplay();
  
  // Adicionar a transação como pendente
  addTransaction({
    date: new Date(),
    type: 'Aposta',
    method: 'Truco',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Configurar o jogo
  trucoDeck = createTrucoDeck();
  trucoGameStage = 'ROUND1';
  
  // Virar uma carta para definir a manilha
  vira = trucoDeck.pop();
  const viraIndex = TRUCO_VALUES.indexOf(vira.value);
  const manilhaIndex = (viraIndex + 1) % TRUCO_VALUES.length;
  manilhaValue = TRUCO_VALUES[manilhaIndex];
  
  // Distribuir as cartas iniciais
  playerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
  dealerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
  
  // Atualizar a interface
  updateTrucoUI();
  
  // Habilitar os botões de ação
  document.getElementById('start-truco-btn').disabled = true;
  document.getElementById('truco-btn').disabled = false;
  document.getElementById('play-card-btn').disabled = false;
  document.getElementById('fold-truco-btn').disabled = false;
  document.getElementById('truco-bet-amount').disabled = true;
  
  // Mostrar mensagem
  document.getElementById('truco-message').textContent = 'Sua vez: Jogue uma carta ou peça Truco';
  
  // Definir quem começa
  playerTurn = Math.random() < 0.5;
  if (!playerTurn) {
    // Se o dealer começa, ele joga automaticamente após um pequeno delay
    setTimeout(playDealerCard, 1000);
  }
}

// Atualizar a interface do Truco
function updateTrucoUI() {
  // Atualizar a carta virada (vira)
  const viraElement = document.getElementById('vira-card');
  viraElement.innerHTML = '';
  if (vira) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('truco-card');
    cardElement.innerHTML = getTrucoCardHTML(vira);
    viraElement.appendChild(cardElement);
    
    // Mostrar qual é a manilha
    document.getElementById('manilha-value').textContent = `Manilha: ${manilhaValue}`;
  }
  
  // Atualizar as cartas do jogador
  const playerHandElement = document.getElementById('player-truco-hand');
  playerHandElement.innerHTML = '';
  playerTrucoHand.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('truco-card');
    cardElement.dataset.index = index;
    cardElement.innerHTML = getTrucoCardHTML(card);
    cardElement.addEventListener('click', selectTrucoCard);
    playerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as cartas do dealer
  const dealerHandElement = document.getElementById('dealer-truco-hand');
  dealerHandElement.innerHTML = '';
  dealerTrucoHand.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('truco-card', 'card-back');
    cardElement.innerHTML = '<div class="card-back-design"></div>';
    dealerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as cartas na mesa
  const tableCardsElement = document.getElementById('table-cards');
  tableCardsElement.innerHTML = '';
  tableCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('truco-card');
    cardElement.innerHTML = getTrucoCardHTML(card.card);
    if (card.player === 'player') {
      cardElement.classList.add('player-card');
    } else {
      cardElement.classList.add('dealer-card');
    }
    tableCardsElement.appendChild(cardElement);
  });
  
  // Atualizar o valor atual do truco
  document.getElementById('truco-value').textContent = `Valor: ${currentTrucoValue} ${currentTrucoValue === 1 ? 'ponto' : 'pontos'}`;
}

// Atualizar o placar do Truco
function updateTrucoScore() {
  document.getElementById('player-score').textContent = trucoPoints.player;
  document.getElementById('dealer-score').textContent = trucoPoints.dealer;
}

// Selecionar uma carta do Truco
function selectTrucoCard(event) {
  if (!playerTurn) return;
  
  const selectedIndex = parseInt(event.currentTarget.dataset.index);
  const selectedCard = playerTrucoHand[selectedIndex];
  
  // Remover a carta da mão do jogador
  playerTrucoHand.splice(selectedIndex, 1);
  
  // Adicionar a carta à mesa
  tableCards.push({ card: selectedCard, player: 'player' });
  
  // Atualizar a interface
  updateTrucoUI();
  
  // Verificar se a rodada terminou
  if (tableCards.length % 2 === 0) {
    // Verificar quem ganhou a rodada
    const lastPlayerCard = tableCards[tableCards.length - 2];
    const lastDealerCard = tableCards[tableCards.length - 1];
    
    const playerCardStrength = getCardStrength(lastPlayerCard.card);
    const dealerCardStrength = getCardStrength(lastDealerCard.card);
    
    if (playerCardStrength > dealerCardStrength) {
      roundWinner = 'player';
      document.getElementById('truco-message').textContent = 'Você ganhou esta rodada!';
    } else if (dealerCardStrength > playerCardStrength) {
      roundWinner = 'dealer';
      document.getElementById('truco-message').textContent = 'O dealer ganhou esta rodada.';
    } else {
      roundWinner = 'tie';
      document.getElementById('truco-message').textContent = 'Empate nesta rodada!';
    }
    
    // Verificar se o jogo terminou
    if (playerTrucoHand.length === 0 || checkTrucoGameEnd()) {
      endTrucoRound();
    } else {
      // Próxima rodada
      if (roundWinner === 'player' || roundWinner === 'tie') {
        playerTurn = true;
        document.getElementById('truco-message').textContent += ' Sua vez de jogar.';
      } else {
        playerTurn = false;
        setTimeout(playDealerCard, 1000);
      }
    }
  } else {
    // Vez do dealer
    playerTurn = false;
    setTimeout(playDealerCard, 1000);
  }
}

// Dealer joga uma carta
function playDealerCard() {
  if (dealerTrucoHand.length === 0) return;
  
  // Escolher a melhor carta para jogar
  let cardIndex = 0;
  
  // Estratégia simples: jogar a carta mais forte se for a primeira da rodada,
  // ou tentar vencer a carta do jogador se já houver uma na mesa
  if (tableCards.length % 2 === 1) {
    const playerCard = tableCards[tableCards.length - 1].card;
    const playerCardStrength = getCardStrength(playerCard);
    
    // Tentar encontrar uma carta que vença a do jogador
    let foundStrongerCard = false;
    for (let i = 0; i < dealerTrucoHand.length; i++) {
      if (getCardStrength(dealerTrucoHand[i]) > playerCardStrength) {
        cardIndex = i;
        foundStrongerCard = true;
        break;
      }
    }
    
    // Se não encontrou carta mais forte, jogar a mais fraca
    if (!foundStrongerCard) {
      let weakestCardStrength = getCardStrength(dealerTrucoHand[0]);
      for (let i = 1; i < dealerTrucoHand.length; i++) {
        const strength = getCardStrength(dealerTrucoHand[i]);
        if (strength < weakestCardStrength) {
          weakestCardStrength = strength;
          cardIndex = i;
        }
      }
    }
  } else {
    // Se for o primeiro a jogar na rodada, escolher aleatoriamente
    cardIndex = Math.floor(Math.random() * dealerTrucoHand.length);
  }
  
  // Jogar a carta escolhida
  const selectedCard = dealerTrucoHand[cardIndex];
  dealerTrucoHand.splice(cardIndex, 1);
  
  // Adicionar a carta à mesa
  tableCards.push({ card: selectedCard, player: 'dealer' });
  
  // Atualizar a interface
  updateTrucoUI();
  
  // Verificar se a rodada terminou
  if (tableCards.length % 2 === 0) {
    // Verificar quem ganhou a rodada
    const lastPlayerCard = tableCards[tableCards.length - 2];
    const lastDealerCard = tableCards[tableCards.length - 1];
    
    const playerCardStrength = getCardStrength(lastPlayerCard.card);
    const dealerCardStrength = getCardStrength(lastDealerCard.card);
    
    if (playerCardStrength > dealerCardStrength) {
      roundWinner = 'player';
      document.getElementById('truco-message').textContent = 'Você ganhou esta rodada!';
    } else if (dealerCardStrength > playerCardStrength) {
      roundWinner = 'dealer';
      document.getElementById('truco-message').textContent = 'O dealer ganhou esta rodada.';
    } else {
      roundWinner = 'tie';
      document.getElementById('truco-message').textContent = 'Empate nesta rodada!';
    }
    
    // Verificar se o jogo terminou
    if (playerTrucoHand.length === 0 || checkTrucoGameEnd()) {
      endTrucoRound();
    } else {
      // Próxima rodada
      if (roundWinner === 'dealer' || roundWinner === 'tie') {
        playerTurn = false;
        setTimeout(playDealerCard, 1000);
      } else {
        playerTurn = true;
        document.getElementById('truco-message').textContent += ' Sua vez de jogar.';
      }
    }
  } else {
    // Vez do jogador
    playerTurn = true;
    document.getElementById('truco-message').textContent = 'Sua vez de jogar.';
  }
}

// Verificar se o jogo de Truco terminou
function checkTrucoGameEnd() {
  // Contar vitórias
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;
  
  for (let i = 0; i < tableCards.length; i += 2) {
    if (i + 1 < tableCards.length) {
      const playerCard = tableCards[i].player === 'player' ? tableCards[i] : tableCards[i + 1];
      const dealerCard = tableCards[i].player === 'dealer' ? tableCards[i] : tableCards[i + 1];
      
      const playerCardStrength = getCardStrength(playerCard.card);
      const dealerCardStrength = getCardStrength(dealerCard.card);
      
      if (playerCardStrength > dealerCardStrength) {
        playerWins++;
      } else if (dealerCardStrength > playerCardStrength) {
        dealerWins++;
      } else {
        ties++;
      }
    }
  }
  
  // Verificar se alguém já ganhou 2 rodadas (melhor de 3)
  return playerWins >= 2 || dealerWins >= 2;
}

// Finalizar a rodada de Truco
function endTrucoRound() {
  // Contar vitórias
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;
  
  for (let i = 0; i < tableCards.length; i += 2) {
    if (i + 1 < tableCards.length) {
      const playerCard = tableCards[i].player === 'player' ? tableCards[i] : tableCards[i + 1];
      const dealerCard = tableCards[i].player === 'dealer' ? tableCards[i] : tableCards[i + 1];
      
      const playerCardStrength = getCardStrength(playerCard.card);
      const dealerCardStrength = getCardStrength(dealerCard.card);
      
      if (playerCardStrength > dealerCardStrength) {
        playerWins++;
      } else if (dealerCardStrength > playerCardStrength) {
        dealerWins++;
      } else {
        ties++;
      }
    }
  }
  
  // Determinar o vencedor da rodada
  let roundWinner;
  if (playerWins > dealerWins) {
    roundWinner = 'player';
    trucoPoints.player += currentTrucoValue;
  } else if (dealerWins > playerWins) {
    roundWinner = 'dealer';
    trucoPoints.dealer += currentTrucoValue;
  } else {
    // Em caso de empate, o ponto vai para quem ganhou a primeira rodada
    if (tableCards.length >= 2) {
      const firstPlayerCard = tableCards[0].player === 'player' ? tableCards[0] : tableCards[1];
      const firstDealerCard = tableCards[0].player === 'dealer' ? tableCards[0] : tableCards[1];
      
      const playerCardStrength = getCardStrength(firstPlayerCard.card);
      const dealerCardStrength = getCardStrength(firstDealerCard.card);
      
      if (playerCardStrength > dealerCardStrength) {
        roundWinner = 'player';
        trucoPoints.player += currentTrucoValue;
      } else if (dealerCardStrength > playerCardStrength) {
        roundWinner = 'dealer';
        trucoPoints.dealer += currentTrucoValue;
      } else {
        // Se até a primeira rodada foi empate, o ponto vai para quem está mão (começou jogando)
        if (tableCards[0].player === 'player') {
          roundWinner = 'player';
          trucoPoints.player += currentTrucoValue;
        } else {
          roundWinner = 'dealer';
          trucoPoints.dealer += currentTrucoValue;
        }
      }
    }
  }
  
  // Atualizar o placar
  updateTrucoScore();
  
  // Verificar se o jogo terminou (alguém chegou a 12 pontos)
  if (trucoPoints.player >= 12 || trucoPoints.dealer >= 12) {
    endTrucoGame(trucoPoints.player >= 12);
  } else {
    // Preparar para a próxima rodada
    setTimeout(() => {
      // Limpar a mesa
      tableCards = [];
      
      // Distribuir novas cartas
      playerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
      dealerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
      
      // Virar uma nova carta para definir a manilha
      vira = trucoDeck.pop();
      const viraIndex = TRUCO_VALUES.indexOf(vira.value);
      const manilhaIndex = (viraIndex + 1) % TRUCO_VALUES.length;
      manilhaValue = TRUCO_VALUES[manilhaIndex];
      
      // Resetar o valor do truco
      currentTrucoValue = 1;
      
      // Atualizar a interface
      updateTrucoUI();
      
      // Definir quem começa
      playerTurn = roundWinner === 'player';
      
      // Mostrar mensagem
      document.getElementById('truco-message').textContent = `Nova rodada! ${playerTurn ? 'Sua vez de jogar.' : 'Vez do dealer.'}`;
      
      // Se for a vez do dealer, ele joga automaticamente
      if (!playerTurn) {
        setTimeout(playDealerCard, 1000);
      }
    }, 2000);
  }
}

// Pedir Truco
function askTruco() {
  // Verificar se pode aumentar o valor
  if (currentTrucoValue >= 12) {
    showNotification('Valor máximo de Truco já atingido', 'warning');
    return;
  }
  
  // Determinar o próximo valor
  let nextValue;
  switch (currentTrucoValue) {
    case 1: nextValue = 3; break;
    case 3: nextValue = 6; break;
    case 6: nextValue = 9; break;
    case 9: nextValue = 12; break;
    default: nextValue = currentTrucoValue + 3;
  }
  
  // Mostrar mensagem
  document.getElementById('truco-message').textContent = `Você pediu ${getTrucoValueName(nextValue)}!`;
  
  // Simular a resposta do dealer
  setTimeout(() => {
    // 70% de chance de aceitar, 30% de desistir
    const dealerAccepts = Math.random() < 0.7;
    
    if (dealerAccepts) {
      currentTrucoValue = nextValue;
      document.getElementById('truco-message').textContent = `Dealer aceitou o ${getTrucoValueName(nextValue)}! Jogo continua.`;
      document.getElementById('truco-value').textContent = `Valor: ${currentTrucoValue} ${currentTrucoValue === 1 ? 'ponto' : 'pontos'}`;
    } else {
      document.getElementById('truco-message').textContent = 'Dealer correu! Você ganhou a rodada.';
      trucoPoints.player += currentTrucoValue;
      updateTrucoScore();
      
      // Verificar se o jogo terminou
      if (trucoPoints.player >= 12) {
        endTrucoGame(true);
      } else {
        // Preparar para a próxima rodada
        setTimeout(() => {
          // Limpar a mesa
          tableCards = [];
          
          // Distribuir novas cartas
          playerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
          dealerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
          
          // Virar uma nova carta para definir a manilha
          vira = trucoDeck.pop();
          const viraIndex = TRUCO_VALUES.indexOf(vira.value);
          const manilhaIndex = (viraIndex + 1) % TRUCO_VALUES.length;
          manilhaValue = TRUCO_VALUES[manilhaIndex];
          
          // Resetar o valor do truco
          currentTrucoValue = 1;
          
          // Atualizar a interface
          updateTrucoUI();
          
          // Jogador começa a próxima rodada
          playerTurn = true;
          
          // Mostrar mensagem
          document.getElementById('truco-message').textContent = 'Nova rodada! Sua vez de jogar.';
        }, 2000);
      }
    }
  }, 1500);
}

// Desistir do Truco
function foldTruco() {
  // Dealer ganha a rodada
  trucoPoints.dealer += currentTrucoValue;
  updateTrucoScore();
  
  // Mostrar mensagem
  document.getElementById('truco-message').textContent = 'Você correu! O dealer ganhou a rodada.';
  
  // Verificar se o jogo terminou
  if (trucoPoints.dealer >= 12) {
    endTrucoGame(false);
  } else {
    // Preparar para a próxima rodada
    setTimeout(() => {
      // Limpar a mesa
      tableCards = [];
      
      // Distribuir novas cartas
      playerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
      dealerTrucoHand = [trucoDeck.pop(), trucoDeck.pop(), trucoDeck.pop()];
      
      // Virar uma nova carta para definir a manilha
      vira = trucoDeck.pop();
      const viraIndex = TRUCO_VALUES.indexOf(vira.value);
      const manilhaIndex = (viraIndex + 1) % TRUCO_VALUES.length;
      manilhaValue = TRUCO_VALUES[manilhaIndex];
      
      // Resetar o valor do truco
      currentTrucoValue = 1;
      
      // Atualizar a interface
      updateTrucoUI();
      
      // Dealer começa a próxima rodada
      playerTurn = false;
      
      // Mostrar mensagem
      document.getElementById('truco-message').textContent = 'Nova rodada! Vez do dealer.';
      
      // Dealer joga automaticamente
      setTimeout(playDealerCard, 1000);
    }, 2000);
  }
}

// Finalizar o jogo de Truco
function endTrucoGame(playerWins) {
  // Desabilitar os botões de ação
  document.getElementById('truco-btn').disabled = true;
  document.getElementById('play-card-btn').disabled = true;
  document.getElementById('fold-truco-btn').disabled = true;
  document.getElementById('start-truco-btn').disabled = false;
  document.getElementById('truco-bet-amount').disabled = false;
  
  // Atualizar a transação
  transactions.shift(); // Remove a transação 'Pendente'
  
  const betAmount = parseFloat(document.getElementById('truco-bet-amount').value);
  
  if (playerWins) {
    // Jogador ganha
    const winAmount = betAmount * 2; // Dobro da aposta
    userBalance += winAmount;
    updateBalanceDisplay();
    
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Truco',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Truco!`, 'success');
    document.getElementById('truco-message').textContent = 'Você venceu o jogo de Truco!';
  } else {
    // Jogador perde
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Truco',
      amount: betAmount,
      status: 'Perdida'
    });
    
    showNotification(`Você perdeu R$ ${betAmount.toFixed(2)} no Truco.`, 'error');
    document.getElementById('truco-message').textContent = 'Você perdeu o jogo de Truco.';
  }
  
  // Resetar o placar para o próximo jogo
  setTimeout(() => {
    trucoPoints = { player: 0, dealer: 0 };
    updateTrucoScore();
  }, 3000);
}

// Obter o HTML da carta de Truco
function getTrucoCardHTML(card) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const isManilha = card.value === manilhaValue;
  
  return `
    <div class="card-value ${isRed ? 'red' : 'black'} ${isManilha ? 'manilha' : ''}">${card.value}</div>
    <div class="card-suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
  `;
}

// Obter a força da carta no Truco
function getCardStrength(card) {
  // Se for manilha, é a carta mais forte
  if (card.value === manilhaValue) {
    // Ordem de força das manilhas por naipe: ♣ > ♥ > ♠ > ♦
    const manilhaStrength = {
      '♣': 40,
      '♥': 39,
      '♠': 38,
      '♦': 37
    };
    return manilhaStrength[card.suit];
  }
  
  // Se não for manilha, segue a ordem normal
  return TRUCO_CARD_STRENGTH[card.value];
}

// Obter o nome do valor do Truco
function getTrucoValueName(value) {
  switch (value) {
    case 3: return 'Truco';
    case 6: return 'Seis';
    case 9: return 'Nove';
    case 12: return 'Doze';
    default: return `${value}`;
  }
}

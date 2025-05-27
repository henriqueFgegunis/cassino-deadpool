// Funções para o jogo de Poker

// Constantes
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const HAND_RANKINGS = {
  ROYAL_FLUSH: 9,
  STRAIGHT_FLUSH: 8,
  FOUR_OF_A_KIND: 7,
  FULL_HOUSE: 6,
  FLUSH: 5,
  STRAIGHT: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIR: 2,
  ONE_PAIR: 1,
  HIGH_CARD: 0
};

// Variáveis do jogo
let pokerDeck = [];
let playerHand = [];
let dealerHand = [];
let communityCards = [];
let pokerGameStage = 'WAITING'; // WAITING, PREFLOP, FLOP, TURN, RIVER, SHOWDOWN
let pokerPot = 0;
let playerBet = 0;
let dealerBet = 0;
let playerFolded = false;
let dealerFolded = false;

// Inicializar o jogo de Poker
function initPoker() {
  // Resetar variáveis
  pokerDeck = createDeck();
  playerHand = [];
  dealerHand = [];
  communityCards = [];
  pokerGameStage = 'WAITING';
  pokerPot = 0;
  playerBet = 0;
  dealerBet = 0;
  playerFolded = false;
  dealerFolded = false;
  
  // Atualizar a interface
  updatePokerUI();
  
  // Habilitar o botão de iniciar
  document.getElementById('start-poker-btn').disabled = false;
  document.getElementById('call-poker-btn').disabled = true;
  document.getElementById('raise-poker-btn').disabled = true;
  document.getElementById('fold-poker-btn').disabled = true;
  
  // Limpar as cartas na mesa
  document.getElementById('community-cards').innerHTML = '';
  document.getElementById('player-poker-hand').innerHTML = '';
  document.getElementById('dealer-poker-hand').innerHTML = '';
  
  // Mostrar mensagem inicial
  document.getElementById('poker-message').textContent = 'Clique em "Iniciar Jogo" para começar';
}

// Criar e embaralhar o baralho
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
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

// Iniciar o jogo de Poker
function startPokerGame() {
  const betAmount = parseFloat(document.getElementById('poker-bet-amount').value);
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
    method: 'Poker',
    amount: betAmount,
    status: 'Pendente'
  });
  
  // Configurar o jogo
  pokerDeck = createDeck();
  pokerPot = betAmount * 2; // Jogador e dealer
  playerBet = betAmount;
  dealerBet = betAmount;
  pokerGameStage = 'PREFLOP';
  
  // Distribuir as cartas iniciais
  playerHand = [pokerDeck.pop(), pokerDeck.pop()];
  dealerHand = [pokerDeck.pop(), pokerDeck.pop()];
  
  // Atualizar a interface
  updatePokerUI();
  
  // Habilitar os botões de ação
  document.getElementById('start-poker-btn').disabled = true;
  document.getElementById('call-poker-btn').disabled = false;
  document.getElementById('raise-poker-btn').disabled = false;
  document.getElementById('fold-poker-btn').disabled = false;
  document.getElementById('poker-bet-amount').disabled = true;
  
  // Mostrar mensagem
  document.getElementById('poker-message').textContent = 'Sua vez: Aposte, Aumente ou Desista';
}

// Atualizar a interface do Poker
function updatePokerUI() {
  // Atualizar o valor do pote
  document.getElementById('poker-pot').textContent = `R$ ${pokerPot.toFixed(2)}`;
  
  // Atualizar as cartas do jogador
  const playerHandElement = document.getElementById('player-poker-hand');
  playerHandElement.innerHTML = '';
  playerHand.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('poker-card');
    cardElement.innerHTML = getCardHTML(card);
    playerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as cartas do dealer
  const dealerHandElement = document.getElementById('dealer-poker-hand');
  dealerHandElement.innerHTML = '';
  dealerHand.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('poker-card');
    if (pokerGameStage === 'SHOWDOWN' || dealerFolded) {
      cardElement.innerHTML = getCardHTML(card);
    } else {
      cardElement.classList.add('card-back');
      cardElement.innerHTML = '<div class="card-back-design"></div>';
    }
    dealerHandElement.appendChild(cardElement);
  });
  
  // Atualizar as cartas comunitárias
  const communityCardsElement = document.getElementById('community-cards');
  communityCardsElement.innerHTML = '';
  
  if (pokerGameStage === 'FLOP' || pokerGameStage === 'TURN' || pokerGameStage === 'RIVER' || pokerGameStage === 'SHOWDOWN') {
    // Mostrar o flop (3 cartas)
    for (let i = 0; i < 3; i++) {
      if (i < communityCards.length) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('poker-card');
        cardElement.innerHTML = getCardHTML(communityCards[i]);
        communityCardsElement.appendChild(cardElement);
      }
    }
  }
  
  if (pokerGameStage === 'TURN' || pokerGameStage === 'RIVER' || pokerGameStage === 'SHOWDOWN') {
    // Mostrar o turn (4ª carta)
    if (communityCards.length >= 4) {
      const cardElement = document.createElement('div');
      cardElement.classList.add('poker-card');
      cardElement.innerHTML = getCardHTML(communityCards[3]);
      communityCardsElement.appendChild(cardElement);
    }
  }
  
  if (pokerGameStage === 'RIVER' || pokerGameStage === 'SHOWDOWN') {
    // Mostrar o river (5ª carta)
    if (communityCards.length >= 5) {
      const cardElement = document.createElement('div');
      cardElement.classList.add('poker-card');
      cardElement.innerHTML = getCardHTML(communityCards[4]);
      communityCardsElement.appendChild(cardElement);
    }
  }
}

// Função para o jogador chamar (call)
function callPoker() {
  switch (pokerGameStage) {
    case 'PREFLOP':
      pokerGameStage = 'FLOP';
      // Revelar 3 cartas comunitárias (flop)
      communityCards = [pokerDeck.pop(), pokerDeck.pop(), pokerDeck.pop()];
      break;
    case 'FLOP':
      pokerGameStage = 'TURN';
      // Revelar a 4ª carta comunitária (turn)
      communityCards.push(pokerDeck.pop());
      break;
    case 'TURN':
      pokerGameStage = 'RIVER';
      // Revelar a 5ª carta comunitária (river)
      communityCards.push(pokerDeck.pop());
      break;
    case 'RIVER':
      pokerGameStage = 'SHOWDOWN';
      // Mostrar as cartas e determinar o vencedor
      determinePokerWinner();
      return;
  }
  
  // Simular a decisão do dealer
  simulateDealerDecision();
  
  // Atualizar a interface
  updatePokerUI();
  
  // Mostrar mensagem
  document.getElementById('poker-message').textContent = `${getStageText(pokerGameStage)}: Sua vez`;
}

// Função para o jogador aumentar (raise)
function raisePoker() {
  const raiseAmount = parseFloat(document.getElementById('poker-bet-amount').value);
  if (raiseAmount <= 0) {
    showNotification('O valor do aumento deve ser maior que zero', 'error');
    return;
  }
  if (raiseAmount > userBalance) {
    showNotification('Saldo insuficiente para este aumento', 'error');
    return;
  }
  
  // Deduzir o aumento do saldo
  userBalance -= raiseAmount;
  updateBalanceDisplay();
  
  // Atualizar o pote e a aposta do jogador
  pokerPot += raiseAmount;
  playerBet += raiseAmount;
  
  // Simular a decisão do dealer
  simulateDealerDecision();
  
  // Avançar para o próximo estágio se o dealer não desistir
  if (!dealerFolded) {
    switch (pokerGameStage) {
      case 'PREFLOP':
        pokerGameStage = 'FLOP';
        // Revelar 3 cartas comunitárias (flop)
        communityCards = [pokerDeck.pop(), pokerDeck.pop(), pokerDeck.pop()];
        break;
      case 'FLOP':
        pokerGameStage = 'TURN';
        // Revelar a 4ª carta comunitária (turn)
        communityCards.push(pokerDeck.pop());
        break;
      case 'TURN':
        pokerGameStage = 'RIVER';
        // Revelar a 5ª carta comunitária (river)
        communityCards.push(pokerDeck.pop());
        break;
      case 'RIVER':
        pokerGameStage = 'SHOWDOWN';
        // Mostrar as cartas e determinar o vencedor
        determinePokerWinner();
        return;
    }
  }
  
  // Atualizar a interface
  updatePokerUI();
  
  // Mostrar mensagem
  if (dealerFolded) {
    document.getElementById('poker-message').textContent = 'O dealer desistiu! Você ganhou!';
    endPokerGame(true);
  } else {
    document.getElementById('poker-message').textContent = `${getStageText(pokerGameStage)}: Sua vez`;
  }
}

// Função para o jogador desistir (fold)
function foldPoker() {
  playerFolded = true;
  
  // Atualizar a interface
  updatePokerUI();
  
  // Mostrar mensagem
  document.getElementById('poker-message').textContent = 'Você desistiu! Perdeu a aposta.';
  
  // Finalizar o jogo
  endPokerGame(false);
}

// Simular a decisão do dealer
function simulateDealerDecision() {
  // Probabilidade do dealer desistir (fold)
  const foldProbability = 0.2;
  
  // Probabilidade do dealer aumentar (raise)
  const raiseProbability = 0.3;
  
  const random = Math.random();
  
  if (random < foldProbability) {
    // Dealer desiste
    dealerFolded = true;
    return;
  }
  
  if (random < foldProbability + raiseProbability) {
    // Dealer aumenta
    const raiseAmount = Math.floor(Math.random() * 3 + 1) * 5; // Aumento de 5, 10 ou 15
    pokerPot += raiseAmount;
    dealerBet += raiseAmount;
    
    // Mostrar notificação
    showNotification(`O dealer aumentou em R$ ${raiseAmount.toFixed(2)}`, 'info');
  }
  
  // Se não desistiu nem aumentou, o dealer chama (call)
}

// Determinar o vencedor do jogo de Poker
function determinePokerWinner() {
  // Combinar as cartas do jogador com as cartas comunitárias
  const playerCards = [...playerHand, ...communityCards];
  const dealerCards = [...dealerHand, ...communityCards];
  
  // Avaliar as mãos
  const playerHandRank = evaluateHand(playerCards);
  const dealerHandRank = evaluateHand(dealerCards);
  
  // Determinar o vencedor
  let playerWins = false;
  
  if (playerHandRank.rank > dealerHandRank.rank) {
    playerWins = true;
  } else if (playerHandRank.rank === dealerHandRank.rank) {
    // Desempate baseado no valor das cartas
    playerWins = breakTie(playerHandRank, dealerHandRank);
  }
  
  // Mostrar mensagem
  const playerHandName = getHandName(playerHandRank.rank);
  const dealerHandName = getHandName(dealerHandRank.rank);
  
  if (playerWins) {
    document.getElementById('poker-message').textContent = `Você ganhou com ${playerHandName} contra ${dealerHandName} do dealer!`;
  } else {
    document.getElementById('poker-message').textContent = `Você perdeu! O dealer tem ${dealerHandName} contra seu ${playerHandName}.`;
  }
  
  // Finalizar o jogo
  endPokerGame(playerWins);
}

// Avaliar a mão de Poker
function evaluateHand(cards) {
  // Ordenar as cartas por valor
  const sortedCards = [...cards].sort((a, b) => {
    return VALUES.indexOf(b.value) - VALUES.indexOf(a.value);
  });
  
  // Verificar cada tipo de mão, do mais alto para o mais baixo
  
  // Royal Flush
  const royalFlush = checkRoyalFlush(sortedCards);
  if (royalFlush) {
    return { rank: HAND_RANKINGS.ROYAL_FLUSH, cards: royalFlush };
  }
  
  // Straight Flush
  const straightFlush = checkStraightFlush(sortedCards);
  if (straightFlush) {
    return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, cards: straightFlush };
  }
  
  // Four of a Kind
  const fourOfAKind = checkFourOfAKind(sortedCards);
  if (fourOfAKind) {
    return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, cards: fourOfAKind };
  }
  
  // Full House
  const fullHouse = checkFullHouse(sortedCards);
  if (fullHouse) {
    return { rank: HAND_RANKINGS.FULL_HOUSE, cards: fullHouse };
  }
  
  // Flush
  const flush = checkFlush(sortedCards);
  if (flush) {
    return { rank: HAND_RANKINGS.FLUSH, cards: flush };
  }
  
  // Straight
  const straight = checkStraight(sortedCards);
  if (straight) {
    return { rank: HAND_RANKINGS.STRAIGHT, cards: straight };
  }
  
  // Three of a Kind
  const threeOfAKind = checkThreeOfAKind(sortedCards);
  if (threeOfAKind) {
    return { rank: HAND_RANKINGS.THREE_OF_A_KIND, cards: threeOfAKind };
  }
  
  // Two Pair
  const twoPair = checkTwoPair(sortedCards);
  if (twoPair) {
    return { rank: HAND_RANKINGS.TWO_PAIR, cards: twoPair };
  }
  
  // One Pair
  const onePair = checkOnePair(sortedCards);
  if (onePair) {
    return { rank: HAND_RANKINGS.ONE_PAIR, cards: onePair };
  }
  
  // High Card
  return { rank: HAND_RANKINGS.HIGH_CARD, cards: sortedCards.slice(0, 5) };
}

// Funções auxiliares para avaliar mãos de Poker
function checkRoyalFlush(cards) {
  const flush = checkFlush(cards);
  if (!flush) return null;
  
  const values = ['10', 'J', 'Q', 'K', 'A'];
  const royalFlush = flush.filter(card => values.includes(card.value));
  
  return royalFlush.length === 5 ? royalFlush : null;
}

function checkStraightFlush(cards) {
  const flush = checkFlush(cards);
  if (!flush) return null;
  
  const straight = checkStraight(flush);
  return straight;
}

function checkFourOfAKind(cards) {
  const valueCounts = countValues(cards);
  
  for (const value in valueCounts) {
    if (valueCounts[value] === 4) {
      const fourCards = cards.filter(card => card.value === value);
      const kicker = cards.find(card => card.value !== value);
      return [...fourCards, kicker];
    }
  }
  
  return null;
}

function checkFullHouse(cards) {
  const valueCounts = countValues(cards);
  let threeOfAKindValue = null;
  let pairValue = null;
  
  for (const value in valueCounts) {
    if (valueCounts[value] >= 3) {
      threeOfAKindValue = value;
      break;
    }
  }
  
  if (!threeOfAKindValue) return null;
  
  for (const value in valueCounts) {
    if (value !== threeOfAKindValue && valueCounts[value] >= 2) {
      pairValue = value;
      break;
    }
  }
  
  if (!pairValue) return null;
  
  const threeCards = cards.filter(card => card.value === threeOfAKindValue).slice(0, 3);
  const pairCards = cards.filter(card => card.value === pairValue).slice(0, 2);
  
  return [...threeCards, ...pairCards];
}

function checkFlush(cards) {
  const suitCounts = {};
  
  for (const card of cards) {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }
  
  for (const suit in suitCounts) {
    if (suitCounts[suit] >= 5) {
      return cards.filter(card => card.suit === suit).slice(0, 5);
    }
  }
  
  return null;
}

function checkStraight(cards) {
  // Remover duplicatas de valores
  const uniqueValues = [];
  const seen = new Set();
  
  for (const card of cards) {
    if (!seen.has(card.value)) {
      seen.add(card.value);
      uniqueValues.push(card);
    }
  }
  
  // Verificar sequência
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    let isStraight = true;
    
    for (let j = 0; j < 4; j++) {
      const currentIndex = VALUES.indexOf(uniqueValues[i + j].value);
      const nextIndex = VALUES.indexOf(uniqueValues[i + j + 1].value);
      
      if (currentIndex !== nextIndex + 1) {
        isStraight = false;
        break;
      }
    }
    
    if (isStraight) {
      return uniqueValues.slice(i, i + 5);
    }
  }
  
  // Verificar A-5-4-3-2
  if (seen.has('A') && seen.has('2') && seen.has('3') && seen.has('4') && seen.has('5')) {
    const ace = cards.find(card => card.value === 'A');
    const two = cards.find(card => card.value === '2');
    const three = cards.find(card => card.value === '3');
    const four = cards.find(card => card.value === '4');
    const five = cards.find(card => card.value === '5');
    
    return [ace, five, four, three, two];
  }
  
  return null;
}

function checkThreeOfAKind(cards) {
  const valueCounts = countValues(cards);
  
  for (const value in valueCounts) {
    if (valueCounts[value] === 3) {
      const threeCards = cards.filter(card => card.value === value);
      const kickers = cards.filter(card => card.value !== value).slice(0, 2);
      return [...threeCards, ...kickers];
    }
  }
  
  return null;
}

function checkTwoPair(cards) {
  const valueCounts = countValues(cards);
  const pairs = [];
  
  for (const value in valueCounts) {
    if (valueCounts[value] >= 2) {
      pairs.push(value);
    }
  }
  
  if (pairs.length >= 2) {
    const firstPairCards = cards.filter(card => card.value === pairs[0]).slice(0, 2);
    const secondPairCards = cards.filter(card => card.value === pairs[1]).slice(0, 2);
    const kicker = cards.filter(card => card.value !== pairs[0] && card.value !== pairs[1])[0];
    
    return [...firstPairCards, ...secondPairCards, kicker];
  }
  
  return null;
}

function checkOnePair(cards) {
  const valueCounts = countValues(cards);
  
  for (const value in valueCounts) {
    if (valueCounts[value] >= 2) {
      const pairCards = cards.filter(card => card.value === value).slice(0, 2);
      const kickers = cards.filter(card => card.value !== value).slice(0, 3);
      return [...pairCards, ...kickers];
    }
  }
  
  return null;
}

function countValues(cards) {
  const valueCounts = {};
  
  for (const card of cards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }
  
  return valueCounts;
}

// Desempatar mãos de mesmo rank
function breakTie(hand1, hand2) {
  // Comparar cada carta na mão
  for (let i = 0; i < hand1.cards.length; i++) {
    const value1 = VALUES.indexOf(hand1.cards[i].value);
    const value2 = VALUES.indexOf(hand2.cards[i].value);
    
    if (value1 > value2) {
      return true;
    } else if (value1 < value2) {
      return false;
    }
  }
  
  // Se todas as cartas forem iguais, é um empate (retorna true para o jogador)
  return true;
}

// Obter o nome da mão
function getHandName(rank) {
  switch (rank) {
    case HAND_RANKINGS.ROYAL_FLUSH:
      return 'Royal Flush';
    case HAND_RANKINGS.STRAIGHT_FLUSH:
      return 'Straight Flush';
    case HAND_RANKINGS.FOUR_OF_A_KIND:
      return 'Quadra';
    case HAND_RANKINGS.FULL_HOUSE:
      return 'Full House';
    case HAND_RANKINGS.FLUSH:
      return 'Flush';
    case HAND_RANKINGS.STRAIGHT:
      return 'Sequência';
    case HAND_RANKINGS.THREE_OF_A_KIND:
      return 'Trinca';
    case HAND_RANKINGS.TWO_PAIR:
      return 'Dois Pares';
    case HAND_RANKINGS.ONE_PAIR:
      return 'Um Par';
    default:
      return 'Carta Alta';
  }
}

// Obter o texto do estágio atual
function getStageText(stage) {
  switch (stage) {
    case 'PREFLOP':
      return 'Pré-Flop';
    case 'FLOP':
      return 'Flop';
    case 'TURN':
      return 'Turn';
    case 'RIVER':
      return 'River';
    case 'SHOWDOWN':
      return 'Showdown';
    default:
      return '';
  }
}

// Finalizar o jogo de Poker
function endPokerGame(playerWins) {
  // Desabilitar os botões de ação
  document.getElementById('call-poker-btn').disabled = true;
  document.getElementById('raise-poker-btn').disabled = true;
  document.getElementById('fold-poker-btn').disabled = true;
  document.getElementById('start-poker-btn').disabled = false;
  document.getElementById('poker-bet-amount').disabled = false;
  
  // Atualizar a transação
  transactions.shift(); // Remove a transação 'Pendente'
  
  if (playerWins) {
    // Jogador ganha
    const winAmount = pokerPot;
    userBalance += winAmount;
    updateBalanceDisplay();
    
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Poker',
      amount: winAmount,
      status: 'Ganha'
    });
    
    showNotification(`Você ganhou R$ ${winAmount.toFixed(2)} no Poker!`, 'success');
  } else {
    // Jogador perde
    const lostAmount = playerBet;
    
    addTransaction({
      date: new Date(),
      type: 'Aposta',
      method: 'Poker',
      amount: lostAmount,
      status: 'Perdida'
    });
    
    showNotification(`Você perdeu R$ ${lostAmount.toFixed(2)} no Poker.`, 'error');
  }
}

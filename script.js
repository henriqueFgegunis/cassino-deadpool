/**
 * SCRIPT PARA O OPENLINK CASINO - EDIÇÃO MERCENÁRIO TAGARELA
 * * Ei, você aí, fuçando no meu código! 
 * Se quebrar alguma coisa, a culpa é sua. Mas se melhorar, me dá os créditos.
 * Assinado: Deadpool.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS (A lista de compras do caos) ---
    const allElements = {
        preloader: document.getElementById('preloader'),
        authModal: document.getElementById('auth-modal'),
        closeAuthModalBtn: document.getElementById('close-auth-modal'),
        openLoginBtn: document.getElementById('open-login-btn'),
        openRegisterBtn: document.getElementById('open-register-btn'),
        homeAcessarBtn: document.getElementById('home-acessar-btn'),
        showRegisterFormBtn: document.getElementById('show-register-form'),
        showLoginFormBtn: document.getElementById('show-login-form'),
        loginFormDiv: document.getElementById('login-form'),
        registerFormDiv: document.getElementById('register-form'),
        headerBalanceArea: document.getElementById('header-balance-area'),
        authButtonsHeader: document.getElementById('auth-buttons'),
        headerBalanceSpan: document.getElementById('header-balance'),
        panelBalanceSpan: document.getElementById('panel-balance'),
        homeSection: document.getElementById('home'),
        playerPanel: document.getElementById('player-panel'),
        entrarBtn: document.getElementById('entrar-btn'),
        registerAccountBtn: document.getElementById('register-account-btn'),
        loginUsuarioInput: document.getElementById('login-usuario'),
        loginSenhaInput: document.getElementById('login-senha'),
        registerEmailInput: document.getElementById('register-email'),
        registerPasswordInput: document.getElementById('register-password'),
        depositBtn: document.getElementById('deposit-btn'),
        addFundsBtn: document.getElementById('add-funds'),
        bonusTimerDiv: document.getElementById('bonus-timer'),
        winnerTickerText: document.getElementById('winner-ticker-text'),
        depositModal: document.getElementById('deposit-modal'),
        closeDepositModalBtn: document.getElementById('close-deposit-modal'),
        depositSteps: document.querySelectorAll('.deposit-step'),
        amountButtons: document.querySelectorAll('.amount-btn'),
        customAmountInput: document.getElementById('custom-amount'),
        continueToMethodsBtn: document.getElementById('continue-to-methods'),
        methodButtons: document.querySelectorAll('.method-btn'),
        confirmationAreas: document.querySelectorAll('.confirmation-area'),
        confirmPaymentButtons: document.querySelectorAll('.confirm-payment-btn'),
        loadingArea: document.getElementById('loading-area'),
        successArea: document.getElementById('success-area'),
        togglePasswordButtons: document.querySelectorAll('.toggle-password'),
        withdrawBtn: document.getElementById('withdraw-btn'),
        withdrawModal: document.getElementById('withdraw-modal'),
        closeWithdrawModalBtn: document.getElementById('close-withdraw-modal'),
        confirmTrollWithdrawBtn: document.getElementById('confirm-troll-withdraw'),
        spinSlotBtn: document.getElementById('spin-slot-btn'),
        reels: [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')],
        slotResult: document.getElementById('slot-result'),
        logoClickable: document.getElementById('header-logo-clickable'),
        deadpoolAlert: document.getElementById('deadpool-alert-welcome'),
        deadpoolAlertText: document.getElementById('deadpool-welcome-text'),
        deadpoolAlertBtn: document.getElementById('deadpool-ok-btn')
    };

    // --- ESTADO DO JOGO E VARIÁVEIS GLOBAIS ---
    let saldo = parseFloat(localStorage.getItem('playerBalance')) || 0;
    let proximoBonus = localStorage.getItem('proximoBonus') ? new Date(localStorage.getItem('proximoBonus')) : null;
    let countdownInterval;
    let selectedAmount = 0;
    const slotSymbols = ['🦄', '🌮', '💩', '💰', '💣', '💎', '🍓', '🍕'];
    const custoGiro = 5;

    // --- FUNÇÕES AUXILIARES (A caixa de ferramentas) ---

    // Função para tocar sons (com segurança)
    const playSound = (sound) => {
        const soundElement = document.getElementById(`sound-${sound}`);
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(() => {}); // Ignora erros se o áudio não puder tocar
        }
    };

    // Animação de atualização de saldo
    const animateBalance = (targetValue) => {
        const startValue = saldo;
        const duration = 1000;
        let startTime = null;

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentBalance = startValue + (targetValue - startValue) * progress;
            const formattedBalance = `R$ ${currentBalance.toFixed(2).replace('.', ',')}`;
            allElements.headerBalanceSpan.textContent = formattedBalance;
            allElements.panelBalanceSpan.textContent = formattedBalance;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                saldo = targetValue;
                localStorage.setItem('playerBalance', saldo);
            }
        };
        requestAnimationFrame(step);
    };

    // Atualiza o saldo na tela
    const updateBalanceDisplay = (newValue, isAnimated = false) => {
        if (isAnimated) {
            animateBalance(newValue);
        } else {
            saldo = newValue;
            const formattedBalance = `R$ ${saldo.toFixed(2).replace('.', ',')}`;
            allElements.headerBalanceSpan.textContent = formattedBalance;
            allElements.panelBalanceSpan.textContent = formattedBalance;
            localStorage.setItem('playerBalance', saldo);
        }
    };

    // Mostra alertas customizados na tela
    const showAlert = (message, type = 'error') => {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) existingAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert alert-${type}`;
        alertDiv.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.classList.add('show'), 10);
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 500);
        }, 4000);
    };
    
    // Transforma o e-mail em um nome de jogador "digno"
    const formatarNomeDeEmail = (email) => {
        if (!email || !email.includes('@')) return `"${email || 'Agente Anônimo'}"`;
        let nome = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
        return nome.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || "Herói Misterioso";
    };

    // --- LÓGICA DE INTERFACE (Onde a mágica acontece) ---

    // Preloader some após um tempo
    window.onload = () => {
        setTimeout(() => {
            if (allElements.preloader) allElements.preloader.classList.add('hidden');
        }, 2000); // Tempo reduzido para melhor experiência
    };

    // Gerencia a visibilidade dos Modais
    const toggleModal = (modal, show) => {
        if (modal) modal.classList.toggle('show', show);
    };

    // Mostra o painel do jogador e esconde o resto
    const showPlayerPanel = (usuario) => {
        allElements.homeSection.classList.add('hidden');
        allElements.playerPanel.classList.remove('hidden');
        allElements.playerPanel.classList.add('fadeIn');
        allElements.authButtonsHeader.classList.add('hidden');
        allElements.headerBalanceArea.classList.remove('hidden');

        toggleModal(allElements.authModal, false);
        
        const nomeFormatado = formatarNomeDeEmail(usuario);
        allElements.deadpoolAlertText.innerHTML = `E aí, ${nomeFormatado}! Cansou de ser normal? Ótimo! Seu dinheiro vai ser MUITO bem aproveitado aqui (por nós, claro). Boa sorte, você vai precisar!`;
        toggleModal(allElements.deadpoolAlert, true);
        
        updateBalanceDisplay(saldo === 0 ? 100.00 : saldo);
        startWinnerTicker();
        atualizarTimerBonus();
    };

    // Reseta a interface para o estado inicial
    const showHomeAndReset = () => {
        playSound('click');
        allElements.homeSection.classList.remove('hidden');
        allElements.playerPanel.classList.add('hidden');
        allElements.authButtonsHeader.classList.remove('hidden');
        allElements.headerBalanceArea.classList.add('hidden');
        toggleModal(allElements.authModal, false);
        toggleModal(allElements.depositModal, false);
        toggleModal(allElements.withdrawModal, false);
    };

    // --- EVENT LISTENERS (Os gatilhos da bagunça) ---

    allElements.logoClickable.addEventListener('click', showHomeAndReset);
    allElements.openLoginBtn.addEventListener('click', () => { playSound('click'); toggleModal(allElements.authModal, true); });
    allElements.openRegisterBtn.addEventListener('click', () => { playSound('click'); toggleModal(allElements.authModal, true); allElements.loginFormDiv.classList.add('hidden'); allElements.registerFormDiv.classList.remove('hidden'); });
    allElements.homeAcessarBtn.addEventListener('click', () => { playSound('click'); toggleModal(allElements.authModal, true); });
    allElements.closeAuthModalBtn.addEventListener('click', () => toggleModal(allElements.authModal, false));
    allElements.showRegisterFormBtn.addEventListener('click', () => { playSound('click'); allElements.loginFormDiv.classList.add('hidden'); allElements.registerFormDiv.classList.remove('hidden'); });
    allElements.showLoginFormBtn.addEventListener('click', () => { playSound('click'); allElements.registerFormDiv.classList.add('hidden'); allElements.loginFormDiv.classList.remove('hidden'); });
    allElements.deadpoolAlertBtn.addEventListener('click', () => { playSound('click'); toggleModal(allElements.deadpoolAlert, false); });

    // Lógica de Login
    allElements.entrarBtn.addEventListener('click', () => {
        playSound('click');
        const usuario = allElements.loginUsuarioInput.value.trim();
        const senha = allElements.loginSenhaInput.value.trim();

        if (usuario.length < 3 || senha.length < 3) {
            playSound('error');
            allElements.loginFormDiv.classList.add('shake');
            setTimeout(() => allElements.loginFormDiv.classList.remove('shake'), 500);
            return;
        }

        allElements.entrarBtn.disabled = true;
        allElements.entrarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            playSound('login');
            showPlayerPanel(usuario);
            allElements.entrarBtn.disabled = false;
            allElements.entrarBtn.innerHTML = '<span class="btn-text">Quebrar a 4ª parede (Entrar)</span>';
        }, 1500);
    });

    // Lógica de Registro
    allElements.registerAccountBtn.addEventListener('click', () => {
        // ... (lógica de registro pode ser adicionada aqui)
        playSound('success');
        showAlert('Conta "criada"! Agora vai pro login e entra na festa.', 'success');
        allElements.showLoginFormBtn.click();
    });
    
    // Ver/Ocultar senha
    allElements.togglePasswordButtons.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetInput = document.getElementById(this.dataset.target);
            if (targetInput) {
                const type = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
                targetInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    // --- LÓGICA DO CAÇA-NÍQUEL ---
    allElements.spinSlotBtn.addEventListener('click', () => {
        if (saldo < custoGiro) {
            playSound('error');
            showAlert(`Sem grana, sem festa! Você precisa de R$${custoGiro.toFixed(2)}.`);
            return;
        }

        updateBalanceDisplay(saldo - custoGiro, true);
        playSound('click');
        allElements.spinSlotBtn.disabled = true;
        allElements.spinSlotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        allElements.slotResult.textContent = 'Girando...';

        let spinCount = 0;
        const spinInterval = setInterval(() => {
            allElements.reels.forEach(reel => {
                if (reel) reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            });
            spinCount++;
            if (spinCount > 20) {
                clearInterval(spinInterval);
                const finalReels = allElements.reels.map(() => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
                allElements.reels.forEach((reel, i) => reel.textContent = finalReels[i]);

                // Lógica de prêmios
                if (finalReels.every(s => s === '🦄')) {
                    playSound('cash');
                    updateBalanceDisplay(saldo + 100, true);
                    allElements.slotResult.textContent = "JACKPOT DE UNICÓRNIOS! +R$100!";
                } else if (finalReels.every(s => s === '💰')) {
                    playSound('cash');
                    updateBalanceDisplay(saldo + 50, true);
                    allElements.slotResult.textContent = "Chuva de dinheiro! +R$50!";
                } else if (finalReels.every(s => s === '💩')) {
                    playSound('troll');
                    allElements.slotResult.textContent = "Três... disso? Que MÁXIMO esforço!";
                } else if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
                    playSound('success');
                    updateBalanceDisplay(saldo + 15, true);
                    allElements.slotResult.textContent = `Trinca de ${finalReels[0]}! +R$15!`;
                } else {
                    playSound('error');
                    allElements.slotResult.textContent = "Quase! Tente de novo (nós insistimos).";
                }
                
                allElements.spinSlotBtn.disabled = false;
                allElements.spinSlotBtn.innerHTML = `Puxar a Alavanca do Caos! (Custa R$${custoGiro})`;
            }
        }, 100);
    });

    // --- OUTRAS FUNCIONALIDADES (Bônus, Saque, etc.) ---
    
    // ... (O restante das suas funções, como depósito, saque e bônus podem ser adicionadas aqui.
    // A estrutura já está pronta para recebê-las.)

    const startWinnerTicker = () => {
        // Sua função de ticker
    };
    const atualizarTimerBonus = () => {
        // Sua função de bônus
    };

    // Inicialização
    updateBalanceDisplay(saldo);

});
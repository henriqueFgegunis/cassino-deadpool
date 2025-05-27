window.onload = function() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
      setTimeout(() => {
          preloader.classList.add('hidden');
      }, 2800);
  }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = document.getElementById('close-auth-modal');
    const openLoginBtn = document.getElementById('open-login-btn');
    const openRegisterBtn = document.getElementById('open-register-btn');
    const homeAcessarBtn = document.getElementById('home-acessar-btn'); 
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const showLoginFormBtn = document.getElementById('show-login-form');
    const loginFormDiv = document.getElementById('login-form');
    const registerFormDiv = document.getElementById('register-form');
    const headerBalanceArea = document.getElementById('header-balance-area');
    const authButtonsHeader = document.getElementById('auth-buttons');
    const headerBalanceSpan = document.getElementById('header-balance');
    const panelBalanceSpan = document.getElementById('panel-balance');
    const homeSection = document.getElementById('home');
    const playerPanel = document.getElementById('player-panel');
    const entrarBtn = document.getElementById('entrar-btn');
    const registerAccountBtn = document.getElementById('register-account-btn');
    const loginUsuarioInput = document.getElementById('login-usuario');
    const loginSenhaInput = document.getElementById('login-senha');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const rememberMeCheck = document.getElementById('rememberMe'); // Certifique-se que este ID existe se for usar
    const depositBtn = document.getElementById('deposit-btn');
    const addFundsBtn = document.getElementById('add-funds');
    const bonusTimerDiv = document.getElementById('bonus-timer');
    const winnerTickerText = document.getElementById('winner-ticker-text');
    const depositModal = document.getElementById('deposit-modal');
    const closeDepositModalBtn = document.getElementById('close-deposit-modal');
    const depositSteps = document.querySelectorAll('.deposit-step');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const continueToMethodsBtn = document.getElementById('continue-to-methods');
    const methodButtons = document.querySelectorAll('.method-btn');
    const confirmationAreas = document.querySelectorAll('.confirmation-area');
    const confirmPaymentButtons = document.querySelectorAll('.confirm-payment-btn');
    const loadingArea = document.getElementById('loading-area');
    const successArea = document.getElementById('success-area');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const withdrawModal = document.getElementById('withdraw-modal');
    const closeWithdrawModalBtn = document.getElementById('close-withdraw-modal');
    const confirmTrollWithdrawBtn = document.getElementById('confirm-troll-withdraw');
    const spinSlotBtn = document.getElementById('spin-slot-btn');
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const slotResult = document.getElementById('slot-result');
    const logoClickable = document.getElementById('header-logo-clickable'); // ID adicionado ao logo no HTML

    // --- ESTADO INICIAL E VARIÁVEIS GLOBAIS ---
    let saldo = parseFloat(localStorage.getItem('playerBalance')) || 0;
    let proximoBonus = localStorage.getItem('proximoBonus') ? new Date(localStorage.getItem('proximoBonus')) : null;
    let countdownInterval;
    let selectedAmount = 0;
    const slotSymbols = ['🍓', '🍕', '🦄', '💩', '💰', '🌮', '💣', '💎'];
    const custoGiro = 5;

    // --- FUNÇÕES AUXILIARES ---
    window.playSound = (sound) => {
        const soundElement = document.getElementById(`sound-${sound}`);
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(() => {});
        }
    };

    function formatarNomeDeEmail(email) {
        if (!email || !email.includes('@')) { return `Jogador "${email || 'Misterioso'}" (que nome original, hein?)`; }
        let nome = email.substring(0, email.indexOf('@'));
        nome = nome.replace(/[._]/g, ' ').replace(/\d+/g, '').trim();
        return nome.split(' ').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ') || "Ser Anônimo";
    }
    
    function animateBalance(targetValue) {
        const startValue = saldo;
        const duration = 1000;
        let startTime = null;
        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentBalance = startValue + (targetValue - startValue) * progress;
            const formattedBalance = `R$ ${currentBalance.toFixed(2).replace('.', ',')}`;
            if(headerBalanceSpan) headerBalanceSpan.textContent = formattedBalance;
            if (panelBalanceSpan) panelBalanceSpan.textContent = formattedBalance;
            if (progress < 1) { requestAnimationFrame(step); } 
            else {
                saldo = targetValue;
                localStorage.setItem('playerBalance', saldo);
            }
        }
        requestAnimationFrame(step);
    }

    function updateBalanceDisplay(newValue, isAnimated = false) {
        if (isAnimated) { animateBalance(newValue); } 
        else {
            saldo = newValue;
            const formattedBalance = `R$ ${saldo.toFixed(2).replace('.', ',')}`;
            if(headerBalanceSpan) headerBalanceSpan.textContent = formattedBalance;
            if (panelBalanceSpan) panelBalanceSpan.textContent = formattedBalance;
            localStorage.setItem('playerBalance', saldo);
        }
    }
    
    window.mostrarAlerta = (mensagem, type = 'info') => {
        const existingAlert = document.querySelector('.alerta');
        if(existingAlert) existingAlert.remove();
        const alerta = document.createElement('div');
        alerta.className = `alerta ${type}`;
        alerta.innerHTML = `<i class="fas ${type === 'success' ? 'fa-grin-beam-sweat' : 'fa-dizzy'}"></i> <p>${mensagem}</p>`;
        document.body.appendChild(alerta);
        setTimeout(() => { alerta.style.opacity = '0'; setTimeout(() => alerta.remove(), 700); }, 4500);
    };

    function formatarTempo(ms) {
        const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), seg = s%60;
        return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(seg).padStart(2,'0')}s (ou uma eternidade)`;
    }
    
    togglePasswordButtons.forEach(toggle => {
        if(toggle) {
            toggle.addEventListener('click', function() {
                playSound('click');
                const targetInputId = this.dataset.target;
                const inputField = document.getElementById(targetInputId);
                if (inputField) {
                    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                    inputField.setAttribute('type', type);
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                }
            });
        }
    });

    window.openModal = function(formToShow = 'login') {
        if(authModal) {
            authModal.classList.add('show');
            if (formToShow === 'register') {
                if(loginFormDiv) loginFormDiv.classList.add('hidden');
                if(registerFormDiv) registerFormDiv.classList.remove('hidden');
            } else {
                if(loginFormDiv) loginFormDiv.classList.remove('hidden');
                if(registerFormDiv) registerFormDiv.classList.add('hidden');
            }
        }
    }
    
    function showHomeAndReset() {
        playSound('click');
        if(homeSection) homeSection.classList.remove('hidden');
        if(playerPanel) playerPanel.classList.add('hidden');
        if(authButtonsHeader) authButtonsHeader.classList.remove('hidden');
        if(headerBalanceArea) headerBalanceArea.classList.add('hidden');
        if(authModal) authModal.classList.remove('show'); 
        if(depositModal) depositModal.classList.remove('show');
        if (withdrawModal) withdrawModal.classList.remove('show');
    }
    if(logoClickable) logoClickable.addEventListener('click', showHomeAndReset);


    if(openLoginBtn) openLoginBtn.addEventListener('click', () => { playSound('click'); openModal('login'); });
    if(openRegisterBtn) openRegisterBtn.addEventListener('click', () => { playSound('click'); openModal('register'); });
    if(homeAcessarBtn) homeAcessarBtn.addEventListener('click', () => { playSound('click'); openModal('login'); });
    if(closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => {if(authModal) authModal.classList.remove('show');});
    if(showRegisterFormBtn) showRegisterFormBtn.addEventListener('click', () => { playSound('click'); if(loginFormDiv) loginFormDiv.classList.add('hidden'); if(registerFormDiv) registerFormDiv.classList.remove('hidden'); });
    if(showLoginFormBtn) showLoginFormBtn.addEventListener('click', () => { playSound('click'); if(registerFormDiv) registerFormDiv.classList.add('hidden'); if(loginFormDiv) loginFormDiv.classList.remove('hidden'); });
    
    if(entrarBtn) {
        entrarBtn.addEventListener('click', () => {
            playSound('click');
            const usuario = loginUsuarioInput.value.trim();
            const senha = loginSenhaInput.value.trim();
            if (usuario.length < 3 || senha.length < 3) {
                playSound('error');
                if(loginFormDiv) loginFormDiv.classList.add('shake');
                mostrarAlerta('Tá de sacanagem? Preenche direito esses campos ou o Tio Pool vai te dar um cascudo virtual!', 'error');
                setTimeout(() => {if(loginFormDiv) loginFormDiv.classList.remove('shake')}, 600);
                return;
            }
            // const rememberMeCheckbox = document.getElementById('rememberMe');
            // if (rememberMeCheckbox && rememberMeCheckbox.checked) { localStorage.setItem('rememberedUser', usuario); } else { localStorage.removeItem('rememberedUser'); }
            
            entrarBtn.disabled = true;
            entrarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando sua "importância"...';
            
            setTimeout(() => {
                if(authModal) authModal.classList.remove('show');
                if(homeSection) homeSection.classList.add('hidden');
                if(playerPanel) playerPanel.classList.remove('hidden');
                if(playerPanel) playerPanel.style.animation = 'fadeIn 0.5s ease-in-out';
                if(authButtonsHeader) authButtonsHeader.classList.add('hidden');
                if(headerBalanceArea) headerBalanceArea.classList.remove('hidden');
                
                entrarBtn.disabled = false;
                entrarBtn.innerHTML = '<span class="btn-text">Entrar (por sua conta e risco)</span>';
                
                if (saldo === 0) { updateBalanceDisplay(100.00, false); } else { updateBalanceDisplay(saldo, false); }
                
                const nomeFormatado = formatarNomeDeEmail(usuario);
                showDeadpoolWelcomeAlert(nomeFormatado); 
                startWinnerTicker();
                atualizarTimerBonus();
            }, 1500);
        });
    }
    
    if(registerAccountBtn) {
        registerAccountBtn.addEventListener('click', () => {
            playSound('click');
            const regEmail = registerEmailInput.value;
            const regPass = registerPasswordInput.value;
            if (!regEmail.includes('@') || regPass.length < 3) {
                playSound('error'); if(registerFormDiv) registerFormDiv.classList.add('shake');
                mostrarAlerta('Preencheu errado, espertão? Ou a senha é "123"? Assim não dá pra te levar a sério (nem eu me levo).', 'error');
                setTimeout(() => {if(registerFormDiv) registerFormDiv.classList.remove('shake')}, 600); return;
            }
            mostrarAlerta('"Conta criada"! Viu? Nem doeu. Agora vai lá no login e finge que isso tudo é sério.', 'success');
            if(showLoginFormBtn) showLoginFormBtn.click();
        });
    }

    function showDeadpoolWelcomeAlert(nomeJogador) {
        playSound('login'); 
        const alertOverlay = document.getElementById('deadpool-alert-welcome'); // Usando o ID do HTML
        const welcomeText = document.getElementById('deadpool-welcome-text');
        const okBtn = document.getElementById('deadpool-ok-btn');

        if(alertOverlay && welcomeText && okBtn) {
            welcomeText.innerHTML = `Aí sim, ${nomeJogador}! Seu dinheiro vai ser MUITO bem gasto aqui (pela gente, claro). Prepare-se para a glória... ou para comer miojo o resto do mês!`;
            alertOverlay.classList.add('show');
            okBtn.onclick = () => { // Usando onclick para garantir que só há um listener
                 playSound('click'); 
                 alertOverlay.classList.remove('show'); 
            };
        }
    }
    
    function showDepositStep(stepNumber) { 
        if(depositSteps.length > 0) depositSteps.forEach(step => step.classList.remove('active')); 
        const targetStep = document.getElementById(`step-${stepNumber}`); 
        if(targetStep) targetStep.classList.add('active'); 
    }

    if(depositBtn) depositBtn.addEventListener('click', () => { playSound('click'); showDepositStep(1); if(customAmountInput) customAmountInput.value = ''; if(depositModal) depositModal.classList.add('show'); });
    if(closeDepositModalBtn) closeDepositModalBtn.addEventListener('click', () => {if(depositModal) depositModal.classList.remove('show');});
    if(depositModal) depositModal.addEventListener('click', (e) => { if (e.target === depositModal) depositModal.classList.remove('show'); });
    amountButtons.forEach(btn => { btn.addEventListener('click', () => { playSound('click');selectedAmount = parseFloat(btn.dataset.amount); showDepositStep(2); }); });
    if(continueToMethodsBtn) continueToMethodsBtn.addEventListener('click', () => { playSound('click');const customAmount = parseFloat(customAmountInput.value); if (isNaN(customAmount) || customAmount <= 0) { mostrarAlerta('Valor inválido. Quer doar 0 reais? Esperto você, hein?', 'error'); return; } selectedAmount = customAmount; showDepositStep(2); });
    methodButtons.forEach(btn => { btn.addEventListener('click', () => { playSound('click');const method = btn.dataset.method; showDepositStep(3); confirmationAreas.forEach(area => area.classList.add('hidden')); const targetArea = document.getElementById(`confirmation-${method}`); if(targetArea) targetArea.classList.remove('hidden'); }); });
    confirmPaymentButtons.forEach(btn => { btn.addEventListener('click', () => { playSound('click');showDepositStep(4); if(loadingArea) loadingArea.classList.remove('hidden'); if(successArea) successArea.classList.add('hidden'); playSound('click'); setTimeout(() => { if(loadingArea) loadingArea.classList.add('hidden'); if(successArea) successArea.classList.remove('hidden'); playSound('cash'); const newBalance = saldo + selectedAmount; updateBalanceDisplay(newBalance, true); setTimeout(() => { if(depositModal) depositModal.classList.remove('show'); }, 1500); }, 2500); }); });

    function atualizarTimerBonus() {
        if(!addFundsBtn || !bonusTimerDiv) return; 
        clearInterval(countdownInterval);
        if (proximoBonus && new Date() < proximoBonus) {
            addFundsBtn.disabled = true; bonusTimerDiv.classList.remove('hidden');
            countdownInterval = setInterval(() => {
                const diff = proximoBonus - new Date();
                if (diff <= 0) {
                    clearInterval(countdownInterval); bonusTimerDiv.classList.add('hidden'); addFundsBtn.disabled = false;
                    addFundsBtn.innerHTML = 'Pegar Esmola Diária (não se acostuma!) <i class="fas fa-handshake-angle"></i>';
                    localStorage.removeItem('proximoBonus'); proximoBonus = null;
                    mostrarAlerta('Sua mixaria diária está disponível! Não gaste tudo de uma vez.', 'success');
                } else {
                    addFundsBtn.innerHTML = 'Aguardando a boa vontade do sistema...';
                    bonusTimerDiv.innerHTML = `<i class="fas fa-hourglass-half"></i> ${formatarTempo(diff)}`;
                }
            }, 1000);
        } else {
            addFundsBtn.disabled = false;
            addFundsBtn.innerHTML = 'Pegar Esmola Diária (não se acostuma!) <i class="fas fa-handshake-angle"></i>';
            bonusTimerDiv.classList.add('hidden');
        }
    }
    if(addFundsBtn) addFundsBtn.addEventListener('click', () => { playSound('click'); if (proximoBonus && new Date() < proximoBonus) { playSound('error'); mostrarAlerta('Segura a emoção, apressadinho! O "bônus" é só uma vez por dia.', 'error'); return; } const bonusAmount = Math.floor(Math.random() * 20) + 1; const newBalance = saldo + bonusAmount; updateBalanceDisplay(newBalance, true); playSound('cash'); mostrarAlerta(`Achou R$ ${bonusAmount.toFixed(2).replace('.',',')} perdidos no sofá! Que sorte... ou não.`, 'success'); proximoBonus = new Date(); proximoBonus.setHours(proximoBonus.getHours() + 24); localStorage.setItem('proximoBonus', proximoBonus.toISOString()); atualizarTimerBonus(); });
    
    const nomes = ["Wade Wilson", "Colossus (reclamando)", "Míssil Adolescente (no TikTok)", "Dopinder (atrasado de novo)", "Al Cega (mas com sorte)", "Vanessa (tentando não rir)"];
    const jogos = ["Roleta da Incerteza Cósmica", "Blackjack do Desespero", "Caça-Níquel da Chimichanga Suprema", "Poker das Desculpas Esfarrapadas"];
    const premios = ["um unicórnio inflável", "meio saco de balas de goma", "o direito de NÃO lavar a louça hoje", "uma foto autografada por mim (Deadpool)", "um high-five relutante"];
    function updateWinnerTicker() { const nome = nomes[Math.floor(Math.random()*nomes.length)], jogo = jogos[Math.floor(Math.random()*jogos.length)], premio = premios[Math.floor(Math.random()*premios.length)]; if(winnerTickerText) winnerTickerText.innerHTML = `<i class="fas fa-trophy"></i> Última Fofoca: <span>${nome}</span> "ganhou" <span>${premio}</span> em <span>'${jogo}'</span>! E eu aqui só olhando...`; }
    function startWinnerTicker() { if(winnerTickerText) {updateWinnerTicker(); setInterval(updateWinnerTicker, 7500);} }
    
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            playSound('click');
            if(withdrawModal) withdrawModal.classList.add('show');
        });
    }
    if (closeWithdrawModalBtn) {
        closeWithdrawModalBtn.addEventListener('click', () => {
            if(withdrawModal) withdrawModal.classList.remove('show');
        });
    }
    if (withdrawModal) {
        withdrawModal.addEventListener('click', (e) => {
            if (e.target === withdrawModal) {
                withdrawModal.classList.remove('show');
            }
        });
    }
    if (confirmTrollWithdrawBtn) {
        confirmTrollWithdrawBtn.addEventListener('click', () => {
            playSound('troll'); 
            updateBalanceDisplay(0, true); 
            if(withdrawModal) withdrawModal.classList.remove('show');
            mostrarAlerta('Sacamos o seu dinheiro (pra nossa conta, óbvio). Valeu, trouxa! Volte sempre para mais "diversão"! HAHAHA!', 'error');
        });
    }
    
    if (spinSlotBtn) {
        spinSlotBtn.addEventListener('click', () => {
            playSound('click');
            if (saldo < custoGiro) {
                playSound('error');
                mostrarAlerta(`Ops! Você precisa de pelo menos R$${custoGiro.toFixed(2).replace('.',',')} pra essa palhaçada. Vá "depositar" mais, mão de vaca!`, 'error');
                return;
            }
            updateBalanceDisplay(saldo - custoGiro, true);
            if(slotResult) slotResult.textContent = "Girandooooo... e torcendo pra não dar M*RDA!";
            if(spinSlotBtn) {
                spinSlotBtn.disabled = true;
                spinSlotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sorteando sua desgraça...';
            }
            const reelsElements = [reel1, reel2, reel3];
            reelsElements.forEach(r => {if(r) r.classList.add('reel-spinning'); });
            let spinCount = 0;
            const maxSpins = 20 + Math.floor(Math.random() * 10);
            const spinInterval = setInterval(() => {
                reelsElements.forEach(r => { if(r) r.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; });
                spinCount++;
                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);
                    reelsElements.forEach(r => {if(r) r.classList.remove('reel-spinning'); });
                    const r1_val = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                    const r2_val = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                    const r3_val = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                    if(reel1) reel1.textContent = r1_val; if(reel2) reel2.textContent = r2_val; if(reel3) reel3.textContent = r3_val;
                    if (r1_val === '🦄' && r2_val === '🦄' && r3_val === '🦄') { playSound('cash'); const premio = 100; updateBalanceDisplay(saldo + premio, true); if(slotResult) slotResult.textContent = `UNICÓRNIOS! Você ganhou R$${premio}! ...Só que não. Mas toma aí uns trocados pra não chorar.`; }
                    else if (r1_val === '💰' && r2_val === '💰' && r3_val === '💰') { playSound('cash'); const premio = 50; updateBalanceDisplay(saldo + premio, true); if(slotResult) slotResult.textContent = `DINHEIRO! R$${premio} pra você! (Não se acostuma, viu?)`; }
                    else if (r1_val === '💩' && r2_val === '💩' && r3_val === '💩') { playSound('error'); if(slotResult) slotResult.textContent = "TRÊS COCÔS?! Que fase, hein? Limpa isso e tenta de novo, se tiver coragem."; }
                    else if (r1_val === r2_val && r2_val === r3_val) { playSound('success'); const premioMenor = 10; updateBalanceDisplay(saldo + premioMenor, true); if(slotResult) slotResult.textContent = `Boa, uma trinca de ${r1_val}! Ganhou R$${premioMenor}. Já dá pra um chiclete.`; }
                    else { playSound('error'); if(slotResult) slotResult.textContent = "NADA! Mais sorte da próxima vez (spoiler: provavelmente não)."; }
                    if(spinSlotBtn) {spinSlotBtn.disabled = false; spinSlotBtn.innerHTML = 'Girar essa geringonça! (Custa R$5)';}
                }
            }, 100);
        });
    }

    const rememberedUserStored = localStorage.getItem('rememberedUser');
    if (rememberedUserStored && loginUsuarioInput) {
        loginUsuarioInput.value = rememberedUserStored;
        const rememberMeCheckbox = document.getElementById('rememberMe');
         if(rememberMeCheckbox) rememberMeCheckbox.checked = true; // Verifica se o checkbox existe
    }

    updateBalanceDisplay(saldo);
    atualizarTimerBonus();
  });

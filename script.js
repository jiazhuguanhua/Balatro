// 游戏状态管理
class BalatroGame {
    constructor() {
        this.score = 0;
        this.round = 1;
        this.lives = 3;
        this.targetScore = 300;
        this.currentHandScore = 0;
        this.money = 100;
        this.deck = [];
        this.hand = [];
        this.selectedCards = [];
        this.discards = 3;
        this.hands = 4;
        this.shopItems = [];
        this.activeSkills = [];
        this.permanentBonuses = {
            scoreMultiplier: 1,
            extraHands: 0,
            extraDiscards: 0,
            extraMoney: 0
        };
        
        // 音频设置
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.bgMusic = document.getElementById('bgMusic');
        
        this.initGame();
        this.bindEvents();
        this.initAudio();
        this.initVisualEffects();
    }

    // 初始化音频
    initAudio() {
        this.bgMusic.volume = 0.3;
        this.playBackgroundMusic();
        
        // 创建音效对象
        this.sounds = {
            cardSelect: this.createSound([220, 330], 0.1, 'square'),
            cardPlay: this.createSound([440, 550, 660], 0.15, 'triangle'),
            scoreUp: this.createSound([523, 659, 784], 0.2, 'sine'),
            roundWin: this.createSound([392, 523, 659, 784], 0.3, 'triangle'),
            roundLose: this.createSound([220, 196, 175], 0.2, 'sawtooth'),
            purchase: this.createSound([659, 784, 880], 0.15, 'sine'),
            error: this.createSound([147, 131], 0.15, 'square')
        };
    }

    // 创建音效
    createSound(frequencies, volume = 0.1, type = 'sine') {
        return () => {
            if (!this.sfxEnabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const duration = 0.2;
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime + index * 0.05);
                oscillator.stop(audioContext.currentTime + duration + index * 0.05);
            });
        };
    }

    // 播放背景音乐 - 改进版本
    playBackgroundMusic() {
        if (this.musicEnabled && this.bgMusic) {
            // 创建更适合的背景音乐
            this.generateBetterBackgroundMusic();
        }
    }

    // 生成更好的背景音乐
    generateBetterBackgroundMusic() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建主和弦进行 - 使用更舒缓的音调
        const chordProgression = [
            [220, 277, 330], // Am
            [246, 311, 370], // Bm
            [261, 330, 392], // C
            [293, 370, 440], // Dm
            [220, 277, 330], // Am
            [246, 311, 370], // Bm
            [261, 330, 392], // C
            [196, 246, 293]  // G
        ];
        
        let chordIndex = 0;
        const playChord = () => {
            if (!this.musicEnabled) return;
            
            const chord = chordProgression[chordIndex];
            chordIndex = (chordIndex + 1) % chordProgression.length;
            
            // 为每个音符创建振荡器
            chord.forEach((frequency, noteIndex) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filterNode = audioContext.createBiquadFilter();
                
                // 设置音色和滤波器
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(frequency * 0.5, audioContext.currentTime); // 降低一个八度
                
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
                filterNode.Q.setValueAtTime(1, audioContext.currentTime);
                
                // 连接音频节点
                oscillator.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // 设置音量包络
                const volume = 0.03 * (1 - noteIndex * 0.2); // 根音最响
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.currentTime + 2.8);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3);
                
                // 播放音符
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 3);
            });
            
            // 添加轻柔的旋律线
            if (Math.random() < 0.4) {
                this.playMelodyNote(audioContext, chord[0] * 2); // 高八度旋律
            }
        };
        
        // 开始播放和弦进行
        playChord();
        this.musicInterval = setInterval(playChord, 3000);
    }

    // 播放旋律音符
    playMelodyNote(audioContext, baseFreq) {
        const melodyNotes = [baseFreq, baseFreq * 1.125, baseFreq * 1.25, baseFreq * 1.5];
        const randomNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(randomNote, audioContext.currentTime);
        
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
    }

    // 初始化视觉效果
    initVisualEffects() {
        this.createFloatingParticles();
        this.startStarAnimation();
    }

    // 创建浮动粒子
    createFloatingParticles() {
        const container = document.getElementById('particlesContainer');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: radial-gradient(circle, #00ffff, transparent);
                border-radius: 50%;
                pointer-events: none;
                animation: floatParticle ${5 + Math.random() * 10}s linear infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.3 + Math.random() * 0.7};
            `;
            container.appendChild(particle);
        }
        
        // 添加粒子动画样式
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes floatParticle {
                    0% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-100px) translateX(50px); }
                    50% { transform: translateY(-200px) translateX(-30px); }
                    75% { transform: translateY(-300px) translateX(80px); }
                    100% { transform: translateY(-400px) translateX(-20px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 开始星星动画
    startStarAnimation() {
        setInterval(() => {
            this.createShootingStar();
        }, 3000 + Math.random() * 5000);
    }

    // 创建流星效果
    createShootingStar() {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: linear-gradient(45deg, #ffffff, #00ffff);
            box-shadow: 0 0 10px #ffffff;
            top: ${Math.random() * 50}%;
            left: -10px;
            animation: shootingStar 2s linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.getElementById('starsContainer').appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 2000);
        
        // 添加流星动画
        if (!document.getElementById('shooting-star-styles')) {
            const style = document.createElement('style');
            style.id = 'shooting-star-styles';
            style.textContent = `
                @keyframes shootingStar {
                    0% { 
                        left: -10px; 
                        top: ${Math.random() * 50}%; 
                        opacity: 0;
                        transform: scale(0);
                    }
                    10% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                    90% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% { 
                        left: 110%; 
                        top: ${Math.random() * 50 + 30}%; 
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 创建分数爆炸效果
    createScoreExplosion(element, score) {
        const explosion = document.createElement('div');
        explosion.textContent = `+${score}`;
        explosion.style.cssText = `
            position: absolute;
            color: #00ff00;
            font-size: 2rem;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            animation: scoreExplosion 1s ease-out forwards;
            text-shadow: 0 0 10px #00ff00;
        `;
        
        const rect = element.getBoundingClientRect();
        explosion.style.left = rect.left + rect.width / 2 + 'px';
        explosion.style.top = rect.top + 'px';
        
        document.body.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 1000);
        
        // 添加分数爆炸动画
        if (!document.getElementById('score-explosion-styles')) {
            const style = document.createElement('style');
            style.id = 'score-explosion-styles';
            style.textContent = `
                @keyframes scoreExplosion {
                    0% { 
                        transform: translateY(0) scale(0.5);
                        opacity: 1;
                    }
                    50% { 
                        transform: translateY(-50px) scale(1.2);
                        opacity: 1;
                    }
                    100% { 
                        transform: translateY(-100px) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 初始化游戏
    initGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialHand();
        this.generateShopItems();
        this.updateUI();
    }

    // 创建标准扑克牌组
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suitClasses = ['spades', 'hearts', 'diamonds', 'clubs'];
        
        this.deck = [];
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                this.deck.push({
                    suit: suits[i],
                    rank: ranks[j],
                    suitClass: suitClasses[i],
                    value: this.getCardValue(ranks[j]),
                    id: `${ranks[j]}_${suitClasses[i]}`
                });
            }
        }
    }

    // 获取卡牌数值
    getCardValue(rank) {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        return parseInt(rank);
    }

    // 洗牌
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // 发初始手牌
    dealInitialHand() {
        this.hand = this.deck.splice(0, 8);
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('playHandBtn').addEventListener('click', () => this.playHand());
        document.getElementById('discardBtn').addEventListener('click', () => this.discardCards());
        document.getElementById('drawBtn').addEventListener('click', () => this.drawCards());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('skipShopBtn').addEventListener('click', () => this.skipShop());
        document.getElementById('refreshShopBtn').addEventListener('click', () => this.refreshShop());
        
        // 音频控制
        document.getElementById('musicToggle').addEventListener('click', () => this.toggleMusic());
        document.getElementById('sfxToggle').addEventListener('click', () => this.toggleSFX());
    }

    // 切换背景音乐
    // 音乐控制 - 增强版
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const btn = document.getElementById('musicToggle');
        
        if (this.musicEnabled) {
            btn.textContent = '🎵';
            btn.classList.remove('muted');
            this.playBackgroundMusic();
        } else {
            btn.textContent = '🔇';
            btn.classList.add('muted');
            this.stopBackgroundMusic();
        }
    }

    // 切换音效
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        const btn = document.getElementById('sfxToggle');
        
        if (this.sfxEnabled) {
            btn.textContent = '🔊';
            btn.classList.remove('muted');
        } else {
            btn.textContent = '🔇';
            btn.classList.add('muted');
        }
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    // 更新UI
    // 更新UI - 增强版
    updateUI() {
        // 基础信息更新
        document.getElementById('score').textContent = this.score;
        document.getElementById('round').textContent = this.round;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('targetScore').textContent = this.targetScore;
        document.getElementById('handScore').textContent = this.currentHandScore;
        document.getElementById('playerMoney').textContent = this.money;
        document.getElementById('handsLeft').textContent = this.hands;
        document.getElementById('discardsLeft').textContent = this.discards;
        
        // 智能高亮系统
        this.applySmartHighlighting();
        
        // 渲染组件
        this.renderHand();
        this.renderSelectedCards();
        this.renderActiveSkills();
        this.updateHandType();
    }

    // 智能高亮系统
    applySmartHighlighting() {
        // 重置所有高亮
        this.clearHighlights();
        
        // 生命值警告
        const livesElement = document.getElementById('lives');
        if (this.lives <= 1) {
            livesElement.style.color = '#ff4444';
            livesElement.classList.add('highlight');
        } else if (this.lives <= 2) {
            livesElement.style.color = '#ffaa00';
        } else {
            livesElement.style.color = '#00ff00';
        }
        
        // 出牌次数警告
        const handsElement = document.getElementById('handsLeft');
        if (this.hands <= 1) {
            handsElement.style.color = '#ff4444';
            handsElement.classList.add('hands-warning');
        } else if (this.hands <= 2) {
            handsElement.style.color = '#ffaa00';
        } else {
            handsElement.style.color = '#00ffff';
        }
        
        // 目标分数状态
        const targetElement = document.getElementById('targetScore');
        const progressPercentage = (this.score / this.targetScore) * 100;
        
        if (progressPercentage >= 90) {
            targetElement.style.color = '#00ff00';
        } else if (progressPercentage >= 70) {
            targetElement.style.color = '#ffff00';
        } else if (progressPercentage >= 40) {
            targetElement.style.color = '#ffaa00';
        } else {
            targetElement.style.color = '#ff6600';
            targetElement.classList.add('critical');
        }
        
        // 分数高亮
        const scoreElement = document.getElementById('score');
        if (this.score >= this.targetScore) {
            scoreElement.style.color = '#00ff00';
            scoreElement.classList.add('highlight');
        } else if (this.score >= this.targetScore * 0.8) {
            scoreElement.style.color = '#ffff00';
        } else {
            scoreElement.style.color = '#00ffff';
        }
        
        // 金币状态
        const moneyElement = document.getElementById('playerMoney');
        if (this.money >= 200) {
            moneyElement.style.color = '#ffd700';
            moneyElement.classList.add('highlight');
        } else if (this.money >= 100) {
            moneyElement.style.color = '#ffaa00';
        } else if (this.money < 50) {
            moneyElement.style.color = '#ff6666';
        } else {
            moneyElement.style.color = '#ffffff';
        }
    }

    // 清除所有高亮
    clearHighlights() {
        const elements = [
            'lives', 'handsLeft', 'targetScore', 'score', 'playerMoney'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('highlight', 'hands-warning', 'critical');
                element.style.color = ''; // 重置为默认颜色
            }
        });
    }

    // 渲染激活的技能牌
    renderActiveSkills() {
        const skillContainer = document.getElementById('activeSkills');
        
        if (this.activeSkills.length === 0) {
            skillContainer.innerHTML = '<div class="no-skills">暂无技能牌</div>';
            return;
        }
        
        skillContainer.innerHTML = '';
        this.activeSkills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-card-mini';
            skillElement.innerHTML = `
                <div style="font-size: 1.2rem;">${skill.icon}</div>
                <div style="font-size: 0.6rem;">${skill.shortName}</div>
            `;
            skillElement.title = `${skill.name}: ${skill.description}`;
            skillContainer.appendChild(skillElement);
        });
    }

    // 渲染手牌
    renderHand() {
        const handContainer = document.getElementById('handCards');
        handContainer.innerHTML = '';
        
        this.hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.classList.add('card-enter');
            cardElement.style.animationDelay = `${index * 0.1}s`;
            cardElement.addEventListener('click', () => this.selectCard(card));
            handContainer.appendChild(cardElement);
        });
    }

    // 渲染选中的卡牌
    renderSelectedCards() {
        const selectedContainer = document.getElementById('selectedCards');
        selectedContainer.innerHTML = '';
        
        this.selectedCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.classList.add('selected');
            cardElement.style.animationDelay = `${index * 0.05}s`;
            cardElement.addEventListener('click', () => this.deselectCard(card));
            selectedContainer.appendChild(cardElement);
        });
    }

    // 创建卡牌元素
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suitClass}`;
        cardDiv.innerHTML = `
            <div class="card-rank">${card.rank}</div>
            <div class="card-suit">${card.suit}</div>
            <div class="card-rank" style="transform: rotate(180deg);">${card.rank}</div>
        `;
        
        // 添加卡牌悬停音效
        cardDiv.addEventListener('mouseenter', () => {
            if (this.sfxEnabled) {
                // 轻微的悬停音效
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        });
        
        return cardDiv;
    }

    // 选择卡牌
    selectCard(card) {
        if (this.selectedCards.length < 5 && !this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
            this.sounds.cardSelect();
            this.addCardSelectEffect(card);
            this.updateUI();
        }
    }

    // 取消选择卡牌
    deselectCard(card) {
        const index = this.selectedCards.indexOf(card);
        if (index > -1) {
            this.selectedCards.splice(index, 1);
            this.sounds.cardSelect();
            this.updateUI();
        }
    }

    // 添加卡牌选择特效
    addCardSelectEffect(card) {
        // 创建光环效果
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(element => {
            if (element.textContent.includes(card.rank) && element.textContent.includes(card.suit)) {
                this.createCardGlow(element);
            }
        });
    }

    // 创建卡牌光环效果
    createCardGlow(element) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: radial-gradient(circle, rgba(0, 255, 255, 0.6), transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: cardGlowPulse 0.5s ease-out;
            z-index: -1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(glow);
        
        setTimeout(() => {
            if (glow.parentNode) {
                glow.parentNode.removeChild(glow);
            }
        }, 500);
        
        // 添加光环动画
        if (!document.getElementById('card-glow-styles')) {
            const style = document.createElement('style');
            style.id = 'card-glow-styles';
            style.textContent = `
                @keyframes cardGlowPulse {
                    0% { 
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% { 
                        transform: scale(1.2);
                        opacity: 1;
                    }
                    100% { 
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 更新手牌类型显示
    updateHandType() {
        const handType = this.getHandType(this.selectedCards);
        const scoreDetails = this.calculateDetailedHandScore(this.selectedCards, handType);
        
        document.getElementById('handType').textContent = handType.name;
        
        // 更新分数详情
        document.getElementById('baseChips').textContent = scoreDetails.baseChips;
        document.getElementById('cardTotal').textContent = scoreDetails.cardTotal;
        document.getElementById('chipsTotal').textContent = scoreDetails.totalChips;
        document.getElementById('multiplierTotal').textContent = scoreDetails.totalMultiplier + 'x';
        document.getElementById('finalScore').textContent = scoreDetails.finalScore;
        
        this.currentHandScore = scoreDetails.finalScore;
        document.getElementById('handScore').textContent = scoreDetails.finalScore;
        
        const playBtn = document.getElementById('playHandBtn');
        playBtn.disabled = this.selectedCards.length === 0 || this.hands <= 0;
    }

    // 计算详细的手牌分数
    calculateDetailedHandScore(cards, handType) {
        if (cards.length === 0) {
            return {
                baseChips: 0,
                cardTotal: 0,
                totalChips: 0,
                baseMultiplier: 0,
                skillMultiplier: 0,
                permanentMultiplier: 1,
                totalMultiplier: 0,
                finalScore: 0,
                breakdown: []
            };
        }
        
        let baseChips = handType.chips;
        let baseMultiplier = handType.multiplier;
        const cardTotal = cards.reduce((sum, card) => sum + card.value, 0);
        
        let skillChipsBonus = 0;
        let skillMultiplierBonus = 0;
        let breakdown = [];
        
        // 应用技能牌效果并记录详情
        this.activeSkills.forEach(skill => {
            switch (skill.effect.type) {
                case 'chipBonus':
                    skillChipsBonus += skill.effect.value;
                    breakdown.push(`${skill.name}: +${skill.effect.value} 筹码`);
                    break;
                case 'multiplierBonus':
                    skillMultiplierBonus += skill.effect.value;
                    breakdown.push(`${skill.name}: +${skill.effect.value} 倍率`);
                    break;
                case 'handTypeBonus':
                    if (handType.name === skill.effect.handType) {
                        skillMultiplierBonus += skill.effect.value;
                        breakdown.push(`${skill.name}: +${skill.effect.value} 倍率 (${skill.effect.handType})`);
                    }
                    break;
                case 'suitBonus':
                    const suitCount = cards.filter(card => card.suit === skill.effect.suit).length;
                    if (suitCount > 0) {
                        const bonus = suitCount * skill.effect.value;
                        skillChipsBonus += bonus;
                        breakdown.push(`${skill.name}: +${bonus} 筹码 (${suitCount}张${skill.effect.suit})`);
                    }
                    break;
                case 'rankBonus':
                    const rankCount = cards.filter(card => card.rank === skill.effect.rank).length;
                    if (rankCount > 0) {
                        const bonus = rankCount * skill.effect.value;
                        skillMultiplierBonus += bonus;
                        breakdown.push(`${skill.name}: +${bonus} 倍率 (${rankCount}张${skill.effect.rank})`);
                    }
                    break;
            }
        });
        
        const totalChips = baseChips + cardTotal + skillChipsBonus;
        const totalMultiplier = (baseMultiplier + skillMultiplierBonus) * this.permanentBonuses.scoreMultiplier;
        const finalScore = Math.floor(totalChips * totalMultiplier);
        
        return {
            baseChips,
            cardTotal,
            skillChipsBonus,
            totalChips,
            baseMultiplier,
            skillMultiplierBonus,
            permanentMultiplier: this.permanentBonuses.scoreMultiplier,
            totalMultiplier,
            finalScore,
            breakdown
        };
    }

    // 获取手牌类型
    getHandType(cards) {
        if (cards.length === 0) return { name: '选择卡牌', multiplier: 0, chips: 0 };
        if (cards.length === 1) return { name: '高牌', multiplier: 1, chips: cards[0].value };
        
        const ranks = cards.map(card => card.value).sort((a, b) => b - a);
        const suits = cards.map(card => card.suit);
        
        // 检查同花
        const isFlush = suits.every(suit => suit === suits[0]);
        
        // 检查顺子
        const isStraight = this.isStraight(ranks);
        
        // 统计相同牌面
        const rankCounts = {};
        ranks.forEach(rank => {
            rankCounts[rank] = (rankCounts[rank] || 0) + 1;
        });
        
        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        
        // 判断手牌类型
        if (isFlush && isStraight) {
            return { name: '同花顺', multiplier: 8, chips: 100 };
        } else if (counts[0] === 4) {
            return { name: '四条', multiplier: 7, chips: 60 };
        } else if (counts[0] === 3 && counts[1] === 2) {
            return { name: '葫芦', multiplier: 6, chips: 40 };
        } else if (isFlush) {
            return { name: '同花', multiplier: 5, chips: 35 };
        } else if (isStraight) {
            return { name: '顺子', multiplier: 4, chips: 30 };
        } else if (counts[0] === 3) {
            return { name: '三条', multiplier: 3, chips: 20 };
        } else if (counts[0] === 2 && counts[1] === 2) {
            return { name: '两对', multiplier: 2, chips: 20 };
        } else if (counts[0] === 2) {
            return { name: '一对', multiplier: 2, chips: 10 };
        } else {
            return { name: '高牌', multiplier: 1, chips: Math.max(...ranks) };
        }
    }

    // 检查是否为顺子
    isStraight(ranks) {
        if (ranks.length < 5) return false;
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
        if (uniqueRanks.length < 5) return false;
        
        for (let i = 0; i < uniqueRanks.length - 4; i++) {
            let consecutive = true;
            for (let j = 0; j < 4; j++) {
                if (uniqueRanks[i + j] - uniqueRanks[i + j + 1] !== 1) {
                    consecutive = false;
                    break;
                }
            }
            if (consecutive) return true;
        }
        
        // 检查 A-2-3-4-5 的特殊情况
        if (uniqueRanks.includes(14) && uniqueRanks.includes(5) && 
            uniqueRanks.includes(4) && uniqueRanks.includes(3) && uniqueRanks.includes(2)) {
            return true;
        }
        
        return false;
    }

    // 计算手牌分数（包含技能牌加成）
    calculateHandScore(cards, handType) {
        if (cards.length === 0) return 0;
        
        let baseChips = handType.chips;
        let multiplier = handType.multiplier;
        const cardSum = cards.reduce((sum, card) => sum + card.value, 0);
        
        // 应用技能牌效果
        this.activeSkills.forEach(skill => {
            switch (skill.effect.type) {
                case 'chipBonus':
                    baseChips += skill.effect.value;
                    break;
                case 'multiplierBonus':
                    multiplier += skill.effect.value;
                    break;
                case 'handTypeBonus':
                    if (handType.name === skill.effect.handType) {
                        multiplier += skill.effect.value;
                    }
                    break;
                case 'suitBonus':
                    const suitCount = cards.filter(card => card.suit === skill.effect.suit).length;
                    baseChips += suitCount * skill.effect.value;
                    break;
                case 'rankBonus':
                    const rankCount = cards.filter(card => card.rank === skill.effect.rank).length;
                    multiplier += rankCount * skill.effect.value;
                    break;
            }
        });
        
        // 应用永久加成
        multiplier *= this.permanentBonuses.scoreMultiplier;
        
        return Math.floor((baseChips + cardSum) * multiplier);
    }

    // 出牌
    playHand() {
        if (this.selectedCards.length === 0 || this.hands <= 0) return;
        
        const handType = this.getHandType(this.selectedCards);
        const scoreDetails = this.calculateDetailedHandScore(this.selectedCards, handType);
        const handScore = scoreDetails.finalScore;
        
        // 播放出牌音效
        this.sounds.cardPlay();
        
        this.score += handScore;
        this.hands--;
        
        // 根据手牌类型给予金币奖励
        const moneyReward = this.calculateMoneyReward(handType, handScore);
        this.money += moneyReward + this.permanentBonuses.extraMoney;
        
        // 创建分数爆炸效果
        this.createScoreExplosion(document.getElementById('score'), handScore);
        
        // 播放得分音效
        setTimeout(() => {
            this.sounds.scoreUp();
        }, 200);
        
        // 显示详细的得分信息
        this.showScoreDetails(scoreDetails, moneyReward);
        
        // 触发技能牌的额外效果
        this.triggerSkillEffects('onPlayHand', { handType, cards: this.selectedCards, score: handScore });
        
        // 从手牌中移除已出的牌
        this.selectedCards.forEach(card => {
            const index = this.hand.indexOf(card);
            if (index > -1) {
                this.hand.splice(index, 1);
            }
        });
        
        this.selectedCards = [];
        
        // 检查是否达到目标分数
        if (this.score >= this.targetScore) {
            setTimeout(() => {
                this.sounds.roundWin();
                this.roundWin();
            }, 1000);
        } else if (this.hands <= 0 && this.hand.length === 0) {
            setTimeout(() => {
                this.sounds.roundLose();
                this.roundLose();
            }, 1000);
        } else {
            this.updateUI();
        }
        
        // 添加分数更新动画
        document.getElementById('score').classList.add('score-update');
        setTimeout(() => {
            document.getElementById('score').classList.remove('score-update');
        }, 500);
    }

    // 显示得分详情
    showScoreDetails(scoreDetails, moneyReward) {
        let message = `🎯 手牌: ${document.getElementById('handType').textContent}\n`;
        message += `💎 筹码: ${scoreDetails.totalChips} = ${scoreDetails.baseChips}(基础) + ${scoreDetails.cardTotal}(卡牌)`;
        
        if (scoreDetails.skillChipsBonus > 0) {
            message += ` + ${scoreDetails.skillChipsBonus}(技能)`;
        }
        
        message += `\n⚡ 倍率: ${scoreDetails.totalMultiplier}x`;
        
        if (scoreDetails.skillMultiplierBonus > 0) {
            message += ` = ${scoreDetails.baseMultiplier}(基础) + ${scoreDetails.skillMultiplierBonus}(技能)`;
        }
        
        if (this.permanentBonuses.scoreMultiplier > 1) {
            message += ` × ${this.permanentBonuses.scoreMultiplier}(永久)`;
        }
        
        message += `\n🏆 最终分数: ${scoreDetails.finalScore}`;
        message += `\n💰 获得金币: +${moneyReward}`;
        
        if (scoreDetails.breakdown.length > 0) {
            message += `\n\n📋 技能效果:`;
            scoreDetails.breakdown.forEach(effect => {
                message += `\n• ${effect}`;
            });
        }
        
        this.showTemporaryMessage(message, 'success', 4000);
    }

    // 计算金币奖励
    calculateMoneyReward(handType, score) {
        const baseReward = Math.floor(score / 50);
        const typeBonus = {
            '高牌': 1,
            '一对': 2,
            '两对': 3,
            '三条': 4,
            '顺子': 5,
            '同花': 6,
            '葫芦': 8,
            '四条': 12,
            '同花顺': 20
        };
        return baseReward + (typeBonus[handType.name] || 1);
    }

    // 触发技能效果
    triggerSkillEffects(trigger, data) {
        this.activeSkills.forEach(skill => {
            if (skill.trigger === trigger) {
                switch (skill.triggerEffect?.type) {
                    case 'moneyBonus':
                        this.money += skill.triggerEffect.value;
                        break;
                    case 'extraHand':
                        if (Math.random() < skill.triggerEffect.chance) {
                            this.hands++;
                        }
                        break;
                    case 'drawCard':
                        this.drawCards();
                        break;
                }
            }
        });
    }

    // 弃牌
    discardCards() {
        if (this.selectedCards.length === 0 || this.discards <= 0) return;
        
        // 从手牌中移除选中的牌
        this.selectedCards.forEach(card => {
            const index = this.hand.indexOf(card);
            if (index > -1) {
                this.hand.splice(index, 1);
            }
        });
        
        this.selectedCards = [];
        this.discards--;
        this.updateUI();
    }

    // 抽牌
    drawCards() {
        const cardsNeeded = Math.min(8 - this.hand.length, this.deck.length);
        const newCards = this.deck.splice(0, cardsNeeded);
        this.hand.push(...newCards);
        this.updateUI();
    }

    // 回合胜利
    roundWin() {
        this.showModal('回合胜利！', `你完成了回合 ${this.round}！\n分数: ${this.score}`, true);
    }

    // 回合失败 - 增强版
    roundLose() {
        // 检查时间冻结效果
        if (this.temporaryEffects && this.temporaryEffects.timeFreeze) {
            this.temporaryEffects.timeFreeze = false;
            this.showEnhancedModal('时间冻结生效', 
                '🛡️ 时间冻结护盾激活！\n本次失败不扣除生命值。\n\n💡 时间冻结效果已消耗', 
                false, 'info');
            return;
        }
        
        this.lives--;
        const failureReason = this.analyzeFailureReason();
        
        if (this.lives <= 0) {
            this.gameOver(failureReason);
        } else {
            this.showEnhancedModal('回合失败', 
                this.generateFailureMessage(failureReason), 
                false, 'warning');
        }
    }

    // 分析失败原因
    analyzeFailureReason() {
        const reasons = [];
        const suggestions = [];
        
        // 检查出牌次数用完
        if (this.hands <= 0) {
            reasons.push('出牌次数用完');
            suggestions.push('考虑购买"额外手数"增强道具');
            suggestions.push('优先出高分手牌，避免浪费出牌机会');
        }
        
        // 检查分数差距
        const scoreDiff = this.targetScore - this.score;
        if (scoreDiff > this.targetScore * 0.8) {
            reasons.push('分数严重不足');
            suggestions.push('寻找更强的技能牌组合');
            suggestions.push('关注手牌类型，同花顺、葫芦等分数更高');
        } else if (scoreDiff > this.targetScore * 0.5) {
            reasons.push('分数不足');
            suggestions.push('考虑购买分数增强道具');
        } else if (scoreDiff > 0) {
            reasons.push('分数略微不足');
            suggestions.push('下次更好地计算分数和选择手牌');
        }
        
        // 检查手牌质量
        if (this.hand.length > 0) {
            const avgCardValue = this.hand.reduce((sum, card) => sum + card.value, 0) / this.hand.length;
            if (avgCardValue < 8) {
                reasons.push('手牌质量偏低');
                suggestions.push('考虑购买"卡牌嬗变"道具改善手牌');
                suggestions.push('优先弃掉低价值卡牌');
            }
        }
        
        // 检查技能牌数量
        if (this.activeSkills.length < 2) {
            reasons.push('技能牌数量不足');
            suggestions.push('积极购买合适的技能牌');
            suggestions.push('技能牌是提升分数的关键');
        }
        
        // 检查金币使用
        if (this.money > 150) {
            reasons.push('金币使用不当');
            suggestions.push('合理使用金币购买增强道具');
            suggestions.push('金币只是手段，分数才是目标');
        }
        
        return {
            primary: reasons[0] || '未知原因',
            reasons: reasons,
            suggestions: suggestions
        };
    }

    // 生成失败消息
    generateFailureMessage(failureAnalysis) {
        const { primary, reasons, suggestions } = failureAnalysis;
        
        let message = `💀 失败原因: ${primary}\n`;
        message += `❤️ 剩余生命: ${this.lives}\n\n`;
        
        if (reasons.length > 1) {
            message += `📝 详细分析:\n`;
            reasons.forEach((reason, index) => {
                message += `  ${index + 1}. ${reason}\n`;
            });
            message += '\n';
        }
        
        if (suggestions.length > 0) {
            message += `💡 改进建议:\n`;
            suggestions.slice(0, 3).forEach((suggestion, index) => {
                message += `  • ${suggestion}\n`;
            });
        }
        
        return message;
    }

    // 游戏结束 - 增强版
    gameOver(failureAnalysis = null) {
        const finalAnalysis = failureAnalysis || this.analyzeFailureReason();
        
        let message = `🎮 游戏结束\n`;
        message += `📊 最终分数: ${this.score}\n`;
        message += `🎯 到达回合: ${this.round}\n`;
        message += `💰 剩余金币: ${this.money}\n\n`;
        
        // 游戏表现评估
        const performance = this.evaluatePerformance();
        message += `🏆 表现评估: ${performance.grade}\n`;
        message += `${performance.comment}\n\n`;
        
        if (finalAnalysis.suggestions.length > 0) {
            message += `🔍 总结建议:\n`;
            finalAnalysis.suggestions.slice(0, 3).forEach((suggestion, index) => {
                message += `  ${index + 1}. ${suggestion}\n`;
            });
        }
        
        this.showEnhancedModal('游戏结束', message, false, 'error');
    }

    // 评估游戏表现
    evaluatePerformance() {
        const scoreRatio = this.score / (this.round * 300); // 基础期望分数
        const roundBonus = this.round >= 5 ? 1.5 : this.round >= 3 ? 1.2 : 1;
        const skillBonus = this.activeSkills.length >= 3 ? 1.3 : this.activeSkills.length >= 1 ? 1.1 : 0.8;
        
        const totalScore = scoreRatio * roundBonus * skillBonus;
        
        if (totalScore >= 2.0) {
            return { grade: 'S 传说', comment: '🌟 出色的表现！你已经掌握了游戏精髓！' };
        } else if (totalScore >= 1.5) {
            return { grade: 'A 优秀', comment: '🎉 很棒的游戏！继续保持这种策略！' };
        } else if (totalScore >= 1.0) {
            return { grade: 'B 良好', comment: '👍 不错的尝试，还有提升空间。' };
        } else if (totalScore >= 0.7) {
            return { grade: 'C 一般', comment: '📈 继续练习，你会越来越好的！' };
        } else {
            return { grade: 'D 需要改进', comment: '💪 别灰心，多尝试不同的策略吧！' };
        }
    }

    // 增强版弹窗显示
    showEnhancedModal(title, message, showNextRound = false, type = 'info') {
        const modal = document.getElementById('gameModal');
        const modalContent = modal.querySelector('.modal-content');
        
        // 根据类型设置样式
        modalContent.className = 'modal-content';
        switch(type) {
            case 'error':
                modalContent.classList.add('modal-error');
                break;
            case 'warning':
                modalContent.classList.add('modal-warning');
                break;
            case 'success':
                modalContent.classList.add('modal-success');
                break;
            case 'info':
            default:
                modalContent.classList.add('modal-info');
                break;
        }
        
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('nextRoundBtn').style.display = showNextRound ? 'inline-block' : 'none';
        modal.style.display = 'block';
        
        // 添加震动效果（如果是失败）
        if (type === 'error' || type === 'warning') {
            modalContent.classList.add('shake-animation');
            setTimeout(() => {
                modalContent.classList.remove('shake-animation');
            }, 500);
        }
    }

    // 显示弹窗
    showModal(title, message, showNextRound = false) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('nextRoundBtn').style.display = showNextRound ? 'inline-block' : 'none';
        document.getElementById('gameModal').style.display = 'block';
    }

    // 下一回合
    nextRound() {
        this.round++;
        this.targetScore = Math.floor(this.targetScore * 1.6);
        this.hands = 4 + this.permanentBonuses.extraHands;
        this.discards = 3 + this.permanentBonuses.extraDiscards;
        this.selectedCards = [];
        
        // 重新创建牌组并发牌
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialHand();
        
        document.getElementById('gameModal').style.display = 'none';
        document.getElementById('shopSection').style.display = 'block';
        this.generateShopItems();
        this.updateUI();
    }

    // 重新开始游戏
    restartGame() {
        this.score = 0;
        this.round = 1;
        this.lives = 3;
        this.targetScore = 300;
        this.money = 100;
        this.hands = 4;
        this.discards = 3;
        this.selectedCards = [];
        this.activeSkills = [];
        this.permanentBonuses = {
            scoreMultiplier: 1,
            extraHands: 0,
            extraDiscards: 0,
            extraMoney: 0
        };
        
        document.getElementById('gameModal').style.display = 'none';
        document.getElementById('shopSection').style.display = 'none';
        
        this.initGame();
    }

    // 生成商店物品
    generateShopItems() {
        this.shopItems = {
            skillCards: this.generateSkillCards(),
            enhancements: this.generateEnhancements(),
            specials: this.generateSpecials()
        };
        this.renderShop();
    }

    // 生成技能牌
    generateSkillCards() {
        const allSkillCards = [
            // 基础增强类
            {
                id: 'lucky_seven',
                name: '幸运七',
                shortName: '幸7',
                icon: '🍀',
                description: '每当你打出包含7的牌时，获得额外的2倍乘数',
                price: 80,
                rarity: 'common',
                effect: { type: 'rankBonus', rank: '7', value: 2 },
                trigger: 'onPlayHand'
            },
            {
                id: 'royal_flush',
                name: '皇家同花顺',
                shortName: '皇室',
                icon: '👑',
                description: '同花顺的乘数增加5',
                price: 150,
                rarity: 'rare',
                effect: { type: 'handTypeBonus', handType: '同花顺', value: 5 }
            },
            {
                id: 'hearts_lover',
                name: '红心之恋',
                shortName: '红心',
                icon: '💖',
                description: '每张红心牌增加10点基础分数',
                price: 90,
                rarity: 'common',
                effect: { type: 'suitBonus', suit: '♥', value: 10 }
            },
            {
                id: 'spades_power',
                name: '黑桃力量',
                shortName: '黑桃',
                icon: '⚫',
                description: '每张黑桃牌增加8点基础分数',
                price: 85,
                rarity: 'common',
                effect: { type: 'suitBonus', suit: '♠', value: 8 }
            },
            {
                id: 'diamond_brilliance',
                name: '钻石光辉',
                shortName: '钻石',
                icon: '💎',
                description: '每张方块牌增加12点基础分数',
                price: 95,
                rarity: 'common',
                effect: { type: 'suitBonus', suit: '♦', value: 12 }
            },
            {
                id: 'club_force',
                name: '梅花之力',
                shortName: '梅花',
                icon: '♣️',
                description: '每张梅花牌增加9点基础分数',
                price: 88,
                rarity: 'common',
                effect: { type: 'suitBonus', suit: '♣', value: 9 }
            },
            // 手牌类型增强
            {
                id: 'pair_master',
                name: '对子大师',
                shortName: '对子',
                icon: '👥',
                description: '一对和两对的乘数增加3',
                price: 100,
                rarity: 'common',
                effect: { type: 'handTypeBonus', handType: '一对', value: 3 }
            },
            {
                id: 'straight_master',
                name: '顺子大师',
                shortName: '顺子',
                icon: '📈',
                description: '顺子和同花顺的基础分数增加40',
                price: 130,
                rarity: 'uncommon',
                effect: { type: 'handTypeBonus', handType: '顺子', value: 40 }
            },
            {
                id: 'flush_master',
                name: '同花大师',
                shortName: '同花',
                icon: '🌈',
                description: '同花的乘数增加4',
                price: 125,
                rarity: 'uncommon',
                effect: { type: 'handTypeBonus', handType: '同花', value: 4 }
            },
            {
                id: 'full_house_king',
                name: '葫芦之王',
                shortName: '葫芦',
                icon: '🏠',
                description: '葫芦的基础分数增加60，乘数增加3',
                price: 160,
                rarity: 'rare',
                effect: { type: 'handTypeBonus', handType: '葫芦', chipValue: 60, multValue: 3 }
            },
            // 高牌位增强
            {
                id: 'ace_supremacy',
                name: 'A牌至尊',
                shortName: 'A牌',
                icon: '🔥',
                description: '每张A牌额外增加20点基础分数和1倍乘数',
                price: 140,
                rarity: 'uncommon',
                effect: { type: 'rankBonus', rank: 'A', chipValue: 20, multValue: 1 }
            },
            {
                id: 'face_cards_glory',
                name: '人头牌荣耀',
                shortName: '人头',
                icon: '👑',
                description: 'J、Q、K牌各自增加15点基础分数',
                price: 120,
                rarity: 'uncommon',
                effect: { type: 'faceCardBonus', value: 15 }
            },
            // 全局增强
            {
                id: 'multiplier_boost',
                name: '乘数增强',
                shortName: '乘数',
                icon: '✖️',
                description: '所有手牌乘数+2',
                price: 120,
                rarity: 'uncommon',
                effect: { type: 'multiplierBonus', value: 2 }
            },
            {
                id: 'chip_boost',
                name: '分数增强',
                shortName: '分数',
                icon: '🔹',
                description: '所有手牌基础分数+30',
                price: 110,
                rarity: 'uncommon',
                effect: { type: 'chipBonus', value: 30 }
            },
            {
                id: 'double_trouble',
                name: '双倍麻烦',
                shortName: '双倍',
                icon: '⚡',
                description: '有25%几率使手牌分数翻倍',
                price: 180,
                rarity: 'rare',
                effect: { type: 'randomDouble', chance: 0.25 },
                trigger: 'onScoreCalculation'
            },
            // 经济类
            {
                id: 'money_maker',
                name: '生财有道',
                shortName: '生财',
                icon: '💰',
                description: '每次出牌额外获得5金币',
                price: 95,
                rarity: 'common',
                triggerEffect: { type: 'moneyBonus', value: 5 },
                trigger: 'onPlayHand'
            },
            {
                id: 'greedy_hands',
                name: '贪婪之手',
                shortName: '贪婪',
                icon: '🤑',
                description: '每次回合结束时获得金币等于剩余手数×3',
                price: 110,
                rarity: 'uncommon',
                triggerEffect: { type: 'endRoundMoney', multiplier: 3 },
                trigger: 'onRoundEnd'
            },
            // 特殊机制
            {
                id: 'lucky_draw',
                name: '幸运抽取',
                shortName: '幸运',
                icon: '🎰',
                description: '弃牌时有30%几率额外抽取1张牌',
                price: 105,
                rarity: 'uncommon',
                effect: { type: 'luckyDraw', chance: 0.3 },
                trigger: 'onDiscard'
            },
            {
                id: 'phoenix_revival',
                name: '凤凰重生',
                shortName: '凤凰',
                icon: '🔥🐦',
                description: '生命值降至0时自动复活并恢复1点生命（每局限用1次）',
                price: 250,
                rarity: 'legendary',
                effect: { type: 'revival', uses: 1 },
                trigger: 'onDeath'
            },
            {
                id: 'time_manipulation',
                name: '时间操控',
                shortName: '时间',
                icon: '⏰',
                description: '每回合开始时获得1次额外的出牌机会',
                price: 140,
                rarity: 'rare',
                effect: { type: 'extraHands', value: 1 },
                trigger: 'onRoundStart'
            }
        ];
        
        // 根据稀有度和回合数调整出现概率
        const weightedCards = [];
        allSkillCards.forEach(card => {
            let weight = 1;
            switch(card.rarity) {
                case 'common': weight = 50; break;
                case 'uncommon': weight = 25; break;
                case 'rare': weight = 10; break;
                case 'legendary': weight = this.round >= 3 ? 3 : 0; break;
            }
            
            for(let i = 0; i < weight; i++) {
                weightedCards.push(card);
            }
        });
        
        // 随机选择3张技能牌，避免重复
        const selected = [];
        const used = new Set();
        
        while(selected.length < 3 && weightedCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * weightedCards.length);
            const card = weightedCards[randomIndex];
            
            if(!used.has(card.id)) {
                selected.push(card);
                used.add(card.id);
            }
        }
        
        return selected;
    }

    // 生成增强道具
    generateEnhancements() {
        const allEnhancements = [
            // 基础增强
            {
                id: 'extra_life',
                name: '额外生命',
                icon: '❤️',
                description: '增加1点生命值',
                price: 100,
                rarity: 'uncommon',
                effect: 'life'
            },
            {
                id: 'extra_hands',
                name: '额外手数',
                icon: '🤲',
                description: '每回合增加2次出牌机会',
                price: 150,
                rarity: 'rare',
                effect: 'hands'
            },
            {
                id: 'extra_discards',
                name: '额外弃牌',
                icon: '🗑️',
                description: '每回合增加2次弃牌机会',
                price: 120,
                rarity: 'uncommon',
                effect: 'discards'
            },
            {
                id: 'score_multiplier',
                name: '分数倍增器',
                icon: '📈',
                description: '所有分数获得1.5倍乘数',
                price: 200,
                rarity: 'rare',
                effect: 'scoreMultiplier'
            },
            // 进阶增强
            {
                id: 'hand_size_boost',
                name: '手牌扩容',
                icon: '📋',
                description: '手牌上限增加2张',
                price: 180,
                rarity: 'rare',
                effect: 'handSize'
            },
            {
                id: 'money_multiplier',
                name: '金币倍增',
                icon: '💵',
                description: '所有金币收入增加50%',
                price: 160,
                rarity: 'uncommon',
                effect: 'moneyMultiplier'
            },
            {
                id: 'lucky_charm',
                name: '幸运护身符',
                icon: '🧿',
                description: '所有随机事件成功率提高20%',
                price: 140,
                rarity: 'uncommon',
                effect: 'luckBoost'
            },
            {
                id: 'perfect_balance',
                name: '完美平衡',
                icon: '⚖️',
                description: '每回合开始时，如果手牌少于6张，补充至6张',
                price: 170,
                rarity: 'rare',
                effect: 'handBalance'
            }
        ];
        
        // 根据稀有度筛选
        const weightedEnhancements = [];
        allEnhancements.forEach(item => {
            let weight = 1;
            switch(item.rarity) {
                case 'common': weight = 40; break;
                case 'uncommon': weight = 25; break;
                case 'rare': weight = 8; break;
            }
            
            for(let i = 0; i < weight; i++) {
                weightedEnhancements.push(item);
            }
        });
        
        // 随机选择2-3个道具
        const selected = [];
        const used = new Set();
        const count = Math.random() < 0.3 ? 3 : 2;
        
        while(selected.length < count && weightedEnhancements.length > 0) {
            const randomIndex = Math.floor(Math.random() * weightedEnhancements.length);
            const item = weightedEnhancements[randomIndex];
            
            if(!used.has(item.id)) {
                selected.push(item);
                used.add(item.id);
            }
        }
        
        return selected;
    }

    // 生成特殊物品
    generateSpecials() {
        const allSpecials = [
            // 直接效果类
            {
                id: 'golden_card',
                name: '黄金卡牌',
                icon: '🏆',
                description: '直接获得200分数',
                price: 150,
                rarity: 'uncommon',
                effect: 'directScore'
            },
            {
                id: 'money_bag',
                name: '金币袋',
                icon: '💼',
                description: '直接获得100金币',
                price: 50,
                rarity: 'common',
                effect: 'directMoney'
            },
            {
                id: 'mega_boost',
                name: '超级增强',
                icon: '💥',
                description: '直接获得500分数',
                price: 280,
                rarity: 'rare',
                effect: 'megaScore'
            },
            // 目标调整类
            {
                id: 'target_reducer',
                name: '目标减少器',
                icon: '🎯',
                description: '减少当前目标分数的20%',
                price: 180,
                rarity: 'uncommon',
                effect: 'reduceTarget'
            },
            {
                id: 'difficulty_adjuster',
                name: '难度调节器',
                icon: '⚙️',
                description: '减少未来所有回合目标分数的10%',
                price: 250,
                rarity: 'rare',
                effect: 'reduceFutureTargets'
            },
            // 特殊机制类
            {
                id: 'time_freeze',
                name: '时间冻结',
                icon: '❄️',
                description: '本回合失败不扣除生命值',
                price: 200,
                rarity: 'rare',
                effect: 'timeFreeze'
            },
            {
                id: 'card_transmute',
                name: '卡牌嬗变',
                icon: '🔬',
                description: '将手牌中一张最低价值的牌变成A',
                price: 160,
                rarity: 'uncommon',
                effect: 'cardTransmute'
            },
            {
                id: 'perfect_hand',
                name: '完美手牌',
                icon: '✨',
                description: '下一次出牌自动获得最佳组合分数',
                price: 220,
                rarity: 'rare',
                effect: 'perfectHand'
            },
            {
                id: 'shop_refresh',
                name: '商店刷新券',
                icon: '🔄',
                description: '免费刷新商店一次',
                price: 80,
                rarity: 'common',
                effect: 'freeRefresh'
            },
            {
                id: 'deck_shuffle',
                name: '牌组重洗',
                icon: '🔀',
                description: '重新洗牌并抽取8张新手牌',
                price: 120,
                rarity: 'uncommon',
                effect: 'deckShuffle'
            },
            // 稀有特殊物品
            {
                id: 'divine_blessing',
                name: '神圣祝福',
                icon: '🙏',
                description: '立即通过本回合并获得额外100金币',
                price: 350,
                rarity: 'legendary',
                effect: 'divineBlessing'
            },
            {
                id: 'chaos_orb',
                name: '混沌宝珠',
                icon: '🔮',
                description: '随机获得3个增强效果（风险与机遇并存）',
                price: 300,
                rarity: 'legendary',
                effect: 'chaosOrb'
            }
        ];
        
        // 根据稀有度和可用性筛选
        const availableSpecials = allSpecials.filter(item => {
            // 某些物品需要特定条件
            if (item.id === 'time_freeze' && this.lives <= 1) return false;
            if (item.id === 'card_transmute' && this.hand.length === 0) return false;
            return true;
        });
        
        const weightedSpecials = [];
        availableSpecials.forEach(item => {
            let weight = 1;
            switch(item.rarity) {
                case 'common': weight = 30; break;
                case 'uncommon': weight = 15; break;
                case 'rare': weight = 5; break;
                case 'legendary': weight = this.round >= 4 ? 2 : 0; break;
            }
            
            for(let i = 0; i < weight; i++) {
                weightedSpecials.push(item);
            }
        });
        
        // 随机选择1-2个特殊物品
        const selected = [];
        const used = new Set();
        const count = Math.random() < 0.4 ? 2 : 1;
        
        while(selected.length < count && weightedSpecials.length > 0) {
            const randomIndex = Math.floor(Math.random() * weightedSpecials.length);
            const item = weightedSpecials[randomIndex];
            
            if(!used.has(item.id)) {
                selected.push(item);
                used.add(item.id);
            }
        }
        
        return selected;
    }

    // 渲染商店
    renderShop() {
        this.renderShopCategory('skillCardItems', this.shopItems.skillCards, 'skill-card');
        this.renderShopCategory('enhancementItems', this.shopItems.enhancements, 'enhancement');
        this.renderShopCategory('specialItems', this.shopItems.specials, 'special');
    }

    // 渲染商店分类
    renderShopCategory(containerId, items, itemClass) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `shop-item ${itemClass}`;
            
            // 添加稀有度样式
            const rarityClass = item.rarity ? `rarity-${item.rarity}` : '';
            if (rarityClass) {
                itemElement.classList.add(rarityClass);
            }
            
            // 稀有度显示文本
            const rarityText = item.rarity ? this.getRarityText(item.rarity) : '';
            
            itemElement.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-header">
                    <div class="shop-item-name">${item.name}</div>
                    ${rarityText ? `<div class="shop-item-rarity">${rarityText}</div>` : ''}
                </div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-price">💰 ${item.price}</div>
            `;
            
            if (!item.sold) {
                itemElement.addEventListener('click', () => this.buyItem(item, itemElement));
            } else {
                itemElement.classList.add('sold');
            }
            
            container.appendChild(itemElement);
        });
    }

    // 获取稀有度文本
    getRarityText(rarity) {
        const rarityTexts = {
            'common': '普通',
            'uncommon': '罕见',
            'rare': '稀有',
            'legendary': '传说'
        };
        return rarityTexts[rarity] || '';
    }

    // 购买物品
    buyItem(item, element) {
        if (item.sold || this.money < item.price) {
            this.sounds.error();
            this.showTemporaryMessage('金币不足或物品已售出！', 'error');
            return;
        }
        
        this.money -= item.price;
        item.sold = true;
        element.classList.add('sold');
        
        // 播放购买音效
        this.sounds.purchase();
        
        // 应用物品效果
        this.applyItemEffect(item);
        this.updateUI();
        this.showTemporaryMessage(`购买成功: ${item.name}`, 'success');
        
        // 添加购买特效
        this.createPurchaseEffect(element);
    }

    // 创建购买特效
    createPurchaseEffect(element) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: purchaseExplosion 0.6s ease-out;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 600);
        
        // 添加购买爆炸动画
        if (!document.getElementById('purchase-explosion-styles')) {
            const style = document.createElement('style');
            style.id = 'purchase-explosion-styles';
            style.textContent = `
                @keyframes purchaseExplosion {
                    0% { 
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(1.5);
                        opacity: 0.8;
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 应用物品效果
    // 应用物品效果
    applyItemEffect(item) {
        if (item.effect) {
            switch (item.effect) {
                // 基础增强效果
                case 'life':
                    this.lives++;
                    this.showTemporaryMessage(`生命值增加1！当前生命值：${this.lives}`, 'success');
                    break;
                case 'hands':
                    this.permanentBonuses.extraHands += 2;
                    this.hands += 2;
                    this.showTemporaryMessage('每回合额外获得2次出牌机会！', 'success');
                    break;
                case 'discards':
                    this.permanentBonuses.extraDiscards += 2;
                    this.discards += 2;
                    this.showTemporaryMessage('每回合额外获得2次弃牌机会！', 'success');
                    break;
                case 'scoreMultiplier':
                    this.permanentBonuses.scoreMultiplier += 0.5;
                    this.showTemporaryMessage('所有分数获得1.5倍乘数！', 'success');
                    break;
                    
                // 新增增强效果
                case 'handSize':
                    this.maxHandSize = (this.maxHandSize || 8) + 2;
                    this.showTemporaryMessage('手牌上限增加2张！', 'success');
                    break;
                case 'moneyMultiplier':
                    this.permanentBonuses.extraMoney += 0.5;
                    this.showTemporaryMessage('金币收入增加50%！', 'success');
                    break;
                case 'luckBoost':
                    this.permanentBonuses.luckBoost = (this.permanentBonuses.luckBoost || 0) + 0.2;
                    this.showTemporaryMessage('幸运值提升！随机事件成功率+20%', 'success');
                    break;
                case 'handBalance':
                    this.permanentBonuses.handBalance = true;
                    this.showTemporaryMessage('获得手牌平衡！每回合开始手牌不足6张时自动补充', 'success');
                    break;
                    
                // 直接效果
                case 'directScore':
                    this.score += 200;
                    this.createScoreExplosion(document.getElementById('scoreDisplay'), 200);
                    this.showTemporaryMessage('直接获得200分数！', 'success');
                    break;
                case 'megaScore':
                    this.score += 500;
                    this.createScoreExplosion(document.getElementById('scoreDisplay'), 500);
                    this.showTemporaryMessage('超级分数增强！获得500分数！', 'success');
                    break;
                case 'directMoney':
                    this.money += 100;
                    this.showTemporaryMessage('直接获得100金币！', 'success');
                    break;
                    
                // 目标调整
                case 'reduceTarget':
                    const reduction = Math.floor(this.targetScore * 0.2);
                    this.targetScore -= reduction;
                    this.showTemporaryMessage(`目标分数减少${reduction}！新目标：${this.targetScore}`, 'success');
                    break;
                case 'reduceFutureTargets':
                    this.permanentBonuses.targetReduction = (this.permanentBonuses.targetReduction || 0) + 0.1;
                    this.showTemporaryMessage('难度降低！未来所有回合目标分数-10%', 'success');
                    break;
                    
                // 特殊机制
                case 'timeFreeze':
                    this.temporaryEffects = this.temporaryEffects || {};
                    this.temporaryEffects.timeFreeze = true;
                    this.showTemporaryMessage('时间冻结！本回合失败不扣除生命值', 'success');
                    break;
                case 'cardTransmute':
                    this.transmuteLowestCard();
                    break;
                case 'perfectHand':
                    this.temporaryEffects = this.temporaryEffects || {};
                    this.temporaryEffects.perfectHand = true;
                    this.showTemporaryMessage('完美手牌！下次出牌自动获得最佳分数', 'success');
                    break;
                case 'freeRefresh':
                    this.generateShopItems();
                    this.showTemporaryMessage('商店免费刷新！', 'success');
                    break;
                case 'deckShuffle':
                    this.shuffleAndRedeal();
                    break;
                case 'divineBlessing':
                    this.score = Math.max(this.score, this.targetScore);
                    this.money += 100;
                    this.showTemporaryMessage('神圣祝福！立即通过本回合并获得100金币！', 'success');
                    setTimeout(() => this.checkRoundWin(), 100);
                    break;
                case 'chaosOrb':
                    this.applyChaosEffects();
                    break;
            }
        }
        
        // 如果是技能牌，添加到激活技能列表
        if (item.effect && typeof item.effect === 'object') {
            this.activeSkills.push(item);
            this.showTemporaryMessage(`技能激活：${item.name}`, 'success');
        }
    }

    // 嬗变最低价值卡牌
    transmuteLowestCard() {
        if (this.hand.length === 0) {
            this.showTemporaryMessage('手牌为空，无法嬗变！', 'error');
            return;
        }
        
        // 找到价值最低的牌
        let lowestCard = this.hand[0];
        let lowestIndex = 0;
        
        for (let i = 1; i < this.hand.length; i++) {
            if (this.hand[i].value < lowestCard.value) {
                lowestCard = this.hand[i];
                lowestIndex = i;
            }
        }
        
        // 将其变成A
        const suits = ['♠', '♥', '♦', '♣'];
        const suitClasses = ['spades', 'hearts', 'diamonds', 'clubs'];
        const randomSuitIndex = Math.floor(Math.random() * suits.length);
        
        this.hand[lowestIndex] = {
            suit: suits[randomSuitIndex],
            rank: 'A',
            suitClass: suitClasses[randomSuitIndex],
            value: 14,
            id: `A_${suitClasses[randomSuitIndex]}_transmuted`
        };
        
        this.renderHand();
        this.showTemporaryMessage(`卡牌嬗变成功！${lowestCard.rank}${lowestCard.suit} → A${suits[randomSuitIndex]}`, 'success');
    }

    // 重新洗牌和发牌
    shuffleAndRedeal() {
        // 将手牌放回牌组
        this.deck = [...this.deck, ...this.hand];
        this.shuffleDeck();
        
        // 重新发8张牌
        this.hand = this.deck.splice(0, 8);
        this.selectedCards = [];
        
        this.renderHand();
        this.showTemporaryMessage('牌组重洗完成！获得8张新手牌', 'success');
    }

    // 应用混沌效果
    applyChaosEffects() {
        const possibleEffects = [
            { effect: 'life', chance: 0.3, positive: true },
            { effect: 'hands', chance: 0.25, positive: true },
            { effect: 'discards', chance: 0.25, positive: true },
            { effect: 'scoreMultiplier', chance: 0.2, positive: true },
            { effect: 'directScore', chance: 0.4, positive: true },
            { effect: 'directMoney', chance: 0.5, positive: true },
            // 负面效果
            { type: 'loseMoney', chance: 0.2, positive: false },
            { type: 'loseHands', chance: 0.15, positive: false },
            { type: 'increaseTarget', chance: 0.1, positive: false }
        ];
        
        const results = [];
        
        // 随机获得3个效果
        for (let i = 0; i < 3; i++) {
            const randomEffect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
            const luck = this.permanentBonuses.luckBoost || 0;
            const effectiveChance = randomEffect.positive ? 
                Math.min(1, randomEffect.chance + luck) : 
                Math.max(0, randomEffect.chance - luck);
            
            if (Math.random() < effectiveChance) {
                if (randomEffect.effect) {
                    // 正面效果
                    this.applyItemEffect({ effect: randomEffect.effect });
                    results.push(`✓ ${this.getEffectDescription(randomEffect.effect)}`);
                } else {
                    // 负面效果
                    switch (randomEffect.type) {
                        case 'loseMoney':
                            const moneyLoss = Math.min(50, this.money);
                            this.money -= moneyLoss;
                            results.push(`✗ 失去${moneyLoss}金币`);
                            break;
                        case 'loseHands':
                            if (this.hands > 1) {
                                this.hands--;
                                results.push(`✗ 失去1次出牌机会`);
                            }
                            break;
                        case 'increaseTarget':
                            const increase = Math.floor(this.targetScore * 0.1);
                            this.targetScore += increase;
                            results.push(`✗ 目标分数增加${increase}`);
                            break;
                    }
                }
            } else {
                results.push('○ 效果失败');
            }
        }
        
        this.showTemporaryMessage(`混沌宝珠效果：\n${results.join('\n')}`, 'info', 4000);
    }

    // 获取效果描述
    getEffectDescription(effect) {
        const descriptions = {
            'life': '生命值+1',
            'hands': '出牌机会+2',
            'discards': '弃牌机会+2',
            'scoreMultiplier': '分数倍数+0.5',
            'directScore': '分数+200',
            'directMoney': '金币+100'
        };
        return descriptions[effect] || '未知效果';
    }

    // 刷新商店（更新版本）
    refreshShop() {
        if (this.money < 10) {
            this.sounds.error();
            this.showTemporaryMessage('金币不足，无法刷新商店！', 'error');
            return;
        }
        
        this.money -= 10;
        this.generateShopItems();
        this.updateUI();
        this.sounds.purchase();
        this.showTemporaryMessage('商店已刷新！', 'success');
    }

    // 显示临时消息
    showTemporaryMessage(message, type = 'info', duration = 2000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type}`;
        
        // 处理多行消息
        if (message.includes('\n')) {
            const lines = message.split('\n');
            messageDiv.innerHTML = lines.map(line => `<div>${line}</div>`).join('');
        } else {
            messageDiv.textContent = message;
        }
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 15px;
            font-weight: bold;
            z-index: 2000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            animation: fadeInOut ${duration}ms ease-in-out;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            text-align: left;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
            white-space: pre-line;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, duration);
        
        // 添加动画样式
        if (!document.getElementById('temp-message-styles')) {
            const style = document.createElement('style');
            style.id = 'temp-message-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 跳过商店
    skipShop() {
        document.getElementById('shopSection').style.display = 'none';
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new BalatroGame();
});

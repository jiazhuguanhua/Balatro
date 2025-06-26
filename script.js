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
        
        this.initGame();
        this.bindEvents();
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
    }

    // 更新UI
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('round').textContent = this.round;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('targetScore').textContent = this.targetScore;
        document.getElementById('handScore').textContent = this.currentHandScore;
        document.getElementById('playerMoney').textContent = this.money;
        document.getElementById('handsLeft').textContent = this.hands;
        document.getElementById('discardsLeft').textContent = this.discards;
        
        this.renderHand();
        this.renderSelectedCards();
        this.renderActiveSkills();
        this.updateHandType();
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
        
        this.hand.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardElement.addEventListener('click', () => this.selectCard(card));
            handContainer.appendChild(cardElement);
        });
    }

    // 渲染选中的卡牌
    renderSelectedCards() {
        const selectedContainer = document.getElementById('selectedCards');
        selectedContainer.innerHTML = '';
        
        this.selectedCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardElement.classList.add('selected');
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
        return cardDiv;
    }

    // 选择卡牌
    selectCard(card) {
        if (this.selectedCards.length < 5 && !this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
            this.updateUI();
        }
    }

    // 取消选择卡牌
    deselectCard(card) {
        const index = this.selectedCards.indexOf(card);
        if (index > -1) {
            this.selectedCards.splice(index, 1);
            this.updateUI();
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
        
        this.score += handScore;
        this.hands--;
        
        // 根据手牌类型给予金币奖励
        const moneyReward = this.calculateMoneyReward(handType, handScore);
        this.money += moneyReward + this.permanentBonuses.extraMoney;
        
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
            this.roundWin();
        } else if (this.hands <= 0 && this.hand.length === 0) {
            this.roundLose();
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

    // 回合失败
    roundLose() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showModal('回合失败', `生命值减少！剩余生命: ${this.lives}`, false);
        }
    }

    // 游戏结束
    gameOver() {
        this.showModal('游戏结束', `最终分数: ${this.score}\n回合: ${this.round}`, false);
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
            {
                id: 'lucky_seven',
                name: '幸运七',
                shortName: '幸7',
                icon: '🍀',
                description: '每当你打出包含7的牌时，获得额外的2倍乘数',
                price: 80,
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
                effect: { type: 'handTypeBonus', handType: '同花顺', value: 5 }
            },
            {
                id: 'hearts_lover',
                name: '红心之恋',
                shortName: '红心',
                icon: '💖',
                description: '每张红心牌增加10点基础分数',
                price: 90,
                effect: { type: 'suitBonus', suit: '♥', value: 10 }
            },
            {
                id: 'spades_power',
                name: '黑桃力量',
                shortName: '黑桃',
                icon: '⚫',
                description: '每张黑桃牌增加8点基础分数',
                price: 85,
                effect: { type: 'suitBonus', suit: '♠', value: 8 }
            },
            {
                id: 'pair_master',
                name: '对子大师',
                shortName: '对子',
                icon: '👥',
                description: '一对和两对的乘数增加3',
                price: 100,
                effect: { type: 'handTypeBonus', handType: '一对', value: 3 }
            },
            {
                id: 'multiplier_boost',
                name: '乘数增强',
                shortName: '乘数',
                icon: '✖️',
                description: '所有手牌乘数+2',
                price: 120,
                effect: { type: 'multiplierBonus', value: 2 }
            },
            {
                id: 'chip_boost',
                name: '分数增强',
                shortName: '分数',
                icon: '🔹',
                description: '所有手牌基础分数+30',
                price: 110,
                effect: { type: 'chipBonus', value: 30 }
            },
            {
                id: 'money_maker',
                name: '生财有道',
                shortName: '生财',
                icon: '💰',
                description: '每次出牌额外获得5金币',
                price: 95,
                triggerEffect: { type: 'moneyBonus', value: 5 },
                trigger: 'onPlayHand'
            }
        ];
        
        // 随机选择3张技能牌
        const shuffled = allSkillCards.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    // 生成增强道具
    generateEnhancements() {
        const allEnhancements = [
            {
                id: 'extra_life',
                name: '额外生命',
                icon: '❤️',
                description: '增加1点生命值',
                price: 100,
                effect: 'life'
            },
            {
                id: 'extra_hands',
                name: '额外手数',
                icon: '🤲',
                description: '每回合增加2次出牌机会',
                price: 150,
                effect: 'hands'
            },
            {
                id: 'extra_discards',
                name: '额外弃牌',
                icon: '🗑️',
                description: '每回合增加2次弃牌机会',
                price: 120,
                effect: 'discards'
            },
            {
                id: 'score_multiplier',
                name: '分数倍增器',
                icon: '📈',
                description: '所有分数获得1.5倍乘数',
                price: 200,
                effect: 'scoreMultiplier'
            }
        ];
        
        return allEnhancements.slice(0, 2);
    }

    // 生成特殊物品
    generateSpecials() {
        const allSpecials = [
            {
                id: 'golden_card',
                name: '黄金卡牌',
                icon: '🏆',
                description: '直接获得200分数',
                price: 150,
                effect: 'directScore'
            },
            {
                id: 'money_bag',
                name: '金币袋',
                icon: '💼',
                description: '直接获得100金币',
                price: 50,
                effect: 'directMoney'
            },
            {
                id: 'target_reducer',
                name: '目标减少器',
                icon: '🎯',
                description: '减少当前目标分数的20%',
                price: 180,
                effect: 'reduceTarget'
            }
        ];
        
        return allSpecials.slice(0, 2);
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
            itemElement.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
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

    // 购买物品
    buyItem(item, element) {
        if (item.sold || this.money < item.price) {
            this.showTemporaryMessage('金币不足或物品已售出！', 'error');
            return;
        }
        
        this.money -= item.price;
        item.sold = true;
        element.classList.add('sold');
        
        // 应用物品效果
        this.applyItemEffect(item);
        this.updateUI();
        this.showTemporaryMessage(`购买成功: ${item.name}`, 'success');
    }

    // 应用物品效果
    applyItemEffect(item) {
        if (item.effect) {
            switch (item.effect) {
                case 'life':
                    this.lives++;
                    break;
                case 'hands':
                    this.permanentBonuses.extraHands += 2;
                    this.hands += 2;
                    break;
                case 'discards':
                    this.permanentBonuses.extraDiscards += 2;
                    this.discards += 2;
                    break;
                case 'scoreMultiplier':
                    this.permanentBonuses.scoreMultiplier += 0.5;
                    break;
                case 'directScore':
                    this.score += 200;
                    break;
                case 'directMoney':
                    this.money += 100;
                    break;
                case 'reduceTarget':
                    this.targetScore = Math.floor(this.targetScore * 0.8);
                    break;
            }
        }
        
        // 如果是技能牌，添加到激活技能列表
        if (item.effect && typeof item.effect === 'object') {
            this.activeSkills.push(item);
        }
    }

    // 刷新商店
    refreshShop() {
        if (this.money < 10) {
            this.showTemporaryMessage('金币不足，无法刷新商店！', 'error');
            return;
        }
        
        this.money -= 10;
        this.generateShopItems();
        this.updateUI();
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

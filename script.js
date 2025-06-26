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
        const handScore = this.calculateHandScore(this.selectedCards, handType);
        
        document.getElementById('handType').textContent = handType.name;
        this.currentHandScore = handScore;
        document.getElementById('handScore').textContent = handScore;
        
        const playBtn = document.getElementById('playHandBtn');
        playBtn.disabled = this.selectedCards.length === 0 || this.hands <= 0;
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
        const handScore = this.calculateHandScore(this.selectedCards, handType);
        
        this.score += handScore;
        this.hands--;
        
        // 根据手牌类型给予金币奖励
        const moneyReward = this.calculateMoneyReward(handType, handScore);
        this.money += moneyReward + this.permanentBonuses.extraMoney;
        
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
        this.hands = 4;
        this.discards = 3;
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
        this.hands = 4;
        this.discards = 3;
        this.selectedCards = [];
        
        document.getElementById('gameModal').style.display = 'none';
        document.getElementById('shopSection').style.display = 'none';
        
        this.initGame();
    }

    // 生成商店物品
    generateShopItems() {
        const items = [
            { name: '额外生命', price: 100, effect: 'life' },
            { name: '额外手数', price: 150, effect: 'hands' },
            { name: '额外弃牌', price: 120, effect: 'discards' },
            { name: '分数加成', price: 200, effect: 'scoreBonus' }
        ];
        
        this.shopItems = items.slice(0, 3);
        this.renderShop();
    }

    // 渲染商店
    renderShop() {
        const shopContainer = document.getElementById('shopItems');
        shopContainer.innerHTML = '';
        
        this.shopItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">$${item.price}</div>
            `;
            
            itemElement.addEventListener('click', () => this.buyItem(item));
            shopContainer.appendChild(itemElement);
        });
    }

    // 购买物品
    buyItem(item) {
        if (this.score >= item.price) {
            this.score -= item.price;
            
            switch (item.effect) {
                case 'life':
                    this.lives++;
                    break;
                case 'hands':
                    this.hands += 2;
                    break;
                case 'discards':
                    this.discards += 2;
                    break;
                case 'scoreBonus':
                    this.score += 100;
                    break;
            }
            
            this.updateUI();
            this.skipShop();
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

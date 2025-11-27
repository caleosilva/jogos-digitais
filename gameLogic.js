class GameLogic {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.gameState = 'start'; // start, playing, paused, boss, gameOver, victory, highScores
        this.lives = 3;
        this.score = 0;
        this.words = [];
        this.bullets = [];
        this.particles = [];
        this.typingQueue = [];
        this.activeWord = null;

        // Configuração de Níveis e Chefe
        this.currentLevelIndex = 0;
        this.wordsClearedInLevel = 0;
        this.wordsToSpawnBoss = 15; // Quantidade de palavras antes do chefe
        this.isBossActive = false;
        this.bossSentencesQueue = [];

        this.gameSpeed = 0.5;
        this.spawnRate = 2000;
        this.lastSpawn = 0;

        // DADOS DOS NÍVEIS
        this.levelsConfig = [
            {
                id: 1, title: "Level 1: Introdução",
                words: [
                    {en: 'hello', pt: 'olá'}, {en: 'hi', pt: 'oi'}, {en: 'my', pt: 'meu'}, 
                    {en: 'name', pt: 'nome'}, {en: 'is', pt: 'é'}, {en: 'meet', pt: 'conhecer'}, 
                    {en: 'you', pt: 'você'}, {en: 'good', pt: 'bom'},
                    {en: 'what', pt: 'o que'}, {en: 'where', pt: 'onde'}, {en: 'how', pt: 'como'}, 
                    {en: 'old', pt: 'velho'}, {en: 'say', pt: 'dizer'}, {en: 'morning', pt: 'manhã'}
                ],
                bossSentences: [
                    {en: 'Hello my name is John', pt: 'Olá meu nome é John'},
                    {en: 'Nice to meet you', pt: 'Prazer em te conhecer'},
                    {en: 'How old are you', pt: 'Quantos anos você tem?'}
                ]
            },
            {
                id: 2, title: "Level 2: Objetos",
                words: [
                    {en: 'car', pt: 'carro'}, {en: 'pen', pt: 'caneta'}, {en: 'book', pt: 'livro'},
                    {en: 'red', pt: 'vermelho'}, {en: 'blue', pt: 'azul'}, {en: 'big', pt: 'grande'},
                    {en: 'this', pt: 'isto'}, {en: 'have', pt: 'tenho'},
                    {en: 'small', pt: 'pequeno'}, {en: 'table', pt: 'mesa'}, {en: 'chair', pt: 'cadeira'},
                    {en: 'water', pt: 'água'}, {en: 'phone', pt: 'telefone'}, {en: 'keyboard', pt: 'teclado'}
                ],
                bossSentences: [
                    {en: 'The car is blue and big', pt: 'O carro é azul e grande'},
                    {en: 'I have a red pen', pt: 'Eu tenho uma caneta vermelha'},
                    {en: 'This is my small book', pt: 'Este é meu livro pequeno'}
                ]
            },
            {
                id: 3, title: "Level 3: Verbos e Ações",
                words: [
                    {en: 'like', pt: 'gosto'}, {en: 'play', pt: 'jogar'}, {en: 'run', pt: 'correr'},
                    {en: 'eat', pt: 'comer'}, {en: 'bread', pt: 'pão'}, {en: 'every', pt: 'todo'},
                    {en: 'day', pt: 'dia'}, {en: 'we', pt: 'nós'},
                    {en: 'sleep', pt: 'dormir'}, {en: 'drink', pt: 'beber'}, {en: 'write', pt: 'escrever'},
                    {en: 'now', pt: 'agora'}, {en: 'look', pt: 'olhar'}, {en: 'find', pt: 'encontrar'}
                ],
                bossSentences: [
                    {en: 'I like to play now', pt: 'Eu gosto de jogar agora'},
                    {en: 'I eat bread every day', pt: 'Eu como pão todo dia'},
                    {en: 'We run and drink water', pt: 'Nós corremos e bebemos água'}
                ]
            },
            {
                id: 4, title: "Level 4: Emoções e Família",
                words: [
                    {en: 'happy', pt: 'feliz'}, {en: 'sad', pt: 'triste'}, {en: 'very', pt: 'muito'},
                    {en: 'today', pt: 'hoje'}, {en: 'feel', pt: 'sentir'}, {en: 'love', pt: 'amar'},
                    {en: 'family', pt: 'família'},
                    {en: 'anger', pt: 'raiva'}, {en: 'fear', pt: 'medo'}, {en: 'home', pt: 'casa'}, 
                    {en: 'friend', pt: 'amigo'}, {en: 'mother', pt: 'mãe'}, {en: 'father', pt: 'pai'}
                ],
                bossSentences: [
                    {en: 'I am very happy today', pt: 'Estou muito feliz hoje'},
                    {en: 'I love my mother and father', pt: 'Eu amo minha mãe e meu pai'},
                    {en: 'Do not feel sad at home', pt: 'Não se sinta triste em casa'}
                ]
            },
            {
                id: 5, title: "Level 5: Perguntas e Locais",
                words: [
                    {en: 'what', pt: 'o que'}, {en: 'where', pt: 'onde'}, {en: 'how', pt: 'como'},
                    {en: 'old', pt: 'velho'}, {en: 'live', pt: 'morar'}, {en: 'do', pt: 'fazer'},
                    {en: 'walk', pt: 'andar'}, {en: 'talk', pt: 'falar'}, {en: 'learn', pt: 'aprender'},
                    {en: 'always', pt: 'sempre'}, {en: 'school', pt: 'escola'}, {en: 'park', pt: 'parque'}
                ],
                bossSentences: [
                    {en: 'How old are you', pt: 'Quantos anos você tem?'},
                    {en: 'Where do you live now', pt: 'Onde você mora agora?'},
                    {en: 'We learn always at school', pt: 'Nós sempre aprendemos na escola'}
                ]
            },
            { // NOVO NÍVEL DE CHEFE ADICIONADO
                id: 6, title: "Level 6: Viagem",
                words: [
                    {en: 'plane', pt: 'avião'}, {en: 'train', pt: 'trem'}, {en: 'trip', pt: 'viagem'},
                    {en: 'ticket', pt: 'bilhete'}, {en: 'city', pt: 'cidade'}, {en: 'mountain', pt: 'montanha'},
                    {en: 'beach', pt: 'praia'}, {en: 'see', pt: 'ver'},
                    {en: 'passport', pt: 'passaporte'}, {en: 'holiday', pt: 'feriado'}, {en: 'hotel', pt: 'hotel'}
                ],
                bossSentences: [
                    {en: 'I need a ticket to the city', pt: 'Eu preciso de um bilhete para a cidade'},
                    {en: 'I want to see the beach', pt: 'Eu quero ver a praia'},
                    {en: 'We travel by plane and train', pt: 'Nós viajamos de avião e trem'},
                    {en: 'I booked a great hotel', pt: 'Eu reservei um ótimo hotel'}
                ]
            }
        ];
    }

    // --- CONTROLE DE FLUXO ---
    startGame() {
        this.gameState = 'playing';
        this.lives = 3;
        this.score = 0;
        this.resetGameEntities();
        
        // Reseta níveis
        this.currentLevelIndex = 0;
        this.resetLevelState();
        
        this.lastSpawn = Date.now();

        uiManager.levelStartTime = Date.now();

    }

    resetGameEntities() {
        this.words = [];
        this.bullets = [];
        this.particles = [];
        this.typingQueue = [];
        this.activeWord = null;
    }

    resetLevelState() {
        this.wordsClearedInLevel = 0;
        this.isBossActive = false;
        this.bossSentencesQueue = [];
        
        // Dificuldade progressiva
        this.gameSpeed = 0.5 + (this.currentLevelIndex * 0.15); 
        this.spawnRate = Math.max(1000, 2000 - (this.currentLevelIndex * 200));
    }

    startBossPhase() {
        this.isBossActive = true;
        const currentLevel = this.levelsConfig[this.currentLevelIndex];
        this.bossSentencesQueue = [...currentLevel.bossSentences];
        
        // Explode todas as palavras normais restantes
        const normalWords = this.words.filter(w => !w.isBoss);
        normalWords.forEach(word => {
            const cx = word.x + word.width / 2;
            const cy = word.y + word.height / 2;
            
            // Cria partículas de explosão (sem dar pontos)
            for(let i = 0; i < 20; i++) {
                this.particles.push(new Particle(cx, cy, 'default'));
            }
        });
        
        // Remove todas as palavras normais da tela
        this.words = this.words.filter(w => w.isBoss);
        
        // Reseta palavra ativa se era uma palavra normal
        if (this.activeWord && !this.activeWord.isBoss) {
            this.activeWord = null;
            this.typingQueue = [];
        }
        
        // O UIManager vai detectar isBossActive e mostrar o aviso
    }

    levelUp() {
        this.currentLevelIndex++;

        this.isBossActive = false;
        
        if (this.currentLevelIndex >= this.levelsConfig.length) {
            this.gameState = 'victory';
            uiManager.createGameOverInput(true); // Input para vitória
        } else {
            this.resetLevelState();
            this.lives = Math.min(5, this.lives + 1); // Recupera vida
            // Limpa palavras antigas para dar um respiro
            this.words = [];
            this.activeWord = null;
            this.typingQueue = [];
            
            uiManager.levelStartTime = Date.now();
        }
    }

    // --- INPUT ---
    processInput(key) {
        if (this.gameState !== 'playing') return;

        // Normaliza (mas mantém espaço para frases)
        const normalizedKey = key.length === 1 ? key.toLowerCase() : key;

        if (!this.activeWord) {
            // Procura nova palavra
            const targetWord = this.words.find(word => 
                word.text[0].toLowerCase() === normalizedKey && !word.isActive
            );
            if (targetWord) {
                this.setActiveWord(targetWord);
                this.addToTypingQueue(normalizedKey, targetWord);
            }
        } else {
            // Continua palavra atual
            const nextIndex = this.activeWord.typedIndex + this.typingQueue.length;
            if (nextIndex < this.activeWord.text.length) {
                const expected = this.activeWord.text[nextIndex].toLowerCase();
                if (expected === normalizedKey) {
                    this.addToTypingQueue(normalizedKey, this.activeWord);
                } else {
                    this.resetActiveWord();
                }
            }
        }
    }

    addToTypingQueue(letter, word) {
        this.typingQueue.push({ letter, targetWord: word, processed: false });
        this.shootBullet(letter, word);
    }

    setActiveWord(word) {
        if (this.activeWord) this.activeWord.isActive = false;
        this.activeWord = word;
        word.isActive = true;
    }

    resetActiveWord() {
        if (this.activeWord) {
            this.activeWord.triggerError();
            this.activeWord.isActive = false;
            this.activeWord.typedIndex = 0;
            this.activeWord = null;
            this.typingQueue = [];
        }
    }

    // --- AÇÕES DO JOGO ---
    shootBullet(letter, targetWord) {
        const px = this.canvas.width / 2;
        const py = this.canvas.height - 60;
        const tx = targetWord.x + targetWord.width / 2;
        const ty = targetWord.y + targetWord.height / 2;
        this.bullets.push(new Bullet(px, py, tx, ty, letter, targetWord));
    }

    spawnWord() {
        const currentLevel = this.levelsConfig[this.currentLevelIndex];

        // Lógica Boss
        if (this.wordsClearedInLevel >= this.wordsToSpawnBoss) {
            // Verifica se ainda existem palavras normais na tela
            const normalWordsOnScreen = this.words.filter(w => !w.isBoss).length;
            
            if (normalWordsOnScreen > 0) {
                // AGUARDA: Não spawna nada enquanto houver palavras normais
                return;
            }
            
            if (!this.isBossActive) {
                this.startBossPhase();
                return;
            }
            if (this.bossSentencesQueue.length > 0) {
                const sentence = this.bossSentencesQueue.shift();
                // Frases: margem maior, velocidade menor
                const x = 50 + Math.random() * (this.canvas.width - 400);
                // Frase do chefe é mais lenta (0.6x)
                const word = new Word(sentence.en, sentence.pt, x, -80, this.gameSpeed * 0.6, this.ctx, true);
                this.words.push(word);
            }
            return;
        }

        // Lógica Normal
        const data = currentLevel.words[Math.floor(Math.random() * currentLevel.words.length)];
        const x = 50 + Math.random() * (this.canvas.width - 200);
        const word = new Word(data.en, data.pt, x, -50, this.gameSpeed, this.ctx, false);
        this.words.push(word);
    }

    destroyWord(word) {
        // Partículas
        const cx = word.x + word.width/2;
        const cy = word.y + word.height/2;
        const color = word.isBoss ? 'gold' : 'default';
        
        for(let i=0; i<20; i++) this.particles.push(new Particle(cx, cy, color));
        
        // Tradução flutuante
        this.particles.push(new Particle(cx, cy, 'default', word.translation));

        // Remove
        this.words = this.words.filter(w => w !== word);
        if (this.activeWord === word) {
            this.activeWord = null;
            this.typingQueue = [];
        }

        // Pontos
        this.score += word.text.length * (word.isBoss ? 20 : 10);

        // Progressão
        if (!this.isBossActive) {
            this.wordsClearedInLevel++;
        } else {
            // Se matou boss, checa se acabaram
            const bossesOnScreen = this.words.filter(w => w.isBoss).length;
            if (this.bossSentencesQueue.length === 0 && bossesOnScreen === 0) {
                setTimeout(() => this.levelUp(), 1000);
            }
        }
    }

    // --- LOOP DE ATUALIZAÇÃO ---
    update() {
        if (this.gameState === 'paused') return;
        if (this.gameState !== 'playing') return;

        const now = Date.now();
        const canSpawn = !this.isBossActive || this.bossSentencesQueue.length > 0;

        if (canSpawn && now - this.lastSpawn > this.spawnRate) {
            this.spawnWord();
            this.lastSpawn = now;
        }

        // Atualiza Palavras
        for (let i = this.words.length - 1; i >= 0; i--) {
            const w = this.words[i];
            w.update();

            // Game Over se tocar o chão
            if (w.y > this.canvas.height - 80) {
                // Se for um boss, game over imediato
                if (w.isBoss) {
                    this.lives = 0;
                    // Explosão maior para o boss
                    for(let k=0; k<40; k++) {
                        this.particles.push(new Particle(w.x+w.width/2, w.y+w.height/2, 'damage'));
                    }
                    
                    this.words.splice(i, 1);
                    if (w === this.activeWord) this.resetActiveWord();
                    
                    this.gameState = 'gameOver';
                    uiManager.createGameOverInput(false);
                } else {
                    // Palavra normal: remove só uma vida
                    this.lives--;
                    // Explosão de dano
                    for(let k=0; k<20; k++) {
                        this.particles.push(new Particle(w.x+w.width/2, w.y+w.height/2, 'damage'));
                    }
                    
                    this.words.splice(i, 1);
                    if (w === this.activeWord) this.resetActiveWord();

                    if (this.lives <= 0) {
                        this.gameState = 'gameOver';
                        uiManager.createGameOverInput(false);
                    }
                }
            }
        }

        // Atualiza Balas
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update();

            if (b.isOffScreen(this.canvas)) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Colisão
            const w = b.targetWord;
            if (this.words.includes(w)) {
                const bounds = w.getBounds();
                if (b.x > bounds.left && b.x < bounds.right && b.y > bounds.top && b.y < bounds.bottom) {
                    this.bullets.splice(i, 1);
                    
                    // Processa acerto
                    if (this.typingQueue.length > 0 && !this.typingQueue[0].processed) {
                        this.typingQueue[0].processed = true;
                        w.typedIndex++;
                        if (w.typedIndex >= w.text.length) {
                            this.destroyWord(w);
                        }
                        this.typingQueue.shift();
                    }
                }
            } else {
                this.bullets.splice(i, 1);
            }
        }

        // Atualiza Partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.isDead()) this.particles.splice(i, 1);
        }
    }

    // High Scores
    getHighScores() {
        const s = localStorage.getItem('wordInvadersHighScores');
        return s ? JSON.parse(s).sort((a,b) => b.score - a.score) : [];
    }
    saveHighScore(name, score) {
        const scores = this.getHighScores();
        scores.push({ name, score });
        localStorage.setItem('wordInvadersHighScores', JSON.stringify(scores));
    }
}

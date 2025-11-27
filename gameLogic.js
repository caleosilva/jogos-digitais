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

        this.targetLang = 'en';

        // DADOS DOS NÍVEIS
        this.levelsConfig = [
            {
                id: 1, title: "Level 1: Introdução",
                words: [
                    {en: 'hello', fr: 'bonjour', pt: 'olá'}, {en: 'hi', fr: 'salut', pt: 'oi'}, {en: 'my', fr: 'mon', pt: 'meu'}, 
                    {en: 'name', fr: 'nom', pt: 'nome'}, {en: 'is', fr: 'est', pt: 'é'}, {en: 'meet', fr: 'rencontrer', pt: 'conhecer'}, 
                    {en: 'you', fr: 'toi', pt: 'você'}, {en: 'good', fr: 'bon', pt: 'bom'},
                    {en: 'what', fr: 'quoi', pt: 'o que'}, {en: 'where', fr: 'ou', pt: 'onde'}, {en: 'how', fr: 'comment', pt: 'como'}, 
                    {en: 'old', fr: 'vieux', pt: 'velho'}, {en: 'say', fr: 'dire', pt: 'dizer'}, {en: 'morning', fr: 'matin', pt: 'manhã'}
                ],
                bossSentences: [
                    {en: 'Hello my name is John', fr: 'Bonjour je m appelle John', pt: 'Olá meu nome é John'},
                    {en: 'Nice to meet you', fr: 'Enchante de te rencontrer', pt: 'Prazer em te conhecer'},
                    {en: 'How old are you', fr: 'Quel age as tu', pt: 'Quantos anos você tem?'}
                ]
            },
            {
                id: 2, title: "Level 2: Objetos",
                words: [
                    {en: 'car', fr: 'voiture', pt: 'carro'}, {en: 'pen', fr: 'stylo', pt: 'caneta'}, {en: 'book', fr: 'livre', pt: 'livro'},
                    {en: 'red', fr: 'rouge', pt: 'vermelho'}, {en: 'blue', fr: 'bleu', pt: 'azul'}, {en: 'big', fr: 'grand', pt: 'grande'},
                    {en: 'this', fr: 'ceci', pt: 'isto'}, {en: 'have', fr: 'avoir', pt: 'tenho'},
                    {en: 'small', fr: 'petit', pt: 'pequeno'}, {en: 'table', fr: 'table', pt: 'mesa'}, {en: 'chair', fr: 'chaise', pt: 'cadeira'},
                    {en: 'water', fr: 'eau', pt: 'água'}, {en: 'phone', fr: 'telephone', pt: 'telefone'}, {en: 'keyboard', fr: 'clavier', pt: 'teclado'}
                ],
                bossSentences: [
                    {en: 'The car is blue and big', fr: 'La voiture est bleue et grande', pt: 'O carro é azul e grande'},
                    {en: 'I have a red pen', fr: 'J ai un stylo rouge', pt: 'Eu tenho uma caneta vermelha'},
                    {en: 'This is my small book', fr: 'C est mon petit livre', pt: 'Este é meu livro pequeno'}
                ]
            },
            {
                id: 3, title: "Level 3: Verbos e Ações",
                words: [
                    {en: 'like', fr: 'aimer', pt: 'gosto'}, {en: 'play', fr: 'jouer', pt: 'jogar'}, {en: 'run', fr: 'courir', pt: 'correr'},
                    {en: 'eat', fr: 'manger', pt: 'comer'}, {en: 'bread', fr: 'pain', pt: 'pão'}, {en: 'every', fr: 'chaque', pt: 'todo'},
                    {en: 'day', fr: 'jour', pt: 'dia'}, {en: 'we', fr: 'nous', pt: 'nós'},
                    {en: 'sleep', fr: 'dormir', pt: 'dormir'}, {en: 'drink', fr: 'boire', pt: 'beber'}, {en: 'write', fr: 'ecrire', pt: 'escrever'},
                    {en: 'now', fr: 'maintenant', pt: 'agora'}, {en: 'look', fr: 'regarder', pt: 'olhar'}, {en: 'find', fr: 'trouver', pt: 'encontrar'}
                ],
                bossSentences: [
                    {en: 'I like to play now', fr: 'J aime jouer maintenant', pt: 'Eu gosto de jogar agora'},
                    {en: 'I eat bread every day', fr: 'Je mange du pain chaque jour', pt: 'Eu como pão todo dia'},
                    {en: 'We run and drink water', fr: 'Nous courons et buvons de l eau', pt: 'Nós corremos e bebemos água'}
                ]
            },
            {
                id: 4, title: "Level 4: Emoções e Família",
                words: [
                    {en: 'happy', fr: 'heureux', pt: 'feliz'}, {en: 'sad', fr: 'triste', pt: 'triste'}, {en: 'very', fr: 'tres', pt: 'muito'},
                    {en: 'today', fr: 'aujourd hui', pt: 'hoje'}, {en: 'feel', fr: 'sentir', pt: 'sentir'}, {en: 'love', fr: 'aimer', pt: 'amar'},
                    {en: 'family', fr: 'famille', pt: 'família'},
                    {en: 'anger', fr: 'colere', pt: 'raiva'}, {en: 'fear', fr: 'peur', pt: 'medo'}, {en: 'home', fr: 'maison', pt: 'casa'}, 
                    {en: 'friend', fr: 'ami', pt: 'amigo'}, {en: 'mother', fr: 'mere', pt: 'mãe'}, {en: 'father', fr: 'pere', pt: 'pai'}
                ],
                bossSentences: [
                    {en: 'I am very happy today', fr: 'Je suis tres heureux aujourd hui', pt: 'Estou muito feliz hoje'},
                    {en: 'I love my mother and father', fr: 'J aime ma mere et mon pere', pt: 'Eu amo minha mãe e meu pai'},
                    {en: 'Do not feel sad at home', fr: 'Ne sois pas triste a la maison', pt: 'Não se sinta triste em casa'}
                ]
            },
            {
                id: 5, title: "Level 5: Perguntas e Locais",
                words: [
                    {en: 'what', fr: 'quoi', pt: 'o que'}, {en: 'where', fr: 'ou', pt: 'onde'}, {en: 'how', fr: 'comment', pt: 'como'},
                    {en: 'old', fr: 'vieux', pt: 'velho'}, {en: 'live', fr: 'vivre', pt: 'morar'}, {en: 'do', fr: 'faire', pt: 'fazer'},
                    {en: 'walk', fr: 'marcher', pt: 'andar'}, {en: 'talk', fr: 'parler', pt: 'falar'}, {en: 'learn', fr: 'apprendre', pt: 'aprender'},
                    {en: 'always', fr: 'toujours', pt: 'sempre'}, {en: 'school', fr: 'ecole', pt: 'escola'}, {en: 'park', fr: 'parc', pt: 'parque'}
                ],
                bossSentences: [
                    {en: 'How old are you', fr: 'Quel age as tu', pt: 'Quantos anos você tem?'},
                    {en: 'Where do you live now', fr: 'Ou habites tu maintenant', pt: 'Onde você mora agora?'},
                    {en: 'We learn always at school', fr: 'Nous apprenons toujours a l ecole', pt: 'Nós sempre aprendemos na escola'}
                ]
            },
            {
                id: 6, title: "Level 6: Viagem",
                words: [
                    {en: 'plane', fr: 'avion', pt: 'avião'}, {en: 'train', fr: 'train', pt: 'trem'}, {en: 'trip', fr: 'voyage', pt: 'viagem'},
                    {en: 'ticket', fr: 'billet', pt: 'bilhete'}, {en: 'city', fr: 'ville', pt: 'cidade'}, {en: 'mountain', fr: 'montagne', pt: 'montanha'},
                    {en: 'beach', fr: 'plage', pt: 'praia'}, {en: 'see', fr: 'voir', pt: 'ver'},
                    {en: 'passport', fr: 'passeport', pt: 'passaporte'}, {en: 'holiday', fr: 'vacances', pt: 'feriado'}, {en: 'hotel', fr: 'hotel', pt: 'hotel'}
                ],
                bossSentences: [
                    {en: 'I need a ticket to the city', fr: 'J ai besoin d un billet pour la ville', pt: 'Eu preciso de um bilhete para a cidade'},
                    {en: 'I want to see the beach', fr: 'Je veux voir la plage', pt: 'Eu quero ver a praia'},
                    {en: 'We travel by plane and train', fr: 'Nous voyageons en avion et train', pt: 'Nós viajamos de avião e trem'},
                    {en: 'I booked a great hotel', fr: 'J ai reserve un super hotel', pt: 'Eu reservei um ótimo hotel'}
                ]
            }
        ];
    }

    // --- CONTROLE DE FLUXO ---
    startGame(lang = 'en') { // Recebe o idioma (padrão 'en')
        this.targetLang = lang; // Define o idioma alvo
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
            const normalWordsOnScreen = this.words.filter(w => !w.isBoss).length;
            
            if (normalWordsOnScreen > 0) return;
            
            if (!this.isBossActive) {
                this.startBossPhase();
                return;
            }
            if (this.bossSentencesQueue.length > 0) {
                const sentence = this.bossSentencesQueue.shift();
                const x = 50 + Math.random() * (this.canvas.width - 400);
                
                // ALTERADO AQUI: Usa this.targetLang
                const textToType = sentence[this.targetLang]; 
                
                const word = new Word(textToType, sentence.pt, x, -80, this.gameSpeed * 0.6, this.ctx, true);
                this.words.push(word);
            }
            return;
        }

        // Lógica Normal
        const data = currentLevel.words[Math.floor(Math.random() * currentLevel.words.length)];
        const x = 50 + Math.random() * (this.canvas.width - 200);
        
        const textToType = data[this.targetLang];

        const word = new Word(textToType, data.pt, x, -50, this.gameSpeed, this.ctx, false);
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

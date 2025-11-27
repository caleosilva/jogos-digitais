class UIManager {
    constructor(gameLogic, canvas) {
        this.gameLogic = gameLogic;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.createStars();

        this.levelStartTime = null;
        this.levelStartDuration = 3000; // 3 segundos
    }

    createStars() {
        for (let i = 0; i < 150; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    draw() {
        this.drawBackground();
        this.drawPlanet();

        if (this.gameLogic.gameState === 'start') {
            this.drawStartScreen();
        } else if (this.gameLogic.gameState === 'gameOver') {
            this.drawGameInterface(); // Desenha o fundo do jogo parado
            this.drawGameOver();
        } else if (this.gameLogic.gameState === 'paused') {
            this.drawGameInterface(); // Desenha o jogo congelado
            this.drawPauseScreen();   // Desenha a tela de pausa por cima
        } else if (this.gameLogic.gameState === 'victory') {
            this.drawGameInterface();
            this.drawVictory();
        } else if (this.gameLogic.gameState === 'highScores') {
            this.drawHighScoresScreen();
        } else {
            this.drawGameInterface();
        }
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000010');
        gradient.addColorStop(1, '#0a0a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            if (this.gameLogic.gameState === 'playing') star.update();
            star.draw(this.ctx);
        });
    }

    drawPlanet() {
        const planetRadius = this.canvas.width * 0.8;
        const planetY = this.canvas.height + planetRadius - 150;
        this.ctx.save();
        this.ctx.shadowColor = '#4d94ff';
        this.ctx.shadowBlur = 60;
        const g = this.ctx.createRadialGradient(
            this.canvas.width/2, planetY, 0,
            this.canvas.width/2, planetY, planetRadius
        );
        g.addColorStop(0, '#3385ff');
        g.addColorStop(0.8, '#003380');
        g.addColorStop(1, '#001a40');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width/2, planetY, planetRadius, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawGameInterface() {
        // Desenha Entidades
        this.gameLogic.words.forEach(w => w.draw());
        this.gameLogic.bullets.forEach(b => b.draw(this.ctx));
        
        // Partículas e Texto Flutuante
        this.gameLogic.particles.forEach(p => {
            if (p.text) {
                this.ctx.save();
                this.ctx.globalAlpha = p.life;
                this.ctx.font = `bold ${28 * p.scale}px "Courier Prime"`;
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = '#ffff00';
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText(p.text, p.x, p.y);
                this.ctx.restore();
            } else {
                p.draw(this.ctx);
            }
        });

        this.drawPlayer();
        this.drawHUD();

        // ADICIONE ESTA LINHA:
        this.drawLevelStart();

        // Aviso de Chefão
        if (this.gameLogic.isBossActive && this.gameLogic.gameState === 'playing') {
            this.drawBossWarning();
        }
    }

    drawPlayer() {
        const x = this.canvas.width / 2;
        const y = this.canvas.height - 60;
        this.ctx.save();
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#cccccc';
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 25);
        this.ctx.lineTo(x - 20, y + 15);
        this.ctx.lineTo(x + 20, y + 15);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        // Cockpit
        this.ctx.fillStyle = '#0088ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 5, 6, 0, Math.PI*2);
        this.ctx.fill();
        // Propulsor
        const flicker = Math.random() * 10;
        this.ctx.fillStyle = `rgba(255, ${100+Math.random()*100}, 0, 0.8)`;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8, y + 15);
        this.ctx.lineTo(x + 8, y + 15);
        this.ctx.lineTo(x, y + 15 + 10 + flicker);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawHUD() {
        this.ctx.font = 'bold 20px "Courier Prime"';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        // Vidas
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillText(`❤️ Vidas: ${this.gameLogic.lives}`, 20, 20);
        // Pontos
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillText(`⭐ Pontos: ${this.gameLogic.score}`, 20, 50);

        // Nível (Canto Direito)
        this.ctx.textAlign = 'right';
        const currentLvl = this.gameLogic.levelsConfig[this.gameLogic.currentLevelIndex];
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillText(currentLvl ? currentLvl.title : "Fim", this.canvas.width - 20, 20);
        
        // Barra de progresso do nível
        if (currentLvl && !this.gameLogic.isBossActive) {
            const progress = this.gameLogic.wordsClearedInLevel / this.gameLogic.wordsToSpawnBoss;
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.fillRect(this.canvas.width - 220, 50, 200, 10);
            this.ctx.fillStyle = '#00ff88';
            this.ctx.fillRect(this.canvas.width - 220, 50, 200 * progress, 10);
        }
    }

    drawBossWarning() {
        // Verifica se há algum boss já visível na tela
        const bossOnScreen = this.gameLogic.words.some(w => w.isBoss && w.y > 0);
        
        // Se já tem boss visível, não mostra o aviso
        if (bossOnScreen) return;
        
        // Pisca
        if (Math.floor(Date.now() / 500) % 2 === 0) return;
        
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 40px "Press Start 2P"';
        this.ctx.fillStyle = '#ffcc00';
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText("BATALHA COM O BOSS!", this.canvas.width/2, 150);
        
        this.ctx.font = '20px "Courier Prime"';
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText("Escreva a frase completa!", this.canvas.width/2, 190);
        this.ctx.restore();
    }

    drawLevelStart() {
        if (!this.levelStartTime) return;
        
        const elapsed = Date.now() - this.levelStartTime;
        if (elapsed > this.levelStartDuration) {
            this.levelStartTime = null;
            return;
        }
        
        // Fade in e fade out
        const progress = elapsed / this.levelStartDuration;
        let alpha;
        if (progress < 0.2) {
            alpha = progress / 0.2; // Fade in nos primeiros 20%
        } else if (progress > 0.8) {
            alpha = (1 - progress) / 0.2; // Fade out nos últimos 20%
        } else {
            alpha = 1;
        }
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, this.canvas.height/2 - 100, this.canvas.width, 200);
        
        // Título do nível
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 48px "Press Start 2P"';
        const currentLevel = this.gameLogic.levelsConfig[this.gameLogic.currentLevelIndex];
        
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height/2 - 50, 0, this.canvas.height/2);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#0088ff');
        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText(currentLevel.title, this.canvas.width/2, this.canvas.height/2 - 20);
        
        // Subtítulo
        this.ctx.shadowBlur = 0;
        this.ctx.font = '20px "Courier Prime"';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Destrua 10 palavras para enfrentar o chefe!', this.canvas.width/2, this.canvas.height/2 + 30);
        
        this.ctx.restore();
    }

    drawStartScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.ctx.font = 'bold 60px "Courier Prime"';
        this.ctx.textAlign = 'center';
        
        // Título com gradiente
        const g = this.ctx.createLinearGradient(0, this.canvas.height/2 - 100, 0, this.canvas.height/2);
        g.addColorStop(0, '#00ff88');
        g.addColorStop(1, '#0088ff');
        this.ctx.fillStyle = g;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('👾 WORD INVADERS 👾', this.canvas.width/2, this.canvas.height/2 - 80);
        
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Courier Prime"';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText('Digite palavras para destruir. Digite frases para vencer o chefe!', this.canvas.width/2, this.canvas.height/2);
        
        const blink = Math.sin(Date.now() / 300) > 0;
        this.ctx.fillStyle = blink ? '#00ff88' : '#333';
        this.ctx.font = '20px "Press Start 2P"';
        
        // ALTERADO AQUI: Instruções novas
        this.ctx.fillText('PRESSIONE 1 PARA INGLÊS', this.canvas.width/2, this.canvas.height/2 + 100);
        this.ctx.fillStyle = blink ? '#4d94ff' : '#333'; // Cor diferente para o 2
        this.ctx.fillText('PRESSIONE 2 PARA FRANCÊS', this.canvas.width/2, this.canvas.height/2 + 140);
        
        this.ctx.restore();
    }

    drawPauseScreen() {
        this.ctx.save();
        
        // Fundo semi-transparente escuro
        this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Caixa central com borda
        const boxWidth = 600;
        const boxHeight = 300;
        const boxX = this.canvas.width/2 - boxWidth/2;
        const boxY = this.canvas.height/2 - boxHeight/2;
        
        // Borda brilhante
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Fundo da caixa
        this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Título PAUSADO
        this.ctx.font = 'bold 60px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('⏸ PAUSADO', this.canvas.width/2, this.canvas.height/2 - 70);

        // Mensagem informativa
        this.ctx.shadowBlur = 0;
        this.ctx.font = '22px "Courier Prime"';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText('Jogo pausado. Relaxe um pouco!', this.canvas.width/2, this.canvas.height/2 + 10);
        
        this.ctx.font = '18px "Courier Prime"';
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('Suas palavras e progresso estão salvos.', this.canvas.width/2, this.canvas.height/2 + 45);

        // Instrução piscante
        const blink = Math.sin(Date.now() / 400) > 0;
        this.ctx.font = '24px "Courier Prime"';
        this.ctx.fillStyle = blink ? '#00ff88' : '#333';
        this.ctx.fillText('Pressione ESC para continuar', this.canvas.width/2, this.canvas.height/2 + 100);

        this.ctx.restore();
    }

    drawGameOver() {
        this.drawOverlay('GAME OVER', '#ff4444', '');
    }

    drawVictory() {
        this.drawOverlay('YOU WIN!', '#ffd700', 'Você completou todas as fases! Salve seu recorde:');
    }

    drawOverlay(title, color, subtext) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.ctx.font = 'bold 60px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(title, this.canvas.width/2, this.canvas.height/2 - 100);

        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Courier Prime"';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Pontuação Final: ${this.gameLogic.score}`, this.canvas.width/2, this.canvas.height/2 - 30);
        
        this.ctx.font = '18px "Courier Prime"';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText(subtext, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.restore();
    }

    drawHighScoresScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('TOP SCORES', this.canvas.width/2, 100);

        const scores = this.gameLogic.getHighScores();
        this.ctx.font = '28px "Courier Prime"';
        this.ctx.fillStyle = '#fff';
        
        for(let i=0; i<Math.min(5, scores.length); i++) {
            const s = scores[i];
            this.ctx.fillText(`${i+1}. ${s.name} - ${s.score}`, this.canvas.width/2, 200 + i*50);
        }

        const blink = Math.sin(Date.now() / 400) > 0;
        this.ctx.fillStyle = blink ? '#00ff88' : '#333';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.fillText('PRESS SPACE TO RESTART', this.canvas.width/2, this.canvas.height - 80);
        this.ctx.restore();
    }

    createGameOverInput(isVictory = false) {
        if (document.getElementById('nameInput')) return;

        const input = document.createElement('input');
        input.id = 'nameInput';
        input.type = 'text';
        input.placeholder = 'Seu nome...';
        input.maxLength = 10;

        const button = document.createElement('button');
        button.id = 'saveButton';
        button.textContent = 'Salvar';

        // Estilos
        const commonStyle = `
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Courier Prime';
            z-index: 100;
        `;

        input.style.cssText = `
            ${commonStyle}
            top: 55%;
            padding: 10px;
            font-size: 20px;
            text-align: center;
            background: #111;
            color: #00ff88;
            border: 2px solid ${isVictory ? '#ffd700' : '#ff4444'};
        `;

        button.style.cssText = `
            ${commonStyle}
            top: 65%;
            padding: 10px 30px;
            font-size: 18px;
            background: ${isVictory ? '#ffd700' : '#ff4444'};
            color: #000;
            border: none;
            cursor: pointer;
            font-weight: bold;
        `;

        document.body.appendChild(input);
        document.body.appendChild(button);

        button.onclick = () => {
            const name = input.value.trim() || "Anonymous";
            this.gameLogic.saveHighScore(name, this.gameLogic.score);
            this.gameLogic.gameState = 'highScores';
            this.removeGameOverInput();
        };
        
        input.focus();
    }

    removeGameOverInput() {
        const i = document.getElementById('nameInput');
        const b = document.getElementById('saveButton');
        if (i) i.remove();
        if (b) b.remove();
    }
}

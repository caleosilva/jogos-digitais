class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        // Começa em posições aleatórias na tela
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = 0;
        this.z = Math.random() * 2 + 0.5; // Profundidade/Velocidade
        this.size = Math.random() * 1.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.y += this.z * 0.5;
        if (this.y > this.canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, type = 'default', text = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.text = text; // Se tiver texto, é uma tradução flutuante
        
        // Física
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;

        // Propriedades para texto flutuante
        if (this.text) {
            this.vx = 0;
            this.vy = -1; // Sobe devagar
            this.decay = 0.015;
            this.scale = 1;
        }
        
        // Cores
        if (type === 'gold') this.color = '255, 215, 0';
        else if (type === 'damage') this.color = '255, 68, 68';
        else this.color = '0, 255, 136';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        
        if (this.text) {
            this.scale += 0.005;
        }
    }

    draw(ctx) {
        // O desenho de partículas de texto é feito no UIManager para melhor controle de fonte
        // Aqui desenhamos apenas as partículas de explosão
        if (!this.text) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = `rgb(${this.color})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    isDead() {
        return this.life <= 0;
    }
}

class Bullet {
    constructor(x, y, targetX, targetY, letter, targetWord) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.letter = letter;
        this.targetWord = targetWord;
        this.speed = 12;

        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Homing: Ajusta a mira se o alvo se moveu
        if (this.targetWord && this.targetWord.isActive) {
            const tx = this.targetWord.x + this.targetWord.width / 2;
            const ty = this.targetWord.y + this.targetWord.height / 2;
            const dx = tx - this.x;
            const dy = ty - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 18px "Courier Prime"';
        ctx.fillText(this.letter.toUpperCase(), this.x, this.y);
        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.y < -50 || this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50;
    }
}

class Word {
    constructor(text, translation, x, y, speed, ctx, isBoss = false) {
        this.text = text;
        this.translation = translation;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.ctx = ctx;
        this.isBoss = isBoss;

        this.typedIndex = 0;
        this.isActive = false;
        this.width = this.measureWidth();
        this.height = 40;
        this.pulsePhase = 0;
        this.errorTimestamp = 0;
    }

    triggerError() {
        this.errorTimestamp = Date.now();
    }

    measureWidth() {
        this.ctx.font = 'bold 24px "Courier Prime"';
        return this.ctx.measureText(this.text).width + 30;
    }

    update() {
        this.y += this.speed;
        if (this.isActive) {
            this.pulsePhase += 0.15;
        }
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    draw() {
        // Configuração visual
        const scale = this.isActive ? 1 + Math.sin(this.pulsePhase) * 0.05 : 1;
        const isError = Date.now() - this.errorTimestamp < 300;
        
        let baseColor = this.isBoss ? '#ffd700' : '#00ff88'; // Dourado ou Verde
        let bgColor = this.isBoss ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 255, 136, 0.1)';

        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

        // Glow ativo
        if (this.isActive && !isError) {
            this.ctx.shadowColor = baseColor;
            this.ctx.shadowBlur = 15;
            bgColor = this.isBoss ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 255, 136, 0.25)';
        }

        // Estilo de Erro
        if (isError) {
            this.ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
            this.ctx.strokeStyle = '#ff4444';
            this.ctx.shadowColor = '#ff4444';
            this.ctx.shadowBlur = 20;
        } else {
            this.ctx.fillStyle = bgColor;
            this.ctx.strokeStyle = this.isActive ? baseColor : 'rgba(255, 255, 255, 0.3)';
        }

        this.ctx.lineWidth = this.isBoss ? 3 : 2;

        // Desenha caixa
        this.roundRect(this.x, this.y, this.width, this.height, 8);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
        this.ctx.font = 'bold 24px "Courier Prime"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Desenha letras
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const charWidth = 14; 
        const totalTextWidth = this.text.length * charWidth;
        const startX = centerX - (totalTextWidth / 2);

        for (let i = 0; i < this.text.length; i++) {
            const letterX = startX + (i * charWidth) + (charWidth/2);
            
            if (i < this.typedIndex) {
                // Já digitado
                this.ctx.fillStyle = baseColor;
                this.ctx.shadowColor = baseColor;
                this.ctx.shadowBlur = 10;
            } else if (i === this.typedIndex && this.isActive) {
                // Cursor atual
                const highlight = Math.sin(Date.now() / 150) * 0.5 + 0.5;
                this.ctx.fillStyle = '#fff';
                this.ctx.shadowColor = '#fff';
                this.ctx.shadowBlur = 15;
            } else {
                // Ainda não digitado
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 0;
            }

            this.ctx.fillText(this.text[i], letterX, centerY);
            this.ctx.shadowBlur = 0;
        }

        this.ctx.restore();
    }

    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }
}

/* ============================= */
/* ========= AUDIO CONTROL ===== */
/* ============================= */

const blipAudio = new Audio('blip.mp3');
blipAudio.preload = 'auto';

const holiAudio = new Audio('Holi_Song.mp3');
holiAudio.preload = 'auto';
holiAudio.loop = true;

let audioStarted = false;

function startAudioSequence() {
    if (audioStarted) return;
    audioStarted = true;

    // immediately play blip for the first five seconds
    blipAudio.play().catch(() => {});

    // after five seconds switch to main song
    setTimeout(() => {
        blipAudio.pause();
        blipAudio.currentTime = 0;
        holiAudio.play().catch(() => {});
    }, 5000);
}

document.body.addEventListener('click', startAudioSequence, { once: true });

/* ============================= */
/* ========= TEXT TYPING ======= */
/* ============================= */

const text = [
    "> initializing_holi.exe",
    "> loading colors █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ 100%",
    "> deleting negativity...",
    "> installing happiness...",
    "> deploying celebration..."
];

let index = 0;
let charIndex = 0;
const typingElement = document.getElementById("typing");

function typeLine() {
    if (index < text.length) {
        if (charIndex < text[index].length) {
            typingElement.innerHTML += text[index].charAt(charIndex);
            charIndex++;
            setTimeout(typeLine, 40);
        } else {
            typingElement.innerHTML += "<br>";
            index++;
            charIndex = 0;
            setTimeout(typeLine, 400);
        }
    } else {
        setTimeout(startHoli, 1000);
    }
}

typeLine();

/* ============================= */
/* ========= CANVAS SETUP ====== */
/* ============================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ============================= */
/* ========= PARTICLES ========= */
/* ============================= */

let particles = [];
let confetti = [];

function randomColor() {
    const colors = [
        "#ff0055",
        "#ffcc00",
        "#00ffcc",
        "#ff66ff",
        "#00aaff",
        "#ff8800",
        "#88ff00"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createParticles() {
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: 0,
            radius: Math.random() * 8 + 4,
            color: randomColor(),
            speedX: (Math.random() - 0.5) * 2,
            speedY: Math.random() * 5 + 2,
            alpha: 1
        });
    }
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: 0,
            width: Math.random() * 6 + 4,
            height: Math.random() * 12 + 6,
            color: randomColor(),
            speedY: Math.random() * 4 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            alpha: 1
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.005;

        if (p.y > canvas.height + 20 || p.alpha <= 0) {
            particles.splice(i, 1);
        }
    });

    confetti.forEach((c, i) => {
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
        ctx.restore();

        c.y += c.speedY;
        c.rotation += c.rotationSpeed;
        c.alpha -= 0.005;
        if (c.y > canvas.height + 20 || c.alpha <= 0) {
            confetti.splice(i, 1);
        }
    });

    requestAnimationFrame(animateParticles);
}

function startHoli() {
    document.getElementById("terminal").style.display = "none";
    holiAudio.play().catch(() => {});
    createParticles();
    animateParticles();

    const interval = setInterval(createParticles, 700);
    const confettiInterval = setInterval(createConfetti, 1200);
    setTimeout(() => clearInterval(interval), 20000);
    setTimeout(() => clearInterval(confettiInterval), 20000);

    setTimeout(() => {
        document.getElementById("finalMessage").style.opacity = 1;
        document.getElementById("finalMessage").classList.add('pop');
    }, 1500);
}

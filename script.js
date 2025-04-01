const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let apiKey = '';
let currentState = 0;
let credits = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        if (this.size > 0.2) this.size -= 0.02;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = (canvas.width * canvas.height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1);
            i--;
            particlesArray.push(new Particle());
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

function showMessage(id, title, content, btnText) {
    const message = document.getElementById(id);
    message.querySelector('h3').textContent = title;
    message.querySelector('p').textContent = content;
    message.querySelector('button').textContent = btnText;
    message.style.display = 'block';
    gsap.fromTo(message, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
}

function closeMessage(id) {
    const message = document.getElementById(id);
    gsap.to(message, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => message.style.display = 'none' });
}

function openApiModal() {
    const modal = document.getElementById('apiModal');
    modal.style.display = 'block';
    gsap.fromTo(modal, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
}

function closeApiModal() {
    const modal = document.getElementById('apiModal');
    gsap.to(modal, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => modal.style.display = 'none' });
}

function saveApiKey() {
    apiKey = document.getElementById('apiKey').value;
    const modal = document.getElementById('apiModal');
    gsap.to(modal, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => modal.style.display = 'none' });
    if (apiKey.startsWith('mock-api-key-')) {
        credits = 12; // מפתח שנרכש
    } else {
        credits = Infinity; // מפתח של OpenAI
    }
    alert('מפתח API נשמר בהצלחה!');
}

function startTextProcess() {
    if (!apiKey) {
        showMessage('instruction-message', 'צריך מפתח API', 'הזן מפתח API של OpenAI או קנה מפתח ב-5 ש"ח ל-12 תמונות.', 'הבנתי');
        return;
    }
    if (credits === 0) {
        showMessage('instruction-message', 'נגמרו הקרדיטים', 'קנה מפתח חדש ב-5 ש"ח כדי להמשיך.', 'הבנתי');
        return;
    }
    currentState = 1;
    updateTextState();
}

function nextStep() {
    currentState++;
    updateTextState();
}

function updateTextState() {
    const states = [
        () => closeMessage('instruction-message'),
        () => {
            const description = document.querySelector('textarea').value;
            if (description) {
                generateFromText(description);
            } else {
                showMessage('instruction-message', 'שגיאה', 'כתוב תיאור לדמות תחילה.', 'חזור');
            }
        },
        () => showMessage('instruction-message', 'הדמות מוכנה!', `נותרו לך ${credits} תמונות. התחל שוב או סגור.`, 'התחל שוב')
    ];

    if (states[currentState]) states[currentState]();
    if (currentState >= states.length - 1) currentState = 0;
}

async function generateFromText(description) {
    const prompt = `${description}, a cartoon character in an animated style with consistent color texture, white background`;
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: '512x512'
            })
        });

        const data = await response.json();
        if (data.data && data.data[0].url) {
            const img = document.createElement('img');
            img.src = data.data[0].url;
            img.style.borderRadius = '10px';
            img.style.maxWidth = '300px';
            document.querySelector('#text-examples').prepend(img);
            credits--;
            currentState++;
            updateTextState();
        } else {
            alert('שגיאה ביצירת הדמות. בדוק את מפתח ה-API.');
        }
    } catch (error) {
        alert('שגיאה: ' + error.message);
    }
}

window.addEventListener('load', () => {
    showMessage('welcome-message', 'ברוכים הבאים ל-Dreamy AI Toons!', 'כלי זה מאפשר לך ליצור דמויות מצוירות בקלות ובכיף, בין אם אתה רוצה דמות חדשה לסיפור ילדים, הפתעה מיוחדת לילד, או לוגו מונפש לעסק שלך. הכל פשוט ומהיר!\n\n', 'בוא נתחיל ליצור!');
});
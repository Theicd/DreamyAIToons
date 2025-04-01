let imageCurrentState = 0;
let userImage = null;
let userDescription = '';

document.getElementById('upload-image').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        userImage = e.target.files[0];
        imageCurrentState = 1;
        updateImageState();
    }
});

function showImageMessage(title, content, btnText, showImage = false, showInput = false) {
    const message = document.getElementById('image-instruction-message');
    let html = `
        <h3>${title}</h3>
        <p>${content}</p>
    `;
    if (showImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
            message.innerHTML = html + `<img src="${event.target.result}" alt="תמונה שהועלתה">` + (showInput ? `<input type="text" id="character-description" placeholder="תאר את הדמות (למשל: 'נסיכה')">` : '') + `<button onclick="nextImageStep()">${btnText}</button>`;
            message.style.display = 'block';
            gsap.fromTo(message, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
        };
        reader.readAsDataURL(userImage);
    } else {
        message.innerHTML = html + (showInput ? `<input type="text" id="character-description" placeholder="תאר את הדמות (למשל: 'נסיכה')">` : '') + `<button onclick="nextImageStep()">${btnText}</button>`;
        message.style.display = 'block';
        gsap.fromTo(message, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
    }
}

function closeImageMessage() {
    const message = document.getElementById('image-instruction-message');
    gsap.to(message, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => message.style.display = 'none' });
}

function nextImageStep() {
    if (imageCurrentState === 1) {
        userDescription = document.getElementById('character-description').value;
        if (!userDescription) {
            showImageMessage('שגיאה', 'כתוב תיאור לדמות תחילה.', 'חזור', true, true);
            return;
        }
    }
    imageCurrentState++;
    updateImageState();
}

function updateImageState() {
    const states = [
        () => closeImageMessage(),
        () => showImageMessage('תמונה הועלתה', 'זו התמונה שהעלית. כתוב תיאור לדמות (למשל: "נסיכה" או "גיבור על").', 'המשך', true, true),
        () => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                try {
                    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: 'gpt-4-vision-preview',
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        { type: 'text', text: 'Describe the person in the image.' },
                                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                                    ]
                                }
                            ]
                        })
                    });

                    const visionData = await visionResponse.json();
                    const description = visionData.choices[0].message.content;
                    const prompt = `${description}, a ${userDescription} in an animated style with consistent color texture, white background`;
                    generateImageFromPrompt(prompt);
                } catch (error) {
                    alert('שגיאה: ' + error.message);
                }
            };
            reader.readAsDataURL(userImage);
        },
        () => showImageMessage('הדמות מוכנה!', `נותרו לך ${credits} תמונות. התחל שוב או סגור.`, 'התחל שוב')
    ];

    if (states[imageCurrentState]) states[imageCurrentState]();
    if (imageCurrentState >= states.length - 1) imageCurrentState = 0;
}

async function generateImageFromPrompt(prompt) {
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
            document.querySelector('#image-examples').prepend(img);
            credits--;
            imageCurrentState++;
            updateImageState();
        } else {
            alert('שגיאה ביצירת הדמות. בדוק את מפתח ה-API.');
        }
    } catch (error) {
        alert('שגיאה: ' + error.message);
    }
}
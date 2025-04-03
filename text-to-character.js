// text-to-character.js - יצירת דמויות מצוירות מטקסט

// משתנה לשמירת מצב התהליך הנוכחי
let textCharacterState = 0;

/**
 * מתחיל את תהליך יצירת הדמות מטקסט
 * בודק שיש מפתח API תקף וקרדיטים זמינים
 */
function startTextProcess() {
    // בדיקת קיום מפתח API
    if (!apiKey) {
        showMessage('instruction-message', 'צריך מפתח API', 'הזן מפתח API של OpenAI או קנה מפתח ב-5 ש"ח ל-12 תמונות.', 'סגור');
        // מגדירים את כפתור הסגירה לקרוא לפונקציית closeMessage במקום nextStep
        document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
        return;
    }
    // בדיקת קרדיטים
    if (credits === 0) {
        showMessage('instruction-message', 'נגמרו הקרדיטים', 'קנה מפתח חדש ב-5 ש"ח כדי להמשיך.', 'סגור');
        // מגדירים את כפתור הסגירה לקרוא לפונקציית closeMessage במקום nextStep
        document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
        return;
    }
    // התחלת התהליך - מעבר לשלב הראשון
    textCharacterState = 1;
    updateTextState();
}

/**
 * מעבר לשלב הבא בתהליך יצירת הדמות
 * משמש כcallback לכפתור בהודעת ההנחיה
 */
function nextStep() {
    textCharacterState++;
    updateTextState();
}

/**
 * מעדכן את מצב התהליך לפי השלב הנוכחי
 */
function updateTextState() {
    const states = [
        () => closeMessage('instruction-message'),
        () => {
            const description = document.querySelector('textarea').value;
            if (description) {
                generateFromText(description);
            } else {
                showMessage('instruction-message', 'שגיאה', 'כתוב תיאור לדמות תחילה.', 'חזור');
                // מגדירים את כפתור הסגירה לקרוא לפונקציית closeMessage במקום nextStep
                document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
            }
        },
        () => {
            showMessage('instruction-message', 'הדמות מוכנה!', `נותרו לך ${credits} תמונות. התחל שוב או סגור.`, 'התחל שוב');
            // בלחיצה על התחל שוב, נסגור את החלון ונאפס את התהליך
            document.getElementById('instruction-btn').onclick = function() { 
                closeMessage('instruction-message');
                textCharacterState = 0; // איפוס המצב כדי שהתהליך יתחיל מהתחלה בפעם הבאה
            };
        }
    ];

    if (states[textCharacterState]) states[textCharacterState]();
    if (textCharacterState >= states.length - 1) textCharacterState = 0;
}

/**
 * מייצר דמות מצוירת מטקסט באמצעות DALLE API
 * @param {string} description - תיאור הדמות הרצויה
 */
async function generateFromText(description) {
    // הצגת הודעת טעינה
    const processingMessageContent = 'המערכת יוצרת את הדמות החמודה שלך ברגעים אלו!<div class="loading-animation"><div class="magic-wand"><i class="fas fa-magic"></i></div></div>';
    
    // הצגת הודעת הטעינה
    resetProcessingMessage();
    
    // הצגת הודעת הטעינה
    showMessage('processing-message', 'רגע של יצירה...', processingMessageContent, 'ממתין');
    
    // השבתת הכפתור
    const processingBtn = document.getElementById('processing-btn');
    const originalBtnText = processingBtn.textContent;
    
    // החלפת הכפתור בכפתור עם אנימציית מים
    processingBtn.outerHTML = `
        <div class="water-button" id="processing-btn">
            ${originalBtnText}
            <div class="water-animation">
                <div class="water-fill"></div>
            </div>
        </div>
    `;
    
    const prompt = `A high-quality, ultra-realistic plush toy of a ${description}, designed for toddlers.  
It has a chubby, rounded body, short arms, and wide soft feet, with fluffy pastel or natural-toned fur.  
Large, glossy eyes with a gentle, slightly smiling expression, and a small, cute nose.  
Ears (if applicable) are oversized with pink interiors.  

Photographed standing straight upright from a comfortable distance, full-body in the frame, centered with space around it.  
Plain white background with a soft gradient near the floor, soft cinematic lighting, and natural shadows under the feet.  
Subtle depth of field, symmetrical framing, one face, two eyes, consistent proportion.`;


    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            })
        });

        // סגירת הודעת הטעינה
        closeMessage('processing-message');
        
        const data = await response.json();
        if (data.data && data.data[0].url) {
            // שמירת הקישור המקורי - מוותרים על העלאה ל-ImageKit בגלל בעיית CORS
            const imageUrl = data.data[0].url;
            saveImageToLocalStorage(imageUrl, description);
            
            // יצירת תמונה עם הלינק המקורי
            const img = document.createElement('img');
            img.src = imageUrl;
            
            // עדכון הסגנון כדי שהתמונה תתאים למסגרת
            img.style.borderRadius = '8px';
            img.style.width = '92%';
            img.style.height = '75%';   // הגדלת הגובה
            img.style.objectFit = 'cover';
            img.style.margin = '3% 4% 12% 4%';  // הגדלת המרווח התחתון והעליון
            // הוספת מסגרת כמו בשאר התמונות באתר
            const container = document.createElement('div');
            container.className = 'example-card';
            container.appendChild(img);
            
            // הוספת תיאור הדמות
            const p = document.createElement('p');
            p.textContent = description;
            container.appendChild(p);
            
            document.querySelector('#text-examples').prepend(container);
            
            credits--;
            textCharacterState++;
            updateTextState();
        } else {
            // החלפת alert בפונקציית showMessage
            showMessage('instruction-message', 'שגיאה בחיבור ל-API', 'שגיאה ביצירת הדמות. בדוק את מפתח ה-API.', 'סגור');
            document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
        }
    } catch (error) {
        // סגירת הודעת הטעינה
        closeMessage('processing-message');
        
        // החלפת alert בפונקציית showMessage
        showMessage('instruction-message', 'שגיאה בחיבור', `שגיאה: ${error.message}`, 'סגור');
        document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
    }
}

function resetProcessingMessage() {
    // בדיקת קיום הודעת הטעינה
    const processingMessage = document.getElementById('processing-message');
    if (!processingMessage) return;
    
    // בדיקת קיום כפתור הטעינה
    const currentBtn = document.getElementById('processing-btn');
    
    // בדיקת סוג הכפתור
    if (!currentBtn || currentBtn.tagName.toLowerCase() !== 'button') {
        // בדיקת קיום כפתור מסוג water-button
        if (currentBtn && currentBtn.classList.contains('water-button')) {
            // שמירת הטקסט המקורי של הכפתור
            const btnText = currentBtn.textContent.trim();
            // יצירת כפתור חדש
            const newButton = document.createElement('button');
            newButton.id = 'processing-btn';
            newButton.textContent = btnText;
            // החלפת הכפתור הישן בכפתור החדש
            currentBtn.parentNode.replaceChild(newButton, currentBtn);
        } else {
            // בדיקת קיום אלמנטים h3 ו-p
            if (!processingMessage.querySelector('h3')) {
                const h3 = document.createElement('h3');
                processingMessage.appendChild(h3);
            }
            
            if (!processingMessage.querySelector('p')) {
                const p = document.createElement('p');
                processingMessage.appendChild(p);
            }
            
            // יצירת כפתור חדש
            const newButton = document.createElement('button');
            newButton.id = 'processing-btn';
            newButton.textContent = 'ממתין';
            processingMessage.appendChild(newButton);
        }
    }
}

// שמירת הלינק והתיאור ב-localStorage
function saveImageToLocalStorage(imageUrl, description) {
    // קבלת הרשימה הקיימת מ-localStorage
    let savedImages = JSON.parse(localStorage.getItem('savedCharacterImages') || '[]');
    
    // הוספת התמונה החדשה לרשימה
    savedImages.push({
        url: imageUrl,
        description: description,
        createdAt: Date.now() // זמן היצירה במילישניות
    });
    
    // שמירת הרשימה המעודכנת ב-localStorage
    localStorage.setItem('savedCharacterImages', JSON.stringify(savedImages));
}

// פונקציה להעלאת תמונה ל-ImageKit
async function uploadToImageKit(imageUrl, description) {
    try {
        // 1. הורדת התמונה מהלינק של OpenAI
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        // 2. הכנת הנתונים להעלאה
        const formData = new FormData();
        formData.append('file', imageBlob, `character_${Date.now()}.png`);
        formData.append('publicKey', 'public_w9igAXzmzEpU+rOlUbc01NwswLg=');
        formData.append('fileName', `character_${Date.now()}`);
        
        // 3. העלאת התמונה לשרת ImageKit
        const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        // 4. אם ההעלאה הצליחה, שמירת הלינק הקבוע
        if (uploadData.url) {
            // שמירת הלינק והתיאור ב-localStorage
            saveImageToLocalStorage(uploadData.url, description);
            return uploadData.url;
        } else {
            console.error('לא התקבל URL מ-ImageKit', uploadData);
            return imageUrl; // החזרת הלינק המקורי אם משהו השתבש
        }
    } catch (error) {
        console.error('שגיאה בהעלאת התמונה ל-ImageKit:', error);
        return imageUrl; // החזרת הלינק המקורי אם משהו השתבש
    }
}

// טעינת התמונות השמורות בעת טעינת הדף
function loadSavedImages() {
    // קבלת הרשימה הקיימת מ-localStorage
    const savedImages = JSON.parse(localStorage.getItem('savedCharacterImages') || '[]');
    
    // הגדרת זמן שעה אחת במילישניות
    const oneHourMs = 60 * 60 * 1000;
    const now = Date.now();
    
    // סינון התמונות שנוצרו בשעה האחרונה
    const validImages = savedImages.filter(image => {
        // בדיקה אם יש תאריך יצירה ואם הוא בתוך השעה האחרונה
        return image.createdAt && ((now - image.createdAt) < oneHourMs);
    });
    
    // עדכון הרשימה ב-localStorage
    localStorage.setItem('savedCharacterImages', JSON.stringify(validImages));
    
    // הצגת התמונות המסוננות
    validImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.url;
        
        // עדכון הסגנון כדי שהתמונה תתאים למסגרת
        img.style.borderRadius = '8px';
        img.style.width = '92%';
        img.style.height = '75%';   // הגדלת הגובה
        img.style.objectFit = 'cover';
        img.style.margin = '3% 4% 12% 4%';  // הגדלת המרווח התחתון והעליון
        // הוספת מסגרת כמו בשאר התמונות באתר
        const container = document.createElement('div');
        container.className = 'example-card';
        container.appendChild(img);
        
        // הוספת תיאור הדמות
        if (image.description) {
            const p = document.createElement('p');
            p.textContent = image.description;
            container.appendChild(p);
        }
        
        document.querySelector('#text-examples').prepend(container);
    });
}

// טעינת התמונות בעת פתיחת הדף
window.addEventListener('DOMContentLoaded', function() {
    loadSavedImages();
});

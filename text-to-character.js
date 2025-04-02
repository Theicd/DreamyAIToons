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
            // מחזירים את כפתור הסגירה לברירת המחדל - התחלה מחדש
            document.getElementById('instruction-btn').onclick = nextStep;
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
            textCharacterState++;
            updateTextState();
        } else {
            // החלפת alert בפונקציית showMessage
            showMessage('instruction-message', 'שגיאה בחיבור ל-API', 'שגיאה ביצירת הדמות. בדוק את מפתח ה-API.', 'סגור');
            document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
        }
    } catch (error) {
        // החלפת alert בפונקציית showMessage
        showMessage('instruction-message', 'שגיאה בחיבור', `שגיאה: ${error.message}`, 'סגור');
        document.getElementById('instruction-btn').onclick = function() { closeMessage('instruction-message'); };
    }
}

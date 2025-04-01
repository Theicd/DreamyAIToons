let paymentStep = 1;

function openPaymentModal() {
    paymentStep = 1;
    updatePaymentModal();
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    gsap.to(modal, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => {
        modal.style.display = 'none';
        paymentStep = 1;
    }});
}

function nextPaymentStep() {
    // ודא שכל השדות בשלב הנוכחי מלאים
    if (paymentStep === 2) {
        const name = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const email = document.getElementById('userEmail').value;
        
        if (!name || !phone || !email) {
            showPaymentError('אנא מלא את כל שדות החובה');
            return;
        }
        
        if (!phone.match(/^\d{9,10}$/)) {
            showPaymentError('אנא הזן מספר טלפון תקין');
            return;
        }
        
        if (!email.includes('@')) {
            showPaymentError('אנא הזן כתובת אימייל תקינה');
            return;
        }
    }
    
    paymentStep++;
    updatePaymentModal();
}

function showPaymentError(message) {
    const errorElement = document.getElementById('payment-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        gsap.fromTo(errorElement, 
            { opacity: 0, y: -10 }, 
            { opacity: 1, y: 0, duration: 0.3 }
        );
    }
}

function updatePaymentModal() {
    const modal = document.getElementById('paymentModal');
    
    if (paymentStep === 1) { // שלב הסבר ראשוני
        modal.innerHTML = `
            <div class="modal-header">
                <h3>רכישת מפתח API</h3>
                <button class="close-btn" onclick="closePaymentModal()">×</button>
            </div>
            <div class="modal-content payment-steps">
                <div class="payment-progress">
                    <div class="progress-step active">1</div>
                    <div class="progress-line"></div>
                    <div class="progress-step">2</div>
                    <div class="progress-line"></div>
                    <div class="progress-step">3</div>
                </div>
                
                <h4>ברוכים הבאים לתהליך רכישת מפתח API</h4>
                
                <div class="payment-info">
                    <p>רכישת מפתח API מאפשרת לך:</p>
                    <ul>
                        <li>יצירת 12 דמויות מצוירות</li>
                        <li>המרת 12 תמונות לדמויות מצוירות</li>
                        <li>יצירת 12 לוגואים תלת-מימדיים</li>
                    </ul>
                    
                    <div class="price-tag">
                        <span class="price-value">5 ₪</span>
                        <span class="price-text">תשלום חד פעמי</span>
                    </div>
                    
                    <p class="payment-steps-explain">
                        <strong>תהליך הרכישה:</strong><br>
                        1. מילוי פרטים קצר<br>
                        2. תשלום באמצעות ביט<br>
                        3. קבלת מפתח API למייל ולטלפון
                    </p>
                </div>
                
                <button class="wide-btn" onclick="nextPaymentStep()">המשך לפרטי התקשרות</button>
            </div>
        `;
    } else if (paymentStep === 2) { // שלב מילוי פרטים
        modal.innerHTML = `
            <div class="modal-header">
                <h3>הזנת פרטי התקשרות</h3>
                <button class="close-btn" onclick="closePaymentModal()">×</button>
            </div>
            <div class="modal-content payment-steps">
                <div class="payment-progress">
                    <div class="progress-step completed">✓</div>
                    <div class="progress-line active"></div>
                    <div class="progress-step active">2</div>
                    <div class="progress-line"></div>
                    <div class="progress-step">3</div>
                </div>
                
                <h4>אנא מלא את פרטיך</h4>
                <p class="step-description">הפרטים ישמשו לשליחת המפתח אליך לאחר התשלום</p>
                
                <div class="payment-form">
                    <div class="form-field">
                        <label for="userName">שם מלא <span class="required">*</span></label>
                        <input type="text" id="userName" placeholder="ישראל ישראלי">
                    </div>
                    
                    <div class="form-field">
                        <label for="userPhone">מספר טלפון <span class="required">*</span></label>
                        <input type="tel" id="userPhone" placeholder="050-1234567">
                    </div>
                    
                    <div class="form-field">
                        <label for="userEmail">אימייל <span class="required">*</span></label>
                        <input type="email" id="userEmail" placeholder="your@email.com">
                    </div>
                    
                    <div id="payment-error" class="error-message"></div>
                </div>
                
                <div class="button-group">
                    <button class="secondary-btn" onclick="paymentStep = 1; updatePaymentModal();">חזרה</button>
                    <button class="primary-btn" onclick="nextPaymentStep()">המשך לתשלום</button>
                </div>
            </div>
        `;
    } else if (paymentStep === 3) { // שלב תשלום
        modal.innerHTML = `
            <div class="modal-header">
                <h3>תשלום באמצעות ביט</h3>
                <button class="close-btn" onclick="closePaymentModal()">×</button>
            </div>
            <div class="modal-content payment-steps">
                <div class="payment-progress">
                    <div class="progress-step completed">✓</div>
                    <div class="progress-line completed"></div>
                    <div class="progress-step completed">✓</div>
                    <div class="progress-line active"></div>
                    <div class="progress-step active">3</div>
                </div>
                
                <h4>סריקת ברקוד לתשלום</h4>
                
                <div class="bit-payment-instructions">
                    <ol>
                        <li>פתח את אפליקציית <strong>ביט</strong></li>
                        <li>לחץ על כפתור <strong>"שלם עם ברקוד"</strong></li>
                        <li>סרוק את הברקוד המוצג כאן</li>
                        <li>אשר תשלום של <strong>5 ₪</strong></li>
                        <li>לאחר התשלום, לחץ על כפתור <strong>"שילמתי"</strong> למטה</li>
                    </ol>
                    
                    <div class="bit-qr-container">
                        <img src="https://via.placeholder.com/200" alt="ברקוד ביט" id="bitBarcode" class="bit-qr-code">
                        <div class="pulse-animation"></div>
                    </div>
                    
                    <p class="payment-notice">
                        <strong>חשוב:</strong> לאחר שתלחץ על <strong>"שילמתי"</strong>, המפתח ישלח למייל ולטלפון שהזנת.
                    </p>
                </div>
                
                <div class="button-group">
                    <button class="secondary-btn" onclick="paymentStep = 2; updatePaymentModal();">חזרה</button>
                    <button class="primary-btn" onclick="confirmPayment()">שילמתי</button>
                </div>
            </div>
        `;
    } else if (paymentStep === 4) { // שלב אישור
        modal.innerHTML = `
            <div class="modal-header">
                <h3>התשלום התקבל!</h3>
            </div>
            <div class="modal-content payment-steps payment-success">
                <div class="success-animation">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                
                <h4>תודה על רכישתך!</h4>
                
                <div class="success-info">
                    <p>מפתח ה-API שלך:</p>
                    <div class="api-key-display" id="generatedApiKey"></div>
                    <p>המפתח נשלח אליך גם במייל ובהודעת SMS.</p>
                    <p class="usage-info">מפתח זה מאפשר לך 12 שימושים באתר, שמור אותו בבטחה!</p>
                </div>
                
                <button class="wide-btn" onclick="applyPurchasedKey()">הזן את המפתח והתחל ליצור</button>
            </div>
        `;
        
        // יצירת מפתח מדומה חדש
        const newApiKey = 'mock-api-key-' + Math.random().toString(36).substring(2, 10);
        document.getElementById('generatedApiKey').textContent = newApiKey;
        
        // אחסון המפתח לשימוש בפונקציית applyPurchasedKey
        window.purchasedApiKey = newApiKey;
    }
    
    modal.style.display = 'block';
    gsap.fromTo(modal, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
}

function confirmPayment() {
    // בדיקה מדומה של תשלום (במציאות היינו מחכים לאישור מהשרת)
    setTimeout(() => {
        paymentStep = 4;
        updatePaymentModal();
    }, 1000);
}

function applyPurchasedKey() {
    if (window.purchasedApiKey) {
        apiKey = window.purchasedApiKey;
        credits = 12;
        closePaymentModal();
        
        // הודעת הצלחה למשתמש
        showMessage('instruction-message', 'המפתח הופעל בהצלחה!', `המפתח שרכשת הופעל, יש לך 12 שימושים זמינים. תוכל עכשיו ליצור דמויות מצוירות מדהימות!`, 'נהדר!');
    }
}
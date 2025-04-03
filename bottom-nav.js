document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const indicator = document.querySelector('.nav-indicator');
    const indicatorMask = document.querySelector('.nav-indicator-mask');
    const navList = document.querySelector('.nav-list');
    const curveLeft = document.querySelector('.curve-left');
    const curveRight = document.querySelector('.curve-right');
    
    function positionElements(item) {
        if (!item || !indicator || !curveLeft || !curveRight || !indicatorMask) return;
        
        const itemRect = item.getBoundingClientRect();
        const navRect = navList.getBoundingClientRect();
        const indicatorWidth = indicator.offsetWidth;
        const leftPosition = itemRect.left - navRect.left + (itemRect.width / 2) - (indicatorWidth / 2);
        
        indicator.style.left = leftPosition + 'px';
        curveLeft.style.left = (leftPosition - 15) + 'px';
        curveRight.style.left = (leftPosition + indicatorWidth - 5) + 'px';
        indicatorMask.style.left = (leftPosition + 5) + 'px';
        indicatorMask.style.width = (indicatorWidth - 10) + 'px';
    }
    
    let sparks = [];
    
    function createSparks(navItem) {
        sparks.forEach(spark => {
            if (spark && spark.parentNode) spark.parentNode.removeChild(spark);
        });
        sparks = [];

        for (let i = 0; i < 10; i++) {
            const spark = document.createElement('div');
            spark.classList.add('star-spark');
            document.querySelector('.bottom-navigation').appendChild(spark);
            
            const rect = navItem.getBoundingClientRect();
            const parentRect = document.querySelector('.bottom-navigation').getBoundingClientRect();
            const startX = rect.left + rect.width / 2 - parentRect.left;
            const startY = rect.top + rect.height / 2 - parentRect.top;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 3;
            const lifespan = 500 + Math.random() * 1000;
            
            spark.style.left = startX + 'px';
            spark.style.top = startY + 'px';
            
            gsap.to(spark, {
                x: Math.cos(angle) * (50 + Math.random() * 50),
                y: Math.sin(angle) * (50 + Math.random() * 50),
                opacity: 1,
                duration: 0.1,
                onComplete: function() {
                    gsap.to(spark, {
                        x: Math.cos(angle) * (100 + Math.random() * 100),
                        y: Math.sin(angle) * (100 + Math.random() * 100),
                        opacity: 0,
                        duration: lifespan / 1000,
                        ease: "power1.out",
                        onComplete: function() {
                            if (spark.parentNode) spark.parentNode.removeChild(spark);
                        }
                    });
                }
            });
            
            sparks.push(spark);
        }
    }

    function activateNavItem() {
        if (this.classList.contains('active')) return;
        
        navItems.forEach(item => {
            if (!item.classList.contains('nav-indicator')) item.classList.remove('active');
        });
        
        createSparks(this);
        this.classList.add('active');
        positionElements(this);
        
        gsap.to(indicator, {
            scale: 1.5,
            opacity: 0.8,
            duration: 0.2,
            onComplete: function() {
                gsap.to(indicator, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: "elastic.out(1, 0.5)"
                });
            }
        });
        
        gsap.fromTo([curveLeft, curveRight, indicatorMask], 
            { opacity: 0.5, y: -5 },
            { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );

        const target = this.getAttribute('data-target');
        
        const mainHeader = document.querySelector('.main-container h1');
        if (mainHeader) {
            if (target === 'text') {
                mainHeader.textContent = 'צרו דמויות מצוירות בקלות';
            } else if (target === 'image') {
                mainHeader.textContent = 'הפכו תמונות לדמויות מצוירות';
            } else if (target === 'logo') {
                mainHeader.textContent = 'צרו לוגואים תלת-מימדיים';
            }
        }

        document.getElementById('text-input-box').style.display = target === 'text' ? 'block' : 'none';
        document.getElementById('image-input-box').style.display = target === 'image' ? 'block' : 'none';
        document.getElementById('text-examples').style.display = target === 'text' ? 'flex' : 'none';
        document.getElementById('image-examples').style.display = target === 'image' ? 'flex' : 'none';
    }

    navItems.forEach(item => {
        if (item.classList.contains('nav-indicator')) return;
        item.addEventListener('click', activateNavItem);
    });

    navItems.forEach(item => {
        if (item.classList.contains('nav-indicator')) return;
        
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                gsap.to(this.querySelector('.nav-icon'), {
                    scale: 1.2,
                    y: -10,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                gsap.to(this.querySelector('.nav-icon'), {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }
        });
    });
    
    if (navItems.length > 0) {
        const actualButtons = Array.from(navItems).filter(item => !item.classList.contains('nav-indicator'));
        if (actualButtons.length > 0) {
            actualButtons[0].classList.add('active');
            setTimeout(() => positionElements(actualButtons[0]), 100);
        }
    }
    
    window.addEventListener('load', function() {
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) positionElements(activeItem);
    });
    
    window.addEventListener('resize', function() {
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) positionElements(activeItem);
    });
});
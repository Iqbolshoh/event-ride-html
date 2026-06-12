// Event Ride - Asosiy logika
class EventRideApp {
    constructor() {
        this.eventData = null;
        this.participants = [];
        this.taxiPrices = {
            econom: 45000,
            comfort: 75000,
            business: 120000
        };
        this.init();
    }

    init() {
        this.loadEventListeners();
        this.checkStoredData();
    }

    loadEventListeners() {
        // 1-bet form
        document.getElementById('eventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createEvent();
        });

        // 2-bet form
        document.getElementById('joinForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addParticipant();
        });

        // Navigatsiya
        document.getElementById('backToEventBtn')?.addEventListener('click', () => {
            this.showPage(1);
        });

        document.getElementById('viewResultsBtn')?.addEventListener('click', () => {
            this.showCalculations();
            this.showPage(3);
        });

        document.getElementById('backToJoinBtn')?.addEventListener('click', () => {
            this.showPage(2);
        });

        document.getElementById('resetAllBtn')?.addEventListener('click', () => {
            this.resetAll();
        });
    }

    checkStoredData() {
        const saved = localStorage.getItem('eventRideData');
        if (saved) {
            const data = JSON.parse(saved);
            this.eventData = data.eventData;
            this.participants = data.participants;
            if (this.eventData && this.participants.length > 0) {
                this.updateEventSummary();
                this.showPage(2);
            }
        }
    }

    createEvent() {
        const eventName = document.getElementById('eventName').value;
        const startLocation = document.getElementById('startLocation').value;
        const destination = document.getElementById('destination').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const participantsCount = parseInt(document.getElementById('participantsCount').value);
        const taxiType = document.getElementById('taxiType').value;

        if (!eventName || !startLocation || !destination || !eventDate || !eventTime) {
            alert('Iltimos, barcha maydonlarni to\'ldiring!');
            return;
        }

        const taxiPrice = this.taxiPrices[taxiType];
        const perPerson = Math.ceil(taxiPrice / participantsCount);

        this.eventData = {
            eventName,
            startLocation,
            destination,
            eventDate,
            eventTime,
            participantsCount: participantsCount,
            taxiType,
            taxiPrice,
            perPersonExpected: perPerson,
            createdAt: new Date().toISOString()
        };

        this.participants = [];
        this.saveToLocalStorage();
        this.updateEventSummary();
        this.showPage(2);
        
        // Formani tozalash
        document.getElementById('eventForm').reset();
    }

    updateEventSummary() {
        if (!this.eventData) return;

        const summaryHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3><i class="fas fa-calendar-day"></i> ${this.eventData.eventName}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${this.eventData.startLocation} → ${this.eventData.destination}</p>
                    <p><i class="fas fa-clock"></i> ${this.eventData.eventDate} | ${this.eventData.eventTime}</p>
                </div>
                <div style="text-align: right;">
                    <div class="stat-card" style="background: white; padding: 15px;">
                        <div class="stat-info">
                            <h4>Taxi narxi</h4>
                            <p>${this.eventData.taxiPrice.toLocaleString()} so'm</p>
                            <small>${this.eventData.taxiType.toUpperCase()}</small>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #f59e0b;">
                <strong><i class="fas fa-calculator"></i> Har bir kishi taxminan:</strong> ${this.eventData.perPersonExpected.toLocaleString()} so'm
                <br><small>${this.participants.length}/${this.eventData.participantsCount} ta qatnashchi qo'shildi</small>
            </div>
        `;

        const summaryElements = document.querySelectorAll('#eventSummary, #finalEventSummary');
        summaryElements.forEach(el => {
            if (el) el.innerHTML = summaryHtml;
        });
    }

    addParticipant() {
        if (!this.eventData) {
            alert('Avval tadbir yarating!');
            this.showPage(1);
            return;
        }

        if (this.participants.length >= this.eventData.participantsCount) {
            alert(`Maksimum ${this.eventData.participantsCount} ta qatnashchi bo'lishi mumkin!`);
            return;
        }

        const name = document.getElementById('participantName').value;
        const amount = parseInt(document.getElementById('contributionAmount').value);
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        if (!name || !amount || amount <= 0) {
            alert('Ism va to\'g\'ri miqdorni kiriting!');
            return;
        }

        const expectedAmount = this.eventData.perPersonExpected;
        const status = amount >= expectedAmount ? 'to\'langan' : 'qisman to\'langan';

        this.participants.push({
            id: Date.now() + Math.random(),
            name,
            amount,
            paymentMethod,
            status,
            date: new Date().toISOString()
        });

        // Formani tozalash
        document.getElementById('joinForm').reset();
        document.getElementById('participantName').value = '';
        document.getElementById('contributionAmount').value = '';
        
        this.saveToLocalStorage();
        this.updateEventSummary();
        
        alert(`${name} muvaffaqiyatli qo'shildi!`);
        
        // Agar barcha qatnashchilar to'plangan bo'lsa
        if (this.participants.length === this.eventData.participantsCount) {
            if (confirm('Barcha qatnashchilar qo\'shildi! Hisob-kitobni ko\'rasizmi?')) {
                this.showCalculations();
                this.showPage(3);
            }
        }
    }

    showCalculations() {
        if (!this.eventData || this.participants.length === 0) {
            alert('Hech qanday qatnashchi yo\'q!');
            return;
        }

        const totalCollected = this.participants.reduce((sum, p) => sum + p.amount, 0);
        const taxiPrice = this.eventData.taxiPrice;
        const deficit = taxiPrice - totalCollected;
        const perPersonFair = Math.ceil(taxiPrice / this.participants.length);
        
        // Statistikani yangilash
        document.getElementById('totalTaxiPrice').innerText = `${taxiPrice.toLocaleString()} so'm`;
        document.getElementById('totalParticipants').innerText = this.participants.length;
        document.getElementById('collectedAmount').innerText = `${totalCollected.toLocaleString()} so'm`;
        document.getElementById('perPersonAmount').innerText = `${perPersonFair.toLocaleString()} so'm`;

        // Qatnashchilar jadvali
        const tbody = document.getElementById('participantsTableBody');
        tbody.innerHTML = '';
        
        this.participants.forEach(p => {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<i class="fas fa-user"></i> ${p.name}`;
            row.insertCell(1).innerHTML = `${p.amount.toLocaleString()} so'm`;
            row.insertCell(2).innerHTML = `<i class="fas ${p.paymentMethod === 'click' ? 'fa-credit-card' : p.paymentMethod === 'payme' ? 'fa-mobile-alt' : 'fa-money-bill'}"></i> ${p.paymentMethod.toUpperCase()}`;
            row.insertCell(3).innerHTML = `<span class="${p.status === 'to\'langan' ? 'status-paid' : 'status-unpaid'}">${p.status}</span>`;
        });

        // Tejamkorlik xabari
        const savingsMsg = document.getElementById('savingsMessage');
        if (deficit > 0) {
            savingsMsg.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                ⚠️ Hali ${deficit.toLocaleString()} so'm yig'ilmagan! 
                ${deficit/this.participants.length > 0 ? `Har bir kishi qo'shimcha ${Math.ceil(deficit/this.participants.length).toLocaleString()} so'm to'lashi kerak.` : ''}
            `;
            savingsMsg.style.background = "#fee2e2";
            savingsMsg.style.color = "#991b1b";
        } else {
            const savings = totalCollected - taxiPrice;
            savingsMsg.innerHTML = `
                <i class="fas fa-chart-line"></i> 
                🎉 Ajoyib! Siz ${savings.toLocaleString()} so'm tejadingiz! 
                Har bir kishi ${perPersonFair.toLocaleString()} so'mdan to'ladi.
            `;
            savingsMsg.style.background = "#d1fae5";
            savingsMsg.style.color = "#065f46";
        }
    }

    showPage(pageNumber) {
        // Barcha page'larni yashirish
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Tanlangan page'ni ko'rsatish
        const targetPage = document.getElementById(`page${pageNumber}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Agar 2-bet ko'rsatilayotgan bo'lsa, ma'lumotlarni yangilash
        if (pageNumber === 2 && this.eventData) {
            this.updateEventSummary();
        }
    }

    saveToLocalStorage() {
        const data = {
            eventData: this.eventData,
            participants: this.participants
        };
        localStorage.setItem('eventRideData', JSON.stringify(data));
    }

    resetAll() {
        if (confirm('Barcha ma\'lumotlar o\'chiriladi. Yangi tadbir yaratasizmi?')) {
            this.eventData = null;
            this.participants = [];
            localStorage.removeItem('eventRideData');
            document.getElementById('eventForm')?.reset();
            document.getElementById('joinForm')?.reset();
            this.showPage(1);
        }
    }
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new EventRideApp();
});
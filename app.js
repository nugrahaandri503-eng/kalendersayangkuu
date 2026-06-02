document.addEventListener('DOMContentLoaded', loadData);

document.getElementById('btn-reset').addEventListener('click', function() {
    window.localStorage.removeItem('sarah-cycles');
    document.getElementById('result-section').classList.add('hidden');
    alert('Datanya udah di-reset ya sayangg! Silakan masukin tanggal baru buat ngetes. 💖');
});

document.getElementById('tracker-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const startDateInput = document.getElementById('start-date').value;
    if(!startDateInput) return;

    const inputDateObj = new Date(startDateInput);
    const todayObj = new Date();
    inputDateObj.setHours(0,0,0,0);
    todayObj.setHours(0,0,0,0);

    if (inputDateObj > todayObj) {
        alert("Sayang, kamu masukin tanggal di masa depan nih. Coba cek lagi kalendernya ya! 😅💖");
        return; 
    }

    let periods = JSON.parse(window.localStorage.getItem('sarah-cycles')) || [];
    
    if (!periods.includes(startDateInput)) {
        periods.push(startDateInput);
        periods.sort((a, b) => new Date(b) - new Date(a));
        window.localStorage.setItem('sarah-cycles', JSON.stringify(periods));
    }

    loadData();
});

function loadData() {
    let periods = JSON.parse(window.localStorage.getItem('sarah-cycles')) || [];
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);
    
    periods = periods.filter(dateStr => {
        let d = new Date(dateStr);
        d.setHours(0,0,0,0);
        return d <= todayObj;
    });
    window.localStorage.setItem('sarah-cycles', JSON.stringify(periods));

    if (periods.length === 0) {
        document.getElementById('result-section').classList.add('hidden');
        return;
    }

    const lastPeriodDate = new Date(periods[0]);
    lastPeriodDate.setHours(0,0,0,0);
    const diffTime = todayObj - lastPeriodDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 

    const cycleLength = 28; 
    let currentDay = diffDays % cycleLength;
    if (currentDay === 0) currentDay = cycleLength;

    const daysUntilNextPeriod = cycleLength - currentDay + 1;

    updateUI(currentDay, lastPeriodDate, daysUntilNextPeriod);
}

function updateUI(day, baseDate, daysUntilNext) {
    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('day-counter').innerText = `Hari ke-${day}`;
    document.getElementById('next-period-countdown').innerText = `Haid berikutnya dalam: ${daysUntilNext} hari ✨`;

    let phaseData = {};

    if (day >= 1 && day <= 7) {
        phaseData = {
            title: "Fase Menstruasi 🩸💤",
            message: "Sayang, tubuhmu lagi mengeluarkan banyak energi buat proses pembaruan alami hari ini. Kalau perutnya mulai kram atau kamu merasa super lelah, istirahat aja ya, nggak usah dipaksain. I love you sayangku cintaku cantiku duniaku bidadariku! ❤️✨",
            tips: "Perbanyak minum teh jahe atau kamomil hangat biar pencernaanmu tenang ya. Nanti aku beliin makanan yang banyak zat besinya kayak daging atau bayam, sama cokelat hitam biar kram perutnya mereda dan ototnya rileks. 🍫😘"
        };
    } else if (day >= 8 && day <= 13) {
        phaseData = {
            title: "Fase Folikuler 🌸✨",
            message: "Halo cewek paling cantik! Energi barumu lagi terbangun nih, hormon kebahagiaanmu (serotonin dan dopamin) juga lagi naik. Semangat ya jalanin aktivitas hari ini, pesonamu lagi bersinar banget! I love you sayangku cintaku cantiku duniaku bidadariku! 🦋💖",
            tips: "Jangan lupa makan sumber protein tanpa lemak yang bagus kayak telur, ayam, atau tahu ya sayang, biar sel-sel kamu beregenerasi optimal. Kalau mau ngemil, yogurt atau tempe juga bagus banget buat pencernaanmu sekarang. 🍳🍓"
        };
    } else if (day >= 14 && day <= 17) {
        phaseData = {
            title: "Fase Ovulasi 🔥❤️",
            message: "Wah, pacarku lagi ada di puncak energinya nih! Kepercayaan diri kamu lagi tinggi banget. Kalau ada tugas berat atau presentasi, sikat aja sayang, kamu pasti bisa dan kelihatan keren banget! I love you sayangku cintaku cantiku duniaku bidadariku! 🌟🥰",
            tips: "Banyakin makan buah-buahan yang berwarna-warni kayak buah beri atau delima ya, biar antioksidannya menjaga tubuhmu dari stres seluler. Hindari makan terlalu berat dulu ya sayang biar perutnya nyaman. 🍓🍇"
        };
    } else {
        phaseData = {
            title: "Fase Luteal ☁️🥺",
            message: "Sayang, di fase ini hormon progesteron bikin kamu gampang capek dan emosi jadi lebih intens. Aku tahu kadang kamu ngerasa nggak pede, ngerasa kembung, atau nggak mau ngaca. Hei, dengerin aku, perasaan kembung itu cuma respon alami tubuhmu bersiap menghadapi perubahan, bukan berarti kamu tambah jelek. Di mataku kamu itu tetep perempuan paling cantik sedunia, jangan pernah insecure ya. I love you sayangku cintaku cantiku duniaku bidadariku! 🥺🫂💖",
            tips: "Kalau tiba-tiba pengen banget ngemil manis-manis (sugar craving), itu wajar banget kok. Tapi kita seimbangin sama ubi jalar atau gandum utuh ya biar gula darah dan mood kamu stabil. Nanti aku beliin alpukat kesukaanmu juga ya! 🥑😘"
        };
    }

    document.getElementById('phase-title').innerText = phaseData.title;
    document.getElementById('cute-message').innerText = phaseData.message;
    document.getElementById('health-tips').innerText = phaseData.tips;

    const formatDate = (dateObj) => {
        return dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long' });
    };

    // Kalkulasi Menstruasi (Hari 1-7)
    const dateMenstruasiStart = new Date(baseDate); 
    const dateMenstruasiEnd = new Date(baseDate); dateMenstruasiEnd.setDate(baseDate.getDate() + 6);

    // Kalkulasi Folikuler (Hari 8-13)
    const dateFollicularStart = new Date(baseDate); dateFollicularStart.setDate(baseDate.getDate() + 7); 
    const dateFollicularEnd = new Date(baseDate); dateFollicularEnd.setDate(baseDate.getDate() + 12);
    
    // Kalkulasi Ovulasi (Hari 14-17)
    const dateOvulationStart = new Date(baseDate); dateOvulationStart.setDate(baseDate.getDate() + 13);
    const dateOvulationEnd = new Date(baseDate); dateOvulationEnd.setDate(baseDate.getDate() + 16);

    // Kalkulasi Luteal (Hari 18-28)
    const dateLutealStart = new Date(baseDate); dateLutealStart.setDate(baseDate.getDate() + 17);
    const dateLutealEnd = new Date(baseDate); dateLutealEnd.setDate(baseDate.getDate() + 27);

    // Kalkulasi Haid Berikutnya (Hari 29)
    const dateNextPeriod = new Date(baseDate); dateNextPeriod.setDate(baseDate.getDate() + 28);

    document.getElementById('date-menstruasi').innerText = `${formatDate(dateMenstruasiStart)} - ${formatDate(dateMenstruasiEnd)}`;
    document.getElementById('date-follicular').innerText = `${formatDate(dateFollicularStart)} - ${formatDate(dateFollicularEnd)}`;
    document.getElementById('date-ovulation').innerText = `${formatDate(dateOvulationStart)} - ${formatDate(dateOvulationEnd)}`;
    document.getElementById('date-luteal').innerText = `${formatDate(dateLutealStart)} - ${formatDate(dateLutealEnd)}`;
    document.getElementById('date-next-period').innerText = `${formatDate(dateNextPeriod)}`;
}

// LOGIKA DATABASE JURNAL ILMIAH & POP-UP MODAL
const scienceData = {
    "menstruasi": {
        title: "Fase Menstruasi: Tubuh Lagi Bersih-bersih 🩸💤",
        text: "Sayang, di fase ini tubuhmu lagi melakukan 'bebersih' alami rahim. Secara medis, ini gara-gara hormon reproduksi lagi turun drastis, jadi dinding rahim meluruh deh. Kalau kamu ngerasa kram, itu karena otot rahim lagi kontraksi gara-gara hormon prostaglandin. Anggap aja tubuhmu lagi 'reset' biar makin fresh bulan depan. Kamu tetep hebat, istirahat ya!"
    },
    "folikuler": {
        title: "Fase Folikuler: Saatnya Kamu Bersinar! 🌸✨",
        text: "Nah, di fase ini, tubuhmu lagi sibuk banget menyiapkan sel telur baru di ovarium. Estrogen kamu lagi naik pesat, dan kabar baiknya: hormon ini bikin mood kamu jauh lebih stabil, fokus lebih tajam, bahkan energi kamu lagi oke banget. Ini waktu yang pas banget kalau mau ngerjain target-target kamu. Kamu lagi cantik-cantiknya nih!"
    },
    "ovulasi": {
        title: "Fase Ovulasi: Mode Bintang Utama 🔥❤️",
        text: "Ini adalah fase paling 'ekstrem' karena estrogen lagi di puncak tertinggi yang memicu lonjakan hormon LH. Efeknya? Kamu bakal ngerasa super *confident*, makin ceria, dan fisikmu lagi bugar banget buat gerak! Tubuhmu lagi berusaha sekuat tenaga melepas sel telur yang matang. Pokoknya, di fase ini, kamu itu *glowing*-nya dapet, cantiknya dapet!"
    },
    "luteal": {
        title: "Fase Luteal: Mode Rileks & Manja ☁️🥺",
        text: "Sayang, ini fase di mana tubuhmu lagi mempersiapkan kemungkinan kalau-kalau ada kehidupan di rahim. Progesteron lagi tinggi-tingginya dan ini bikin tubuh cenderung mau 'mode hemat energi' alias gampang capek dan perut agak kembung. Kalau kamu ngerasa emosi naik turun atau pengen ngemil cokelat, itu bukan salah kamu, itu cuma hormon yang lagi main-main. Jangan dengerin kalau ada suara di pikiranmu yang bilang kamu nggak cantik, itu bohong besar! Kamu tetep bidadari aku."
    }
};

// Menangani Klik pada Daftar Jadwal
const modal = document.getElementById("science-modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const clickablePhases = document.querySelectorAll(".clickable-phase");

clickablePhases.forEach(item => {
    item.addEventListener("click", function() {
        const phaseKey = this.getAttribute("data-phase");
        const data = scienceData[phaseKey];
        
        modalTitle.innerText = data.title;
        modalBody.innerText = data.text;
        modal.classList.remove("hidden");
    });
});

closeModal.addEventListener("click", function() {
    modal.classList.add("hidden");
});

window.addEventListener("click", function(event) {
    if (event.target == modal) {
        modal.classList.add("hidden");
    }
});
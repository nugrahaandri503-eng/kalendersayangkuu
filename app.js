let tempData = null;

// 1. Memuat data saat web pertama kali dibuka
document.addEventListener('DOMContentLoaded', loadData);

// 2. KETIKA TOMBOL "KALKULASIKAN" DIKLIK
document.getElementById('tracker-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const startObj = new Date(document.getElementById('start-date').value);
    const endInput = document.getElementById('end-date').value;
    const endObj = endInput ? new Date(endInput) : null;
    const cycleLength = parseInt(document.getElementById('cycle-length').value);

    startObj.setHours(0,0,0,0);
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);

    if (startObj > todayObj) {
        alert("Sayangg, kamu masukin tanggal di masa depan nih. Coba cek lagi kalendernya ya! 😅💖");
        return; 
    }

    tempData = {
        start: startObj.toISOString(),
        end: endObj ? endObj.toISOString() : null,
        length: cycleLength
    };

    document.getElementById('btn-save-permanent').classList.remove('hidden');
    processDataUI(tempData);
});

// 3. KETIKA TOMBOL HIJAU "SIMPAN PERMANEN" DIKLIK
document.getElementById('btn-save-permanent').addEventListener('click', function() {
    if (!tempData) return;

    let history = JSON.parse(window.localStorage.getItem('sarah-cycles-v3')) || [];
    
    const existingIndex = history.findIndex(item => item.start === tempData.start);
    if (existingIndex !== -1) {
        history[existingIndex] = tempData; 
    } else {
        history.push(tempData);
    }

    history.sort((a, b) => new Date(b.start) - new Date(a.start)); 
    window.localStorage.setItem('sarah-cycles-v3', JSON.stringify(history));

    // MENGIRIM DATA KE GOOGLE SPREADSHEET
    const API_URL = "https://script.google.com/macros/s/AKfycbwkSaSjuCBVzDymiA4uXg_gz1og6XaP18SEbwNkN3lXXnbNmbLMXGKXStMRG-xbIzbHPg/exec"; 
    
    let startDateStr = new Date(tempData.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    let endDateStr = tempData.end ? new Date(tempData.end).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Belum Berhenti";

    const payload = JSON.stringify({
        mulai: startDateStr,
        selesai: endDateStr,
        siklus: tempData.length
    });

    fetch(API_URL, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(response => console.log("Sukses meluncur ke Spreadsheet!"))
      .catch(error => console.error("Gagal terkirim:", error));

    alert("Jadwal bulan ini sudah terkunci dan datanya otomatis masuk ke Google Spreadsheet-mu! 💾✨");
    document.getElementById('btn-save-permanent').classList.add('hidden');
    loadData();
});

// 4. FUNGSI MENAMPILKAN DATA PERMANEN
function loadData() {
    let history = JSON.parse(window.localStorage.getItem('sarah-cycles-v3')) || [];
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);
    
    history = history.filter(dateStr => {
        let d = new Date(dateStr.start);
        d.setHours(0,0,0,0);
        return d <= todayObj;
    });
    window.localStorage.setItem('sarah-cycles-v3', JSON.stringify(history));

    updateHistoryTable(history);

    if (history.length === 0) {
        document.getElementById('day-counter').innerText = `Hari ke-?`;
        document.getElementById('saved-date-display').innerText = `Haid Terakhir: -`;
        document.getElementById('phase-title').innerText = `Menunggu Data ⏳`;
        document.getElementById('cute-message').innerText = `Silakan isi tanggal di kiri lalu klik Kalkulasikan ya!`;
        document.getElementById('date-menstruasi').innerText = `-`;
        document.getElementById('date-follicular').innerText = `-`;
        document.getElementById('date-ovulation').innerText = `-`;
        document.getElementById('date-luteal').innerText = `-`;
        document.getElementById('date-next-period').innerText = `-`;
        return;
    }

    const latest = history[0];
    processDataUI(latest);
}

// 5. FUNGSI LOGIKA PERHITUNGAN HARI
function processDataUI(dataObj) {
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);

    const baseDate = new Date(dataObj.start);
    baseDate.setHours(0,0,0,0);
    const cycleLen = dataObj.length;
    
    const diffTime = todayObj - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    const daysUntilNext = cycleLen - diffDays + 1;

    if (daysUntilNext < 0) {
        document.getElementById('countdown-box').classList.add('hidden');
        document.getElementById('overdue-alert').classList.remove('hidden');
        updateUI(diffDays, baseDate, cycleLen, "telat");
    } else {
        document.getElementById('countdown-box').classList.remove('hidden');
        document.getElementById('overdue-alert').classList.add('hidden');
        document.getElementById('next-period-countdown').innerText = `Haid berikutnya dalam: ${daysUntilNext} hari ✨`;
        updateUI(diffDays, baseDate, cycleLen, "normal");
    }
}

// 6. MENAMPILKAN TABEL REKAM JEJAK & FITUR HAPUS SPESIFIK
function updateHistoryTable(history) {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    const formatDate = (dStr) => new Date(dStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });

    history.forEach((record, index) => {
        let li = document.createElement('li');
        li.style.position = "relative"; 
        let endTxt = record.end ? formatDate(record.end) : "Belum Berhenti";
        
        li.innerHTML = `
            🗓️ <strong>Mulai:</strong> ${formatDate(record.start)} <br> 
            🛑 <strong>Selesai:</strong> ${endTxt} <br> 
            🔄 <strong>Siklus:</strong> ${record.length} hari
            <button class="btn-delete-item" data-index="${index}" style="position:absolute; right:5px; top:15px; background:none; border:none; font-size:1.1rem; cursor:pointer;" title="Hapus Data Ini">❌</button>
        `;
        list.appendChild(li);
    });

    document.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-index');
            hapusDataSpesifik(idx);
        });
    });

    const healthBox = document.getElementById('health-text');
    const healthIcon = document.getElementById('health-icon');
    
    if(history.length > 0) {
        const latestLen = history[0].length;
        if (latestLen >= 21 && latestLen <= 35) {
            healthIcon.innerText = "✅";
            healthBox.innerHTML = `Siklus sehat dan normal sayang!<br>Panjang siklus terakhirmu stabil di rentang medis (21-35 hari). Bagus banget!`;
            healthBox.parentElement.style.backgroundColor = "#e6ffe6";
        } else {
            healthIcon.innerText = "⚠️";
            healthBox.innerHTML = `Siklus di luar rentang normal.<br>Jangan stres ya sayang, banyak istirahat.`;
            healthBox.parentElement.style.backgroundColor = "#ffe6e6";
        }
    } else {
        healthIcon.innerText = "⏳";
        healthBox.innerHTML = `Belum ada data tersimpan...`;
        healthBox.parentElement.style.backgroundColor = "white";
    }
}

function hapusDataSpesifik(index) {
    if(confirm("Yakin mau menghapus rekam jejak bulan ini sayang?")) {
        let history = JSON.parse(window.localStorage.getItem('sarah-cycles-v3')) || [];
        history.splice(index, 1); 
        window.localStorage.setItem('sarah-cycles-v3', JSON.stringify(history));
        loadData(); 
    }
}

// 7. MENGGANTI TULISAN UI & SISTEM NOTIFIKASI
function updateUI(day, baseDate, cycleLen, status) {
    document.getElementById('day-counter').innerText = `Hari ke-${day}`;
    const formatFullDate = (dateObj) => dateObj.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('saved-date-display').innerText = `Haid Terakhir: ${formatFullDate(baseDate)}`;

    let phaseData = {};
    const hariMenstruasiBerikutnya = cycleLen + 1;
    const awalLuteal = hariMenstruasiBerikutnya - 14; 
    const puncakOvulasi = awalLuteal - 1; 
    const awalOvulasi = puncakOvulasi - 3;
    const akhirFolikuler = awalOvulasi - 1;

    if (day >= 1 && day <= 7) {
        phaseData = { 
            title: "Fase Menstruasi 🩸💤", 
            message: "Sayang, tubuhmu lagi mengeluarkan banyak energi buat proses pembaruan alami hari ini. Kalau perutnya mulai kram atau kamu merasa super lelah, istirahat aja ya. I love you sayangku cintaku cantiku duniaku bidadariku! ❤️✨", 
            tips: "Perbanyak minum teh jahe hangat biar pencernaan tenang. Nanti aku beliin makanan yang banyak zat besinya kayak daging atau bayam biar kram perutnya mereda ya sayang! 🍫😘" 
        };
    } else if (day >= 8 && day <= akhirFolikuler) {
        phaseData = { 
            title: "Fase Folikuler 🌸✨", 
            message: "Halo cewek paling cantik! Energi barumu lagi terbangun nih setelah masa bersih-bersih kemarin. Semangat ya jalanin aktivitas hari ini, pesonamu lagi bersinar kuat banget! I love you sayangku cintaku cantiku duniaku bidadariku! 🦋💖", 
            tips: "Jangan lupa makan sumber protein tanpa lemak yang bagus kayak telur, ayam, atau tahu ya sayang, biar sel-sel beregenerasi optimal memulihkan energi barumu. 🍳🍓" 
        };
    } else if (day >= awalOvulasi && day <= puncakOvulasi) {
        phaseData = { 
            title: "Fase Ovulasi 🔥❤️", 
            message: "Wah, pacarku lagi ada di puncak energinya nih! Kepercayaan diri kamu lagi tinggi-tingginya. Kalau ada tugas kuliah, presentasi, atau urusan berat, sikat aja sayang! Aku selalu mendukungmu. I love you sayangku cintaku cantiku duniaku bidadariku! 🌟🥰", 
            tips: "Banyakin makan buah-buahan yang berwarna-warni biar antioksidannya menjaga tubuh bugar kamu. Hindari makan yang terlalu instan atau berat dulu ya sayang. 🍓🍇" 
        };
    } else if (day >= awalLuteal && status !== "telat") {
        phaseData = { 
            title: "Fase Luteal ☁️🥺", 
            message: "Sayang, di fase ini progesteron naik bikin kamu gampang capek dan emosi agak intens (PMS). Kalau kamu ngerasa kembung atau badmood, itu cuma respon alami tubuh kok. Di mataku kamu tetep perempuan paling manis sedunia. I love you sayangku cintaku cantiku duniaku bidadariku! 🥺🫂💖", 
            tips: "Kalau pengen banget ngemil manis-manis, wajar banget kok! Tapi kita seimbangin sama gandum utuh ya biar gula darah stabil. Nanti aku beliin alpukat kesukaanmu! 🥑😘" 
        };
    } else if (status === "telat") {
        phaseData = { 
            title: "Fase Menunggu ⏳", 
            message: "Udah lewat dari perkiraan tanggalnya nih sayang. Jangan panik atau tegang ya, rileks aja. Tenang, ada aku di sini yang bakal selalu nemenin kamu. Peluk erat jauh dari aku! 🤗💖", 
            tips: "Coba diingat-ingat lagi sayang, akhir-akhir ini di kampus lagi stres berat, kecapekan begadang, atau kurang tidur nggak? Jaga pola makan ya." 
        };
    }

    document.getElementById('phase-title').innerText = phaseData.title;
    document.getElementById('cute-message').innerText = phaseData.message;
    document.getElementById('health-tips').innerText = phaseData.tips;

    const formatDateShort = (dateObj) => dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long' });

    const dMensStart = new Date(baseDate); 
    const dMensEnd = new Date(baseDate); dMensEnd.setDate(baseDate.getDate() + 6);
    const dFolStart = new Date(baseDate); dFolStart.setDate(baseDate.getDate() + 7); 
    const dFolEnd = new Date(baseDate); dFolEnd.setDate(baseDate.getDate() + akhirFolikuler - 1);
    const dOvuStart = new Date(baseDate); dOvuStart.setDate(baseDate.getDate() + awalOvulasi - 1);
    const dOvuEnd = new Date(baseDate); dOvuEnd.setDate(baseDate.getDate() + puncakOvulasi - 1);
    const dLutStart = new Date(baseDate); dLutStart.setDate(baseDate.getDate() + awalLuteal - 1);
    const dLutEnd = new Date(baseDate); dLutEnd.setDate(baseDate.getDate() + hariMenstruasiBerikutnya - 2);
    const dNext = new Date(baseDate); dNext.setDate(baseDate.getDate() + hariMenstruasiBerikutnya - 1);

    document.getElementById('date-menstruasi').innerText = `${formatDateShort(dMensStart)} - ${formatDateShort(dMensEnd)}`;
    document.getElementById('date-follicular').innerText = `${formatDateShort(dFolStart)} - ${formatDateShort(dFolEnd)}`;
    document.getElementById('date-ovulation').innerText = `${formatDateShort(dOvuStart)} - ${formatDateShort(dOvuEnd)}`;
    document.getElementById('date-luteal').innerText = `${formatDateShort(dLutStart)} - ${formatDateShort(dLutEnd)}`;
    document.getElementById('date-next-period').innerText = `${formatDateShort(dNext)}`;
}

// 8. LOGIKA DOWNLOAD CSV SPREADSHEET (DENGAN PEMISAH FORMAT SEMIKOLON UNTUK EXCEL INDONESIA)
document.getElementById('btn-download-csv').addEventListener('click', function() {
    let history = JSON.parse(window.localStorage.getItem('sarah-cycles-v3')) || [];
    if(history.length === 0) {
        alert("Belum ada data yang tersimpan untuk diunduh sayang! 😅");
        return;
    }
    let csvContent = "\uFEFFMulai Haid;Selesai Haid;Lama Siklus (Hari)\n";
    history.forEach(row => {
        let startDate = new Date(row.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        let endDate = row.end ? new Date(row.end).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Belum Berhenti";
        csvContent += `"${startDate}";"${endDate}";"${row.length}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Rekam_Jejak_Siklus_Sarah.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
});

// 9. DIALOG JURNAL ILMIAH POP-UP MODAL (VERSI LENGKAP & GEMAS SEPERTI IMAGE_9AE2B5.PNG)
const scienceData = {
    "menstruasi": { 
        title: "Fase Menstruasi: Tubuh Lagi Bersih-bersih 🩸💤", 
        text: "Sayang, di fase ini tubuhmu lagi melakukan 'bebersih' alami dinding rahim. Secara medis, ini gara-gara hormon reproduksi estrogen dan progesteron drop drastis, makanya lapisan dinding rahim meluruh. Kalau kamu ngerasa kram perut, itu karena otot rahimmu lagi kontraksi buat ngeluarin darahnya dipicu hormon bernama prostaglandin. Anggap aja tubuhmu lagi 'reset ulang' biar makin sehat dan fresh bulan depan. Kamu kuat banget, aku bangga punya pacar hebat kayak kamu!" 
    },
    "folikuler": { 
        title: "Fase Folikuler: Saatnya Kamu Bersinar! 🌸✨", 
        text: "Nah, di fase ini, tubuhmu lagi sibuk mempersiapkan sel telur baru di dalam ovarium lewat bantuan hormon FSH. Kadar hormon estrogen kamu bakal meroket naik pesat! Kabar baiknya, lonjakan hormon ini bikin suasana hati (mood) kamu jauh lebih stabil, pikiran jadi super fokus, dan energi fisik kamu lagi prima banget. Ini waktu yang pas banget kalau mau belajar UTS, ngerjain project, atau olahraga. Kamu lagi manis dan glowing-glowingnya nih!" 
    },
    "ovulasi": { 
        title: "Fase Ovulasi: Mode Bintang Utama 🔥❤️", 
        text: "Ini adalah fase paling krusial karena kadar estrogen mencapai puncak tertinggi, memicu lonjakan Luteinizing Hormone (LH) yang mendadak. Efek biologisnya? Sel telur yang matang akhirnya dilepaskan! Di fase subur ini, insting pelindung, rasa percaya diri, dan daya tarik fisikmu lagi berada di level maksimal. Pokoknya pesona kecantikanmu lagi memancar tak tertandingi, deh!" 
    },
    "luteal": { 
        title: "Fase Luteal: Mode Rileks & Manja ☁️🥺", 
        text: "Sayang, ini fase di mana tubuhmu melepas hormon progesteron dalam jumlah besar untuk mempertebal rahim. Efek hormon ini bikin tubuh cenderung masuk 'mode hemat energi', makanya kamu gampang capek, perut agak begah/kembung, dan emosi bisa naik turun sensitif (PMS). Kalau kamu ngerasa sedih atau insecure tanpa alasan, itu cuma efek hormon aja ya sayang. Jangan didengerin suara-suara aneh di pikiranmu. Di mataku, kamu tetep bidadari tercantik dan paling berharga di dunia ini." 
    }
};

const scienceModal = document.getElementById("science-modal");
document.querySelectorAll(".clickable-phase").forEach(item => {
    item.addEventListener("click", function() {
        const data = scienceData[this.getAttribute("data-phase")];
        document.getElementById("modal-title").innerText = data.title;
        document.getElementById("modal-body").innerText = data.text;
        scienceModal.classList.remove("hidden");
    });
});
document.getElementById("close-modal").addEventListener("click", () => scienceModal.classList.add("hidden"));

const credModal = document.getElementById("credibility-modal");
// INI YANG BENAR: pakai classList.remove
document.getElementById("btn-credibility").addEventListener("click", () => credModal.classList.remove("hidden"));
document.getElementById("close-credibility").addEventListener("click", () => credModal.classList.add("hidden"));

const gombalModal = document.getElementById("gombal-modal");
const gombalText = document.getElementById("gombal-text");
const gombalanList = [
    "Kamu tau nggak bedanya kamu sama tanggal merah? Kalau tanggal merah libur, kalau kamu nggak pernah libur bikin aku kangen. 😜",
    "Perutnya sakit ya? Sini aku obatin pakai pelukan... eh jarak jauh dulu ya, peluk online! 🤗",
    "Nyeri mens itu emang nyebelin, tapi tetep nggak senyebelin kalau aku sehari nggak dapet kabar dari kamu. 🥰",
    "Meskipun hari ini kamu ngerasa lemes dan badmood, di mataku kamu tetep juara satu cantiknya! 🏆✨",
    "Tarik napas panjang... hembuskan... ingat, pacarmu ini sayang banget sama kamu! ❤️"
];

document.getElementById("btn-gombal").addEventListener("click", () => {
    gombalText.innerText = gombalanList[Math.floor(Math.random() * gombalanList.length)];
    gombalModal.classList.remove("hidden");
});

document.getElementById("btn-next-gombal").addEventListener("click", () => {
    let newGombal;
    do { newGombal = gombalanList[Math.floor(Math.random() * gombalanList.length)]; } while (newGombal === gombalText.innerText);
    gombalText.innerText = newGombal;
});
document.getElementById("close-gombal").addEventListener("click", () => gombalModal.classList.add("hidden"));

window.addEventListener("click", function(event) {
    if (event.target == scienceModal) scienceModal.classList.add("hidden");
    if (event.target == gombalModal) gombalModal.classList.add("hidden");
    if (event.target == credModal) credModal.classList.add("hidden");
});

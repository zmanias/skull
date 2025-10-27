// Menunggu seluruh dokumen HTML dimuat (best practice)
document.addEventListener('DOMContentLoaded', () => {
    
    // --- [LOGIKA UNTUK CHATBOT AI] ---
    
    // 1. Definisikan semua elemen yang kita butuhkan
    const fabButton = document.getElementById('fab-chat-button');
    const chatWidget = document.getElementById('chat-widget');
    const closeButton = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    
    // [BARU] Definisikan tombol kirim untuk spam prevention
    const sendButton = chatForm.querySelector('button[type="submit"]');
    
    // 2. Definisikan endpoint API Anda
    const apiEndpoint = 'https://api.fandirr.my.id/ai/gpt?model=gpt-3.5-turbo&prompt=';
    // [BARU] Definisikan endpoint TTS
    const ttsEndpoint = 'https://api.fandirr.my.id/tools/tts?lang=id&text=';

    // 3. Fungsi untuk membuka/menutup jendela chat
    function toggleChat() {
        chatWidget.classList.toggle('show');
        fabButton.classList.toggle('hidden'); // Sembunyikan/tampilkan FAB
    }

    // 4. Pasang event listener ke tombol Chatbot
    if (fabButton && chatWidget && closeButton) {
        fabButton.addEventListener('click', toggleChat);
        closeButton.addEventListener('click', toggleChat);
    }

    // 5. Fungsi helper untuk menambahkan pesan ke log
    function appendMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        messageElement.innerHTML = `<p>${message}</p>`;
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
        return messageElement;
    }

    // 6. Logika utama saat form (pesan) dikirim
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (userMessage === '') return;

            appendMessage(userMessage, 'user');
            chatInput.value = '';
            
            // [BARU] Nonaktifkan tombol untuk mencegah spam
            sendButton.disabled = true;

            const typingIndicator = appendMessage('AI sedang mengetik...', 'typing');

            try {
                // c. Panggil API AI
                const response = await fetch(apiEndpoint + encodeURIComponent(userMessage));
                if (!response.ok) throw new Error('Respon jaringan AI tidak baik.');
                
                const data = await response.json();
                
                // d. Hapus indikator "sedang mengetik"
                chatLog.removeChild(typingIndicator);

                // e. Ambil balasan dari struktur JSON
                let aiReply = 'Maaf, terjadi kesalahan saat mengambil balasan.';
                if (data.status === 'success' && data.result && data.result.reply) {
                    aiReply = data.result.reply;
                }

                // f. Tampilkan balasan AI di log
                appendMessage(aiReply, 'ai');

                // --- [BARU] Logika untuk memutar Audio TTS ---
                try {
                    const ttsResponse = await fetch(ttsEndpoint + encodeURIComponent(aiReply));
                    if (!ttsResponse.ok) throw new Error('Respon jaringan TTS tidak baik.');
                    
                    const ttsData = await ttsResponse.json();
                    
                    if (ttsData.status === 200 && ttsData.result && ttsData.result.url) {
                        // Buat elemen audio baru dan putar
                        const audio = new Audio(ttsData.result.url);
                        audio.play();
                    } else {
                        // Gagal mendapatkan URL audio, tapi jangan hentikan chat
                        console.warn('Gagal memproses audio TTS:', ttsData.message);
                    }
                } catch (ttsError) {
                    console.warn('Error saat fetching TTS:', ttsError);
                    // Gagal memutar audio bukan error fatal, lanjutkan saja
                }
                // --- [AKHIR] Logika TTS ---

            } catch (error) {
                console.error('Error fetching AI response:', error);
                // Hapus "sedang mengetik" jika terjadi error
                if (typingIndicator) chatLog.removeChild(typingIndicator);
                appendMessage('Maaf, saya tidak bisa terhubung ke server AI saat ini.', 'ai');
            } finally {
                // [BARU] Aktifkan kembali tombol, baik berhasil maupun gagal
                sendButton.disabled = false;
            }
        });
    }

    // --- [LOGIKA UNTUK HAMBURGER MENU] ---
    
    // 1. Definisikan elemen Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('#nav-links-menu a');

    // 2. Fungsi utama untuk toggle menu
    function toggleMenu() {
        document.body.classList.toggle('menu-open');
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    }

    // 3. Pasang event listener
    if (hamburgerBtn && navMenu && overlay) {
        hamburgerBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('menu-open')) {
                    toggleMenu();
                }
            });
        });
    }

    // --- [LOGIKA UNTUK SLIDER KANAN-KIRI] ---
    
    // 1. Temukan SEMUA slider-track di halaman
    const sliderTracks = document.querySelectorAll('.slider-track');
    
    // 2. Loop setiap slider-track yang ditemukan
    sliderTracks.forEach(track => {
        
        // 3. Temukan 'dots' yang berhubungan dengan track ini
        const dotsContainer = track.nextElementSibling;
        if (!dotsContainer || !dotsContainer.classList.contains('slider-dots')) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        
        // 4. Tambahkan event listener 'scroll' ke track ini
        track.addEventListener('scroll', () => {
            
            // 5. Hitung slide mana yang sedang aktif
            const slideWidth = track.clientWidth;
            const activeSlideIndex = Math.round(track.scrollLeft / slideWidth);
            
            // 6. Update 'active' class pada dots
            dots.forEach((dot, index) => {
                if (index === activeSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
    });

}); // <-- Ini adalah '});' penutup dari DOMContentLoaded
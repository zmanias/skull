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
    const sendButton = chatForm.querySelector('button[type="submit"]');
    
    // 2. Definisikan endpoint API Anda
    const apiEndpoint = 'https://api.fandirr.my.id/ai/gpt?model=gpt-3.5-turbo&prompt=';
    const ttsEndpoint = 'https://api.fandirr.my.id/tools/tts?lang=id&text=';

    // 3. Fungsi untuk membuka/menutup jendela chat
    function toggleChat() {
        chatWidget.classList.toggle('show');
        fabButton.classList.toggle('hidden');
    }

    // 4. Pasang event listener ke tombol Chatbot
    if (fabButton && chatWidget && closeButton) {
        fabButton.addEventListener('click', toggleChat);
        closeButton.addEventListener('click', toggleChat);
    }

    // 5. Fungsi helper untuk menambahkan pesan ke log
    // [MODIFIKASI] Ditambahkan parameter 'textToSpeak'
    function appendMessage(message, type, textToSpeak = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        let messageContent = `<p>${message}</p>`;
        
        // [BARU] Jika ini pesan AI, tambahkan tombol play
        if (type === 'ai' && textToSpeak) {
            // Simpan teks di data-attribute untuk referensi
            messageContent += `<button class="play-tts" data-text="${encodeURIComponent(textToSpeak)}" title="Putar Suara">🔈</button>`;
        }
        
        messageElement.innerHTML = messageContent;
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
            
            // Nonaktifkan tombol untuk mencegah spam
            sendButton.disabled = true;

            const typingIndicator = appendMessage('AI sedang mengetik...', 'typing');

            try {
                // c. Panggil API AI
                const response = await fetch(apiEndpoint + encodeURIComponent(userMessage));
                if (!response.ok) throw new Error('Respon jaringan AI tidak baik.');
                
                const data = await response.json();
                chatLog.removeChild(typingIndicator);

                // e. Ambil balasan dari struktur JSON
                let aiReply = 'Maaf, terjadi kesalahan saat mengambil balasan.';
                if (data.status === 'success' && data.result && data.result.reply) {
                    aiReply = data.result.reply;
                }

                // f. Tampilkan balasan AI di log
                // [MODIFIKASI] Logika TTS dihapus dari sini dan dipindah ke tombol.
                // Kita kirim 'aiReply' sebagai parameter textToSpeak
                appendMessage(aiReply, 'ai', aiReply);

            } catch (error) {
                console.error('Error fetching AI response:', error);
                if (typingIndicator) chatLog.removeChild(typingIndicator);
                appendMessage('Maaf, saya tidak bisa terhubung ke server AI saat ini.', 'ai');
            } finally {
                // Aktifkan kembali tombol, baik berhasil maupun gagal
                sendButton.disabled = false;
            }
        });
    }

    // --- [BARU: LOGIKA UNTUK TOMBOL PLAY TTS] ---
    // Gunakan Event Delegation untuk menangani tombol .play-tts yang baru dibuat
    chatLog.addEventListener('click', async (e) => {
        // Cek apakah yang diklik adalah tombol play
        if (!e.target.classList.contains('play-tts')) return;

        const playButton = e.target;
        const textToSpeak = decodeURIComponent(playButton.dataset.text);

        // Mencegah klik ganda
        playButton.disabled = true;
        playButton.textContent = '🔄'; // Indikator loading

        try {
            const ttsResponse = await fetch(ttsEndpoint + encodeURIComponent(textToSpeak));
            if (!ttsResponse.ok) throw new Error('Respon jaringan TTS tidak baik.');
            
            const ttsData = await ttsResponse.json();
            
            if (ttsData.status === 200 && ttsData.result && ttsData.result.url) {
                const audio = new Audio(ttsData.result.url);
                
                // Mainkan audio, dan kembalikan tombol saat selesai
                audio.play();
                audio.addEventListener('ended', () => {
                    playButton.disabled = false;
                    playButton.textContent = '🔈';
                });
            } else {
                throw new Error(ttsData.message || 'Gagal memproses audio TTS.');
            }
        } catch (ttsError) {
            console.warn('Error saat fetching TTS:', ttsError);
            playButton.disabled = false; // Aktifkan kembali jika error
            playButton.textContent = '⚠️'; // Tanda error
        }
    });

    // --- [LOGIKA UNTUK HAMBURGER MENU] ---
    
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('#nav-links-menu a');

    function toggleMenu() {
        document.body.classList.toggle('menu-open');
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    }

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
    
    const sliderTracks = document.querySelectorAll('.slider-track');
    
    sliderTracks.forEach(track => {
        const dotsContainer = track.nextElementSibling;
        if (!dotsContainer || !dotsContainer.classList.contains('slider-dots')) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        
        track.addEventListener('scroll', () => {
            const slideWidth = track.clientWidth;
            const activeSlideIndex = Math.round(track.scrollLeft / slideWidth);
            
            dots.forEach((dot, index) => {
                if (index === activeSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
    });

});
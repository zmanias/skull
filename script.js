// Menunggu seluruh dokumen HTML dimuat (best practice)
document.addEventListener('DOMContentLoaded', () => {
    
    // --- [LOGIKA UNTUK CHATBOT AI] ---
    
    // 1. Definisikan elemen Chatbot
    const fabButton = document.getElementById('fab-chat-button');
    const chatWidget = document.getElementById('chat-widget');
    const closeButton = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    
    // 2. Definisikan endpoint API
    const apiEndpoint = 'https://api.fandirr.my.id/ai/gpt?model=gpt-3.5-turbo&prompt=';

    // 3. Fungsi untuk membuka/menutup jendela chat
    function toggleChat() {
        chatWidget.classList.toggle('show');
        fabButton.classList.toggle('hidden'); // Sembunyikan/tampilkan FAB
    }

    // 4. Pasang event listener ke tombol Chatbot
    // (Kita cek dulu apakah elemennya ada, untuk menghindari error)
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
            const typingIndicator = appendMessage('AI sedang mengetik...', 'typing');

            try {
                const response = await fetch(apiEndpoint + encodeURIComponent(userMessage));
                if (!response.ok) throw new Error('Respon jaringan tidak baik.');
                
                const data = await response.json();
                chatLog.removeChild(typingIndicator);

                let aiReply = 'Maaf, terjadi kesalahan saat mengambil balasan.';
                if (data.status === 'success' && data.result && data.result.reply) {
                    aiReply = data.result.reply;
                }
                appendMessage(aiReply, 'ai');

            } catch (error) {
                console.error('Error fetching AI response:', error);
                if (typingIndicator) chatLog.removeChild(typingIndicator);
                appendMessage('Maaf, saya tidak bisa terhubung ke server AI saat ini.', 'ai');
            }
        });
    }

    // --- [BARU: LOGIKA UNTUK HAMBURGER MENU] ---
    
    // 1. Definisikan elemen Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('#nav-links-menu a');

    // 2. Fungsi utama untuk toggle menu
    function toggleMenu() {
        // Toggle class di body untuk animasi CSS
        document.body.classList.toggle('menu-open');
        
        // Update ARIA (Aksesibilitas)
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    }

    // 3. Pasang event listener
    if (hamburgerBtn && navMenu && overlay) {
        // Klik tombol hamburger
        hamburgerBtn.addEventListener('click', toggleMenu);
        
        // Klik di overlay (untuk menutup)
        overlay.addEventListener('click', toggleMenu);
        
        // [UX] Klik salah satu link (untuk menutup)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('menu-open')) {
                    toggleMenu();
                }
            });
        });
    }

});
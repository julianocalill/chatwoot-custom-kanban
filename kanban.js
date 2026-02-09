(function() {
    console.log('🚀 Chatwoot Kanban: Procurando a aba do WoofedCRM...');

    const KANBAN_OVERLAY_ID = 'cw-custom-kanban-overlay';
    const KANBAN_TAB_ID = 'cw-custom-kanban-tab';

    // --- 1. CONFIGURAÇÃO E API ---
    function getAccountId() {
        const urlParts = window.location.pathname.split('/');
        const accountIndex = urlParts.indexOf('accounts');
        if (accountIndex > -1 && urlParts[accountIndex + 1]) {
            return urlParts[accountIndex + 1];
        }
        return 1; 
    }

    async function fetchConversations(status) {
        const accountId = getAccountId();
        try {
            const response = await fetch(`/api/v1/accounts/${accountId}/conversations?status=${status}`);
            const json = await response.json();
            return json.data?.payload || json.payload || [];
        } catch (error) {
            console.error('❌ Erro API:', error);
            return [];
        }
    }

    // --- 2. INTERFACE (MODAL E CARDS) ---
    function createCard(conversation) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.onclick = () => {
            document.getElementById(KANBAN_OVERLAY_ID).style.display = 'none';
            window.location.href = `/app/accounts/${getAccountId()}/conversations/${conversation.id}`;
        };

        const meta = conversation.meta || {};
        const sender = meta.sender || {};
        const lastMsg = conversation.messages?.[0]?.content || '...';

        card.innerHTML = `
            <div class="card-header">
                <strong>#${conversation.id}</strong>
                <span>${new Date(conversation.last_activity_at * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="card-body">
                <div class="sender-name">${sender.name || 'Visitante'}</div>
                <div class="last-message">${lastMsg.substring(0, 40)}</div>
            </div>
        `;
        return card;
    }

    async function buildBoard() {
        const board = document.getElementById('kanban-board-content');
        if(!board) return;
        board.innerHTML = '<p style="padding:20px">Carregando...</p>';
        
        const openConversations = await fetchConversations('open');
        board.innerHTML = '';

        // Coluna Abertos
        const col = document.createElement('div');
        col.className = 'kanban-column';
        col.innerHTML = `<h3>🔥 Abertos (${openConversations.length})</h3>`;
        const list = document.createElement('div');
        list.className = 'kanban-list';
        openConversations.forEach(c => list.appendChild(createCard(c)));
        col.appendChild(list);
        board.appendChild(col);
    }

    function createKanbanOverlay() {
        if (document.getElementById(KANBAN_OVERLAY_ID)) return;
        const overlay = document.createElement('div');
        overlay.id = KANBAN_OVERLAY_ID;
        overlay.className = 'kanban-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="kanban-header">
                <h2>Pipeline</h2>
                <button id="close-kanban">Fechar</button>
            </div>
            <div class="kanban-board" id="kanban-board-content"></div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('close-kanban').onclick = () => overlay.style.display = 'none';
    }

    // --- 3. INJETOR INTELIGENTE (O Segredo) ---
    function injectNextToWoofed() {
        // Se já existe o botão, não faz nada
        if (document.getElementById(KANBAN_TAB_ID)) return;

        // Procura todos os elementos que possam conter o texto "WoofedCRM"
        // Geralmente são <a>, <button> ou <span> dentro de abas
        const allElements = document.querySelectorAll('a, li, button, span');
        let woofedElement = null;

        for (let el of allElements) {
            if (el.innerText && el.innerText.includes('WoofedCRM')) {
                // Achamos o texto! Agora vamos subir até achar o elemento da lista (LI)
                woofedElement = el.closest('li') || el.closest('a');

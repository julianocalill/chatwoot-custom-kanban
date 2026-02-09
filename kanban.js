(function() {
    console.log('🚀 Chatwoot Kanban: Iniciando script de Abas...');

    const KANBAN_OVERLAY_ID = 'cw-custom-kanban-overlay';
    const KANBAN_TAB_ID = 'cw-custom-kanban-tab';

    // --------------------------------------------------------
    // 1. Lógica de Dados (API) - CORRIGIDA
    // --------------------------------------------------------
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
            
            // Correção do erro de leitura da API
            // Tenta achar o payload em diferentes estruturas possíveis
            const conversations = json.data?.payload || json.payload || [];
            console.log(`✅ ${conversations.length} conversas carregadas.`);
            return conversations;
        } catch (error) {
            console.error('❌ Erro ao buscar conversas:', error);
            return [];
        }
    }

    // --------------------------------------------------------
    // 2. Lógica Visual (O Quadro)
    // --------------------------------------------------------
    function createCard(conversation) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.onclick = () => {
            // Fecha o Kanban e vai para a conversa
            document.getElementById(KANBAN_OVERLAY_ID).style.display = 'none';
            window.location.href = `/app/accounts/${getAccountId()}/conversations/${conversation.id}`;
        };

        const meta = conversation.meta || {};
        const sender = meta.sender || {};
        const lastMsg = conversation.messages && conversation.messages.length > 0 
            ? conversation.messages[0].content 
            : 'Sem mensagens';

        card.innerHTML = `
            <div class="card-header">
                <strong>#${conversation.id}</strong>
                <span class="card-time">${new Date(conversation.last_activity_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="card-body">
                <div class="sender-name">${sender.name || 'Visitante'}</div>
                <div class="last-message">${lastMsg.substring(0, 50)}</div>
            </div>
        `;
        return card;
    }

    async function buildBoard() {
        const board = document.getElementById('kanban-board-content');
        if(!board) return;
        
        board.innerHTML = '<p style="padding:20px; color: #666;">Carregando suas conversas...</p>';

        const openConversations = await fetchConversations('open');
        
        board.innerHTML = ''; // Limpa loading

        // Coluna Abertos
        const colOpen = document.createElement('div');
        colOpen.className = 'kanban-column';
        colOpen.innerHTML = `<h3>🔥 Abertos (${openConversations.length})</h3>`;
        const listOpen = document.createElement('div');
        listOpen.className = 'kanban-list';
        
        openConversations.forEach(conv => listOpen.appendChild(createCard(conv)));
        colOpen.appendChild(listOpen);
        board.appendChild(colOpen);

        // Coluna Exemplo
        const colProg = document.createElement('div');
        colProg.className = 'kanban-column';
        colProg.innerHTML = `<h3>✅ Resolvidos (Exemplo)</h3><div class="kanban-list"></div>`;
        board.appendChild(colProg);
    }

    function createKanbanInterface() {
        if (document.getElementById(KANBAN_OVERLAY_ID)) return;

        const overlay = document.createElement('div');
        overlay.id = KANBAN_OVERLAY_ID;
        overlay.className = 'kanban-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <div class="kanban-header">
                <h2>Pipeline de Atendimento</h2>
                <button id="close-kanban">Voltar para Mensagens</button>
            </div>
            <div class="kanban-board" id="kanban-board-content"></div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('close-kanban').onclick = () => {
            overlay.style.display = 'none';
        };
    }

    // --------------------------------------------------------
    // 3. O Injetor de Abas (A Mágica)
    // --------------------------------------------------------
    function injectTab() {
        // Procura a lista de abas dentro do cabeçalho da conversa
        // O seletor depende da estrutura exata, geralmente é uma UL dentro de .conversation-header ou .panel
        const tabContainer = document.querySelector('.conversation--header ul') 
                          || document.querySelector('.tabs ul')
                          || document.querySelector('ul.tabs');

        // Se não achou a aba, ou se o botão já existe, para.
        if (!tabContainer || document.getElementById(KANBAN_TAB_ID)) return;

        console.log('🎯 Container de abas encontrado! Injetando Kanban...');

        const li = document.createElement('li');
        li.className = 'tabs-title'; // Classe nativa do Chatwoot (tentativa)
        
        const btn = document.createElement('a');
        btn.id = KANBAN_TAB_ID;
        btn.innerText = 'Kanban';
        btn.style.cursor = 'pointer';
        // Estilo básico para parecer uma aba
        btn.style.padding = '1rem'; 
        btn.style.display = 'inline-block';
        btn.style.fontWeight = '500';
        btn.style.color = 'var(--s-700)';
        
        // Efeito Hover simples
        btn.onmouseover = () => btn.style.color = 'var(--w-500)';
        btn.onmouseout = () => btn.style.color = 'var(--s-700)';

        btn.onclick = async (e) => {
            e.preventDefault();
            createKanbanInterface();
            const overlay = document.getElementById(KANBAN_OVERLAY_ID);
            overlay.style.display = 'flex';
            await buildBoard();
        };

        li.appendChild(btn);
        
        // Insere a aba. Tenta inserir depois do Woofed, se não, no final.
        tabContainer.appendChild(li);
    }

    // Roda repetidamente para garantir que a aba apareça quando você troca de conversa
    setInterval(injectTab, 1000);

})();

(function() {
    console.log('🚀 Chatwoot Kanban: Iniciando...');

    const KANBAN_ID = 'cw-custom-kanban-overlay';
    
    // Configurações básicas
    // Tenta pegar o ID da conta da URL ou do objeto window (varia conforme a versão do Chatwoot)
    function getAccountId() {
        // Tenta pegar da URL atual (ex: /app/accounts/1/...)
        const urlParts = window.location.pathname.split('/');
        const accountIndex = urlParts.indexOf('accounts');
        if (accountIndex > -1 && urlParts[accountIndex + 1]) {
            return urlParts[accountIndex + 1];
        }
        return 1; // Fallback
    }

    // Função para buscar conversas da API
    async function fetchConversations(status) {
        const accountId = getAccountId();
        try {
            const response = await fetch(`/api/v1/accounts/${accountId}/conversations?status=${status}`);
            const data = await response.json();
            return data.data.payload || [];
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            return [];
        }
    }

    // Renderiza um Card de conversa
    function createCard(conversation) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        // Redireciona para a conversa ao clicar
        card.onclick = () => {
            window.location.href = `/app/accounts/${getAccountId()}/conversations/${conversation.id}`;
        };

        const meta = conversation.meta || {};
        const sender = meta.sender || {};
        
        card.innerHTML = `
            <div class="card-header">
                <strong>#${conversation.id}</strong>
                <span class="card-time">${new Date(conversation.last_activity_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="card-body">
                <div class="sender-name">${sender.name || 'Visitante'}</div>
                <div class="last-message">${conversation.messages && conversation.messages.length > 0 ? conversation.messages[0].content.substring(0, 50) + '...' : 'Sem mensagens'}</div>
            </div>
        `;
        return card;
    }

    // Constrói o quadro Kanban
    async function buildBoard() {
        const board = document.getElementById('kanban-board-content');
        board.innerHTML = '<p style="padding:20px">Carregando conversas...</p>';

        // Busca conversas (Status Open)
        const openConversations = await fetchConversations('open');
        
        // Limpa
        board.innerHTML = '';

        // Cria Coluna "Abertos"
        const colOpen = document.createElement('div');
        colOpen.className = 'kanban-column';
        colOpen.innerHTML = `<h3>🔥 Abertos (${openConversations.length})</h3>`;
        const listOpen = document.createElement('div');
        listOpen.className = 'kanban-list';
        
        openConversations.forEach(conv => {
            listOpen.appendChild(createCard(conv));
        });
        colOpen.appendChild(listOpen);
        board.appendChild(colOpen);

        // Cria Coluna Exemplo "Em Atendimento" (Placeholder visual)
        const colProg = document.createElement('div');
        colProg.className = 'kanban-column';
        colProg.innerHTML = `<h3>👨‍💻 Em Atendimento (Exemplo)</h3><div class="kanban-list"></div>`;
        board.appendChild(colProg);
    }

    // Cria a Interface do Modal
    function createKanbanInterface() {
        if (document.getElementById(KANBAN_ID)) return;

        const overlay = document.createElement('div');
        overlay.id = KANBAN_ID;
        overlay.className = 'kanban-overlay';
        overlay.style.display = 'none'; // Começa oculto

        overlay.innerHTML = `
            <div class="kanban-header">
                <h2>Meu Pipeline de Vendas</h2>
                <button id="close-kanban">X Fechar</button>
            </div>
            <div class="kanban-board" id="kanban-board-content">
                </div>
        `;

        document.body.appendChild(overlay);

        // Evento Fechar
        document.getElementById('close-kanban').onclick = () => {
            overlay.style.display = 'none';
        };

        return overlay;
    }

    // Adiciona o botão na barra lateral
    function injectButton() {
        // Tenta achar a sidebar (depende da versão do chatwoot, pode variar o seletor)
        const sidebar = document.querySelector('.secondary-menu') || document.querySelector('aside'); 
        
        if (sidebar && !document.getElementById('btn-open-kanban')) {
            const btn = document.createElement('a');
            btn.id = 'btn-open-kanban';
            btn.innerHTML = '<span class="icon">📊</span><span class="label">Kanban</span>';
            btn.className = 'menu-item';
            btn.style.cursor = 'pointer';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.padding = '10px';
            btn.style.color = 'var(--s-500)';
            btn.style.fontWeight = '500';

            btn.onclick = async (e) => {
                e.preventDefault();
                createKanbanInterface();
                const overlay = document.getElementById(KANBAN_ID);
                overlay.style.display = 'flex';
                await buildBoard();
            };

            // Insere no topo ou fim da sidebar
            sidebar.insertBefore(btn, sidebar.firstChild);
        }
    }

    // Observador para garantir que o botão seja reinserido se a página mudar (SPA)
    setInterval(injectButton, 2000);

})();
<script>
  (function() {
    console.log('🚀 Injetor Kanban iniciado...');

    // Função para adicionar o botão
    function addKanbanButton() {
      // Evita duplicar o botão se já existir
      if (document.getElementById('my-custom-kanban-btn')) return;

      // Cria o botão
      const btn = document.createElement('button');
      btn.id = 'my-custom-kanban-btn';
      btn.innerText = 'KANBAN';
      btn.style.position = 'fixed';
      btn.style.bottom = '20px';
      btn.style.right = '20px';
      btn.style.zIndex = '9999';
      btn.style.padding = '10px 20px';
      btn.style.backgroundColor = '#00D1B2'; // Cor do Chatwoot
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '5px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = 'bold';
      btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

      // Ação do botão
      btn.onclick = function() {
        alert('Aqui vamos abrir o Kanban! \nConta ID: ' + window.chatwootConfig.accountId);
        // Aqui chamaremos a função loadKanbanView()
      };

      document.body.appendChild(btn);
    }

    // Como o Chatwoot é lento para carregar os elementos, tentamos injetar a cada 2 segundos
    // O ideal seria usar MutationObserver, mas setInterval é mais simples para teste
    setInterval(addKanbanButton, 2000);
  })();
</script>
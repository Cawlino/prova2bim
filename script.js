document.addEventListener("DOMContentLoaded", () => {
    const apiURL = 'http://servicodados.ibge.gov.br/api/v3/noticias';
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const filterIcon = document.getElementById('filter-icon');
    const filterDialog = document.getElementById('filter-dialog');
    const filterForm = document.getElementById('filter-form');
    const filterCount = document.getElementById('filter-count');
    const newsList = document.getElementById('news-list');
    const pagination = document.getElementById('pagination');

    const urlParams = new URLSearchParams(window.location.search);

    const fetchData = async () => {
        try {
            const response = await fetch(`${apiURL}?${urlParams.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Dados da API do IBGE:', data); // Verifica o que está sendo retornado pela API
            renderNews(data.items);
            renderPagination(data);
        } catch (error) {
            console.error('Erro na requisição da API:', error);
        }
    };
    

    const renderNews = (items) => {
        newsList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const h2 = document.createElement('h2');
            const p = document.createElement('p');
            const editorias = document.createElement('p');
            const time = document.createElement('p');
            const button = document.createElement('button');

            img.src = `https://agenciadenoticias.ibge.gov.br/${item.imagem}`;
            h2.textContent = item.titulo;
            p.textContent = item.introducao;
            editorias.textContent = item.editorias.map(ed => `#${ed}`).join(' ');
            time.textContent = `Publicado há ${calculateTimeAgo(item.data_publicacao)}`;
            button.textContent = "Leia Mais";
            button.onclick = () => window.open(item.url, '_blank');

            li.appendChild(img);
            li.appendChild(h2);
            li.appendChild(p);
            li.appendChild(editorias);
            li.appendChild(time);
            li.appendChild(button);

            newsList.appendChild(li);
        });
    };

    const renderPagination = (data) => {
        pagination.innerHTML = '';
        for (let i = 1; i <= data.totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === data.currentPage) button.classList.add('active');
            button.onclick = () => {
                urlParams.set('page', i);
                updateURL();
                fetchData();
            };
            pagination.appendChild(button);
        }
    };

    const calculateTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Publicado hoje";
        if (diffDays === 1) return "Publicado ontem";
        return `Publicado há ${diffDays} dias`;
    };

    const updateURL = () => {
        window.history.pushState({}, '', `?${urlParams.toString()}`);
        filterCount.textContent = Array.from(urlParams.entries()).filter(([key, _]) => !['page', 'busca'].includes(key)).length;
    };

    filterIcon.addEventListener('click', () => {
        filterDialog.showModal();
    });

    document.getElementById('close-dialog').addEventListener('click', () => {
        filterDialog.close();
    });

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(filterForm);
        for (const [key, value] of formData.entries()) {
            urlParams.set(key, value);
        }
        updateURL();
        filterDialog.close();
        fetchData();
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        urlParams.set('busca', searchInput.value);
        updateURL();
        fetchData();
    });

    if (urlParams.get('busca')) {
        searchInput.value = urlParams.get('busca');
    }

    const populateFilterOptions = async () => {
        const response = await fetch('http://servicodados.ibge.gov.br/api/docs/noticias?versao=3');
        const data = await response.json();
        const typeSelect = document.getElementById('type');
        data.tipos.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.nome;
            typeSelect.appendChild(opt);
        });
    };

    populateFilterOptions();
    fetchData();
});

// Инициализация данных по умолчанию
const DEFAULT_DATA = {
    "Python": "Язык программирования высокого уровня, известный своей простотой и читаемостью. Используется для веб-разработки, анализа данных, искусственного интеллекта и многого другого.",
    "Git": "Распределенная система контроля версий. Позволяет отслеживать изменения в коде, работать в команде и управлять историей проекта.",
    "HTML/CSS": "Основные технологии для создания веб-страниц. HTML структурирует содержимое, а CSS отвечает за оформление и визуальное представление.",
    "JavaScript": "Язык программирования для создания интерактивности на веб-странице. Работает в браузере и может использоваться на серверной части (Node.js).",
    "React": "Библиотека JavaScript для создания пользовательских интерфейсов. Позволяет строить интерактивные приложения из переиспользуемых компонентов.",
    "Docker": "Технология контейнеризации, которая позволяет упаковать приложение и его зависимости в контейнер для простого развертывания.",
    "REST API": "Архитектурный стиль для создания веб-сервисов. Использует HTTP методы для работы с ресурсами.",
    "SQL": "Язык для работы с реляционными базами данных. Используется для создания, чтения, обновления и удаления данных.",
};

// Состояние приложения
let appState = {
    items: {},
    selectedItem: null,
    isEditMode: false,
    editingItem: null,
    isDarkMode: localStorage.getItem('darkMode') === 'true'
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    setupEventListeners();
    renderItemsList();
});

function initTheme() {
    if (appState.isDarkMode) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

function setupEventListeners() {
    // Боковая панель
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('searchInput').addEventListener('input', filterItems);

    // Модальное окно
    document.getElementById('saveBtn').addEventListener('click', saveItem);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeBtn').addEventListener('click', closeModal);

    // Основная область
    document.getElementById('editBtn').addEventListener('click', openEditModal);
    document.getElementById('deleteBtn').addEventListener('click', openDeleteConfirm);

    // Подтверждение удаления
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirmModal);

    // Закрытие модалей по клику на фон
    document.getElementById('modal').addEventListener('click', closeModalOnBackdrop);
    document.getElementById('confirmModal').addEventListener('click', closeConfirmOnBackdrop);

    // Горячие клавиши
    document.addEventListener('keydown', handleKeyPress);
}

// ========== УПРАВЛЕНИЕ ДАННЫМИ ==========

function loadData() {
    const saved = localStorage.getItem('appData');
    if (saved) {
        appState.items = JSON.parse(saved);
    } else {
        appState.items = { ...DEFAULT_DATA };
        saveData();
    }
}

function saveData() {
    localStorage.setItem('appData', JSON.stringify(appState.items));
}

// ========== ОТОБРАЖЕНИЕ СПИСКА ==========

function renderItemsList() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '';

    const items = Object.keys(appState.items)
        .sort((a, b) => a.localeCompare(b));

    if (items.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>Нет элементов</p></div>';
        return;
    }

    items.forEach(itemName => {
        const item = document.createElement('div');
        item.className = 'item';
        if (itemName === appState.selectedItem) {
            item.classList.add('active');
        }
        item.textContent = itemName;
        item.addEventListener('click', () => selectItem(itemName));
        list.appendChild(item);
    });
}

function filterItems(e) {
    const searchText = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const content = appState.items[item.textContent]?.toLowerCase() || '';

        if (text.includes(searchText) || content.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========== ВЫБОР ЭЛЕМЕНТА ==========

function selectItem(itemName) {
    appState.selectedItem = itemName;
    renderItemsList();
    displayContent(itemName);
}

function displayContent(itemName) {
    const content = appState.items[itemName];

    document.getElementById('selectedTitle').textContent = itemName;
    document.getElementById('contentText').textContent = content;
    document.getElementById('lastModified').textContent = `Обновлено: ${new Date().toLocaleString('ru-RU')}`;

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('contentArea').style.display = 'block';
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';
}

// ========== МОДАЛЬНЫЕ ОКНА ==========

function openAddModal() {
    appState.isEditMode = false;
    appState.editingItem = null;

    document.getElementById('modalTitle').textContent = '➕ Добавить новый элемент';
    document.getElementById('titleInput').value = '';
    document.getElementById('contentInput').value = '';

    openModal();
}

function openEditModal() {
    if (!appState.selectedItem) return;

    appState.isEditMode = true;
    appState.editingItem = appState.selectedItem;

    document.getElementById('modalTitle').textContent = '✏️ Редактировать элемент';
    document.getElementById('titleInput').value = appState.selectedItem;
    document.getElementById('contentInput').value = appState.items[appState.selectedItem];

    openModal();
}

function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.getElementById('titleInput').focus();
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function closeModalOnBackdrop(e) {
    if (e.target.id === 'modal') {
        closeModal();
    }
}

function saveItem() {
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('contentInput').value.trim();

    if (!title) {
        alert('⚠️ Введите название!');
        document.getElementById('titleInput').focus();
        return;
    }

    if (!content) {
        alert('⚠️ Введите информацию!');
        document.getElementById('contentInput').focus();
        return;
    }

    if (appState.isEditMode && appState.editingItem !== title) {
        // Если название изменилось, удаляем старое
        delete appState.items[appState.editingItem];
    }

    appState.items[title] = content;
    appState.selectedItem = title;

    saveData();
    renderItemsList();
    displayContent(title);
    closeModal();

    showNotification(appState.isEditMode ? '✏️ Элемент обновлен!' : '➕ Элемент добавлен!');
}

// ========== УДАЛЕНИЕ ==========

function openDeleteConfirm() {
    if (!appState.selectedItem) return;

    document.getElementById('confirmText').textContent = 
        `Вы уверены что хотите удалить "${appState.selectedItem}"? Это действие невозможно отменить.`;

    document.getElementById('confirmModal').classList.add('active');
}

function confirmDelete() {
    if (appState.selectedItem) {
        delete appState.items[appState.selectedItem];
        saveData();

        appState.selectedItem = null;
        renderItemsList();

        document.getElementById('selectedTitle').textContent = 'Добро пожаловать!';
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('contentArea').style.display = 'none';
        document.getElementById('editBtn').style.display = 'none';
        document.getElementById('deleteBtn').style.display = 'none';

        closeConfirmModal();
        showNotification('🗑️ Элемент удален!');
    }
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

function closeConfirmOnBackdrop(e) {
    if (e.target.id === 'confirmModal') {
        closeConfirmModal();
    }
}

// ========== ТЕМА ==========

function toggleTheme() {
    appState.isDarkMode = !appState.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', appState.isDarkMode);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = appState.isDarkMode ? '☀️' : '🌙';
}

// ========== УТИЛИТЫ ==========

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        z-index: 2000;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function handleKeyPress(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'n':
                e.preventDefault();
                openAddModal();
                break;
        }
    }

    if (e.key === 'Escape') {
        closeModal();
        closeConfirmModal();
    }

    if (e.key === 'Enter' && document.getElementById('modal').classList.contains('active')) {
        saveItem();
    }
}

// Анимация для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

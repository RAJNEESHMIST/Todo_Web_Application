// Todo App - Full Featured Application
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.currentEditId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.setMinDates();
        this.render();
    }

    initializeElements() {
        // Input elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        
        // Search and filter
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // Display elements
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.statsElements = {
            total: document.getElementById('totalTodos'),
            active: document.getElementById('activeTodos'),
            completed: document.getElementById('completedTodos')
        };
        
        // Bulk actions
        this.bulkActions = document.getElementById('bulkActions');
        this.deleteCompletedBtn = document.getElementById('deleteCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        // Top action buttons
        this.deleteCompletedBtnTop = document.getElementById('deleteCompletedBtnTop');
        this.clearAllBtnTop = document.getElementById('clearAllBtnTop');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        
        // Modal
        this.editModal = document.getElementById('editModal');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.editTodoInput = document.getElementById('editTodoInput');
        this.editPrioritySelect = document.getElementById('editPrioritySelect');
        this.editCategorySelect = document.getElementById('editCategorySelect');
        this.editDueDateInput = document.getElementById('editDueDateInput');
    }

    attachEventListeners() {
        // Add todo
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Search
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        
        // Filter
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
        
        // Bulk actions
        this.deleteCompletedBtn.addEventListener('click', () => this.deleteCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        // Top action buttons
        this.deleteCompletedBtnTop.addEventListener('click', () => this.deleteCompleted());
        this.clearAllBtnTop.addEventListener('click', () => this.clearAll());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Modal
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });
        
        // Load saved theme
        this.loadTheme();
    }

    setMinDates() {
        // Set minimum date to today to prevent selecting past dates
        const today = new Date().toISOString().split('T')[0];
        if (this.dueDateInput) {
            this.dueDateInput.setAttribute('min', today);
        }
        if (this.editDueDateInput) {
            this.editDueDateInput.setAttribute('min', today);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a todo text!', 'warning');
            return;
        }

        // Auto-select today's date if no date is selected
        let dueDate = this.dueDateInput.value;
        if (!dueDate) {
            const today = new Date().toISOString().split('T')[0];
            dueDate = today;
        }

        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            priority: this.prioritySelect.value,
            category: this.categorySelect.value,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.dueDateInput.value = '';
        this.prioritySelect.value = 'medium';
        this.categorySelect.value = 'other';
        
        this.saveTodos();
        this.render();
        this.showNotification('Todo added successfully!', 'success');
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this todo?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
            this.showNotification('Todo deleted!', 'success');
        }
    }

    toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.currentEditId = id;
        this.editTodoInput.value = todo.text;
        this.editPrioritySelect.value = todo.priority;
        this.editCategorySelect.value = todo.category;
        this.editDueDateInput.value = todo.dueDate || '';
        
        // Ensure min date is set to today when opening edit modal
        this.setMinDates();
        
        this.editModal.classList.add('show');
    }

    saveEdit() {
        if (!this.currentEditId) return;

        const todo = this.todos.find(t => t.id === this.currentEditId);
        if (todo) {
            todo.text = this.editTodoInput.value.trim();
            todo.priority = this.editPrioritySelect.value;
            todo.category = this.editCategorySelect.value;
            
            // Auto-select today's date if no date is selected during edit
            let dueDate = this.editDueDateInput.value;
            if (!dueDate) {
                const today = new Date().toISOString().split('T')[0];
                dueDate = today;
            }
            todo.dueDate = dueDate;
            
            if (!todo.text) {
                this.showNotification('Todo text cannot be empty!', 'warning');
                return;
            }

            this.saveTodos();
            this.render();
            this.closeEditModal();
            this.showNotification('Todo updated!', 'success');
        }
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.currentEditId = null;
    }

    deleteCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed todos to delete!', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed todo(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.showNotification('Completed todos deleted!', 'success');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('No todos to clear!', 'warning');
            return;
        }

        if (confirm('Are you sure you want to delete ALL todos? This cannot be undone!')) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.showNotification('All todos cleared!', 'success');
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        this.render();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.clearSearchBtn.style.display = 'none';
        this.render();
    }

    getFilteredTodos() {
        let filtered = [...this.todos];
        const searchTerm = this.searchInput.value.toLowerCase().trim();

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchTerm) ||
                todo.category.toLowerCase().includes(searchTerm) ||
                todo.priority.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'high-priority':
                filtered = filtered.filter(t => t.priority === 'high');
                break;
        }

        return filtered;
    }

    getDueDateStatus(dueDate) {
        if (!dueDate) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays === 0) return 'today';
        if (diffDays <= 3) return 'soon';
        return null;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = new Date(date);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Update stats
        this.updateStats();
        
        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
        }

        // Show/hide bulk actions
        if (this.todos.length > 0) {
            this.bulkActions.style.display = 'flex';
        } else {
            this.bulkActions.style.display = 'none';
        }

        // Render todos
        this.todoList.innerHTML = filteredTodos.map(todo => {
            const dueDateStatus = this.getDueDateStatus(todo.dueDate);
            const dueDateClass = dueDateStatus ? ` ${dueDateStatus}` : '';
            
            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="app.toggleComplete('${todo.id}')">
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-meta">
                            <span class="priority-badge ${todo.priority}">${todo.priority}</span>
                            <span class="category-badge ${todo.category}">${todo.category}</span>
                            ${todo.dueDate ? `
                                <span class="due-date${dueDateClass}">
                                    <i class="fas fa-calendar"></i>
                                    ${this.formatDate(todo.dueDate)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-btn edit" onclick="app.editTodo('${todo.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="todo-btn delete" onclick="app.deleteTodo('${todo.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add fade-in animation to new items
        const todoItems = this.todoList.querySelectorAll('.todo-item');
        todoItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.statsElements.total.textContent = total;
        this.statsElements.active.textContent = active;
        this.statsElements.completed.textContent = completed;
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--accent)'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});


Vue.component('card-form', {
    props: ['cardData'],
    template: `
        <div class="modal">
        <div class="modal-content">
            <h3>Создать / Редактировать карточку</h3>
            <label>
            Заголовок:
            <input type="text" v-model="title" placeholder="Title" />
            </label>

            <div v-for="(item, index) in items" :key="index" class="item-input">
            <input type="text" v-model="items[index]" placeholder="Task" />
            <button @click="removeItem(index)" v-if="items.length > 3">-</button>
            </div>

            <button @click="addItem" :disabled="items.length >= 5">+ Add Item</button>

            <div class="theme-selector">
            <label v-for="theme in themes" :key="theme.name">
                <input type="radio" v-model="selectedTheme" :value="theme.file" />
                <img :src="theme.file" :class="{ selected: selectedTheme === theme.file }" />
                {{ theme.name }}
            </label>
            </div>

            <div v-if="errors.length" class="errors">
            <b>Ошибки:</b>
            <ul>
                <li v-for="err in errors" :key="err">{{ err }}</li>
            </ul>
            </div>

            <button @click="saveCard">Save</button>
            <button @click="$emit('cancel')">Cancel</button>
        </div>
        </div>
    `,
    data() {
        return {
            title: this.cardData ? this.cardData.title : '',
            items: this.cardData ? [...this.cardData.items] : ['', '', ''],
            errors: [],
            themes: [
                { name: 'Orange', file: 'assets/orange.jpg' },
                { name: 'Blue', file: 'assets/blue.jpg' },
                { name: 'Gold', file: 'assets/gold.jpg' }
            ],
            selectedTheme: this.cardData?.theme || 'assets/orange.jpg'
        }
    },
    methods: {
        addItem() {
            if (this.items.length < 5) this.items.push('');
        },
        removeItem(index) {
            if (this.items.length > 3) this.items.splice(index, 1);
        },
        saveCard() {
            this.errors = [];
            if (!this.title) this.errors.push("Заголовок обязателен");
            if (this.items.slice(0,3).some(i => !i)) this.errors.push("Первые 3 пункта обязательны");

            if (this.errors.length === 0) {
                this.$emit('save', {
                    title: this.title,
                    items: this.items,
                    completedItems: this.cardData && this.cardData.completedItems ? this.cardData.completedItems : this.items.map(() => false),
                    completedAt: this.cardData && this.cardData.completedAt ? this.cardData.completedAt : null,
                    theme: this.selectedTheme,
                    id: this.cardData ? this.cardData.id : Date.now()
                });
            }
        }
    }
});
Vue.component('card', {
    props: ['card'],
    template: `
        <div class="card" :class="{ 'completed-card': card.completedAt }"
             :style="{ backgroundImage: 'url(' + card.theme + ')', backgroundSize: 'cover', backgroundPosition: 'center' }">
            <h4>{{ card.title }}</h4>

            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                <input type="checkbox" v-model="card.completedItems[index]" :disabled="card.completedAt" />
                {{ item }}
                </li>
            </ul>

            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }">
                {{ progress }}%
                </div>
            </div>

            <button @click="$emit('complete')" :disabled="card.completedAt">
                {{ card.completedAt ? 'Выполнено' : 'Выполнить' }}
            </button>

            <span v-if="card.completedAt" style="color: gray; margin-left: 10px;">
                {{ card.completedAt }}
            </span>
        </div>
    `,
    data() {
        return {
            completedItems: this.card.completedItems || this.card.items.map(() => false)
        }
    },
    computed: {
        progress() {
            const total = this.card.items.length;
            const completed = this.card.completedItems.filter(Boolean).length;
            return Math.round((completed / total) * 100);
        },
        isLocked() {
            return !!this.card.completedAt;
        }
    },
    mounted() {
        if (!this.card.completedItems) {
            this.$set(this.card, 'completedItems', this.completedItems);
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: { 1: [], 2: [], 3: [] },
        showForm: false,
        editingCard: null,
        editingColumn: null
    },
    mounted() {
        const saved = localStorage.getItem('boardData');
        if (saved) {
            this.columns = JSON.parse(saved);
        }
    },
    methods: {
        saveToStorage() {
            localStorage.setItem('boardData', JSON.stringify(this.columns));
        },
        addCard(column) {
            if (
                (column === 1 && this.columns[1].length >= 3) ||
                (column === 2 && this.columns[2].length >= 5)
            ) {
                alert("Вы превысили максимум");
                return;
            }
            this.editingCard = null;
            this.editingColumn = column;
            this.showForm = true;
        },
        editCard(column, index) {
            this.editingCard = this.columns[column][index];
            this.editingColumn = column;
            this.showForm = true;
        },
        saveCard(card) {
            if (this.editingCard) {
                const idx = this.columns[this.editingColumn]
                    .findIndex(c => c.id === card.id);

                this.$set(this.columns[this.editingColumn], idx, card);
            } else {
                this.columns[this.editingColumn].push(card);
            }
            this.showForm = false;
            this.editingCard = null;
            this.saveToStorage();
        },
        cancelForm() {
            this.showForm = false;
            this.editingCard = null;
        },
        markComplete(column, index) {
            const card = this.columns[column][index];
            const total = card.items.length;
            const completed = card.completedItems.filter(Boolean).length;
            const percent = Math.round((completed / total) * 100);
            if (percent === 100) {
                card.completedAt = new Date().toLocaleString();
                this.columns[3].push(card);
                this.columns[column].splice(index, 1);
                this.saveToStorage();
                return;
            }
            if (column === 1 && percent >= 50 && this.columns[2].length < 5) {
                this.columns[2].push(card);
                this.columns[1].splice(index, 1);
                this.saveToStorage();
                return;
            }

            this.saveToStorage();
        }

    }
});
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

          <p v-if="errors.length" class="errors">
            <b>Ошибки:</b>
            <ul>
              <li v-for="err in errors">{{ err }}</li>
            </ul>
          </p>

          <button @click="saveCard">Save</button>
          <button @click="$emit('cancel')">Cancel</button>
        </div>
      </div>
    `,
    data() {
        return {
            title: this.cardData ? this.cardData.title : '',
            items: this.cardData ? [...this.cardData.items] : ['', '', ''],
            errors: []
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
                    completed: this.cardData ? this.cardData.completed : false,
                    id: this.cardData ? this.cardData.id : Date.now()
                });
            }
        }
    }
});
Vue.component('card', {
  props: ['card'],
  template: `
    <div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, idx) in card.items" :key="idx">
          <input type="checkbox" v-model="item.done"> {{ item.text }}
        </li>
      </ul>
      <button class="complete-btn" @click="$emit('complete')">Выполнено</button>
    </div>
  `
})

new Vue({
  el: '#app',
  data: {
    columns: {
      1: [],
      2: [],
      3: []
    },
    nextId: 1,
    showForm: false,
    editingCard: null,
    editingColumn: null
  },
  methods: {
    addCard(column) {
      if ((column === 1 && this.columns[1].length >= 3) ||
          (column === 2 && this.columns[2].length >= 5)) {
        alert('Вы превысили максимум');
        return;
      }
      const newCard = {
        id: this.nextId++,
        title: 'New Card ' + this.nextId,
        items: [
          { text: 'Task 1', done: false },
          { text: 'Task 2', done: false },
          { text: 'Task 3', done: false }
        ]
      };
      this.columns[column].push(newCard);
    },
    markComplete(column, index) {
      const card = this.columns[column][index];
      alert(`Карточка "${card.title}" отмечена как выполненная`);
    }
  }
})
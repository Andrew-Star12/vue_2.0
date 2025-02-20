Vue.component('note-form', {
    template: `
    <div>
      <form @submit.prevent="submitNote">
        <div>
          <label for="title">Заголовок</label>
          <input type="text" id="title" v-model="title" required />
        </div>

        <div v-for="(point, index) in points" :key="index">
          <label :for="'point' + index">Пункт {{ index + 1 }}</label>
          <input type="text" v-model="points[index]" :id="'point' + index" required />
        </div>

        <button type="submit">Сохранить заметку</button>
      </form>

      <div v-show="isNoteSaved">
        <h3>Заметка сохранена!</h3>
        <p><strong>Заголовок:</strong> {{ title }}</p>
        <ul>
          <li v-for="(point, index) in points" :key="index">{{ point }}</li>
        </ul>
      </div>
    </div>
  `,
    data() {
        return {
            title: '',
            points: ['', '', ''],
            isNoteSaved: false
        };
    },
    methods: {
        submitNote() {
            const newNote = {
                title: this.title,
                points: this.points
            };

            // Отправляем новую заметку в родительский компонент
            this.$emit('add-note', newNote);

            // Очищаем поля после сохранения
            this.resetForm();
        },
        resetForm() {
            this.title = '';
            this.points = ['', '', ''];
            this.isNoteSaved = false;
        }
    }
});

// Компонент для отображения всех заметок
Vue.component('note-column', {
    props: {
        notes: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="note-column">
      <h2>Заметки</h2>
      <div v-if="notes.length === 0">
        <p>Нет заметок</p>
      </div>
      <div v-else>
        <div v-for="(note, index) in notes" :key="index" class="note-card">
          <h3>{{ note.title }}</h3>
          <ul>
            <li v-for="(point, idx) in note.points" :key="idx">{{ point }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
    data() {
        return {};
    }
});

// Инициализируем Vue-приложение
new Vue({
    el: '#app',
    data() {
        return {
            notes: [] // Храним заметки
        };
    },
    methods: {
        addNote(newNote) {
            // Добавляем новую заметку в массив
            this.notes.push(newNote);
        }
    }
});

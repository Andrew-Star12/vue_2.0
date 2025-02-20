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
          <input type="text" v-model="point.text" :id="'point' + index" required />
        </div>

        <button type="submit">Сохранить заметку</button>
      </form>
    </div>
  `,
    data() {
        return {
            title: '',
            points: [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ]
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

            // Сбрасываем форму в пустое состояние, но не скрываем ее
            this.resetForm();
        },
        resetForm() {
            this.title = '';
            this.points = [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ];
        }
    }
});




Vue.component('note-column', {
    props: {
        notes: {
            type: Array,
            required: true
        }
    },
    computed: {
        unfinishedNotes() {
            return this.notes.filter(note => this.getCompletionPercentage(note) < 50);
        },
        inProgressNotes() {
            return this.notes.filter(note => this.getCompletionPercentage(note) >= 50 && this.getCompletionPercentage(note) < 100);
        },
        completedNotes() {
            return this.notes.filter(note => this.getCompletionPercentage(note) === 100);
        }
    },
    methods: {
        getCompletionPercentage(note) {
            const completedPoints = note.points.filter(point => point.checked).length;
            const totalPoints = note.points.length;
            return (completedPoints / totalPoints) * 100;
        }
    },
    template: `
    <div class="note-column">
      <div class="column">
        <h2>Незавершенные</h2>
        <div v-if="unfinishedNotes.length === 0">
          <p>Нет незавершенных заметок</p>
        </div>
        <div v-else>
          <div v-for="(note, index) in unfinishedNotes" :key="index" class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
              <li v-for="(point, idx) in note.points" :key="idx">
                <input type="checkbox" v-model="point.checked" /> {{ point.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="column">
        <h2>Промежуточные</h2>
        <div v-if="inProgressNotes.length === 0">
          <p>Нет промежуточных заметок</p>
        </div>
        <div v-else>
          <div v-for="(note, index) in inProgressNotes" :key="index" class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
              <li v-for="(point, idx) in note.points" :key="idx">
                <input type="checkbox" v-model="point.checked" /> {{ point.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="column">
        <h2>Завершенные</h2>
        <div v-if="completedNotes.length === 0">
          <p>Нет завершенных заметок</p>
        </div>
        <div v-else>
          <div v-for="(note, index) in completedNotes" :key="index" class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
              <li v-for="(point, idx) in note.points" :key="idx">
                <input type="checkbox" v-model="point.checked" /> {{ point.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
});



new Vue({
    el: '#app',
    data() {
        return {
            notes: [] // Храним все заметки
        };
    },
    methods: {
        addNote(newNote) {
            // Добавляем новую заметку в массив
            this.notes.push(newNote);
        }
    }
});

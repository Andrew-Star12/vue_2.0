Vue.component('note-form', {
    template: `
    <div>
      <form @submit.prevent="submitNote">
        <div>
          <label for="title">Заголовок</label>
          <input type="text" id="title" v-model="title" required />
        </div>

        <!-- Начальные три пункта, которые нельзя удалить -->
        <div v-for="(point, index) in initialPoints" :key="'initial' + index">
          <label :for="'point' + index">Пункт {{ index + 1 }}</label>
          <input type="text" v-model="point.text" :id="'point' + index" required />
        </div>

        <!-- Дополнительные пункты, которые можно добавлять и удалять -->
        <div v-for="(point, index) in addedPoints" :key="'added' + index">
          <label :for="'addedPoint' + index">Пункт {{ index + 4 }}</label>
          <input type="text" v-model="point.text" :id="'addedPoint' + index" required />
          <!-- Кнопка для удаления добавленного пункта -->
          <button type="button" @click="removePoint(index)">Удалить</button>
        </div>

        <!-- Кнопка для добавления пункта (максимум 5 пунктов) -->
        <button type="button" @click="addPoint" :disabled="addedPoints.length >= 2">Добавить пункт</button>
        <button type="submit">Сохранить заметку</button>
      </form>
    </div>
  `,
    data() {
        return {
            title: '',
            initialPoints: [
                { text: '', checked: false }, // Пункт 1
                { text: '', checked: false }, // Пункт 2
                { text: '', checked: false }  // Пункт 3
            ],
            addedPoints: [] // Массив для добавленных пользователем пунктов
        };
    },
    methods: {
        addPoint() {
            // Если добавленных пунктов меньше 2, добавляем новый пункт
            if (this.addedPoints.length < 2) {
                this.addedPoints.push({ text: '', checked: false });
            }
        },
        removePoint(index) {
            // Удаляем добавленный пункт
            this.addedPoints.splice(index, 1);
        },
        submitNote() {
            const newNote = {
                title: this.title,
                points: [...this.initialPoints, ...this.addedPoints] // Объединяем начальные и добавленные пункты
            };

            // Отправляем новую заметку в родительский компонент
            this.$emit('add-note', newNote);

            // Сбрасываем форму в пустое состояние
            this.resetForm();
        },
        resetForm() {
            this.title = '';
            this.initialPoints = [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ]; // Сбрасываем начальные пункты
            this.addedPoints = []; // Сбрасываем только добавленные пункты
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
        },
        canAddNote() {
            // Ограничение на 3 незавершенные заметки
            return this.unfinishedNotes.length < 3;
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
                <input type="checkbox" v-model="point.checked" disabled /> {{ point.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div v-if="!canAddNote" class="alert">
        <p>Для добавления новой заметки нужно освободить место в разделе "Незавершенные".</p>
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
            // Проверяем, можно ли добавить заметку
            const unfinishedNotes = this.notes.filter(note => this.getCompletionPercentage(note) < 50);
            if (unfinishedNotes.length < 3) {
                this.notes.push(newNote);
            } else {
                alert("Невозможно добавить заметку. Освободите место в разделе 'Незавершенные'.");
            }
        },
        getCompletionPercentage(note) {
            const completedPoints = note.points.filter(point => point.checked).length;
            const totalPoints = note.points.length;
            return (completedPoints / totalPoints) * 100;
        }
    }
});

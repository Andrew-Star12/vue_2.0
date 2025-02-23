Vue.component('note-form', {
    data() {
        return {
            title: '',
            initialPoints: [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ],
            addedPoints: [] // Массив для добавленных пользователем пунктов
        };
    },
    computed: {
        canAddNote() {
            return this.$parent.notes.filter(note => note.status === 'inProgress').length < 5;
        }
    },
    methods: {
        addPoint() {
            if (this.addedPoints.length < 2) {
                this.addedPoints.push({ text: '', checked: false });
            }
        },
        removePoint(index) {
            this.addedPoints.splice(index, 1);
        },
        submitNote() {
            const newNote = {
                title: this.title,
                points: [...this.initialPoints, ...this.addedPoints],
                status: 'unfinished' // Статус по умолчанию для новых заметок
            };
            this.$emit('add-note', newNote); // Событие для добавления заметки
            this.resetForm();
        },
        resetForm() {
            this.title = '';
            this.initialPoints = [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ];
            this.addedPoints = [];
        }
    },
    template: `
    <div>
        <form @submit.prevent="submitNote">
            <div>
                <label for="title">Заголовок</label>
                <input type="text" id="title" v-model="title" required />
            </div>

            <div v-for="(point, index) in initialPoints" :key="'initial' + index">
                <label :for="'point' + index">Пункт {{ index + 1 }}</label>
                <input type="text" v-model="point.text" :id="'point' + index" required />
            </div>

            <div v-for="(point, index) in addedPoints" :key="'added' + index">
                <label :for="'addedPoint' + index">Пункт {{ index + 4 }}</label>
                <input type="text" v-model="point.text" :id="'addedPoint' + index" required />
                <button type="button" @click="removePoint(index)">Удалить</button>
            </div>

            <button type="button" @click="addPoint" :disabled="addedPoints.length >= 2">Добавить пункт</button>
            <button type="submit" :disabled="!canAddNote">Сохранить заметку</button>
        </form>
    </div>
    `
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
        canMoveToInProgress() {
            return this.inProgressNotes.length < 5;
        },
        isFirstColumnBlocked() {
            return this.inProgressNotes.length >= 5;
        }
    },
    methods: {
        getCompletionPercentage(note) {
            const completedPoints = note.points.filter(point => point.checked).length;
            const totalPoints = note.points.length;
            return (completedPoints / totalPoints) * 100;
        },
        moveToInProgress(note) {
            if (this.inProgressNotes.length >= 5) {
                alert('Невозможно переместить заметку. В разделе "Промежуточные" уже 5 заметок.');
                return;
            }
            note.status = 'inProgress';
            this.$emit('update-note-status', note);
        },
        moveToCompleted(note) {
            note.status = 'completed';
            note.completedAt = new Date().toLocaleString();  // Сохраняем текущую дату и время
            this.$emit('update-note-status', note);
            this.saveNotes(); // Сохраняем изменения в localStorage
        },
        addNote(newNote) {
            const unfinishedNotes = this.notes.filter(note => this.getCompletionPercentage(note) < 50);
            if (unfinishedNotes.length < 3) {
                this.notes.push(newNote);
                this.saveNotes();
            } else {
                alert("Невозможно добавить заметку. Освободите место в разделе 'Незавершенные'.");
            }
        },
        saveNotes() {
            localStorage.setItem('notes', JSON.stringify(this.notes)); // Сохраняем заметки в localStorage
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
                <note-card
                    v-for="(note, index) in unfinishedNotes"
                    :key="index"
                    :note="note"
                    :isFirstColumnBlocked="isFirstColumnBlocked"
                    @move-to-in-progress="moveToInProgress"
                />
            </div>
        </div>
        <div class="column">
            <h2>Промежуточные</h2>
            <div v-if="inProgressNotes.length === 0">
                <p>Нет промежуточных заметок</p>
            </div>
            <div v-else>
                <note-card
                    v-for="(note, index) in inProgressNotes"
                    :key="index"
                    :note="note"
                    :isFirstColumnBlocked="false"
                    @move-to-completed="moveToCompleted"
                />
            </div>
        </div>
        <div class="column">
            <h2>Завершенные</h2>
            <div v-if="completedNotes.length === 0">
                <p>Нет завершенных заметок</p>
            </div>
            <div v-else>
                <note-card
                    v-for="(note, index) in completedNotes"
                    :key="index"
                    :note="note"
                    :isFirstColumnBlocked="true"
                />
            </div>
            
        </div>
    </div>
    `
});


Vue.component('note-card', {
    props: {
        note: {
            type: Object,
            required: true
        },
        isFirstColumnBlocked: {
            type: Boolean,
            required: true
        }
    },
    computed: {
        completionPercentage() {
            const completedPoints = this.note.points.filter(point => point.checked).length;
            const totalPoints = this.note.points.length;
            return (completedPoints / totalPoints) * 100;
        }
    },
    watch: {
        // Следим за изменениями в checked пунктах
        'note.points': function () {
            // Если все чекбоксы отмечены, считаем, что заметка завершена
            if (this.completionPercentage === 100 && !this.note.completedAt) {
                this.markAsCompleted();
            }
        }
    },
    methods: {
        markAsCompleted() {
            // Устанавливаем дату завершения, если заметка ещё не была завершена
            this.note.completedAt = new Date().toLocaleString();
            this.$emit('update-note-status', this.note); // Обновляем статус заметки в родительском компоненте
            this.$emit('save-notes'); // Сохраняем изменения в localStorage
        }
    },
    template: `
    <div class="note-card">
        <h3>{{ note.title }}</h3>
        <ul>
            <li v-for="(point, idx) in note.points" :key="idx">
                <input
                    type="checkbox"
                    v-model="point.checked"
                    :disabled="isFirstColumnBlocked"
                />
                {{ point.text }}
            </li>
        </ul>

        <!-- Отображение даты завершения для завершенных заметок -->
        <p v-if="note.completedAt">Завершена: {{ note.completedAt }}</p>
    </div>
    `
});





new Vue({
    el: '#app',
    data() {
        const storedNotes = localStorage.getItem('notes');
        return {
            notes: storedNotes ? JSON.parse(storedNotes) : []  // Проверяем, есть ли данные в localStorage
        };
    },
    methods: {
        addNote(newNote) {
            const unfinishedNotes = this.notes.filter(note => this.getCompletionPercentage(note) < 50);
            if (unfinishedNotes.length < 3) {
                this.notes.push(newNote);
                this.saveNotes();
            } else {
                alert("Невозможно добавить заметку. Освободите место в разделе 'Незавершенные'.");
            }
        },
        updateNoteStatus(updatedNote) {
            const index = this.notes.findIndex(note => note === updatedNote);
            if (index !== -1) {
                this.notes[index] = updatedNote;  // Обновляем заметку в массиве
                this.saveNotes();
            }
        },
        saveNotes() {
            localStorage.setItem('notes', JSON.stringify(this.notes)); // Сохраняем заметки в localStorage
        },
        getCompletionPercentage(note) {
            const completedPoints = note.points.filter(point => point.checked).length;
            const totalPoints = note.points.length;
            return (completedPoints / totalPoints) * 100;
        }
    }
});
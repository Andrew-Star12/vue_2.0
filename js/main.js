Vue.component('note-form', {

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
            this.$emit('add-note', newNote);
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
            <button type="submit" :disabled="!canAddNote">Сохранить заметку</button>
        </form>
    </div>
    `,
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
            // Ограничение на 5 промежуточных заметок
            return this.inProgressNotes.length < 5;
        },
        isFirstColumnBlocked() {
            // Если во втором столбике (Промежуточные) уже 5 заметок, блокируем первый столбик
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
            note.status = 'inProgress'; // Устанавливаем статус заметки
            this.$emit('update-note-status', note); // Отправляем событие родителю, чтобы синхронизировать данные
        },
        moveToCompleted(note) {
            // Устанавливаем дату завершения при перемещении в завершенные
            note.status = 'completed';
            note.completedAt = new Date().toLocaleString(); // Добавляем дату завершения
            this.$emit('update-note-status', note); // Сохраняем изменения
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
                            <input type="checkbox" v-model="point.checked" :disabled="isFirstColumnBlocked" /> {{ point.text }}
                        </li>
                    </ul>
                    <button v-if="canMoveToInProgress && getCompletionPercentage(note) >= 50" @click="moveToInProgress(note)">Переместить в "Промежуточные"</button>
                    <div v-else-if="getCompletionPercentage(note) >= 50">
                        <p>Невозможно переместить, в разделе "Промежуточные" уже 5 заметок.</p>
                    </div>
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
                    <button v-if="getCompletionPercentage(note) === 100" @click="moveToCompleted(note)">Переместить в завершенные</button>
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
                    <p v-if="note.completedAt">Завершена: {{ note.completedAt }}</p>
                </div>
            </div>
        </div>
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

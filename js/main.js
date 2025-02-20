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
            // Сохраняем заметку (пока просто выводим в консоль)
            console.log('Заметка сохранена:', {
                title: this.title,
                points: this.points
            });

            // Отображаем сообщение о сохранении
            this.isNoteSaved = true;

            // Сбрасываем форму в пустое состояние, но не скрываем ее
            this.resetForm();
        },
        resetForm() {
            // После отправки очищаем поля формы
            this.title = '';
            this.points = ['', '', ''];
            // После сброса можно скрыть сообщение, если нужно, например, через таймер
            setTimeout(() => {
                this.isNoteSaved = false; // скрываем сообщение через некоторое время
            }, 3000);
        }
    }
});



// Инициализируем Vue-приложение
new Vue({
    el: '#app'
});

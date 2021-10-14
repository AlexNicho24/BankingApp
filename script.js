'use strict';

///////////////////////////////////
// Modal Windows
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.schedule__modal');
// const EditModal = document.querySelector('.schedule__modal--edit');
const btnCloseModal = document.querySelectorAll('.schedule__modal--close');
const submitBtn = document.querySelector('.btn');
const eventModal = document.querySelector('.schedule__modal--edit');
const eventHeader = document.querySelector('#eventHeader');
const eventDescription = document.querySelector('#eventDescription');

/////////////////////////////////
// Calendar App
let monthNumID = 0;
let date = null;
const calendar = document.getElementById('calendar__app');
const prevButton = document.querySelector('.prev__button');
const nextButton = document.querySelector('.next__button');
const todayButton = document.querySelector('.button4');
const monthSelector = document.getElementById('month');
const inputTitle = document.querySelector('.inputTitle');
const inputDescription = document.querySelector('.inputDescription');
const taskbar = document.querySelector('.calendar__taskbar');
const schedulesTaskbar = document.querySelector('.schedules');

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

class App {
  #schedules = [];

  constructor() {
    // Gets Data from local Storage
    this._getLocalStorage();
    // Creates Calender
    this._createCalender();

    submitBtn.addEventListener('click', this._createSchedule.bind(this));
    prevButton.addEventListener('click', this._prevMonth.bind(this));
    nextButton.addEventListener('click', this._nextMonth.bind(this));
    todayButton.addEventListener('click', this._thisMonth.bind(this));
    taskbar.addEventListener('click', this._clickEvents.bind(this));
    btnCloseModal.forEach((el) =>
      el.addEventListener('click', this._closeModal)
    );
    overlay.addEventListener('click', this._closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this._closeModal();
      }
    });
  }

  _createCalender() {
    const dt = new Date();

    if (monthNumID != 0) dt.setMonth(new Date().getMonth() + monthNumID);

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById(
      'monthDisplay'
    ).innerText = `${dt.toLocaleDateString('en-us', {
      month: 'long',
    })} ${year}`;

    calendar.innerHTML = '';

    for (let index = 0; index < weekdays.length; index++) {
      let element = weekdays[index];
      let html = `
          <div class="calendar__weekdays">
            <span>
              ${element}
            </span>
          </div>
        `;
      calendar.innerHTML += html;
    }

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
      const daySquare = document.createElement('div');
      daySquare.classList.add('day');

      //Try to find the day of the week and make it equal to the event day
      const currentDay = `${year}/${month + 1}/${i - paddingDays}`;

      if (i > paddingDays) {
        daySquare.innerText = i - paddingDays;

        if (i - paddingDays === day && monthNumID === 0) {
          daySquare.id = 'currentDay';
        }

        const scheduleForDay = this.#schedules.find(
          (e) => e.date === currentDay
        );

        if (scheduleForDay) {
          let html = `
            <div class="scheduled__event" data-id=${scheduleForDay.id}>
              <div class="schedule__title">
                <p>${scheduleForDay.title}</p>
              </div>
            </div>
          `;
          daySquare.innerHTML += html;
        }

        // Clicking on the day opens the event modal and passes the inside the modal
        daySquare.addEventListener(
          'click',
          this._showmodal.bind(this, currentDay)
        );
      } else daySquare.classList.add('padding');

      calendar.appendChild(daySquare);
    }
  }

  // Creates an event once submit button is pressed
  _createSchedule(e, scheduledDay) {
    e.preventDefault();
    const id = Math.random().toString(16).slice(2);
    const title = inputTitle.value;
    const description = inputDescription.value;
    let schedule;

    if (!title) return alert('please write a title');
    schedule = {
      id,
      date,
      title,
      description,
    };

    this.#schedules.push(schedule);
    this._setLocalStorage();
    this._renderTask(schedule);
    this._closeModal();
    this._createCalender();
  }

  _renderTask(eventTask) {
    let html = `
    <li class = "schedule__container" data-id=${eventTask.id}>
      <div class = "schedule">
        <span>Title: ${eventTask.title}</span>
        <div class="schedule__btnControls">
          <button class= "schedule__Btn" data-type="delete">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class= "schedule__Btn" data-type="Goto">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
    schedulesTaskbar.innerHTML += html;
  }

  // Moves calendar to previous month
  _prevMonth() {
    monthNumID--;
    this._createCalender();
  }

  // Moves calendar to next month
  _nextMonth() {
    monthNumID++;
    this._createCalender();
  }

  _thisMonth() {
    monthNumID = 0;
    this._createCalender();
  }

  _clickEvents(e) {
    const buttonEl = e.target.closest('.schedule__btnControls button');
    const scheduleEl = e.target.closest('.schedule__container');

    if (!buttonEl || !scheduleEl) return;

    const event = this.#schedules.find(
      (schedule) => schedule.id === scheduleEl.dataset.id
    );

    if (buttonEl.dataset.type === 'delete') {
      this._delEvent(event);
    } else if (buttonEl.dataset.type === 'Goto') {
      this._goToEvent(event);
    } else {
    }
  }

  // Shows modal for submiting events and adds clicked day date to date
  _showmodal(clickDate) {
    date = clickDate;
    overlay.classList.remove('hidden');

    const currentEvent = this.#schedules.find((e) => e.date === clickDate);
    if (currentEvent) {
      eventModal.classList.remove('hidden');
      eventHeader.innerText = `Title:\n ${currentEvent.title}`;
      eventDescription.innerText = `Description: ${currentEvent.description}`;
      //del addeventlistern
    } else {
      modal.classList.remove('hidden');
    }
  }

  // Clicking on the close button, overlay or pressing escape closes modal
  _closeModal() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    eventModal.classList.add('hidden');
    inputTitle.value = '';
    inputDescription.value = '';
  }

  _editEvent() {}

  _delEvent(currentEvent) {
    let task = document.querySelector(
      `.schedule__container[data-id='${currentEvent.id}']`
    );

    const taskId = this.#schedules.find(
      (schedule) => schedule.id === task.dataset.id
    );
    const taskIndex = this.#schedules.indexOf(taskId);

    this.#schedules.splice(taskIndex, 1);
    this._setLocalStorage();
    this._createCalender();
    task.remove();
  }

  //maybe while loop find the month name if equals month assign increment monthnum by 1
  _goToEvent(currentEvent) {
    let eventDate = currentEvent.date.split('/');
    eventDate = new Date(Date.UTC(eventDate[0], eventDate[1]));
    eventDate = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
      eventDate
    );
    console.log(eventDate);
    let dt = new Date();
    let stringMonth;
    // dt.setMonth(new Date().getMonth() + monthNumID);
    dt.setFullYear(new Date().getMonth() + monthNumID);
    console.log(dt);
    // do {
    //   monthNumID++;

    //   stringMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    //     dt
    //   );
    // } while (stringMonth != eventDate);

    // this._createCalender();
    // monthNumID = 0;
  }

  // adds object to local storage
  _setLocalStorage() {
    localStorage.setItem('schedules', JSON.stringify(this.#schedules));
  }

  // gathers data from local storage
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('schedules'));

    if (!data) return;

    this.#schedules = data;

    this.#schedules.forEach((schedule) => this._renderTask(schedule));
  }
}

const app = new App();

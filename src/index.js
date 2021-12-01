class SocialNetworkQueries {
  constructor({ fetchObservedEvents, timeProvider }) {
    this.fetchObservedEvents = fetchObservedEvents;
    this.timeProvider = timeProvider;
  }

  findUpcomingEvents({ futureDays }) {
    const DAY_MS = 86400000;
    const futureDaysMs = DAY_MS * futureDays;
    const nowAsMillisFromEpoch = this.getTimeMS(this.timeProvider.nowAsMillisFromEpoch());
    const tomorrowMS = nowAsMillisFromEpoch.NoTime + DAY_MS;
    const daysEvents = nowAsMillisFromEpoch.NoTime + futureDaysMs;

    return new Promise((resolve, reject) => {
      this.fetchObservedEvents().then((events) => {
        let results = events
          .map((event) => {
            return {
              ...event,
              startDateTimeMS: this.getTimeMS(event.startDateTime).withTime,
            };
          })
          .sort(this.orderEvents('startDateTimeMS'))
          .map((event) => {
            let startDateTimeMS = this.getTimeMS(event.startDateTime);

            if (
              startDateTimeMS.NoTime >= nowAsMillisFromEpoch.NoTime &&
              startDateTimeMS.NoTime < tomorrowMS &&
              startDateTimeMS.withTime >= nowAsMillisFromEpoch.withTime
            ) {
              return {
                what: event.label,
                when: 'today',
              };
            }
            if (startDateTimeMS.NoTime >= tomorrowMS && startDateTimeMS.NoTime < tomorrowMS + DAY_MS) {
              return {
                what: event.label,
                when: 'tomorrow',
              };
            }
            if (startDateTimeMS.NoTime > tomorrowMS + DAY_MS && startDateTimeMS.NoTime <= daysEvents) {
              return {
                what: event.label,
                when: this.formatDate(startDateTimeMS.NoTime),
              };
            }
            return {
              what: event.label,
              when: 0,
            };
          })
          .filter(({ when }) => when != 0)
          .sort(this.orderEvents('what'));

        return resolve(results);
      });
    });
  }

  getTimeMS(date) {
    return {
      withTime: new Date(date).getTime(),
      NoTime: new Date(`${this.formatDate(date, true)}Z`).getTime(),
    };
  }

  formatDate(date, isEqual = false) {
    let dt = new Date(date),
      day = '' + dt.getUTCDate(),
      month = '' + (dt.getUTCMonth() + 1),
      year = dt.getUTCFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return isEqual ? [month, day, year].join('.') : [day, month, year].join('.');
  }

  orderEvents(property) {
    return (a, b) => {
      if (property == 'startDateTimeMS') return a[property] - b[property];
      if (property == 'what' && a.when != b.when) return 0;

      let x = a[property].toLowerCase();
      let y = b[property].toLowerCase();

      if (x < y) return -1;
      if (x > y) return 1;

      return 0;
    };
  }
}

export { SocialNetworkQueries };

class SocialNetworkQueries {

    constructor({fetchObservedEvents, timeProvider}) {
        this.fetchObservedEvents = fetchObservedEvents;
        this.timeProvider = timeProvider;
    }

    findUpcomingEvents({futureDays}) {
        return Promise.resolve({});
    }

}

export { SocialNetworkQueries };

import { SocialNetworkQueries } from "../src/index";

const resolved = (value) => Promise.resolve(value);

const aLotOfDaysInAFuture = 100000; // around 300 years

const anyUpcomingIsoDateTime = "2019-01-01T01:01Z";
const anyDateTimeFromDistantPastAsMillisFromEpoch = 0;
const _2019_01_01T22_00_00_000Z_asMillisFromEpoch = 1546380000000;

describe("SocialNetworkQueries", () => {

    let fetchObservedEventsStub;
    let timeProviderStub;
    let queries;

    let stubbedUserPromise;
    let stubbedMillisFromEpoch;

    beforeEach(() => {
        fetchObservedEventsStub = () => stubbedUserPromise;
        fetchObservedEventsStub.willReturn = (userPromise) => {
            stubbedUserPromise = userPromise;
        };

        timeProviderStub = {
            willReturnMillisFromEpoch: (millisFromEpoch) => {
                stubbedMillisFromEpoch = millisFromEpoch;
            },
            nowAsMillisFromEpoch: () => stubbedMillisFromEpoch,
        };
        timeProviderStub.willReturnMillisFromEpoch(anyDateTimeFromDistantPastAsMillisFromEpoch);

        queries = new SocialNetworkQueries({
            fetchObservedEvents: fetchObservedEventsStub,
            timeProvider: timeProviderStub,
        });
    });

    describe("upcoming events", () => {

        it("should provide proper structure of listed upcoming event", async () => {
            // given
            const observedEvents = [
                {
                    label: "any label 1",
                    startDateTime: anyUpcomingIsoDateTime,
                },
                {
                    label: "any label 2",
                    startDateTime: anyUpcomingIsoDateTime,
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));

            // when
            const upcomingEvents = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(upcomingEvents).toEqual([
                {
                    what: jasmine.any(String),
                    when: jasmine.any(String),
                },
                {
                    what: jasmine.any(String),
                    when: jasmine.any(String),
                },
            ]);
        });

        it("should present event label as 'what' field", async () => {
            // given
            const observedEvents = [
                {
                    label: "label of event 1",
                    startDateTime: anyUpcomingIsoDateTime,
                },
                {
                    label: "label of event 2",
                    startDateTime: anyUpcomingIsoDateTime,
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));

            // when
            const upcomingEvents = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(upcomingEvents).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    what: "label of event 1",
                }),
                jasmine.objectContaining({
                    what: "label of event 2",
                }),
            ]));
        });

        it("should present event startDateTime as 'when' field, properly formatted", async () => {
            // given
            const observedEvents = [
                {
                    label: "event 1",
                    startDateTime: "2019-01-01T00:00Z",
                },
                {
                    label: "event 2",
                    startDateTime: "2019-12-31T23:59Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));

            // when
            const upcomingEvents = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(upcomingEvents).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    when: "01.01.2019",
                }),
                jasmine.objectContaining({
                    when: "31.12.2019",
                }),
            ]));
        });

        it("should order events by their startDateTime from nearest to most distant one", async () => {
            // given
            const observedEvents = [
                {
                    label: "any label",
                    startDateTime: "2022-02-01T00:00Z",
                },
                {
                    label: "any label",
                    startDateTime: "2022-01-02T00:00Z",
                },
                {
                    label: "any label",
                    startDateTime: "2021-01-02T00:00Z",
                },
                {
                    label: "any label",
                    startDateTime: "2022-01-01T00:00Z",
                },
                {
                    label: "any label",
                    startDateTime: "2021-02-01T00:00Z",
                },
                {
                    label: "any label",
                    startDateTime: "2021-01-01T00:00Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));

            // when
            const upcomingEvents = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(upcomingEvents).toEqual([
                jasmine.objectContaining({
                    when: "01.01.2021",
                }),
                jasmine.objectContaining({
                    when: "02.01.2021",
                }),
                jasmine.objectContaining({
                    when: "01.02.2021",
                }),
                jasmine.objectContaining({
                    when: "01.01.2022",
                }),
                jasmine.objectContaining({
                    when: "02.01.2022",
                }),
                jasmine.objectContaining({
                    when: "01.02.2022",
                }),
            ]);
        });

        it("include only events starting now or in a future", async () => {
            // given
            const observedEvents = [
                {
                    label: "event from past",
                    startDateTime: "2019-01-01T21:59Z",
                },
                {
                    label: "event starting right now",
                    startDateTime: "2019-01-01T22:00Z",
                },
                {
                    label: "event from future",
                    startDateTime: "2019-01-01T22:01Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));
            timeProviderStub.willReturnMillisFromEpoch(_2019_01_01T22_00_00_000Z_asMillisFromEpoch);

            // when
            const upcomingEvents = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(upcomingEvents).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    what: "event starting right now",
                }),
                jasmine.objectContaining({
                    what: "event from future",
                }),
            ]));
        });

        it("include only events starting in given number of days", async () => {
            // given
            const observedEvents = [
                {
                    label: "event today",
                    startDateTime: "2019-01-01T23:00Z",
                },
                {
                    label: "event tomorrow",
                    startDateTime: "2019-01-02T23:00Z",
                },
                {
                    label: "event 2 days from now",
                    startDateTime: "2019-01-03T23:00Z",
                },
                {
                    label: "event 3 days from now",
                    startDateTime: "2019-01-04T23:00Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));
            timeProviderStub.willReturnMillisFromEpoch(_2019_01_01T22_00_00_000Z_asMillisFromEpoch);

            // when
            const eventsFor2Days = await queries.findUpcomingEvents({futureDays: 1});

            // then
            expect(eventsFor2Days).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    what: "event today",
                }),
                jasmine.objectContaining({
                    what: "event tomorrow",
                }),
            ]));
        });

        it("use human-friendly date for today", async () => {
            // given
            const observedEvents = [
                {
                    label: "event",
                    startDateTime: "2019-01-01T23:00Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));
            timeProviderStub.willReturnMillisFromEpoch(_2019_01_01T22_00_00_000Z_asMillisFromEpoch);

            // when
            const eventsForToday = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(eventsForToday).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    when: "today",
                }),
            ]));
        });

        it("use human-friendly date for tomorrow", async () => {
            // given
            const observedEvents = [
                {
                    label: "event",
                    startDateTime: "2019-01-02T23:00Z",
                },
            ];
            fetchObservedEventsStub.willReturn(resolved(observedEvents));
            timeProviderStub.willReturnMillisFromEpoch(_2019_01_01T22_00_00_000Z_asMillisFromEpoch);

            // when
            const eventsForToday = await queries.findUpcomingEvents({futureDays: aLotOfDaysInAFuture});

            // then
            expect(eventsForToday).toEqual(jasmine.arrayWithExactContents([
                jasmine.objectContaining({
                    when: "tomorrow",
                }),
            ]));
        });

    });

});

const findIn = (upcomingEvent, what) => {
    const foundEvent = upcomingEvent.find(event => event.what === what);
    expect(foundEvent).toBeDefined();
    return foundEvent;
};

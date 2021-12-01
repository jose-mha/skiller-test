import { SocialNetworkQueries } from "../src/index";

describe('SocialNetworkQueries', () => {
  describe("example from README", () => {

    it("should list upcoming events", async () => {
      // given
      const observedEvents = [
        {
          label: "Good bye, 2018, nothing to miss…",
          startDateTime: "2018-12-31T12:00Z",
        },
        {
          label: "New Year celebration in Windsor Castle",
          startDateTime: "2018-12-31T21:00Z",
        },
        {
          label: "Rockets Club reunion",
          startDateTime: "2019-01-31T23:59Z",
        },
        {
          label: "Grapes & Happiness – debut concert",
          startDateTime: "2019-01-03T18:00Z",
        },
        {
          label: "I will clean my windows in 2019 even if it's February yet",
          startDateTime: "2019-02-01T00:00Z",
        },
        {
          label: "\"How to be a better parent?\" webinar (for group members only)",
          startDateTime: "2019-01-01T14:15Z",
        },
        {
          label: "New Year celebration in Rabati Castle",
          startDateTime: "2018-12-31T21:00Z",
        },
      ];
      const timeProviderStub = {
        // 2018-31-12T20:00:00.000Z = 1546286400000 millis from epoch (1970-01-01T00:00:00.000Z)
        nowAsMillisFromEpoch: () => 1546286400000,
      };

      // when
      const upcomingEvents = await new SocialNetworkQueries({
        fetchObservedEvents: () => Promise.resolve(observedEvents),
        timeProvider: timeProviderStub
      }).findUpcomingEvents({ futureDays: 31 });

      // then
      expect(upcomingEvents).toEqual([
        {
          what: "New Year celebration in Rabati Castle",
          when: "today",
        },
        {
          what: "New Year celebration in Windsor Castle",
          when: "today",
        },
        {
          what: "\"How to be a better parent?\" webinar (for group members only)",
          when: "tomorrow",
        },
        {
          what: "Grapes & Happiness – debut concert",
          when: "03.01.2019",
        },
        {
          what: "Rockets Club reunion",
          when: "31.01.2019",
        },
      ]);
    });

  });
});

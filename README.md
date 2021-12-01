# Introduction

Your task is to implement the function `SocialNetworkQueries#findUpcomingEvents({ futureDays })`
per the requirements listed below, and make sure all tests pass.

`SocialNetworkQueries#fetchObservedEvents` function will return a `Promise` containing events data that should be queried as described below.

To complete the task, implement `SocialNetworkQueries#findUpcomingEvents`, follow the rules that should be applied when using `futureDays` as a limit to fetched event dates and add appropriate ordering to the result data.

To understand better the format of data that will be received as input and that should be given as an output, you can refer to an example that is given at the end.

# Setup

Follow these steps if you are using zip/git mode (i.e. not available inside Devskiller in-browser IDE):

1. `npm install` – install dependencies
2. `npm test` – run all tests once (this will be used to evaluate your solutions)
3. `npm run test:watch` - run all tests in _watch mode_ (optionally, you can use it locally if you prefer)

# Task requirements

There is a `SocialNetworkQueries` class with `{ fetchObservedEvents, timeProvider }` as constructor parameters.

For a given list of events observed by a user and a current timestamp, `socialNetworkQueries.findUpcomingEvents({ futureDays })` should return a `Promise` which resolves with an array containing upcoming events only.
 
## `fetchObservedEvents`

* `fetchObservedEvents` is a function returning a `Promise` which resolves with a list of events observed by a user in the following format:

    ```json
    [
        {
            label: <string>,
            startDateTime: <string>,
        },
    ]
    ```
    example:
    ```json
    {
        label: "label of event 1",
        startDateTime: "2019-01-01T01:01Z",
    }
    ```

   * `label` is a non-empty string, containing the name of an event

   * `startDateTime` is a string with UTC time (0 time zone offset) in the following format `YYYY-MM-DDTHH:MMZ`, e.g. `2018-12-31T23:59Z`

## `timeProvider`

* `timeProvider` is an object with a function named `nowAsMillisFromEpoch`

   * `timeProvider.nowAsMillisFromEpoch()` returns a number which is an epoch time based timestamp of the **current time** expressed in milliseconds. For example, given the following date `2018-31-12T20:00:00.000Z`, the returned timestamp would be `1546286400000`.

## `futureDays`

* `futureDays` is a non-negative integer number for the range of days that upcoming events should be within from the current time that is provided.
  Example:
   * If an observed event happens later today, it should be included in the list of upcoming events for `futureDays` >= 0
   
   * If an observed event happens tomorrow, it should be included in the list of upcoming events for `futureDays` >= 1, but should be excluded for `futureDays` = 0
   
   * and so on…
   
* To decide whether the given observed event qualifies as upcoming, please use the UTC timestamp of the event start or end date.

## result

* The structure of the array held by resolved promises should be:
 
   ```json
   [
       {
           what: <string>,
           when: <string>,
       },
   ]
   ```
   
   * `what` is an exact copy of data in the `label` field - an event name
   
   * `when` is a `YYYY.MM.DD` representation of the value for `startDateTime`, but:
   
      * If `startDateTime` happens the same day as the current timestamp, please put `today` into the `what` field.
      
      * If `startDateTime` falls on the next day relative to the current timestamp, please put `tomorrow` into the `what` field.
      
      * Please remember to operate in UTC (0 time zone offset)!
 
# An event is considered to be upcoming if it starts at (`startDateTime`) or later than the current timestamp, and before a boundary indicated by `futureDays` (as described above in this README). 

* If no observed event qualifies as upcoming, the resulting array should be empty.

### Sorting

* Events should be sorted using the `startDateTime` field with events happening sooner placing first (with a lower array index).


* In a situation where `startDateTime` values are equal, the events should be ordered alphabetically based on their `label` value. **Important:** to make sure your implementation matches the one expected in the tests, please use `label1.localeCompare(label2, "en", { sensitivity: "base" })` to compare the labels of 2 books.

## Valid data

There are no paths other than happy ones :-)

In other words, you can assume the best case scenario where all input data is valid and promises are not rejected. No validation on input data needs to be performed for this task.

# An example

Let's assume that observed events for `fetchObservedEvents` are:

```json
[
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
]
``` 

… and current the timestamp returned by `timeProvider.nowAsMillisFromEpoch()` is `1546286400000` which is equivalent to `2018-31-12T20:00:00.000Z` in ISO date-time …
 
… then if we perform a query with `futureDays: 31` …

```js
const queries = new SocialNetworkQueries({
    fetchObservedEvents,
    timeProvider,
});
queries.findUpcomingEvents({ futureDays: 31 })
    .then(upcomingEvents => {
        // …
    });
```

… the resolved promise for `upcomingEvents` will be

```json
[
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
]
```

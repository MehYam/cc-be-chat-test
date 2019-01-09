# Notes

Run the app and navigate a web browser to http://localhost:3000.  The web UI should be self-explanatory.  The client demonstrates sign-in, chatting, shows a list of online users, and renders slash-command results in italics. It responds to disconnects by snapping back to the sign-in UI.

## System Design

This app employs a monolithic design where most of the heavy lifting is provided by the ChatManager class.  It creates the websocket server, listens for connections, and creates Client instances to store per-user data and stats.  It routes the messages, using helper classes for scrubbing profanity (profanityFilter.js), and the History class for the chat log and stats (i.e. for /popular).

## Performance and Scaling

Actual profiling and manual testing are the best ways to get answers about performance bottlenecks (this always reveals surprises, either in perf problems you didn't anticipate, or perf problems you expected but never materialized), but it's possible to guess a few things beforehand about how things should scale.

Performance can be separated into two broad focus areas: 1) efficiency of design, where we consider the dependencies and bottlenecks of individual components, and how they affect the performance of the system as a whole, and, 2) efficiency in the small, where we focus on spot issues like the memory footprint of History, websocket connections and messaging load, regex costs, etc.

Firstly, design:  when trying to scale up ChatManager to its limit, some component will be the first to break.  For example, there may be a ceiling on concurrent websocket connections, or how much bandwidth can be handled at peak usage.  In this case, the architecture must accomodate parallelizing *around* the bottleneck, allowing it to be scaled independently of the rest.  This requires separating the concerns of the app into a more distributed architecture of services, where connection services are managed separately from message routing and data management services.  Each of the roles of the app - networking, messaging, user sessions, history/data, profanity scrubbing - could all be a part of their own farm of services that scales individually of the others.

Secondly, performance in the small:  profiling is the key to identifying bottlenecks here, but there are a few intuitive perf problems to think about.  History currently leaks memory, as it logs everything and never purges, but it's a simple fix to limit its length to something reasonable and purge either as new messages come in, or on some kind of timer.  It may actually be more performant to purge less often, as the gc incurs extra overhead in pruning regularly as arrays need to be realloc'ed.  

The profanity filter uses a giant regex.  Hard to say how this performs under load (it may be not a problem at all), but one simple solution is to do all the filtering in the client.  If it had to be done on the server, it's 100% certain that there's a way to do it more efficiently, right down to writing a native plugin that's tuned to do it quickly and efficiently.  My guess is that there are mature libraries that already do this.

There are a few other places where we allocate temporary strings and arrays (.split(), etc), but each of these could be profiled and refined individually as needed.



## Unit Tests

Unfortunately, I saved this to the end since I haven't yet set up a unit test framework in Node.  In true TDD, the tests would have been written from the start, but I wasn't confident that I'd have the time to do it all.  The History class is an easy first place to start retroactively adding tests.  End-to-end tests would be fairly easy to add as well, as writing an automated client that connects over a local websocket is not that hard (especially had I written a cli client instead of the web front-end).  Having tests - especially the end-to-end tester - in place would certainly have made development faster and easier, but I wasn't confident I had the time to do it all.

## Packages

The only packages added were ws for websockets and fs for reading the profanity list and test web page

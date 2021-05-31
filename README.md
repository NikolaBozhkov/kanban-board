# Kanban Board

## Running the project
I recommend running it using `npm run dev` and going to `localhost:5000`

You can run it as a production build using `npm run build:client` -> `npm run build:server` -> `npm start`.
But I didn't have time to properly test it at the end, so the asset size is a bit big, which causes load lag and there seems to be a problem with some of the colors being washed out.

## Remarks
My approach was to focus on scalability and general solutions, which combined with my 0 experience with modern React ended up eating most of my time. 

This led to quite the crunch of requirements at the end and a very unoptimized handling of actions that involve moving stuff around. In particular, mapping and sending the populated lists of a board with almost every request.
This shouldn't really have a large impact since a board won't have that many lists or cards but still it's a dumb solution.

Obviously there are many more things that can be improved. Spending the majority of time trying to understand how to properly do things in React and how to make it scalable prevented me from implementing a lot of features that I had planned.

I can't say the project is very scalable now or that I have a great understanding of React but it definitely feels better than just mashing functionality without understanding basic concepts.
In particular, some stuff can be extracted in their own components, functionality polished, state can be managed better and CSS modules can be introduced (The CSS is not tragic, but can be greatly improved).

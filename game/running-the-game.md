# Running The Game

This document intends to describe how an online Blood on the Clocktower game is made running.
This document is intended for developers rather than users and can be a good starting point for learning the existing codebase.

To make it easier to cross reference online / in-player play, the in-player game-running steps taken from [Blood on the Clocktower Rulebook](https://rpubs.com/whiteeli/931038) will be provided.

## Steps

### Setup

> 1. Gather your players. Get one chair per player and arrange the chairs facing each other. A rough circle or square is fine, as long as people are sitting in a definite clockwise or counterclockwise order. As the Storyteller, you will need to be able to enter and exit the circle often, so a leave a gap between two chairs. The center of this space will need to be mostly empty—no tables or hazards on the floor which can be tripped on.

Setup the `TownSquare`.

> 2. Prepare the Grimoire. Clip and stand the Grimoire by fastening the two metal clips as close as possible to the upper and lower corners, creating a sturdy book-like container from the game box. Unfold and assemble the black Grimoire stand and place the Grimoire upon it, putting it where players that walk around will not accidentally see its contents. Collect supplies of all the info, night, and shroud tokens anywhere you like in the Grimoire. (We recommend the bottom-left corner of the right side.)

Setup the `Grimoire`.

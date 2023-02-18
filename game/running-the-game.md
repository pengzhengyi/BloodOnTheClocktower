# Running The Game

This document intends to describe how an online Blood on the Clocktower game is made running.
This document is intended for developers rather than users and can be a good starting point for learning the existing codebase.

To make it easier to cross reference online / in-player play, the in-player game-running steps taken from [Blood on the Clocktower Rulebook](https://rpubs.com/whiteeli/931038) will be provided.

## Steps

### Setup

> 1. Gather your players. Get one chair per player and arrange the chairs facing each other. A rough circle or square is fine, as long as people are sitting in a definite clockwise or counterclockwise order. As the Storyteller, you will need to be able to enter and exit the circle often, so a leave a gap between two chairs. The center of this space will need to be mostly empty—no tables or hazards on the floor which can be tripped on.

`SetupSheet` sets up the `ITownSquare`.

> 2. Prepare the Grimoire. Clip and stand the Grimoire by fastening the two metal clips as close as possible to the upper and lower corners, creating a sturdy book-like container from the game box. Unfold and assemble the black Grimoire stand and place the Grimoire upon it, putting it where players that walk around will not accidentally see its contents. Collect supplies of all the info, night, and shroud tokens anywhere you like in the Grimoire. (We recommend the bottom-left corner of the right side.)

`SetupSheet` sets up the `IStoryTeller`.

> 3. Choose an edition. This box set comes with three editions: Trouble Brewing, Bad Moon Rising, and Sects & Violets. Choose one to play with. Uncover and add its edition box to the bottom-left part of the Grimoire. (This will let you easily access the character and reminder tokens you need for this game.) You’ll need 5 players or more for Trouble Brewing, and you’ll need 7 players or more for all other editions.

`SetupSheet` sets up the `Edition`.

> 4. Prepare the Town Square. Place the Town Square board on the floor in the center of the chairs. Add life tokens equal to the number of players to the Town Square. Put a pile of vote tokens in the center of the Town Square. Place the Traveler sheet partially under the Town Square, so it shows the number of Townsfolk, Outsiders and Minions.

> 5. Read the rules to any new players. The rules sheet describes all the major things that a new player will need to know to start playing. Simply read out the text written on this sheet to the group, or let those who want to read it privately do so.

> 6. Secretly choose characters. Take all of the Townsfolk character tokens out of the chosen edition box, and choose the appropriate number for the number of players, as listed on the setup sheet. Put these character tokens in the left side of the Grimoire, and return all remaining Townsfolk character tokens to the edition box. Then, do the same for any Outsiders, Minions, and the Demon. Do this secretly— the players do not know which characters are in the game. If there are more than 15 players in this game, then any excess players must volunteer to be Travelers. Travelers have enormous power but less responsibility, and they often help the game go quicker. Give these volunteers the Traveler sheet, so that they can choose which Travelers they wish to be. You’ll find more information about them in “Traveler Characters”. For your first game, we do not recommend that you include Travelers.

`SetupSheet` sets up the number of players for each character type through `recommendCharacterTypeComposition`.
`SetupSheet` asks storyteller to choose initial characters from `setupInPlayCharacters`.

> 7. Add and remove characters. If any chosen character tokens show an orange leaf, you will need to add or remove some character tokens, as described by its almanac entry. On the character token, the text in square brackets like [this] briefly describes how to alter the characters in play this game. This happens once, during the setup phase, and does not happen again once the game is underway. After adding and removing character tokens, the number of character tokens will always equal the number of players.

# Gameplay Components

This folder contains the components that constitutes to the gameplay of the game.

In other words, these components are essential to the actual running of the game rather than
logistics.

## Design Principle

To reduce the coupling between the myriad of components, the components are interacted
with [mediator pattern](https://refactoring.guru/design-patterns/mediator).
Therefore, instead of components interacting with each other directly, they will
communicate any such interactions through the mediator.

## When to have a new component

A new component should be created when it will interact with more than one component
or it does not fit into any of the existing components.

For example, seating should be a component because it interacts with both the player
and the seating. However, character type should not be a component outside of character
because it primarily interacts with and fits into the character component.

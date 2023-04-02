# Overview

This application uses the typical server-client interaction model.

## Types of clients

There are three types of client:

- player: these are participants of the game
- storyteller: this is the key figure who controls the game
- audience (planned): these are passive listeners on game

## Modes of communication

Between player and storyteller, there are two modes of communication:

- message: an one-time notification that can optionally demand a response
- chat: an ongoing communication that retains history

The difference between these two modes of communication is that message is usually tied to a very specific purpose and is highly customized for that purpose. For example, Storyteller might send a message to a demon player to inquire the player to kill. On the other hand, chat is more free-formed and flexible to carry all other purposes.

## Types of communication

There are following types of communication:

- message
  - player to player
  - player to storyteller
  - storyteller to player
- chat
  - player and player
  - player and storyteller

## Glossary of message type

| Topic | Event | Sender | Recipient | Request | Response | Comments |
| ----- | ----- | ------ | --------- | ------- | -------- | -------- |

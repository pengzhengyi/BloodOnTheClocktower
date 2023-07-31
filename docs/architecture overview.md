# Architecture Overview

This documents serves as a high level overview of the architecture.

Broadly speaking, the entire architecture is separated into two divisions: UI and backend.
The UI is responsible for handling user interactions while the backend is responsible for
handling the game logic and session logistics.

The UI and backend are detached in a way such that the backend does not need to be aware
of which type of UI it is interacting, let it be a CLI or a remote web application.
The backend only deals with the representatives (proxies) for each type of actors, such as
the Storyteller and the Players. The UI is responsible for implementing the appropriate
communication protocol like REST to interact with their respective proxies.

The architecture is primarily event-driven and asynchronous.

## Architecture Characteristics

The most important characteristics of the architecture are:

- **Scalability**: The architecture is designed to be scalable. Multiple instances of the backend
  can be deployed to handle multiple sessions.
- **Extensibility**: The architecture is designed to be extensible. New types of UI can be added
  without redeploying the backend. Also new features can be hot-loaded into the backend.
  For example, suppose user-defined characters need to be added to a game session. The backend
  does not need to be redeployed to support this feature. Instead, the backend can accept this
  configuration from the UI and load the new characters into the game session.
- **Maintainability**: The architecture will be well-tested and well-documented. Good abstractions
  will be used to make the codebase easy to understand and maintain.

## Top Level Partitioning

The architecture will be technically partitioned. This is because the project will not involve different
domains and the core functionalities are relatively simple and tightly coupled.

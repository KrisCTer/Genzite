# Architecture Rules

## Mandatory Architecture Pattern

Genzite backend uses a **Modular Monolith** architecture.

## Strict Dependency Boundaries

- Cross-domain concrete dependency injection is forbidden.
- Communication between domains must happen through Interfaces.
- Domain modules must not directly depend on each other's concrete implementations.

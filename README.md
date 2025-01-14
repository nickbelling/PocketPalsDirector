# Pocket Pals Director

## TODO

- Update game styles to always fit 100%
- Add preview size selector (and default size) to games
- Update `<game-selector>` to enable adding a new game from within it
- Update home page to be a grid of game title images
- Documentation
- Unit tests

## Adding a new game

1.  Ensure schematics are properly built:

    ```
    npm run build:schematics
    ```

2.  Add game:

    ```
    ng generate game MyNewGameName
    ```

## Deploying custom Firebase functions

Firebase functions are defined in `/functions`.

```
npx firebase deploy --only functions
```

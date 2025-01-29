# Pocket Pals Director

## TODO

- Redo Ranky Panky controller
- Fix positioning of games with timers
- Database:
    - Update `<game-selector>` to enable adding a new game from within it
    - Investigate enabling image export of games at different aspect ratios
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

## Deployment

### Hosting

The following builds and deploys the webapp to hosting. Note that the cloud
functions must exist in the same Firebase project, or the app will not work.

```
npm run deploy
```

### Cloud functions

Firebase functions are defined in `/functions`.

```
npm run deploy:functions
```

# Pocket Pals Director

## TODO

- Update game styles to always fit 100%
- Add preview size selector (and default size) to games
- Update home page to be a grid of game title images
- Database:
    - Update `<game-selector>` to enable adding a new game from within it
    - Investigate enabling image export of games at different aspect ratios
    - Select logos/heros from SteamGridDB rather than requiring download/reupload
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

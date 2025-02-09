# Pocket Pals Director

## TODO

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

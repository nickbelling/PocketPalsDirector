# Pocket Pals Director

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

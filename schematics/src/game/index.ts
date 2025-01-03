import {
    apply,
    chain,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    strings,
    template,
    Tree,
    url,
} from '@angular-devkit/schematics';

interface NewGameOptions {
    name: string;
}

function renameTemplateFiles(): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        tree.visit((filePath) => {
            if (filePath.endsWith('.template')) {
                const newFilePath = filePath.replace(/\.template$/, '');
                tree.rename(filePath, newFilePath);
            }
        });
        return tree;
    };
}

export function allCapsUnderscore(str: string): string {
    return strings.underscore(str).toUpperCase();
}

export function game(options: NewGameOptions): Rule {
    return (_: Tree, _context: SchematicContext) => {
        const templateSource = apply(url('./files'), [
            template({
                ...strings,
                underscore: allCapsUnderscore,
                ...options,
            }),
            move(`src/app/games/${strings.dasherize(options.name)}`),
            renameTemplateFiles(),
        ]);

        return chain([mergeWith(templateSource)]);
    };
}

// Enable Markdown files to be imported as text in TypeScript files. This makes
// relevant documentation available in Angular components for rendering.
declare module '*.md' {
    const content: string;
    export default content;
}

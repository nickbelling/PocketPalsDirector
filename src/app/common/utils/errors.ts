import { deserializeError } from 'serialize-error';

/**
 * Parses an Error object, regardless of type, and best-effort formats it for
 * display.
 *
 * Best handles the "error" produced by the `catch` part of a `try/catch`.
 *
 * @param error The error object to parse.
 * @returns The error, formatted as a string.
 */
export function parseError(error: Error | unknown): string {
    const parsed = deserializeError(error);
    return `[${parsed.name}] - ${parsed.message}`;
}

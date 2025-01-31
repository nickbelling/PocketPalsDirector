import { deserializeError } from 'serialize-error';

export function parseError(error: unknown): string {
    const parsed = deserializeError(error);
    return `[${parsed.name}] - ${parsed.message}`;
}

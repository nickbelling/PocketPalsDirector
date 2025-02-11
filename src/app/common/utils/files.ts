import { CORS_PROXY_FUNCTION_URL } from '../firestore';

/**
 * Downloads the given URL and makes it available as a {@link File} object.
 * @param url The URL to download.
 * @param filename The name of the file to set.
 * @param useCorsProxy If true, downloads via the CORS proxy.
 * @returns The downloaded file, as a {@link File} object.
 */
export async function downloadUrlAsFile(
    url: string,
    filename: string,
    useCorsProxy: boolean = false,
): Promise<File> {
    const blob = await downloadUrlAsBlob(url, useCorsProxy);

    // Create a File object using the Blob and the provided filename
    return new File([blob], filename, { type: blob.type });
}

export async function downloadUrlAsBlob(
    url: string,
    useCorsProxy: boolean = false,
): Promise<Blob> {
    if (useCorsProxy) {
        url = `${CORS_PROXY_FUNCTION_URL}/?url=${url}`;
    }

    const response = await fetch(url);

    // Check if the fetch request was successful
    if (!response.ok) {
        throw new Error(
            `Failed to download file from URL: ${response.status} ${response.statusText}`,
        );
    }

    // Read the response as a Blob
    return await response.blob();
}

/**
 * Returns true if the given concrete MIME file type matches the given "accepts"
 * pattern.
 * @param concreteType The concrete file MIME type to check, e.g. `"image/png"`.
 * @param pattern The "accepts" pattern to match, e.g. `"image/*"`,
 * `"image/png, image/jpg"`, etc.
 * @returns True if the file type matches the pattern.
 */
export function fileTypeMatchesInputPattern(
    concreteType: string,
    pattern: string,
): boolean {
    // If no pattern is specified (or only whitespace), allow all file types.
    if (!pattern || pattern.trim() === '') {
        return true;
    }

    // Split the pattern string by commas, trim extra spaces, and filter out empties.
    const patterns = pattern
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '');

    for (const p of patterns) {
        if (p === '*/*') {
            // Accepts any MIME type.
            return true;
        } else if (p.endsWith('/*')) {
            // For wildcard patterns (like "image/*"), check if concreteType
            // starts with the prefix. Remove the trailing '*' to get "image/".
            const prefix = p.slice(0, -1);
            if (concreteType.startsWith(prefix)) {
                return true;
            }
        } else {
            // Otherwise, check for an exact match.
            if (concreteType === p) {
                return true;
            }
        }
    }

    return false;
}

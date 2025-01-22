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
    const blob = await response.blob();

    // Create a File object using the Blob and the provided filename
    return new File([blob], filename, { type: blob.type });
}

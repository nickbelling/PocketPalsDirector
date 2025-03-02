import * as cors from 'cors';
import { Request, Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import fetch = require('node-fetch');

const corsHandler = cors({ origin: true });

/**
 * Firebase function - proxies requests to the given URL and strips CORS headers.
 *
 * Post-deployment, accessed via `https://{PROJECTID}.web.app/corsproxy`. See
 * `firebase.json`'s `hosting` function bindings.
 */
export const corsProxy = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Expect a "url" query param, e.g., ?url=https://example.com/some-image.jpg
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).send("Missing 'url' query parameter.");
            }

            // Fetch the content from the provided URL
            const response = await fetch(decodeURI(url));

            // If the response is not OK, return the status from the target
            if (!response.ok) {
                const errorText = await response.text();
                return res.status(response.status).send(errorText);
            }

            // Buffer the content (especially important for images)
            const contentBuffer = Buffer.from(await response.arrayBuffer());

            // Forward the Content-Type from the original response
            const contentType =
                response.headers.get('content-type') ||
                'application/octet-stream';

            // Return the resource to the client
            res.setHeader('Content-Type', contentType);
            // Allow cross-origin so your Angular app can access it
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).send(contentBuffer);
        } catch (error) {
            console.error('Error in corsProxy:', error);
            return res.status(500).send('Error proxying the request.');
        }
    });
});

import * as cors from 'cors';
import { Request, Response } from 'express';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import fetch = require('node-fetch');

const corsHandler = cors({ origin: true });

const STEAMGRIDDB_API_KEY = defineSecret('STEAMGRIDDB_API_KEY');

export const sgdbProxy = onRequest(
    {
        // Let Firebase inject this secret at runtime
        secrets: [STEAMGRIDDB_API_KEY],
    },
    async (req: Request, res: Response) => {
        corsHandler(req, res, async () => {
            try {
                const { path } = req.query;
                if (!path || typeof path !== 'string') {
                    return res
                        .status(400)
                        .send("Missing or invalid 'path' query parameter.");
                }

                const apiKey = STEAMGRIDDB_API_KEY.value();

                // Build the SteamGridDB URL
                const url = `https://www.steamgriddb.com/api/v2${path}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    return res.status(response.status).send(errorText);
                }

                const data = await response.json();
                return res.status(200).json(data);
            } catch (err) {
                console.error('Error in sgdbProxy:', err);
                return res
                    .status(500)
                    .send('Error fetching data from SteamGridDB.');
            }
        });
    },
);

export const corsProxy = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Expect a "url" query param, e.g., ?url=https://example.com/some-image.jpg
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).send("Missing 'url' query parameter.");
            }

            // Fetch the content from the provided URL
            const response = await fetch(url);

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

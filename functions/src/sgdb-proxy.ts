import * as cors from 'cors';
import { Request, Response } from 'express';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import fetch = require('node-fetch');

const corsHandler = cors({ origin: true });
const STEAMGRIDDB_API_KEY = defineSecret('STEAMGRIDDB_API_KEY');

/**
 * Firebase function - proxies requests to SteamGridDB, appending the API key
 * stored in the `STEAMGRIDDB_API_KEY` secret.
 *
 * Post-deployment, accessed via `https://{PROJECTID}.web.app/sgdbproxy`. See
 * `firebase.json`'s `hosting` function bindings.
 */
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

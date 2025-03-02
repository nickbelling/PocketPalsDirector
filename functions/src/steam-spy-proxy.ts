import * as cors from 'cors';
import { Request, Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import fetch = require('node-fetch');

const corsHandler = cors({ origin: true });

/**
 * Firebase function - proxies requests to SteamSpy, appending the app ID specified.
 *
 * Post-deployment, accessed via `https://{PROJECTID}.web.app/steamspyproxy`. See
 * `firebase.json`'s `hosting` function bindings.
 */
export const steamSpyProxy = onRequest(async (req: Request, res: Response) => {
    corsHandler(req, res, async () => {
        try {
            const { appId } = req.query;
            if (!appId || typeof appId !== 'string') {
                return res
                    .status(400)
                    .send("Missing or invalid 'appId' query parameter.");
            }

            // Build the SteamSpy URL
            const url = `https://steamspy.com/api.php?request=appdetails&appid=${appId}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                return res.status(response.status).send(errorText);
            }

            const data = await response.json();
            return res.status(200).json(data);
        } catch (err) {
            console.error('Error in steamSpyProxy:', err);
            return res.status(500).send('Error fetching data from SteamSpy.');
        }
    });
});

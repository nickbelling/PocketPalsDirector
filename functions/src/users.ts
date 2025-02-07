import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2/https';

admin.initializeApp();
const auth = admin.auth();

/**
 * If an administrator, lists all users registered in Firebase, including
 * whether or not they have the `"admin"` custom claim set to `true`.
 */
export const listUsers = functions.onCall(async (request) => {
    if (!request.auth) {
        throw new functions.HttpsError(
            'unauthenticated',
            'User must be authenticated.',
        );
    }

    if (!request.auth.token?.admin) {
        throw new functions.HttpsError(
            'permission-denied',
            'Only admins can list users.',
        );
    }

    try {
        const listUsersResult = await auth.listUsers();
        return listUsersResult.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
            creationTime: user.metadata.creationTime,
            admin: user.customClaims?.admin || false,
        }));
    } catch (error) {
        console.error('Error listing users:', error);
        throw new functions.HttpsError(
            'internal',
            'Failed to list users',
            error,
        );
    }
});

/**
 * If an administrator, sets the given user's `"admin"` custom claim to the
 * given `true`/`false` value.
 */
export const setAdmin = functions.onCall(async (request) => {
    if (!request.auth) {
        throw new functions.HttpsError(
            'unauthenticated',
            'User must be authenticated.',
        );
    }

    if (!request.auth.token?.admin) {
        throw new functions.HttpsError(
            'permission-denied',
            'Only admins can modify roles.',
        );
    }

    const { uid, isAdmin } = request.data;
    if (typeof uid !== 'string' || typeof isAdmin !== 'boolean') {
        throw new functions.HttpsError(
            'invalid-argument',
            'Invalid arguments.',
        );
    }

    try {
        await auth.setCustomUserClaims(uid, { admin: isAdmin });
        return { success: true };
    } catch (error) {
        console.error('Error setting admin claim:', error);
        throw new functions.HttpsError(
            'internal',
            'Failed to set admin claim',
            error,
        );
    }
});

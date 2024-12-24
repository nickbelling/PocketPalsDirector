import { Timestamp } from 'firebase/firestore';

export type Entity<TEntity extends object> = TEntity & {
    firebaseId: string;
    createdAt: Timestamp | null;
};

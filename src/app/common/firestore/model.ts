import { Timestamp } from 'firebase/firestore';

export type Entity<TEntity extends object> = TEntity & {
    id: string;
    createdAt: Timestamp | null;
};

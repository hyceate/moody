import { persistentMap } from '@nanostores/persistent';

export interface User {
  id: string | undefined;
  [key: string]: string | undefined;
}
export const $user = persistentMap<User>('session', { id: undefined });

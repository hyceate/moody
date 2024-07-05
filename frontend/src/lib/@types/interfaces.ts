export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}
export interface Pin {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  link: string;
  imgPath: string;
  imgWidth: number;
  imgHeight: number;
  user: User;
  comments: [string];
  boards: [
    {
      board: Board;
      savedAt: string;
    },
  ];
}

export interface Board {
  user?: User;
  id: string;
  title: string;
  description?: string;
  url?: string;
  isPrivate: boolean;
  pins: Pin[];
  pinCount?: number;
}

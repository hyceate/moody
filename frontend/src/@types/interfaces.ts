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
  link: string;
  imgPath: string;
  imgWidth: number;
  imgHeight: number;
  user: User;
  comments: [string];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  private: boolean;
  pins: Pin[];
  pinCount: number;
}

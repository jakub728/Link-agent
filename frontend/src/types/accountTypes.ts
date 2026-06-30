export interface AccountInterface {
  userId: string;
  platform: string;
  profileId: string;
  profileName: string;
  picture: string;
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    botToken?: string;
    chatId?: string;
  };
  createdAt: Date;
}

export interface AllAccountsInterface {
  groupedAccounts: {
    facebook: AccountInterface[];
    linkedin: AccountInterface[];
    reddit: AccountInterface[];
    wykop: AccountInterface[];
    discord: AccountInterface[];
    telegram: AccountInterface[];
  };
}

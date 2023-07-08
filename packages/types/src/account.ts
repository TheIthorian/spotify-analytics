export type UserDetails = {
    id: number;
    username: string;
    displayName: string;
    hasStreamHistoryRecords: boolean;
    hasUploads: boolean;
};

export type GetUserDetailsResponseData = UserDetails;

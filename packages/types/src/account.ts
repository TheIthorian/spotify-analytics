export type UserDetails = {
    id: number;
    username: string;
    hasStreamHistoryRecords: boolean;
    hasUploads: boolean;
};

export type GetUserDetailsResponseData = UserDetails;

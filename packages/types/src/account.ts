import { z } from 'zod';

export type UserDetails = {
    id: number;
    username: string;
    displayName: string;
    hasStreamHistoryRecords: boolean;
    hasUploads: boolean;
};

export type GetUserDetailsResponseData = UserDetails;

export const PasswordLoginRequestBodySchema = z.object({
    username: z.string(),
    password: z.string(),
});

export type PasswordLoginRequestBody = z.infer<typeof PasswordLoginRequestBodySchema>;

export const LoginRequestQuerySchema = z.object({
    provider: z.enum(['github', 'password']),
});

export type LoginRequestQuery = z.infer<typeof LoginRequestQuerySchema>;

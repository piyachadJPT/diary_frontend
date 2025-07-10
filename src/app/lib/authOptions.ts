import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface ExtendedToken extends JWT {
    accessToken?: string;
    username?: string;
    displayName?: string;
    mail?: string;
    extensionAttribute1?: string;
    extensionAttribute6?: string;
}

interface ExtendedSession extends Session {
    authenticated?: boolean;
    user: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        extensionAttribute1?: string | null;
        extensionAttribute6?: string | null;
    };
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 60 * 60,
        updateAge: 60 * 5
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
            authorization: {
                params: { scope: "openid email profile User.Read" },
            },
            httpOptions: { timeout: 10000 },
        }),
    ],
    callbacks: {
        session: async ({ session, token }) => {
            return {
                ...session,
                authenticated: true,
                user: {
                    ...session.user,
                    id: token.accessToken,
                    name: token.displayName || session.user?.name,
                    email: token.mail || session.user?.email,
                    extensionAttribute1: token.extensionAttribute1,
                    extensionAttribute6: token.extensionAttribute6,
                },
            } as ExtendedSession;
        },
        jwt: async ({ token, account }) => {
            if (account) {
                token.accessToken = account.access_token;
                try {
                    const response = await fetch(
                        'https://graph.microsoft.com/v1.0/me/?$select=displayName,userPrincipalName,mail,onPremisesExtensionAttributes',
                        {
                            headers: {
                                Authorization: `Bearer ${account.access_token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch user data: ${response.statusText}`);
                    }

                    const user = await response.json();

                    token.username = user.userPrincipalName?.replace('@up.ac.th', '') || null;
                    token.displayName = user.displayName || null;
                    token.mail = user.mail || null;
                    token.extensionAttribute1 = user.onPremisesExtensionAttributes?.extensionAttribute1 || null;
                    token.extensionAttribute6 = user.onPremisesExtensionAttributes?.extensionAttribute6 || null;
                } catch (error) {
                    console.error('Error fetching user data from Microsoft Graph:', error);
                }
            }

            return token as ExtendedToken;
        },
    },

};

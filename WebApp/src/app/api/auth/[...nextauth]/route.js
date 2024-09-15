import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "secret",
    },
];

export const authOptions = {
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                const user = users.find(
                    (user) =>
                        user.email === credentials.email &&
                        user.password === credentials.password
                );
                if (user) {
                    return user;
                } else {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
        signOut: "/logout",
        error: "/",
    },
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
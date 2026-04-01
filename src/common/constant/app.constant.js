export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log(
    "\n",
    {
        DATABASE_URL: DATABASE_URL,
        ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET
    },
    "\n"
)
/** Single fallback so login (sign) and middleware (verify) always match when env is unset. */
const JWT_SECRET_FALLBACK = 'your-super-secret-jwt-key-change-this-in-production';

/** Read at request time so serverless (e.g. Vercel) uses the same secret for sign and verify. Set JWT_SECRET in your API deployment so all instances use one value. */
export const getJwtSecret = () => process.env.JWT_SECRET || JWT_SECRET_FALLBACK;

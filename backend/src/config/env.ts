/**
 * Vérifie les variables d'environnement critiques au démarrage.
 * On échoue tôt (et clairement) plutôt que de tourner avec des secrets par défaut.
 */
const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function assertEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Variables d'environnement manquantes : ${missing.join(', ')}. ` +
        `Voir backend/.env.example (ou Project Settings → Environment Variables sur Vercel).`,
    );
  }
  if (process.env.NODE_ENV === 'production') {
    for (const k of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if ((process.env[k] as string).length < 32) {
        throw new Error(`${k} doit faire au moins 32 caractères en production.`);
      }
    }
  }
}

export const jwtSecret = () => process.env.JWT_SECRET as string;
export const jwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET as string;

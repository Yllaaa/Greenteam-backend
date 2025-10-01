export function detectPlatform(userAgent: string): 'android' | 'ios' | 'web' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('android')) return 'android';

  return 'web';
}

export async function generateUniqueUsername(
  baseUsername: string,
): Promise<string> {
  const sanitizedBase = baseUsername.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);

  for (let counter = 0; counter < 5; counter++) {
    const usernameToTry =
      counter === 0 ? sanitizedBase : `${sanitizedBase}${counter}`;

    try {
      const existingUser = await Promise.race([
        this.authRepository.getUserByUsername(usernameToTry),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Username lookup timed out')),
            2000,
          ),
        ),
      ]);

      if (!existingUser) {
        return usernameToTry;
      }
    } catch (error) {
      console.error(`Error checking username ${usernameToTry}:`, error);
      break;
    }
  }

  const timestamp = Date.now().toString().slice(-6);
  return `${sanitizedBase}_${timestamp}`;
}

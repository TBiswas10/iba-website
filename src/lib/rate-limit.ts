const WINDOW_MS = 10 * 60 * 1000;
const MAX_SIGNUPS_PER_IP = 5;
const MAX_SIGNUPS_PER_EMAIL = 3;

type WindowRecord = {
  count: number;
  resetAt: number;
};

const signupWindows = new Map<string, WindowRecord>();
const signupEmailWindows = new Map<string, WindowRecord>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cloudflare = request.headers.get("cf-connecting-ip");
  if (cloudflare) {
    return cloudflare;
  }

  return "unknown";
}

export function checkSignupRateLimit(request: Request) {
  const key = getClientIp(request);
  const now = Date.now();
  const current = signupWindows.get(key);

  if (!current || current.resetAt <= now) {
    signupWindows.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_SIGNUPS_PER_IP) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  signupWindows.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

export function checkSignupEmailRateLimit(email: string) {
  const key = email.trim().toLowerCase();
  if (!key) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  const now = Date.now();
  const current = signupEmailWindows.get(key);

  if (!current || current.resetAt <= now) {
    signupEmailWindows.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_SIGNUPS_PER_EMAIL) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  signupEmailWindows.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

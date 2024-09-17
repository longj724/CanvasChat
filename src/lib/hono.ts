import { hc } from 'hono/client';

import { AppType } from '@/app/api/[[...route]]/route';

const isProduction = process.env.NODE_ENV === 'production';

const appUrl = isProduction
  ? process.env.NEXT_PUBLIC_PRODUCTION_APP_URL!
  : process.env.NEXT_PUBLIC_LOCAL_APP_URL!;

export const client = hc<AppType>(appUrl);

import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  let locale = 'en'; // Default fallback
  
  try {
    // Read locale from cookies for SSR support
    const cookieStore = await cookies();
    locale = cookieStore.get('locale')?.value || 'en';
    // eslint-disable-next-line
  } catch (error) {
    // During build time or when cookies are not available, use default locale
    locale = 'en';
  }
  
  return {
    locale,
    messages: (await import(`../../locale/${locale}.json`)).default
  };
});
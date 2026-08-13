import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription, companyName, logo, logoDark } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-zinc-900 selection:text-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-50 flex w-full flex-row items-center justify-between border-b border-zinc-200/60 bg-zinc-50/70 p-4 backdrop-blur-xl md:px-8 md:py-4 dark:border-zinc-800/60 dark:bg-zinc-950/70">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Saira <span className="font-normal text-zinc-400">Voice AI</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-medium text-zinc-500 sm:inline-block dark:text-zinc-400">
                Learning & Literacy Assistant
              </span>
            </div>
          </header>

          {children}
          <div className="group fixed right-4 bottom-4 z-50">
            <ThemeToggle className="border border-zinc-200 shadow-md dark:border-zinc-800" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

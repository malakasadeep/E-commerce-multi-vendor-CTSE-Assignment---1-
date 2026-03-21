import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'Eshop - Admin Dashboard',
  description: 'Admin dashboard for managing the Eshop ecommerce platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

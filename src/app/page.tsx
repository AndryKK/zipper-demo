import { CartProvider } from '@/lib/CartContext';
import StoreShell from '@/components/store/StoreShell';
import StoreHomePage from '@/components/store/StoreHomePage';

export default function RootPage() {
  return (
    <CartProvider>
      <StoreShell>
        <StoreHomePage />
      </StoreShell>
    </CartProvider>
  );
}

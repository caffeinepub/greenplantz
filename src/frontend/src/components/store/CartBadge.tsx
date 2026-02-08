import { useCart } from '../../store/cart/useCart';

export default function CartBadge() {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
      {totalItems > 9 ? '9+' : totalItems}
    </span>
  );
}

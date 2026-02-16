import { PaymentStatus } from '../../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PaymentStatusBadge = ({ status, className = '' }: PaymentStatusBadgeProps) => {
  if (!status) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>
        No Payment
      </span>
    );
  }

  const styles: Record<Exclude<PaymentStatus, null>, { bg: string; text: string; label: string }> = {
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Pending',
    },
    payment_pending: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Payment Pending',
    },
    paid: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Paid',
    },
    failed: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Failed',
    },
    refunded: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Refunded',
    },
    partial_refund: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      label: 'Partial Refund',
    },
  };

  const style = styles[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}>
      {style.label}
    </span>
  );
};

export default PaymentStatusBadge;
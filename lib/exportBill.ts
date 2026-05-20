// lib/exportBill.ts
import { IBill } from '@/types';
import { ShopOption } from '@/components/ui/ShopDropdown';

export async function exportBill(
  bill: IBill,
  shop: ShopOption | null,
  type: 'pdf' | 'image'
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { createRoot } = await import('react-dom/client');
  const { default: BillPreviewComp } = await import('@/components/bill/BillPreview');
  const React = await import('react');

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  document.body.appendChild(container);

  const root = createRoot(container);

  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(BillPreviewComp, { bill: { ...bill, shop } })
    );
    setTimeout(resolve, 300);
  });

  const canvas = await html2canvas(container.firstChild as HTMLElement, {
    scale: 2,
    backgroundColor: '#fff',
  });

  root.unmount();
  document.body.removeChild(container);

  if (type === 'image') {
    const link = document.createElement('a');
    link.download = `bill-${bill.billNo}:vehicle-${bill.vehicleNo}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      canvas.width / 2,
      canvas.height / 2
    );
    pdf.save(`bill-${bill.billNo}-${bill.vehicleNo}.pdf`);
  }
}
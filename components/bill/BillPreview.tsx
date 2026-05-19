import { toDisplayDateTime } from '@/lib/utils';
import { IBill } from '@/types';

interface Props {
  bill: Omit<Partial<IBill>, 'shop'> & {
    shop?: {
      title: string;
      location: string;
      weight: number;
    } | null;
  };
}

export default function BillPreview({ bill }: Props) {
  const shop = bill.shop;

  return (
    <div
      id="bill-preview"
      className="bg-white text-black font-mono text-xs border-2 border-black"
      style={{ width: '380px', padding: '16px', lineHeight: '1.6' }}
    >
      {/* Logo + Title */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '28px', marginBottom: '2px' }}>⚖️</div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
          {shop?.title?.toUpperCase() ?? 'WEIGHT BRIDGE'}
        </div>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>
          {shop?.location ?? ''}
        </div>
      </div>

      <div className="dotted-line" />

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px' }}>
        COMPUTERIZED {shop?.weight ?? 80} TONNE WEIGH BRIDGE
      </div>

      <div className="dotted-line" />

      {/* Bill No */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontWeight: 'bold' }}>Bill No.</span>
        <span>: {bill.billNo ?? '—'}</span>
      </div>

      {/* Print Date + Vehicle No */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>PRINT DATE</span>{' '}
          <span>: {bill.printDate ? toDisplayDateTime(bill.printDate) : '—'}</span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>VEHICLE NO</span>{' '}
          <span>: {bill.vehicleNo ?? '—'}</span>
        </div>
      </div>

      {/* Material */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: 'bold' }}>MATERIAL</span>{' '}
        <span>: {bill.material ?? 'SCRAP'}</span>
      </div>

      <div className="dotted-line" />

      {/* Gross Weight */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>GROSS WEIGHT</span>{' '}
          <span>
            : {bill.grossWeight != null ? String(bill.grossWeight).padStart(5, '0') : '00000'} KG
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>TIME</span>{' '}
          <span>: {bill.grossTime ? toDisplayDateTime(bill.grossTime) : '—'}</span>
        </div>
      </div>

      {/* Tare Weight */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>TARE WEIGHT</span>{' '}
          <span>
            : {bill.tareWeight != null ? String(bill.tareWeight).padStart(5, '0') : '00000'} KG
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>TIME</span>{' '}
          <span>: {bill.tareTime ? toDisplayDateTime(bill.tareTime) : '—'}</span>
        </div>
      </div>

      {/* Net Weight */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: 'bold' }}>NET WEIGHT</span>{' '}
        <span>
          :{' '}
          {bill.grossWeight != null && bill.tareWeight != null
            ? String(bill.grossWeight - bill.tareWeight).padStart(5, '0')
            : '00000'}{' '}
          KG
        </span>
      </div>

      <div className="dotted-line" />

      {/* Weighment Charges */}
      <div style={{ marginBottom: '2px' }}>
        <span style={{ fontWeight: 'bold' }}>WEIGHMENT CHARGES</span>{' '}
        <span>: {bill.weighmentCharges ?? 0}</span>
      </div>

      {/* Operator */}
      <div style={{ textAlign: 'right', marginTop: '12px', fontWeight: 'bold' }}>
        OPERATORS SIGN : {bill.operatorSign ?? 'ADMIN'}
      </div>
    </div>
  );
}
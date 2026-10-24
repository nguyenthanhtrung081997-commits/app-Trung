import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Upload,
  QrCode,
  Building2,
  Copy,
  Check,
  Settings2,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { PaymentTransaction, BankQrSettings } from '../types';
import { formatVND, VIETNAMESE_BANKS } from '../data/initialData';

interface ReceiptPreviewModalProps {
  transaction: PaymentTransaction | null;
  bankSettings: BankQrSettings;
  onUpdateBankSettings: (nextSettings: BankQrSettings) => void;
  onClose: () => void;
}

/**
 * Generates a crisp, deterministic SVG QR-like matrix for fallback/default display
 * when the user has not uploaded a custom QR photo yet.
 */
const DefaultQrSvg: React.FC<{ seedText: string }> = ({ seedText }) => {
  const size = 21;
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderPattern = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const getFinderCell = (r: number, c: number, baseR: number, baseC: number) => {
    const lr = r - baseR;
    const lc = c - baseC;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const cells: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      if (r < 7 && c < 7) {
        row.push(getFinderCell(r, c, 0, 0));
      } else if (r < 7 && c >= size - 7) {
        row.push(getFinderCell(r, c, 0, size - 7));
      } else if (r >= size - 7 && c < 7) {
        row.push(getFinderCell(r, c, size - 7, 0));
      } else if (r === 7 || c === 7) {
        row.push(false);
      } else if (!isFinderPattern(r, c)) {
        const cellSeed = Math.imul(hash ^ (r * 31 + c * 17), 2654435761);
        row.push((Math.abs(cellSeed) % 10) < 5);
      } else {
        row.push(false);
      }
    }
    cells.push(row);
  }

  return (
    <svg
      viewBox={`0 0 ${size + 4} ${size + 4}`}
      className="w-full h-full bg-white rounded"
      aria-label="Mã QR thanh toán"
    >
      <rect width={size + 4} height={size + 4} fill="#FFFFFF" />
      {cells.map((row, rIdx) =>
        row.map((filled, cIdx) =>
          filled ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx + 2}
              y={rIdx + 2}
              width={1}
              height={1}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  transaction,
  bankSettings,
  onUpdateBankSettings,
  onClose,
}) => {
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<'account' | 'syntax' | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!transaction) return null;

  const transferSyntax = `${bankSettings.transferNotePrefix || 'NOP HP'} ${transaction.studentCode} ${transaction.studentName} ${transaction.className}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text: string, type: 'account' | 'syntax') => {
    navigator.clipboard?.writeText(text);
    setCopiedField(type);
    setTimeout(() => {
      setCopiedField((prev) => (prev === type ? null : prev));
    }, 2000);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP...).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước ảnh QR không được vượt quá 5MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateBankSettings({
          ...bankSettings,
          customQrImageUrl: reader.result,
          showBankSectionOnReceipt: true,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBankSelect = (shortName: string) => {
    const found = VIETNAMESE_BANKS.find((b) => b.shortName === shortName);
    onUpdateBankSettings({
      ...bankSettings,
      bankShortName: shortName,
      bankFullName: found ? found.fullName : shortName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden file input always mounted so both toolbar and compact QR box can trigger it */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleQrFileChange}
        className="hidden"
      />

      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl my-auto overflow-hidden max-h-[96vh] flex flex-col shadow-xl">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 no-print shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {transaction.isPaymentRequestNotice
                ? 'Xem trước Phiếu báo thu (Gọn trên 1 màn hình)'
                : 'Xem trước Phiếu thu tiền học sinh (Gọn trên 1 màn hình)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfigPanel((prev) => !prev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                showConfigPanel
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showConfigPanel ? 'Thu gọn cấu hình QR/STK' : 'Sửa Mã QR & Số tài khoản'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-200">
          {/* Interactive QR & Bank Account Configuration Panel (no-print) */}
          {showConfigPanel && (
            <div className="p-3.5 bg-slate-50 no-print space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cấu hình nhanh Mã QR & Thông tin tài khoản trên phiếu</span>
                </div>

                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none bg-white px-2.5 py-0.5 border border-slate-200 rounded-md">
                  <input
                    type="checkbox"
                    checked={bankSettings.showBankSectionOnReceipt}
                    onChange={(e) =>
                      onUpdateBankSettings({
                        ...bankSettings,
                        showBankSectionOnReceipt: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Hiện trên phiếu in</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                {/* Left: QR Image Upload Controls */}
                <div className="md:col-span-4 bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2.5">
                  <div className="w-11 h-11 border border-slate-200 rounded p-0.5 bg-white shrink-0 flex items-center justify-center overflow-hidden">
                    {bankSettings.customQrImageUrl ? (
                      <img
                        src={bankSettings.customQrImageUrl}
                        alt="Mã QR đã tải lên"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <DefaultQrSvg seedText={bankSettings.accountNumber + transferSyntax} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <Upload className="w-3 h-3" />
                      Chèn ảnh QR từ máy
                    </button>

                    {bankSettings.customQrImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateBankSettings({
                            ...bankSettings,
                            customQrImageUrl: '',
                          })
                        }
                        className="w-full px-2 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50 rounded flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Gỡ ảnh QR
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Bank Account Inputs */}
                <div className="md:col-span-8 bg-white border border-slate-200 rounded-lg p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                      Ngân hàng
                    </label>
                    <select
                      value={bankSettings.bankShortName}
                      onChange={(e) => handleBankSelect(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    >
                      {VIETNAMESE_BANKS.map((b) => (
                        <option key={b.shortName} value={b.shortName}>
                          {b.shortName} — {b.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      value={bankSettings.accountNumber}
                      onChange={(e) =>
                        onUpdateBankSettings({
                          ...bankSettings,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="VD: 1029 8866 9999"
                      className="w-full px-2 py-1 text-xs font-mono tabular-nums font-semibold bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                      Chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={bankSettings.accountHolder}
                      onChange={(e) =>
                        onUpdateBankSettings({
                          ...bankSettings,
                          accountHolder: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: BAN DAI DIEN PHU HUYNH"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                      Chi nhánh ngân hàng
                    </label>
                    <input
                      type="text"
                      value={bankSettings.branchName}
                      onChange={(e) =>
                        onUpdateBankSettings({
                          ...bankSettings,
                          branchName: e.target.value,
                        })
                      }
                      placeholder="VD: CN Sở Giao Dịch"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                </div>
              </div>
              {uploadError && (
                <div className="text-[11px] text-red-600 font-medium">{uploadError}</div>
              )}
            </div>
          )}

          {/* COMPACT SINGLE-SCREEN PRINTABLE RECEIPT BODY */}
          <div className="p-4 sm:p-5 space-y-3 bg-white">
            {/* Row 1: Compact Merged Header & Title */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {transaction.isPaymentRequestNotice
                    ? 'PHIẾU BÁO THU CÁC KHOẢN TIỀN HỌC SINH'
                    : 'PHIẾU THU CÁC KHOẢN TIỀN HỌC SINH'}
                </h2>
                <div className="text-[11px] text-slate-500">
                  Lớp {transaction.className} · Năm học 2026–2027 · Hình thức: {transaction.paymentMethod}
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="font-mono tabular-nums font-bold text-slate-900">
                  Số: {transaction.receiptCode}
                </div>
                <div className="text-[11px] font-mono tabular-nums text-slate-500">
                  Ngày: {transaction.paidAt}
                </div>
              </div>
            </div>

            {/* Row 2: Single-Bar Student & Payer Info */}
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <div>
                <span className="text-slate-500">Học sinh: </span>
                <span className="font-bold text-slate-900">
                  {transaction.studentName} ({transaction.studentCode})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Lớp: </span>
                <span className="font-semibold text-slate-900">{transaction.className}</span>
              </div>
              <div>
                <span className="text-slate-500">Phụ huynh / Người nộp: </span>
                <span className="font-semibold text-slate-900">{transaction.payerName}</span>
              </div>
            </div>

            {/* Row 3: Side-by-Side [Bảng Kê Mục Tiền + Chữ Ký] & [Thông Tin Chuyển Khoản + Mã QR Lớn] */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Left Column: Itemized Table + Signatures */}
              <div
                className={
                  bankSettings.showBankSectionOnReceipt
                    ? 'md:col-span-7 space-y-3'
                    : 'md:col-span-12 space-y-3'
                }
              >
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <th className="py-1.5 px-2.5 w-9 text-center">STT</th>
                        <th className="py-1.5 px-2.5">Tên mục tiền khoản thu</th>
                        <th className="py-1.5 px-2.5 text-right">
                          {transaction.isPaymentRequestNotice ? 'Cần nộp' : 'Số tiền'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {transaction.paidItems.length > 0 ? (
                        transaction.paidItems.map((pi, idx) => (
                          <tr key={pi.lineItemId + '-' + idx}>
                            <td className="py-1.5 px-2.5 text-center font-mono tabular-nums text-[11px] text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 font-medium text-slate-900">
                              {pi.title}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                              {formatVND(pi.amountPaid)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 px-2.5 text-center text-slate-400 text-xs"
                          >
                            Chưa có khoản thu nào được tích chọn tham gia cho học sinh này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td
                          colSpan={2}
                          className="py-2 px-2.5 text-right text-xs font-bold text-slate-800"
                        >
                          TỔNG SỐ TIỀN CÁC KHOẢN THAM GIA:
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono tabular-nums text-sm font-bold text-emerald-700 whitespace-nowrap">
                          {formatVND(transaction.totalPaid)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Compact Signatures right under the table */}
                <div className="grid grid-cols-2 gap-4 pt-1 text-center text-[11px] text-slate-600">
                  <div>
                    <div className="font-semibold text-slate-900">Phụ huynh / Người nộp</div>
                    <div className="text-[10px] text-slate-400">(Ký và ghi rõ họ tên)</div>
                    <div className="mt-7 font-medium text-slate-800">{transaction.payerName}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Người lập phiếu / Thủ quỹ</div>
                    <div className="text-[10px] text-slate-400">(Ký và ghi rõ họ tên)</div>
                    <div className="mt-7 font-medium text-slate-800">Giáo viên / Thủ quỹ lớp</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bank Account Info + Large QR Code */}
              {bankSettings.showBankSectionOnReceipt && (
                <div className="md:col-span-5 border border-slate-200 rounded-xl p-3 bg-slate-50/70 flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-900 mb-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      THÔNG TIN CHUYỂN KHOẢN
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConfigPanel((prev) => !prev)}
                      className="text-[10px] font-medium text-blue-600 hover:underline no-print"
                    >
                      (Sửa STK/QR)
                    </button>
                  </div>

                  {/* Large QR Code Scan Box */}
                  <div className="w-40 h-40 sm:w-44 sm:h-44 bg-white border border-slate-300 rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-2xs">
                    {bankSettings.customQrImageUrl ? (
                      <img
                        src={bankSettings.customQrImageUrl}
                        alt="Mã QR chuyển khoản"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <DefaultQrSvg
                        seedText={bankSettings.accountNumber + transaction.studentCode}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1.5 px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 no-print whitespace-nowrap"
                  >
                    <Upload className="w-3 h-3" />
                    {bankSettings.customQrImageUrl ? 'Đổi ảnh mã QR' : 'Chèn ảnh mã QR'}
                  </button>

                  {/* Essential Bank Account Info Underneath QR */}
                  <div className="w-full mt-2 pt-2 border-t border-slate-200/80 text-left space-y-1 text-[11px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Ngân hàng:</span>
                      <span className="font-semibold text-slate-900 text-right truncate">
                        {bankSettings.bankShortName}
                        {bankSettings.branchName ? ` (${bankSettings.branchName})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Số TK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono tabular-nums text-xs font-bold text-blue-700">
                          {bankSettings.accountNumber || 'Chưa nhập'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankSettings.accountNumber, 'account')}
                          className="p-0.5 text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-100 no-print"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === 'account' ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Chủ TK:</span>
                      <span className="font-bold text-slate-900 text-right truncate">
                        {bankSettings.accountHolder}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

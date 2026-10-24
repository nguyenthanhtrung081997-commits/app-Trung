export type FeeCategory =
  | 'Học phí'
  | 'Bán trú'
  | 'Bảo hiểm'
  | 'Quỹ lớp'
  | 'Đồng phục & Sách'
  | 'Ngoại khóa'
  | 'Khác';

export type FeeUnit = 'Tháng' | 'Học kỳ' | 'Năm học' | 'Bộ' | 'Lần' | 'Ngày';

export interface ClassFeeItem {
  id: string;
  title: string;
  category: FeeCategory;
  amount: number; // Số tiền định mức cho 1 học sinh (Đơn giá × Số lượng)
  unitPrice: number;
  quantity: number;
  unit: FeeUnit;
  isMandatory: boolean;
  note: string;
}

export interface StudentItemState {
  checked: boolean; // Ô tích chọn đã đóng / chọn thu mục tiền này
  exempt?: boolean; // Nếu học sinh không đăng ký mục tự nguyện này
  customAmount?: number; // Nếu học sinh có mức thu riêng (giảm trừ/khác định mức)
  paidAt?: string;
}

export interface ClassStudent {
  id: string;
  studentCode: string;
  fullName: string;
  parentName: string;
  parentPhone: string;
  note?: string;
  // Map từ feeItemId -> trạng thái tích chọn của học sinh đó
  itemStates: Record<string, StudentItemState>;
}

export interface PaidItemSummary {
  lineItemId: string;
  title: string;
  category: FeeCategory;
  amountPaid: number;
}

export interface BankQrSettings {
  bankShortName: string;
  bankFullName: string;
  accountNumber: string;
  accountHolder: string;
  branchName: string;
  transferNotePrefix: string;
  customQrImageUrl: string;
  showBankSectionOnReceipt: boolean;
}

export interface PaymentTransaction {
  id: string;
  receiptCode: string;
  studentId: string;
  studentOrderNumber?: number;
  studentCode: string;
  studentName: string;
  className: string;
  payerName: string;
  paidAt: string;
  paymentMethod: 'Chuyển khoản QR' | 'Tiền mặt';
  note: string;
  paidItems: PaidItemSummary[];
  totalPaid: number;
  isPaymentRequestNotice?: boolean;
}

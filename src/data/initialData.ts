import {
  ClassFeeItem,
  ClassStudent,
  FeeCategory,
  FeeUnit,
  BankQrSettings,
} from '../types';

export const FEE_CATEGORIES: FeeCategory[] = [
  'Học phí',
  'Bán trú',
  'Bảo hiểm',
  'Quỹ lớp',
  'Đồng phục & Sách',
  'Ngoại khóa',
  'Khác',
];

export const FEE_UNITS: FeeUnit[] = ['Tháng', 'Học kỳ', 'Năm học', 'Bộ', 'Lần', 'Ngày'];

export const VIETNAMESE_BANKS = [
  { shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)' },
  { shortName: 'MBBank', fullName: 'Ngân hàng TMCP Quân Đội (MB)' },
  { shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam (TCB)' },
  { shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)' },
  { shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam (CTG)' },
  { shortName: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và PTNT Việt Nam' },
  { shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu (ACB)' },
  { shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPB)' },
  { shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong (TPB)' },
  { shortName: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín (STB)' },
];

export const INITIAL_BANK_QR_SETTINGS: BankQrSettings = {
  bankShortName: 'Vietcombank',
  bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
  accountNumber: '1029 8866 9999',
  accountHolder: 'BAN DAI DIEN PHU HUYNH LOP 10A1',
  branchName: 'CN Sở Giao Dịch',
  transferNotePrefix: 'THU TIEN',
  customQrImageUrl: '',
  showBankSectionOnReceipt: true,
};

export const INITIAL_CLASS_FEE_ITEMS: ClassFeeItem[] = [
  {
    id: 'fee-1',
    title: 'Học phí Tháng 10',
    category: 'Học phí',
    unitPrice: 1550000,
    quantity: 1,
    unit: 'Tháng',
    amount: 1550000,
    isMandatory: true,
    note: 'Học phí chương trình chính khóa',
  },
  {
    id: 'fee-2',
    title: 'Tiền ăn bán trú (22 ngày)',
    category: 'Bán trú',
    unitPrice: 45000,
    quantity: 22,
    unit: 'Ngày',
    amount: 990000,
    isMandatory: false,
    note: '22 ngày × 45.000đ/suất',
  },
  {
    id: 'fee-3',
    title: 'Phí chăm sóc bán trú',
    category: 'Bán trú',
    unitPrice: 250000,
    quantity: 1,
    unit: 'Tháng',
    amount: 250000,
    isMandatory: false,
    note: 'Quản lý nghỉ trưa & điện nước',
  },
  {
    id: 'fee-4',
    title: 'Bảo hiểm Y tế năm học',
    category: 'Bảo hiểm',
    unitPrice: 680400,
    quantity: 1,
    unit: 'Năm học',
    amount: 680400,
    isMandatory: true,
    note: 'Thu hộ cơ quan BHXH 12 tháng',
  },
  {
    id: 'fee-5',
    title: 'Quỹ hội phụ huynh HK1',
    category: 'Quỹ lớp',
    unitPrice: 300000,
    quantity: 1,
    unit: 'Học kỳ',
    amount: 300000,
    isMandatory: false,
    note: 'Hoạt động lớp & khen thưởng học tập',
  },
  {
    id: 'fee-6',
    title: 'Đồng phục áo khoác đông',
    category: 'Đồng phục & Sách',
    unitPrice: 280000,
    quantity: 1,
    unit: 'Bộ',
    amount: 280000,
    isMandatory: false,
    note: 'Áo khoác gió 2 lớp có phù hiệu',
  },
];

export const QUICK_FEE_PRESETS: Array<{
  title: string;
  category: FeeCategory;
  unitPrice: number;
  quantity: number;
  unit: FeeUnit;
  isMandatory: boolean;
  note: string;
}> = [
  {
    title: 'Tiền nước uống tinh khiết',
    category: 'Bán trú',
    unitPrice: 60000,
    quantity: 1,
    unit: 'Học kỳ',
    isMandatory: true,
    note: 'Nước uống đóng bình tại lớp',
  },
  {
    title: 'Tài liệu ôn tập & Photo đề',
    category: 'Đồng phục & Sách',
    unitPrice: 120000,
    quantity: 1,
    unit: 'Học kỳ',
    isMandatory: false,
    note: 'Tài liệu bổ trợ Toán - Văn - Anh',
  },
  {
    title: 'Hoạt động ngoại khóa STEM',
    category: 'Ngoại khóa',
    unitPrice: 350000,
    quantity: 1,
    unit: 'Lần',
    isMandatory: false,
    note: 'Vé tham quan, xe đưa đón & bảo hiểm',
  },
  {
    title: 'Tiền vệ sinh & trang trí lớp',
    category: 'Quỹ lớp',
    unitPrice: 100000,
    quantity: 1,
    unit: 'Học kỳ',
    isMandatory: false,
    note: 'Mua dụng cụ vệ sinh và cây xanh lớp học',
  },
];

export const INITIAL_CLASS_STUDENTS: ClassStudent[] = [
  {
    id: 'stu-1',
    studentCode: 'HS01',
    fullName: 'Nguyễn Minh Khôi',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0903 412 889',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: true },
    },
  },
  {
    id: 'stu-2',
    studentCode: 'HS02',
    fullName: 'Trần Ngọc Bảo Trâm',
    parentName: 'Lê Thị Thanh Mai',
    parentPhone: '0918 765 234',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: false },
    },
  },
  {
    id: 'stu-3',
    studentCode: 'HS03',
    fullName: 'Phạm Hoàng Gia Bảo',
    parentName: 'Phạm Quốc Tuấn',
    parentPhone: '0989 112 345',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: false },
      'fee-3': { checked: false },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: true },
    },
  },
  {
    id: 'stu-4',
    studentCode: 'HS04',
    fullName: 'Lê Hà Phương Linh',
    parentName: 'Lê Minh Đức',
    parentPhone: '0935 678 910',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: false },
    },
  },
  {
    id: 'stu-5',
    studentCode: 'HS05',
    fullName: 'Đặng Tuấn Kiệt',
    parentName: 'Đặng Hoàng Nam',
    parentPhone: '0972 301 445',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: false },
      'fee-5': { checked: true },
      'fee-6': { checked: true },
    },
  },
  {
    id: 'stu-6',
    studentCode: 'HS06',
    fullName: 'Vũ Khánh Ngân',
    parentName: 'Vũ Đình Trọng',
    parentPhone: '0944 892 103',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: false },
      'fee-3': { checked: false },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: true },
    },
  },
  {
    id: 'stu-7',
    studentCode: 'HS07',
    fullName: 'Hoàng Đức Minh',
    parentName: 'Hoàng Văn Bách',
    parentPhone: '0912 556 789',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: true },
      'fee-5': { checked: true },
      'fee-6': { checked: true },
    },
  },
  {
    id: 'stu-8',
    studentCode: 'HS08',
    fullName: 'Bùi Thanh Thảo',
    parentName: 'Bùi Xuân Hòa',
    parentPhone: '0966 234 881',
    itemStates: {
      'fee-1': { checked: true },
      'fee-2': { checked: true },
      'fee-3': { checked: true },
      'fee-4': { checked: true },
      'fee-5': { checked: false },
      'fee-6': { checked: false },
    },
  },
];

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

export function formatShortVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
}

export function getStudentRowSummary(student: ClassStudent, feeItems: ClassFeeItem[]) {
  let totalParticipatingAmount = 0;
  let checkedCount = 0;
  const totalItemsCount = feeItems.length;

  feeItems.forEach((fee) => {
    const st = student.itemStates[fee.id];
    if (st?.checked) {
      const itemAmt = st?.customAmount !== undefined ? st.customAmount : fee.amount;
      totalParticipatingAmount += itemAmt;
      checkedCount++;
    }
  });

  return {
    totalParticipatingAmount,
    checkedCount,
    totalItemsCount,
  };
}

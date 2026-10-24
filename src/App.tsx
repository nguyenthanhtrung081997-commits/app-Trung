/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Printer,
  CheckCircle2,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  Calculator,
  Edit3,
  Users,
  BarChart3,
} from 'lucide-react';
import {
  ClassFeeItem,
  ClassStudent,
  FeeCategory,
  FeeUnit,
  PaymentTransaction,
  BankQrSettings,
} from './types';
import {
  INITIAL_CLASS_FEE_ITEMS,
  INITIAL_CLASS_STUDENTS,
  INITIAL_BANK_QR_SETTINGS,
  FEE_CATEGORIES,
  FEE_UNITS,
  QUICK_FEE_PRESETS,
  formatVND,
  formatShortVND,
  getStudentRowSummary,
} from './data/initialData';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';

type ActiveView = 'matrix' | 'summary' | 'items' | 'students';

const STORAGE_KEYS = {
  CLASS_NAME: 'thuchiedu_single_classname_v3',
  FEE_ITEMS: 'thuchiedu_single_fee_items_v3',
  STUDENTS: 'thuchiedu_single_students_v3',
  BANK_QR: 'thuchiedu_bank_qr_v1',
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('matrix');

  // Single Class Name (editable inline)
  const [className, setClassName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CLASS_NAME) || '10A1';
    } catch {
      return '10A1';
    }
  });
  const [isEditingClassName, setIsEditingClassName] = useState<boolean>(false);

  // Fee Items (Columns in the single-class matrix)
  const [feeItems, setFeeItems] = useState<ClassFeeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEE_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_CLASS_FEE_ITEMS;
    } catch {
      return INITIAL_CLASS_FEE_ITEMS;
    }
  });

  // Students ordered 1, 2, 3, 4... in this single class
  const [students, setStudents] = useState<ClassStudent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_CLASS_STUDENTS;
    } catch {
      return INITIAL_CLASS_STUDENTS;
    }
  });

  // Bank & QR Settings for Receipts
  const [bankSettings, setBankSettings] = useState<BankQrSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANK_QR);
      return saved ? JSON.parse(saved) : INITIAL_BANK_QR_SETTINGS;
    } catch {
      return INITIAL_BANK_QR_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASS_NAME, className);
    } catch {
      // ignore
    }
  }, [className]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEE_ITEMS, JSON.stringify(feeItems));
    } catch {
      // ignore
    }
  }, [feeItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANK_QR, JSON.stringify(bankSettings));
    } catch {
      // ignore
    }
  }, [bankSettings]);

  // Search & Feedback States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Add Fee Item Form States (in 'items' tab)
  const [newFeeTitle, setNewFeeTitle] = useState<string>('');
  const [newFeeCategory, setNewFeeCategory] = useState<FeeCategory>('Học phí');
  const [newFeeUnitPrice, setNewFeeUnitPrice] = useState<string>('150000');
  const [newFeeQuantity, setNewFeeQuantity] = useState<string>('1');
  const [newFeeUnit, setNewFeeUnit] = useState<FeeUnit>('Tháng');
  const [newFeeMandatory, setNewFeeMandatory] = useState<boolean>(true);
  const [newFeeDefaultChecked, setNewFeeDefaultChecked] = useState<boolean>(true);
  const [newFeeNote, setNewFeeNote] = useState<string>('');
  const [feeFormError, setFeeFormError] = useState<string>('');

  // Quick Add Student Row States (at the bottom of the numbered table)
  const [quickStuName, setQuickStuName] = useState<string>('');
  const [quickParentName, setQuickParentName] = useState<string>('');
  const [quickParentPhone, setQuickParentPhone] = useState<string>('');
  const [bulkNamesText, setBulkNamesText] = useState<string>('');

  // Receipt Preview Modal State
  const [receiptToPreview, setReceiptToPreview] = useState<PaymentTransaction | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Toggle participation checkbox for (studentId, feeItemId)
  const handleToggleStudentFeeCheck = (studentId: string, feeItemId: string) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        const current = stu.itemStates[feeItemId] || { checked: false };
        return {
          ...stu,
          itemStates: {
            ...stu.itemStates,
            [feeItemId]: {
              ...current,
              checked: !current.checked,
            },
          },
        };
      })
    );
  };

  // Check or uncheck ALL fee items for a single student row
  const handleSetAllItemsForStudent = (studentId: string, checkValue: boolean) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        const nextStates = { ...stu.itemStates };
        feeItems.forEach((fee) => {
          const cur = nextStates[fee.id] || { checked: false };
          nextStates[fee.id] = {
            ...cur,
            checked: checkValue,
          };
        });
        return { ...stu, itemStates: nextStates };
      })
    );
  };

  // Check or uncheck an entire column (fee item) across all students in the class
  const handleSetEntireFeeColumn = (feeItemId: string, checkValue: boolean) => {
    setStudents((prev) =>
      prev.map((stu) => {
        const cur = stu.itemStates[feeItemId] || { checked: false };
        return {
          ...stu,
          itemStates: {
            ...stu.itemStates,
            [feeItemId]: {
              ...cur,
              checked: checkValue,
            },
          },
        };
      })
    );
  };

  // Add a new clear fee item column to the class
  const handleAddFeeItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newFeeTitle.trim();
    const uPrice = Math.max(0, Number(newFeeUnitPrice) || 0);
    const qty = Math.max(1, Number(newFeeQuantity) || 1);
    const totalAmt = uPrice * qty;

    if (!cleanTitle) {
      setFeeFormError('Vui lòng nhập tên mục tiền cần thu (VD: Tiền nước uống học kỳ 1).');
      return;
    }
    if (totalAmt <= 0) {
      setFeeFormError('Số tiền của mục thu phải lớn hơn 0 ₫.');
      return;
    }

    const newFeeId = `fee-${Date.now()}`;
    const createdFee: ClassFeeItem = {
      id: newFeeId,
      title: cleanTitle,
      category: newFeeCategory,
      unitPrice: uPrice,
      quantity: qty,
      unit: newFeeUnit,
      amount: totalAmt,
      isMandatory: newFeeMandatory,
      note: newFeeNote.trim(),
    };

    setFeeItems((prev) => [...prev, createdFee]);
    setStudents((prev) =>
      prev.map((stu) => ({
        ...stu,
        itemStates: {
          ...stu.itemStates,
          [newFeeId]: { checked: newFeeDefaultChecked },
        },
      }))
    );

    setNewFeeTitle('');
    setNewFeeUnitPrice('150000');
    setNewFeeQuantity('1');
    setNewFeeNote('');
    setFeeFormError('');
    triggerFeedback(
      `Đã thêm mục tiền "${cleanTitle}" (${formatVND(totalAmt)}) vào bảng thu lớp ${className}.`
    );
  };

  const handleDeleteFeeItem = (feeId: string, title: string) => {
    setFeeItems((prev) => prev.filter((f) => f.id !== feeId));
    triggerFeedback(`Đã xóa mục tiền "${title}" khỏi bảng thu.`);
  };

  // Add a single new student at the end of the numbered list (1, 2, 3, 4...)
  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = quickStuName.trim();
    if (!cleanName) return;

    const nextNumber = students.length + 1;
    const defaultStates: Record<string, { checked: boolean }> = {};
    feeItems.forEach((f) => {
      defaultStates[f.id] = { checked: f.isMandatory };
    });

    const newStu: ClassStudent = {
      id: `stu-${Date.now()}`,
      studentCode: `HS${String(nextNumber).padStart(2, '0')}`,
      fullName: cleanName,
      parentName: quickParentName.trim() || 'Phụ huynh HS',
      parentPhone: quickParentPhone.trim() || '',
      itemStates: defaultStates,
    };

    setStudents((prev) => [...prev, newStu]);
    setQuickStuName('');
    setQuickParentName('');
    setQuickParentPhone('');
    triggerFeedback(`Đã thêm học sinh STT ${nextNumber}: ${cleanName}.`);
  };

  // Bulk add students from newline-separated list
  const handleBulkAddStudents = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkNamesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const startIdx = students.length;
    const createdStudents: ClassStudent[] = lines.map((line, idx) => {
      const orderNum = startIdx + idx + 1;
      const defaultStates: Record<string, { checked: boolean }> = {};
      feeItems.forEach((f) => {
        defaultStates[f.id] = { checked: f.isMandatory };
      });
      return {
        id: `stu-bulk-${Date.now()}-${idx}`,
        studentCode: `HS${String(orderNum).padStart(2, '0')}`,
        fullName: line,
        parentName: 'Phụ huynh HS',
        parentPhone: '',
        itemStates: defaultStates,
      };
    });

    setStudents((prev) => [...prev, ...createdStudents]);
    setBulkNamesText('');
    setActiveView('matrix');
    triggerFeedback(
      `Đã thêm ${createdStudents.length} học sinh mới vào danh sách lớp ${className}.`
    );
  };

  const handleDeleteStudent = (studentId: string, fullName: string) => {
    setStudents((prev) =>
      prev
        .filter((s) => s.id !== studentId)
        .map((s, idx) => ({
          ...s,
          studentCode: `HS${String(idx + 1).padStart(2, '0')}`,
        }))
    );
    triggerFeedback(`Đã xóa học sinh ${fullName} và đánh lại số thứ tự 1, 2, 3...`);
  };

  // Open Receipt & QR Modal for a student based on their participating (checked) items
  const handleOpenStudentReceipt = (student: ClassStudent, orderNumber: number) => {
    const participatingItems = feeItems.filter((f) => student.itemStates[f.id]?.checked);

    const paidItemsSummary = participatingItems.map((f) => {
      const st = student.itemStates[f.id];
      const amt = st?.customAmount !== undefined ? st.customAmount : f.amount;
      return {
        lineItemId: f.id,
        title: f.title,
        category: f.category,
        amountPaid: amt,
      };
    });

    const totalAmt = paidItemsSummary.reduce((sum, i) => sum + i.amountPaid, 0);

    setReceiptToPreview({
      id: `rcpt-${student.id}`,
      receiptCode: `PT-${className}-STT${String(orderNumber).padStart(2, '0')}`,
      studentId: student.id,
      studentOrderNumber: orderNumber,
      studentCode: `STT ${orderNumber} (${student.studentCode})`,
      studentName: student.fullName,
      className,
      payerName: student.parentName || `Phụ huynh em ${student.fullName}`,
      paidAt: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Chuyển khoản QR',
      note: `Các khoản thu tham gia của học sinh STT ${orderNumber} — ${student.fullName}`,
      paidItems: paidItemsSummary,
      totalPaid: totalAmt,
    });
  };

  // Numbered students (1, 2, 3, 4...) with participation summary
  const numberedStudentsWithSummary = useMemo(() => {
    return students.map((stu, idx) => ({
      student: stu,
      orderNumber: idx + 1,
      summary: getStudentRowSummary(stu, feeItems),
    }));
  }, [students, feeItems]);

  const visibleStudents = useMemo(() => {
    return numberedStudentsWithSummary.filter(({ student, orderNumber }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchOrder = String(orderNumber) === q;
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchParent = student.parentName.toLowerCase().includes(q);
        if (!matchOrder && !matchName && !matchParent) return false;
      }
      return true;
    });
  }, [numberedStudentsWithSummary, searchQuery]);

  // Class-wide Totals based on student participation (Used in 'Tổng hợp thu' tab)
  const classTotals = useMemo(() => {
    let totalClassAmount = 0;

    const perFeeItemStats: Record<
      string,
      {
        participatingCount: number;
        totalStudentsCount: number;
        totalItemAmount: number;
      }
    > = {};

    feeItems.forEach((f) => {
      perFeeItemStats[f.id] = {
        participatingCount: 0,
        totalStudentsCount: students.length,
        totalItemAmount: 0,
      };
    });

    numberedStudentsWithSummary.forEach(({ student, summary }) => {
      totalClassAmount += summary.totalParticipatingAmount;

      feeItems.forEach((f) => {
        const st = student.itemStates[f.id];
        if (st?.checked) {
          const amt = st?.customAmount !== undefined ? st.customAmount : f.amount;
          perFeeItemStats[f.id].participatingCount += 1;
          perFeeItemStats[f.id].totalItemAmount += amt;
        }
      });
    });

    const standardTotalPerStudent = feeItems.reduce((s, f) => s + f.amount, 0);
    const averagePerStudent =
      students.length > 0 ? Math.round(totalClassAmount / students.length) : 0;

    return {
      totalClassAmount,
      perFeeItemStats,
      standardTotalPerStudent,
      averagePerStudent,
    };
  }, [numberedStudentsWithSummary, feeItems, students.length]);

  // Export CSV
  const handleExportCSV = () => {
    const feeHeaders = feeItems.map((f, i) => `"Khoản ${i + 1}: ${f.title} (${f.amount}đ)"`);
    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Phụ huynh',
      'SĐT',
      ...feeHeaders,
      'Số khoản tham gia',
      'Tổng tiền phải đóng (VNĐ)',
    ];

    const rows = numberedStudentsWithSummary.map(({ student, orderNumber, summary }) => {
      const feeCells = feeItems.map((f) => {
        const st = student.itemStates[f.id];
        return st?.checked ? `"Có tham gia (${f.amount})"` : `"Không tham gia (0)"`;
      });

      return [
        orderNumber,
        `"${student.fullName}"`,
        `"${student.parentName}"`,
        `"${student.parentPhone}"`,
        ...feeCells,
        `"${summary.checkedCount}/${summary.totalItemsCount}"`,
        summary.totalParticipatingAmount,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bang-thu-lop-${className}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerFeedback(`Đã xuất file Excel (CSV) bảng thu của Lớp ${className}.`);
  };

  const handleResetDemoData = () => {
    setClassName('10A1');
    setFeeItems(INITIAL_CLASS_FEE_ITEMS);
    setStudents(INITIAL_CLASS_STUDENTS);
    setBankSettings(INITIAL_BANK_QR_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CLASS_NAME);
    localStorage.removeItem(STORAGE_KEYS.FEE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.BANK_QR);
    triggerFeedback('Đã khôi phục dữ liệu mẫu ban đầu của lớp.');
  };

  const calculatedNewFeeAmount =
    Math.max(0, Number(newFeeUnitPrice) || 0) * Math.max(1, Number(newFeeQuantity) || 1);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#matrix"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('matrix');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          ThuChiEdu
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('matrix')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeView === 'matrix'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Bảng thu của lớp
          </button>
          <button
            type="button"
            onClick={() => setActiveView('summary')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeView === 'summary'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Tổng hợp thu
          </button>
          <button
            type="button"
            onClick={() => setActiveView('items')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeView === 'items'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Cấu hình mục tiền ({feeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('students')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeView === 'students'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Danh sách lớp ({students.length})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (CSV)
          </button>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => setActiveView('matrix')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeView === 'matrix' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Bảng thu của lớp
        </button>
        <button
          type="button"
          onClick={() => setActiveView('summary')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeView === 'summary' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Tổng hợp thu
        </button>
        <button
          type="button"
          onClick={() => setActiveView('items')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeView === 'items' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Mục tiền ({feeItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveView('students')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
            activeView === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Danh sách ({students.length})
        </button>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5 no-print">
        {/* Feedback Toast */}
        {feedbackBanner && (
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-slate-400 hover:text-white ml-4"
            >
              Đóng
            </button>
          </div>
        )}

        {/* =====================================================================
            MỤC 1: BẢNG THU CỦA LỚP (CHỈ HIỆN Ô TÍCH CHỌN HỌC SINH CÓ THAM GIA KHOẢN THU)
           ===================================================================== */}
        {activeView === 'matrix' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Compact Top Header inside the Table Card */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
              <div className="flex flex-wrap items-center gap-3">
                {/* Editable Class Name */}
                {isEditingClassName ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-slate-900">Lớp:</span>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      onBlur={() => setIsEditingClassName(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingClassName(false);
                      }}
                      autoFocus
                      className="px-2 py-0.5 text-base font-bold text-blue-700 bg-blue-50 border border-blue-300 rounded w-24 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-lg font-bold text-slate-900">
                      Bảng Tích Chọn Tham Gia Khoản Thu — Lớp {className}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingClassName(true)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Đổi tên lớp"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span className="text-xs text-slate-500">
                  · Sĩ số: <strong className="font-mono tabular-nums text-slate-800">{students.length}</strong> học sinh · Tích chọn những khoản học sinh có tham gia
                </span>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm STT (1, 2, 3...) hoặc tên HS..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Pure Student List (1, 2, 3, 4...) & Participation Checkboxes Only */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                    {/* Column 1: STT 1, 2, 3, 4... */}
                    <th className="py-3 px-3 w-14 text-center font-bold text-slate-900 border-r border-slate-200">
                      STT
                    </th>

                    {/* Column 2: Student Name */}
                    <th className="py-3 px-3.5 min-w-[210px] font-bold text-slate-900 border-r border-slate-200">
                      <div>Họ và tên học sinh</div>
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        Xếp thứ tự 1, 2, 3, 4...
                      </div>
                    </th>

                    {/* Fee Participation Columns */}
                    {feeItems.map((fee, idx) => {
                      const colStat = classTotals.perFeeItemStats[fee.id];
                      const allChecked =
                        colStat &&
                        colStat.totalStudentsCount > 0 &&
                        colStat.participatingCount === colStat.totalStudentsCount;

                      return (
                        <th
                          key={fee.id}
                          className="py-2.5 px-2.5 min-w-[130px] border-r border-slate-200 align-top bg-slate-50/90 text-center"
                        >
                          <div className="text-[10px] font-mono tabular-nums font-semibold text-blue-700">
                            Khoản {idx + 1}
                          </div>

                          <div
                            className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-2"
                            title={fee.title}
                          >
                            {fee.title}
                          </div>

                          <div className="font-mono tabular-nums text-xs font-bold text-slate-700 mt-0.5">
                            {formatVND(fee.amount)}
                          </div>

                          <div className="mt-1.5 pt-1 border-t border-slate-200/80 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetEntireFeeColumn(fee.id, !allChecked)}
                              className="text-[10px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              {allChecked ? (
                                <>
                                  <CheckSquare className="w-3 h-3 text-emerald-600" />
                                  Bỏ chọn
                                </>
                              ) : (
                                <>
                                  <Square className="w-3 h-3" />
                                  Chọn cả cột
                                </>
                              )}
                            </button>
                            <span className="text-[10px] font-mono tabular-nums text-slate-500">
                              {colStat?.participatingCount || 0}/{students.length}
                            </span>
                          </div>
                        </th>
                      );
                    })}

                    {/* Compact Action Column for Receipt */}
                    <th className="py-3 px-3 text-center min-w-[115px] font-bold text-slate-900">
                      Phiếu & QR
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-xs">
                  {visibleStudents.map(({ student, orderNumber, summary }) => {
                    const isAllSelected =
                      summary.totalItemsCount > 0 &&
                      summary.checkedCount === summary.totalItemsCount;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                        {/* STT: 1, 2, 3, 4... */}
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-sm font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                          {orderNumber}
                        </td>

                        {/* Student Full Name + Quick Select All Row */}
                        <td className="py-2.5 px-3.5 border-r border-slate-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {student.fullName}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleSetAllItemsForStudent(student.id, !isAllSelected)
                              }
                              className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                            >
                              {isAllSelected ? 'Bỏ chọn hết' : 'Chọn hết'}
                            </button>
                          </div>
                        </td>

                        {/* Pure Participation Checkbox Only (No Paid/Unpaid labels) */}
                        {feeItems.map((fee) => {
                          const st = student.itemStates[fee.id] || { checked: false };
                          const isChecked = !!st.checked;

                          return (
                            <td
                              key={fee.id}
                              onClick={() => handleToggleStudentFeeCheck(student.id, fee.id)}
                              className={`py-2.5 px-2 border-r border-slate-200 text-center cursor-pointer select-none transition-colors ${
                                isChecked
                                  ? 'bg-emerald-50/40 hover:bg-emerald-50/80'
                                  : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="inline-flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  aria-label={`${student.fullName} tham gia ${fee.title}`}
                                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </div>
                            </td>
                          );
                        })}

                        {/* Print Receipt & QR Button */}
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentReceipt(student, orderNumber)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center justify-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            Phiếu & QR
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Quick Add Next Student Row (STT N+1) directly at bottom of list */}
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-xs font-bold text-blue-700 border-r border-slate-200">
                      {students.length + 1}
                    </td>
                    <td colSpan={feeItems.length + 2} className="py-2 px-3.5">
                      <form
                        onSubmit={handleQuickAddStudent}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="text"
                          value={quickStuName}
                          onChange={(e) => setQuickStuName(e.target.value)}
                          placeholder={`+ Nhập tên học sinh STT ${students.length + 1}...`}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Thêm học sinh số {students.length + 1}
                        </button>
                      </form>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            MỤC 2: TỔNG HỢP THU (TÍNH TỔNG TIỀN THEO CÁC KHOẢN HỌC SINH THAM GIA)
           ===================================================================== */}
        {activeView === 'summary' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Báo cáo tổng hợp tự động theo các mục học sinh tham gia của Lớp {className}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Tổng Hợp Thu Tiền — Lớp {className}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('matrix')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  ← Quay lại Bảng tích chọn
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất báo cáo Excel (CSV)
                </button>
              </div>
            </div>

            {/* 4-Column Summary KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-medium text-slate-500">
                  Tổng tiền thu cả lớp (Theo mục tham gia)
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
                  {formatVND(classTotals.totalClassAmount)}
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  Tổng cộng từ {students.length} học sinh trong lớp
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-medium text-slate-500">
                  Định mức nếu tham gia đủ {feeItems.length} khoản
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {formatVND(classTotals.standardTotalPerStudent)}
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  Mức tối đa cho 1 học sinh
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-medium text-slate-500">
                  Trung bình mỗi học sinh
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {formatVND(classTotals.averagePerStudent)}
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  Tính theo các khoản thực tế tham gia
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-medium text-slate-500">
                  Quy mô lớp & Khoản thu
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                  {students.length} HS · {feeItems.length} khoản
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  Lớp {className}
                </div>
              </div>
            </div>

            {/* Section 1: Tổng hợp thu theo từng khoản tiền */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">
                  1. Tổng Hợp Số Học Sinh Tham Gia & Thành Tiền Theo Từng Khoản Thu ({feeItems.length} khoản)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-3 px-4 w-20">Khoản</th>
                      <th className="py-3 px-4">Tên mục tiền khoản thu</th>
                      <th className="py-3 px-4 text-right">Mức thu / 1 HS</th>
                      <th className="py-3 px-4 text-center">Số HS tham gia</th>
                      <th className="py-3 px-4 text-right">Thành tiền (Số HS × Mức thu)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {feeItems.map((fee, idx) => {
                      const st = classTotals.perFeeItemStats[fee.id];
                      return (
                        <tr key={fee.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600 text-xs">
                            Khoản {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{fee.title}</div>
                            <div className="text-xs text-slate-500">
                              {fee.category} · {fee.isMandatory ? 'Bắt buộc' : 'Tự nguyện'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatVND(fee.amount)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums text-xs">
                            <span className="font-bold text-slate-900">
                              {st?.participatingCount || 0}
                            </span>{' '}
                            / {students.length} HS
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                            {formatVND(st?.totalItemAmount || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                      <td colSpan={4} className="py-3 px-4 text-right">
                        TỔNG CỘNG TOÀN LỚP {className}:
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                        {formatVND(classTotals.totalClassAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section 2: Tổng hợp thu theo từng học sinh (1, 2, 3, 4...) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">
                  2. Tổng Hợp Số Tiền Phải Đóng Theo Từng Học Sinh (STT 1 → {students.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-3 px-4 w-14 text-center">STT</th>
                      <th className="py-3 px-4">Họ và tên học sinh</th>
                      <th className="py-3 px-4 text-center">Số khoản tham gia</th>
                      <th className="py-3 px-4 text-right">Tổng số tiền phải đóng</th>
                      <th className="py-3 px-4 text-right">Phiếu thu & QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {numberedStudentsWithSummary.map(({ student, orderNumber, summary }) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-900">
                          {orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-xs text-slate-500">
                            PH: {student.parentName}
                            {student.parentPhone ? ` · ${student.parentPhone}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-xs">
                          <span className="font-bold text-slate-900">{summary.checkedCount}</span> / {summary.totalItemsCount} khoản
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {formatVND(summary.totalParticipatingAmount)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentReceipt(student, orderNumber)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            Phiếu & QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold text-xs sm:text-sm">
                      <td colSpan={3} className="py-3 px-4 text-right text-slate-800">
                        TỔNG CỘNG CẢ LỚP:
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700">
                        {formatVND(classTotals.totalClassAmount)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MỤC 3: CẤU HÌNH & THÊM TỪNG MỤC TIỀN (TÁCH RIÊNG KHỎI BẢNG THU)
           ===================================================================== */}
        {activeView === 'items' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Thêm Mục Tiền Mới Cho Lớp {className}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mỗi mục tiền bạn thêm sẽ tạo thành một cột tích chọn tham gia trên Bảng thu của lớp.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Mẫu nhanh:
                  </span>
                  {QUICK_FEE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewFeeTitle(preset.title);
                        setNewFeeCategory(preset.category);
                        setNewFeeUnitPrice(String(preset.unitPrice));
                        setNewFeeQuantity(String(preset.quantity));
                        setNewFeeUnit(preset.unit);
                        setNewFeeMandatory(preset.isMandatory);
                        setNewFeeNote(preset.note);
                        setFeeFormError('');
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      + {preset.title} ({formatShortVND(preset.unitPrice * preset.quantity)})
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleAddFeeItem}
                className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
              >
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Tên mục tiền cần thu <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFeeTitle}
                    onChange={(e) => {
                      setNewFeeTitle(e.target.value);
                      if (feeFormError) setFeeFormError('');
                    }}
                    placeholder="VD: Tiền ăn bán trú tháng 11 / Quỹ lớp..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Nhóm khoản thu
                  </label>
                  <select
                    value={newFeeCategory}
                    onChange={(e) => setNewFeeCategory(e.target.value as FeeCategory)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    {FEE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Đơn giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newFeeUnitPrice}
                    onChange={(e) => setNewFeeUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4. Số lượng & ĐVT
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={newFeeQuantity}
                      onChange={(e) => setNewFeeQuantity(e.target.value)}
                      className="w-14 px-2 py-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-center"
                    />
                    <select
                      value={newFeeUnit}
                      onChange={(e) => setNewFeeUnit(e.target.value as FeeUnit)}
                      className="flex-1 px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {FEE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    5. Thành tiền / 1 HS
                  </label>
                  <div className="px-3 py-2 bg-slate-900 text-emerald-400 font-mono tabular-nums text-xs font-bold rounded-lg flex items-center justify-between">
                    <Calculator className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{formatVND(calculatedNewFeeAmount)}</span>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6. Ghi chú / Giải trình mục tiền
                  </label>
                  <input
                    type="text"
                    value={newFeeNote}
                    onChange={(e) => setNewFeeNote(e.target.value)}
                    placeholder="VD: Thu theo nghị quyết phụ huynh học kỳ 1..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-4 pb-1.5">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newFeeMandatory}
                      onChange={(e) => setNewFeeMandatory(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Khoản bắt buộc</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newFeeDefaultChecked}
                      onChange={(e) => setNewFeeDefaultChecked(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Tích tham gia sẵn cho cả lớp</span>
                  </label>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào bảng thu ({formatShortVND(calculatedNewFeeAmount)})
                  </button>
                </div>
              </form>

              {feeFormError && (
                <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {feeFormError}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Danh Sách Các Mục Tiền Hiện Có ({feeItems.length} mục)
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveView('matrix')}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  ← Quay lại Bảng thu của lớp
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-3 px-4 w-16">Thứ tự</th>
                      <th className="py-3 px-4">Tên mục tiền</th>
                      <th className="py-3 px-4">Nhóm · Tính chất</th>
                      <th className="py-3 px-4 text-right">Đơn giá × SL</th>
                      <th className="py-3 px-4 text-right">Số tiền / 1 HS</th>
                      <th className="py-3 px-4 text-right">Xóa mục</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {feeItems.map((fee, idx) => (
                      <tr key={fee.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-600">
                          Khoản {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{fee.title}</div>
                          {fee.note && <div className="text-slate-500 mt-0.5">{fee.note}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {fee.category} · {fee.isMandatory ? 'Bắt buộc' : 'Tự nguyện'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                          {formatVND(fee.unitPrice)} × {fee.quantity} {fee.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 text-sm">
                          {formatVND(fee.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteFeeItem(fee.id, fee.title)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            title="Xóa mục tiền này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MỤC 4: QUẢN LÝ DANH SÁCH HỌC SINH TRONG LỚP (1, 2, 3, 4...)
           ===================================================================== */}
        {activeView === 'students' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Nhập Nhanh Danh Sách Học Sinh Lớp {className} (Xếp thứ tự 1, 2, 3, 4...)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dán danh sách họ tên học sinh (mỗi học sinh 1 dòng) từ Excel/Word để thêm hàng loạt vào bảng thu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('matrix')}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  ← Quay lại Bảng thu của lớp
                </button>
              </div>

              <form onSubmit={handleBulkAddStudents} className="space-y-3">
                <textarea
                  rows={5}
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  placeholder={'Nguyễn Văn An\nTrần Thị Bích Ngọc\nLê Hoàng Nam'}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    + Thêm vào danh sách lớp (Bắt đầu từ STT {students.length + 1})
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Danh Sách Học Sinh Hiện Tại ({students.length} học sinh)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-2.5 px-4 w-16 text-center">STT</th>
                      <th className="py-2.5 px-4">Họ và tên học sinh</th>
                      <th className="py-2.5 px-4">Phụ huynh</th>
                      <th className="py-2.5 px-4">Số điện thoại</th>
                      <th className="py-2.5 px-4 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.map((stu, idx) => (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-center font-mono tabular-nums font-bold text-slate-900">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {stu.fullName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{stu.parentName}</td>
                        <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                          {stu.parentPhone || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(stu.id, stu.fullName)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-8 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            ThuChiEdu — Quản Lý Khoản Thu Học Sinh Lớp {className}
          </div>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục dữ liệu mẫu ban đầu
          </button>
        </div>
      </footer>

      {/* Printable Receipt & QR Code Modal */}
      <ReceiptPreviewModal
        transaction={receiptToPreview}
        bankSettings={bankSettings}
        onUpdateBankSettings={setBankSettings}
        onClose={() => setReceiptToPreview(null)}
      />
    </div>
  );
}

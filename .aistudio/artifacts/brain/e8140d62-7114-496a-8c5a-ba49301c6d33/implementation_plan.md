# Cập Nhật Bảng Tích Chọn Học Sinh Tham Gia Khoản Thu — ThuChiEdu

Cấu hình lại **Bảng thu của lớp** để chỉ hiển thị thuần túy **ô tích chọn (`checkbox`) xác nhận học sinh có tham gia khoản thu đó hay không**, loại bỏ hoàn toàn các nhãn trạng thái *"Đã đóng"*, *"Chưa đóng"*, *"Miễn/KĐK"* trên bảng tích chọn để giao diện tối giản, rõ ràng và dễ thao tác.

### User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các phương án thiết kế mặc định đã được chuẩn hóa theo yêu cầu của bạn:

- **Hiển thị ô tích chọn trong Bảng thu của lớp**: Mỗi ô giao giữa Học sinh và Khoản thu chỉ hiển thị **duy nhất ô tích chọn (`[✓]`) căn giữa gọn gàng** (không hiện chữ *"Đã đóng"*, *"Chưa đóng"* hay nhãn phụ bên trong ô).
- **Loại bỏ bộ lọc Đã đóng / Chưa đóng ở Bảng tích chọn**: Thanh công cụ phía trên bảng thu chỉ giữ tiêu đề lớp, tổng sĩ số và ô tìm kiếm học sinh; bỏ các nút lọc *"Đã tích đủ / Đóng 1 phần / Chưa đóng"*.
- **Cách tính Tổng hợp thu & Phiếu thu**: Tổng số tiền của mỗi học sinh và của cả lớp được tính trực tiếp dựa trên **các khoản thu mà học sinh được tích chọn tham gia**.

---

### 1. Overview & Core Concept

- **What It Does**: Biến **Bảng thu của lớp** thành ma trận đăng ký/tham gia khoản thu theo danh sách học sinh từ `1, 2, 3, 4...`. Giáo viên hoặc thủ quỹ chỉ cần tích chọn những khoản mà từng học sinh có tham gia.
- **Target Audience / Persona**: Giáo viên chủ nhiệm và Ban đại diện phụ huynh của một lớp học cần lập bảng danh sách học sinh tham gia từng khoản thu (học phí, bán trú, bảo hiểm, đồng phục, ngoại khóa...) và in phiếu thu/mã QR tương ứng.
- **Key Value**: Loại bỏ sự rối mắt của các trạng thái *"Đã đóng / Chưa đóng"* lặp lại ở mọi ô trong bảng, giúp bảng thu gọn như một bảng điểm danh tham gia khoản thu, nhìn được nhiều cột và nhiều học sinh cùng lúc.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Tích chọn tham gia khoản thu trên Bảng thu của lớp**:
     - Cột 1: Số thứ tự (`1, 2, 3, 4...`).
     - Cột 2: Họ và tên học sinh kèm nút thao tác nhanh *"Chọn hết"* / *"Bỏ chọn hết"* cho học sinh đó.
     - Các cột Khoản thu: Tiêu đề cột hiển thị tên khoản thu, mức tiền định mức và nút *"Chọn cả cột"* kèm số lượng học sinh tham gia (`X/Y HS`). Bên dưới, mỗi ô của học sinh **chỉ hiển thị một ô checkbox căn giữa** (tích = có tham gia, bỏ tích = không tham gia).
     - Cột cuối: Nút mở **Phiếu & QR** để xem trước và in phiếu thu gồm các khoản mà học sinh đó tham gia.
  2. **Xem Tổng hợp thu**:
     - Thống kê theo từng khoản thu: Số lượng học sinh tham gia × Định mức = Tổng thành tiền của khoản thu đó.
     - Thống kê theo từng học sinh (`1, 2, 3...`): Số khoản tham gia và Tổng số tiền cần đóng của từng em.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Phong cách bảng dữ liệu (Spreadsheet / SaaS Dashboard) hiện đại, sạch sẽ, ưu tiên khoảng trắng và đường kẻ mảnh (`1px solid #E2E8F0`).
  - *Color Palette & Mood*: Nền sáng trung tính (`--background: #F8FAFC`), bề mặt bảng trắng tinh (`#FFFFFF`), điểm nhấn màu xanh lam (`#2563EB`) và xanh ngọc (`#059669`) cho ô checkbox được tích chọn.
  - *Typography & Hierarchy*: `Plus Jakarta Sans` cho tiêu đề và tên học sinh; `JetBrains Mono` (`tabular-nums`) cho số thứ tự và toàn bộ số tiền.
  - *Component Styling & Layout*: Chiều cao dòng bảng thu gọn (`py-2`), toàn bộ ô tích chọn căn giữa đồng nhất, giúp tăng mật độ hiển thị trên màn hình.
- **Interactive Feedback & Motion**: Nhấp vào bất kỳ vị trí nào trong ô của khoản thu sẽ bật/tắt ngay trạng thái tham gia với phản hồi màu nền nhẹ nhàng (`hover:bg-slate-50`, khi tích có nền xanh nhạt tinh tế).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Tối giản ô tích chọn trong Bảng thu của lớp**
  - *Chosen Approach*: Chỉ hiển thị duy nhất ô checkbox căn giữa trong mỗi ô giao giữa học sinh và khoản thu; số tiền định mức đã được hiển thị rõ ở tiêu đề cột.
  - *Why*: Đáp ứng đúng yêu cầu bỏ phần *"Đã đóng"* và *"Chưa đóng"* ở bảng tích chọn, đồng thời giúp chiều rộng mỗi cột gọn hơn và chiều cao mỗi dòng thấp hơn.
  - *Alternatives Considered*: Giữ nhãn *"Tham gia / Không tham gia"* bằng chữ dưới mỗi ô — bị loại bỏ vì gây lặp chữ không cần thiết khi bản thân ô tích chọn đã thể hiện rõ.
- **Decision 2: Đồng bộ công thức tính theo các khoản tham gia**
  - *Chosen Approach*: Các mục được tích chọn (`checked = true`) đại diện cho các khoản học sinh có tham gia; tổng số tiền của học sinh bằng tổng các mục được tích chọn.
  - *Why*: Đảm bảo khi in **Phiếu & QR** hoặc xuất báo cáo **Tổng hợp thu**, số tiền của từng học sinh khớp chính xác với những ô đã tích trên bảng.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│                     ThuChiEdu Application State                          │
│  • Danh sách học sinh (1, 2, 3...) & Trạng thái tham gia từng khoản thu  │
│  • Danh mục các khoản thu của lớp & Cấu hình Ngân hàng / Mã QR           │
└───────────────────┬──────────────────────────────────┬───────────────────┘
                    │                                  │
                    ▼                                  ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│   Tab 1: Bảng Thu Của Lớp (Matrix)    │  │    Tab 2: Tổng Hợp Thu        │
│  • Thanh tìm kiếm & Sĩ số lớp         │  │  • Tổng tiền phải thu cả lớp  │
│  • Bảng STT 1,2,3 + Tên học sinh      │  │  • Bảng tổng hợp theo khoản   │
│  • Ô Checkbox thuần túy (Có tham gia) │  │    (Số HS tham gia × Mức thu) │
│  • Nút mở Phiếu & QR từng học sinh    │  │  • Bảng tổng tiền từng HS     │
└───────────────────┬───────────────────┘  └───────────────┬───────────────┘
                    │                                      │
                    └──────────────────┬───────────────────┘
                                       ▼
                    ┌──────────────────────────────────────┐
                    │   Modal Xem Trước Phiếu Thu & Mã QR  │
                    │  • Liệt kê các khoản HS có tham gia  │
                    │  • Hiển thị Ngân hàng, STK & QR lớn  │
                    └──────────────────────────────────────┘
```

- **Data Model & State**:
  - Trạng thái `checked` trong `itemStates[feeItemId]` của mỗi học sinh biểu thị việc học sinh **có tham gia** khoản thu đó.
  - Hàm tính tổng cho từng học sinh sẽ cộng các khoản thu có `checked === true` để tính ra số khoản tham gia và tổng số tiền phải đóng của học sinh đó.
- **Interactive Component & State Mapping**:
  - **Ô tích chọn đơn lẻ**: Nhấp vào ô hoặc checkbox sẽ đảo trạng thái `checked` của học sinh tại khoản thu đó.
  - **Nút "Chọn cả cột" / "Bỏ chọn" trên tiêu đề cột**: Tích chọn hoặc bỏ tích tham gia khoản thu đó cho toàn bộ học sinh trong lớp.
  - **Nút "Chọn hết" / "Bỏ chọn" tại dòng học sinh**: Tích chọn hoặc bỏ tích tất cả các khoản thu cho học sinh đó.
  - **Nút "Phiếu & QR"**: Mở hộp thoại xem trước phiếu thu liệt kê các khoản mà học sinh đó đã được tích chọn tham gia kèm tổng số tiền và mã QR chuyển khoản.

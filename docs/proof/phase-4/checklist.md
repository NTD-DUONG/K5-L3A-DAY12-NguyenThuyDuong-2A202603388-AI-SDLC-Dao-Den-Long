# Phase 4 — minh chứng phát hành

Ngày 21/11/2026, người học xác nhận: “tôi kiểm tra rồi, tất cả đều đạt”. Kết quả thao tác trực tiếp được ghi theo xác nhận này, không phải quan sát của công cụ AI.

- [x] Contract 1.3; 61/61 kiểm thử tự động đạt.
- [x] Benchmark GPU thật: 200 Bóng Mực, 100 đom đóm, 3 đèn; khởi động 3 giây, đo 30 giây. Trung bình 179,37 FPS; 1% low 73,46 FPS; p95 7,40 ms; tải 1614,44 ms. Đạt ngưỡng tham khảo; máy giảng viên cần đo lại.
- [x] Giữ hai lần benchmark trước; không loại khung chậm. Lần cuối hidden_ms = 0. RSS bản web là null.
- [x] Soak 10 đêm cùng tiến trình, seed 7–16: không crash; RSS 53,2383 → 59,4883 MB, tăng 11,74%. Cả 10 kết quả lost là dữ liệu thật.
- [x] Giải nén gói sạch, cài dependency, chạy 61/61 test đạt.
- [x] API leaderboard, lưu đĩa, top 10, thứ tự bằng điểm và xuất JSON đã kiểm thử tự động.
- [x] Người học xác nhận các chức năng đều đạt, bao gồm nhóm UI còn chờ: đổi/trùng phím, chữ lớn, cảnh báo, giảm chuyển động, lưu và xem bảng điểm.
- [x] README, LICENSE, CREDITS, CHANGELOG bốn phase, retro và harness đã có.
- [x] MP4 ghi canvas game thật bằng input tự động: 74,33 giây, 13.213.823 byte; metadata trong demo.json.
- [x] Tag phase-4 và v1.0.0; Release public có ZIP, SHA256, demo.mp4, bench.json và soak.json.
- [ ] Video chơi thủ công kèm chạy test/headless/bench: chưa có file bổ sung được cung cấp hoặc kiểm chứng. Xác nhận chức năng không làm thay đổi nội dung video tự động đang có.

Release: https://github.com/NTD-DUONG/K5-L3A-DAY12-NguyenThuyDuong-2A202603388-AI-SDLC-Dao-Den-Long/releases/tag/v1.0.0

Docker chưa được build trong môi trường công cụ; ZIP là bản chạy được đã cung cấp. Không khẳng định kết quả test ẩn hoặc số đo máy giảng viên. Token/chi phí thực chưa có thống kê.

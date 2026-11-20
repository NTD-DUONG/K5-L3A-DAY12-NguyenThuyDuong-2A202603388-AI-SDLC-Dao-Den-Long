# Nhật ký Phase 3

- Yêu cầu: Ticket-03 thay luật cốt lõi, không chỉ thêm tính năng. Đã đọc trạng thái repo và giữ các ảnh/tài liệu Phase2 đang chờ commit; không tự gắn tag Phase2 còn thiếu minh chứng.
- Quyết định: dầu dùng số nguyên1/60, capacity dẫn xuất; luồng cuối tick xét no_flames trước rồi dawn_survived theo ngưỡng. ADR-003 và CHANGELOG.md ghi mô hình và test bị thay.
- Đã triển khai: fuel/ever_lit/relit_count, refuel/relight, drain/target_lantern_id, điểm mới, thời lượng mới, capacity, màu dễ phân biệt và hiển thị dầu/đèn tắt.
- Kiểm chứng:55/55test,9scenario JSONL chạy hai lần giống hệt, kiểm tra event trọng yếu và benchmark3đêm. Xem docs/proof/phase-3.
- Lỗi phát hiện qua regression: test hết choáng mong chase là luật cũ; Ticket-03 yêu cầu wander nên đã đổi và ghi lý do, không skip test.
- Rà soát UI: thanh dầu quay về camera, mũi tên vẫn ưu tiên đèn tắt như yêu cầu cũ; khi không còn đèn tắt thì hướng tới đèn yếu. Tùy chọn dễ phân biệt không vào lõi/headless.
- Chưa kiểm chứng trực tiếp bằng trình duyệt: thanh dầu/blink1Hz, giấy rách/xẹp, màu và lưu cài đặt; cần người học chơi thử và cung cấp ảnh. Không dùng ảnhPhase2 chứng minh luậtPhase3.
- Token/chi phí: chưa có số đo; không tự tạo con số. Chưa tag/push phase-3.

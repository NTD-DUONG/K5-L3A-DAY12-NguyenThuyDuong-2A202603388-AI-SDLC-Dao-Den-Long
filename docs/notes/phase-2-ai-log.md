# Nhật ký AI Phase 2

- Đã đọc và lưu nguyên văn Ticket-02 người học gửi.
- Phát hiện thiếu bảng số liệu chuẩn ở Phần 1 và bảng RGB mục 8. Đã hỏi người học bổ sung; chưa tự đoán các giá trị bắt buộc.
- Trong lúc chờ: lập acceptance criteria cho 8 mục tính năng; tạo dữ liệu bản đồ 3 đêm đúng các tọa độ được cung cấp; thêm 4 test dữ liệu bản đồ và cập nhật AGENTS.md/lệnh kiểm chứng.
- 4/4 test bản đồ đã chạy đạt. Dữ liệu bản đồ chưa tích hợp vào game; không có bằng chứng 3 đêm chơi được.
- Chưa đổi contract 1.0 hay tuning/gameplay Phase 1; chưa commit/tag/push Phase 2.
- Token/chi phí: chưa có số đo từ công cụ.

## Triển khai sau khi nhận đủ chuẩn

- Đã nhận bảng số liệu và RGB, lưu lại trong docs/requirements/phase-2-standard.md.
- Contract1.1 dùng tuning chuẩn; lõi mới tách tick/sim_tick, xử lý pause, dash, hit/drop/TTL, rơi/hồi sinh, pulse3D/đẩy15tick, shade AI/safe/recoil, drifter và charm,3địa hình/gió.
- Renderer nối cùng lõi cho menu/giới thiệu/3đêm/kết quả/BìnhMinh, settings localStorage, Web Audio, HUD và bản đồ/cooldown/mũi tên.
- Regression Phase1 được cập nhật có lý do: sức chứa20→10; pickup1,5→1 và thêm kiểm tra cao; nhặt không cộng điểm, nạp cộng10; thắngscenario848→948; pulse ngang→3D, đẩy ngay3m→4m/15tick; bất tử120→90tick và AI recoil mới làm thay đổi thời điểm va chạm tiếp. Tag phase-1 không đổi.
- Bộ kiểm chứng hiện có36test đạt; 8scenario chạy2lần giống hệt. Benchmark đủ3đêm với spawn/AI/gió mặc định và invuln kéo dài để không thua sớm. Báo cáo lưu máy/thời gian thực.
- Harness: npm run proof:phase2 sinh output và so byte; npm run check chạy regression, tính năng mới, cú pháp renderer. CI thêm npm ci.
- HTTP200 cho toàn bộ module phục vụweb; browser access host unavailable nên chưa chơi/nhìn/nghe trực tiếp hoặc đo FPS. Không ghi các mục đó đạt.
- Nút đo FPS đặt buffer1280×720 và đo30giây, hủy khi pause/chuyển tab/kết thúcđêm/menu; tải fileJSON để người học lưu bằng chứng.
- Chưa tag/push phase-2 vì còn kiểm chứng web/FPS. Các ghi chú ở phần đầu phản ánh lúc chưa nhận bảng chuẩn.

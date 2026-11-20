# Changelog

## Phase 3 — Contract v1.2

### Thay đổi phá vỡ tương thích

- Đêm 1/2/3 còn 240/270/300 giây, thay 300/330/360.
- Bỏ thắng ngay khi đủ đèn và reason all_lit. Thắng chỉ tại bình minh với ít nhất 3/5, 4/6, 5/7 đèn sáng, còn sống; reason dawn_survived.
- Đèn sáng hao dầu, có thể tắt, mất tiến độ nạp và chỉ cần 5 đom đóm để thắp lại.
- Đèn dưới 30 dầu không còn vùng an toàn; shade wander chọn đèn yếu và có trạng thái drain.
- Thay toàn bộ điểm cũ: nạp/refuel +5; thắp đầu +100, thắp lại +40; pulse +5 hoặc tổng +15 nếu mục tiêu đang drain; thắng +50+floor(fuel) mỗi đèn sáng và +50 mỗi ngọn lửa. Không thưởng thời gian.
- Sức chứa đầu đêm 10, thêm 2 mỗi lần thắp thành công, tối đa 20.
- Snapshot/scenario và events mở rộng theo contract v1.2; lantern_lit thêm relight, mới có refuel/lantern_out/fuel_drain.

### Hiển thị

- Thanh dầu trên đèn, nhấp nháy 1 Hz dưới 30.
- Đèn tắt xẹp 20% và có vết rách.
- Cài đặt bảng màu dễ phân biệt được lưu: viền/mắt shade xanh #00B3FF, cảnh báo trắng kèm ⚠.
- HUD và hướng dẫn chuyển sang giữ sáng tới bình minh, sức chứa động.

### Test bị thay thế và lý do

- tests/core.test.mjs: “last lamp wins once” đổi thành “all lamps stay playing until dawn”; điểm nạp từng phần 170→135 theo +5 thay +10; thời gian sau một giây 299→239; hết choáng kỳ vọng wander thay chase theo Ticket-03.
- tests/phase2.test.mjs: thời gian pause mặc định 300→240; số bước hết ba đêm 18000/19800/21600→14400/16200/18000; điểm thắng tick cuối đổi sang thưởng fuel. Vẫn kiểm tra no_flames ưu tiên.
- Các kiểm tra di chuyển, biên nhặt, dash, charm, drifter, fall, spawn, wind, định dạng/tất định giữ chạy. Không skip hoặc xóa âm thầm test.
- tests/phase3.test.mjs thêm kiểm tra nhiên liệu, drain, refuel, relight, sức chứa, ngưỡng và bình minh.
- Kết quả và ảnh Phase 1–2 giữ ở thư mục lịch sử tương ứng, không sửa output cũ thành kết quả v1.2.

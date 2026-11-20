# Bằng chứng Phase 2

Trạng thái: 36/36 test đạt. Đã xem 3 ảnh cũ có file trong repo và loạt 7 ảnh mới trong hội thoại, thể hiện menu, chơi/thắng Đêm1 và Đêm2, giới thiệu Đêm2 và chơi Đêm3. Chưa có màn Bình Minh hoặc phép đo FPS. Xem [bản minh chứng tổng hợp](minh-chung.md). Chưa đủ để chốt tag phase-2.

## Ảnh người học cung cấp — 20/11/2026

| File | Quan sát được |
|---|---|
| [Đang chơi](web-playing.png) | Đêm1,1/5đèn,1/10đom đóm, đồng hồ04:04, HUD/cooldown/mũi tên |
| [Tạm dừng](web-paused.png) | Có Tiếp tục, Chơi lại Đêm, Cài đặt, Về menu; chưa chứng minh hành vi từng nút |
| [Thắng Đêm1](web-night1-won.png) | ĐiểmĐêm1=1298, tổngđãthắng=1298, có nút Đêm tiếp theo |

Lỗi trong ảnh trước sửa: đồng hồ chồng điểm và nhãn mũi tên bị nghiêng. Đã sửa mã: đồng hồ là phần tử riêng trong bố cục grid ba cột; mũi tên chỉ xoay biểu tượng, nhãn nằm ngang và chuyển lên trên để không che Mây. Người học đã xác nhận “ok đc rồi” sau sửa. Chưa có ảnh mới hoặc xác nhận riêng kích thước1280×720.

- [x] Đồng hồ ở trên giữa, nhãn mũi tên nằm ngang sau sửa: người học xác nhận và loạt ảnh mới thể hiện rõ.
- [x] Có ảnh thắng Đêm1 và Đêm2; tổng điểm 1278+1444=2722 khớp ảnh.
- [x] Có ảnh giới thiệu Đêm2 và gameplay Đêm3 với1/7đèn.
- [ ] Lưu file gốc của loạt7ảnh mới vào repo; hiện chỉ có ảnh trong hội thoại.

## Tự động

- [x] Contract v1.1, tuning chuẩn, CLI nhận3đêm; regression từ Phase1 được cập nhật theo luật thay thế.
- [x] 36/36 test: regression, map/terrain, dash, pause, bùa, Gió Lạc, rơi/hồi sinh, drop, spawn, pulse3D và gió; xem tests/phase2.test.mjs và tests-report.txt. TTL hết hạn và mọi tổ hợp tương tác chưa được phủ hết.
- [x] 8 scenario tại tests/phase-2; output cùng tên trong thư mục này; chạy hai lần giống hệt từng byte.
- [x] Benchmark chạy đủ Đêm1/2/3:18000/19800/21600 bước; giữ spawn/AI/gió mặc định, chỉ bất tử kéo dài để tránh thua sớm. Thời gian và máy tại headless-summary.json; tất cả <=30giây.
- [ ] CI Linux chạy thành công và cài sạch macOS/Linux.
- [x] HTTP200 cho trang/module/CSS tại cổng5174, xem http-report.json. Chưa quan sát WebGL vì browser access host unavailable.

| Tính năng | Scenario/bằng chứng |
|---|---|
| Pause/tick-sim_tick/bộ đếm | pause.jsonl |
| Lướt | dash.jsonl |
| Bùa Gió | charm.jsonl |
| Gió Lạc cướp/thả | drifter-steal.jsonl, drifter-drop.jsonl |
| Rơi/hồi sinh | fall.jsonl |
| Bục nhảy | pad.jsonl |
| Gió Đêm3 | wind.jsonl |
| Hiệu năng headless | benchmark-night1/2/3.jsonl, headless-summary.json |

## Người học kiểm tra bản web

- [ ] Menu → giới thiệu/lời Ông Đăng → chơi; thắng qua Đêm2/3, kết thúc Bình Minh, tổng điểm đúng; thua chỉ chơi lại Đêm đang chơi.
- [ ] Đêm1 bán kính40, 5đèn; Đêm2 hai đảo/cầu/pad/6đèn; Đêm3 tầng/dốc/tháp/pad/7đèn đi được.
- [ ] Lướt Shift: giữ không tự lặp, có cooldown, lướt trên không giữ độ cao.
- [ ] Gió Lạc cướp một lần, pulse đuổi và thả; Bùa Gió đỏ viền vàng tăng tốc/lướt không hồi.
- [ ] Esc/P: tiếp tục, chơi lại Đêm, cài đặt, về menu; đổi tab tự dừng.
- [ ] Chỉnh âm lượng/độ nhạy rồi tải lại vẫn giữ; thực sự nghe và cảm nhận thay đổi.
- [ ] Nghe nhạc nền và đủ hiệu ứng: nhặt, đèn, pulse, hit, nhảy, dash, thắng/thua, shade sinh,10giây cuối.
- [ ] HUD đúng vị trí,10ô, cooldown, nhắc nạp, mũi tên đèn ngoài màn; đồng hồ <=30s đỏ/nhấp nháy.
- [ ] Gió Đêm3 có lá/âm thanh trước2giây và đẩy trong5giây.
- [ ] Lưu ảnh ở các đêm/trạng thái; so màu chuẩn và độ sáng tăng theo đèn.
- [ ] Đo FPS1280×720 bằng nút Cài đặt, lưu phase-2-fps.json; average_fps>=30.

## Giới hạn/giả định cần xem

Xem docs/notes/phase-2-spec.md: tầng0 tồn tại dưới các tầng cao để giữ điểm xuất phát(0,0,0); an toàn đẩy ngay ra ngoài là trong giới hạn30tick; trạng thái spawning tự chọn30tick, tốc độ wander2m/s vì bản ticket không nêu. RGB vật liệu đúng cấu hình không đồng nghĩa pixel ảnh bằng RGB sau chiếu sáng/tone mapping.

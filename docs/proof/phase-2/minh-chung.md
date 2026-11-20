# Minh chứng Phase 2 — Đảo Đèn Lồng

Ngày tổng hợp: 20/11/2026. Phạm vi: Ticket-02 và Test Contract v1.1.

Nguồn gồm kết quả chạy tự động đã lưu trong repo, ảnh người học gửi và xác nhận chơi thử. Ảnh tĩnh chỉ chứng minh trạng thái hiển thị, không thay thế phép đo FPS hoặc kiểm tra âm thanh.

## 1. Kết quả kiểm chứng tự động

Lệnh chạy:

```sh
npm run check
npm run proof:phase2
```

- **36/36 test đạt**, không có test thất bại. [Báo cáo chạy](tests-report.txt).
- Các test Phase 1 còn hiệu lực được chạy lại; các giá trị mong đợi thay đổi theo số liệu chuẩn Phase 2. Chi tiết thay đổi tại [nhật ký AI](../../notes/phase-2-ai-log.md).
- **8 scenario headless** được chạy hai lần cùng seed, scenario và inputs; output giống hệt từng byte. [Tổng hợp kết quả](headless-summary.json).
- CLI hỗ trợ ba đêm, snapshot/event/end theo contract v1.1. Các kiểm tra bao gồm tick/sim_tick khi pause, di chuyển, nhảy/lướt, nạp đèn/điểm, pulse 3D, miễn thương, rơi/hồi sinh, Bùa Gió, Gió Lạc, lịch spawn, bục nhảy và gió.

| Nội dung | Bằng chứng |
|---|---|
| Tạm dừng, tiếp tục, đóng băng thời gian/bộ đếm | [pause.jsonl](pause.jsonl) |
| Lướt | [dash.jsonl](dash.jsonl) |
| Nhặt Bùa Gió | [charm.jsonl](charm.jsonl) |
| Gió Lạc cướp và thả đom đóm | [drifter-steal.jsonl](drifter-steal.jsonl), [drifter-drop.jsonl](drifter-drop.jsonl) |
| Rơi, mất tài nguyên và hồi sinh | [fall.jsonl](fall.jsonl) |
| Bục nhảy sang đảo khác | [pad.jsonl](pad.jsonl) |
| Gió Đêm 3 | [wind.jsonl](wind.jsonl) |

## 2. Minh chứng chơi trực tiếp từ loạt 7 ảnh mới

Người học đã gửi loạt ảnh theo thứ tự dưới đây trong hội thoại. Các ảnh mới chưa có đường dẫn file để sao chép vào repo; cần bổ sung file gốc trước khi dùng tài liệu này làm bộ minh chứng độc lập trên GitHub. Các mô tả dưới đây ghi đúng nội dung quan sát được, không tự tạo ảnh hay kết quả.

| Ảnh trong hội thoại | Quan sát | Yêu cầu được hỗ trợ |
|---|---|---|
| A1 — Màn bắt đầu | Tiêu đề “Ba đêm giữ lửa”, nút Bắt đầu và Cài đặt | Có menu chính |
| A2 — Đang chơi Đêm 1 | 3/5 đèn, 10/10 đom đóm, 3 ngọn lửa, thời gian 02:40, điểm 600/tổng 0 | Hiển thị tiến độ đèn, sức chứa chuẩn và HUD trong gameplay |
| A3 — Thắng Đêm 1 | Điểm đêm 1278, tổng các đêm đã thắng 1278; nút Đêm tiếp theo | Có kết quả thắng và chuyển sang đêm kế tiếp; tổng sau đêm đầu bằng điểm đêm đầu |
| A4 — Giới thiệu Đêm 2 | “Đêm 2 · Hai bờ tre”, lời Ông Đăng và nút Vào Đêm 2 | Có màn giới thiệu đêm và lời nhân vật |
| A5 — Đang chơi Đêm 2 | 3/6 đèn, 0/10 đom đóm, thời gian 03:24, điểm 600/tổng 1278; bản đồ hai đảo | Đêm 2 có bản đồ riêng, tổng 6 đèn, giữ điểm đã thắng từ Đêm 1 |
| A6 — Thắng Đêm 2 | Điểm đêm 1444, tổng đã thắng 2722; nút Đêm tiếp theo | Kết quả Đêm 2 và cộng tổng đúng: **1278 + 1444 = 2722** |
| A7 — Đang chơi Đêm 3 | “Đêm 3 / Tháp Bình Minh”, 1/7 đèn, thời gian 04:49, điểm 200/tổng 2722; thấy tầng cao, dốc và bục nhảy | Đã chuyển tới gameplay Đêm 3, tổng 7 đèn, giữ tổng điểm hai đêm trước và thể hiện địa hình nhiều tầng |

Loạt ảnh mới cũng cho thấy **đồng hồ đã ở trên giữa**, số đèn/điểm ở bên phải, thanh 10 ô ở dưới giữa; biểu tượng mũi tên xoay trong khi nhãn tên đèn/khoảng cách vẫn nằm ngang. Người học đã xác nhận HUD ổn sau sửa.

Ảnh cũ đã có file trong repo:

- [Đang chơi trước sửa HUD](web-playing.png).
- [Tạm dừng với đủ bốn nút](web-paused.png).
- [Một lượt thắng Đêm 1 trước đó](web-night1-won.png): điểm 1298. Đây là **lượt chơi khác** với loạt ảnh mới có điểm 1278; không dùng 1298 để kiểm tra tổng 2722 ở loạt mới.

## 3. Hiệu năng headless

Máy đo theo báo cáo: Windows, Node.js v24.14.0, Intel Core i5-1135G7 @ 2.40GHz.

| Đêm | Số bước gameplay | Thời gian đã lưu | Ngưỡng |
|---|---:|---:|---|
| 1 | 18000 | 170,17 ms | <=30 giây — đạt phép đo này |
| 2 | 19800 | 221,63 ms | <=30 giây — đạt phép đo này |
| 3 | 21600 | 369,72 ms | <=30 giây — đạt phép đo này |

Benchmark giữ spawn/AI/gió mặc định, chỉ kéo dài bất tử để tránh kết thúc sớm do hết máu. Kết quả và cấu hình máy ở [headless-summary.json](headless-summary.json). Đây là thời gian xử lý **headless**, không phải FPS bản web.

## 4. Các mục chưa đủ bằng chứng

- Chưa có ảnh thắng Đêm 3/màn Bình Minh và tổng điểm cuối ba đêm.
- Chưa có file đo FPS bản web ở 1280×720; chưa kết luận đạt trung bình >=30 FPS.
- Chưa có xác nhận chơi trực tiếp về hành vi Gió Lạc, Bùa Gió, đủ hiệu ứng âm thanh và cài đặt còn lưu sau tải lại. Các test headless chỉ xác nhận phạm vi logic đã kiểm tra.
- Chưa xác nhận toàn bộ hành vi các nút tạm dừng, chơi lại đúng đêm, đồng hồ nhấp nháy khi <=30 giây và hiệu ứng báo gió bằng hình/âm thanh.
- Chưa đối chiếu trực tiếp mọi tọa độ/bán kính, toàn bộ màu với dung sai 10% hoặc kết quả cài sạch macOS/Linux; cấu hình và test hiện có không thay thế toàn bộ các kiểm tra này.
- Chưa có tag phase-2. Bản sửa HUD và minh chứng bổ sung cần được commit/push trước khi chốt tag.

## 5. Đánh giá hiện tại

Có bằng chứng tự động cho lõi và contract, cùng bằng chứng ảnh cho luồng menu → chơi/thắng Đêm 1 → giới thiệu/chơi/thắng Đêm 2 → chơi Đêm 3. Phép cộng tổng điểm hai đêm đã thắng khớp với ảnh. HUD đã được sửa và có ảnh sau sửa.

**Chưa kết luận Phase 2 hoàn tất toàn bộ** cho tới khi bổ sung các bằng chứng còn thiếu, đặc biệt màn Bình Minh và phép đo FPS. Không suy ra đạt test ẩn từ 36 test hiện có.

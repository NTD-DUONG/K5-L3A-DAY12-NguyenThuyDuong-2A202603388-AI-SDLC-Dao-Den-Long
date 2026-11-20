# Phase 2 — tiêu chí nghiệm thu và kế hoạch

Trạng thái: đã tích hợp contract1.1, lõi và renderer3đêm. Đã có kiểm chứng tự động; chưa xác nhận chơi trực tiếp/âm thanh/FPS. Ticket gốc tại docs/requirements/phase-2.txt; phần chuẩn bổ sung tại phase-2-standard.md.

## Dữ liệu đã bổ sung và giả định

- Người học đã gửi Phần1 số liệu chuẩn và mục8 RGB; đã dùng trong tuning/palette, không dùng số tự chọn Phase1.
- Lịch shade:2con tại tick300 mọi Đêm, sau đó1con mỗi khoảng480/420/360tick (cách đọc Phần1 cộng lịch từng đêm).
- Thời gian spawning30tick và tốc độ wander2m/s tự chọn vì bản gửi không quy định; scenario có state bỏ qua giai đoạn khởi tạo tương ứng.
- Giữ xuất phát(0,0,0) mọi đêm. Đêm3 tầng0 vẫn là mặt đất dưới các tầng cao; người chơi đi ra dưới đĩa trung tâm rồi dùng dốc/pad để lên. Vách chặn việc bước từ tầng thấp lên tầng cao.
- Vùng an toàn đẩy ra ngay là đáp ứng tối đa30tick; nếu nhiều vùng chồng nhau, dùng bước thoát ngoài hợp các vùng.
- Nhạc/âm thanh tạo bằng Web Audio từ thao tác bắt đầu của người chơi; không có asset tải ngoài.
- ttl_s null cho đom đóm thường (không TTL). Phần shade bị hit recoil được tính60bước sau hit; pulse đẩy15bước kể từ bước kích hoạt.
- Tên 3 đảo và lời Ông Đăng chưa có trong bản gửi; có thể viết lời giới thiệu riêng nếu bản đầy đủ không quy định.

## Tiêu chí nghiệm thu cho từng mục tính năng

| Mục | Tiêu chí kiểm tra được | Bằng chứng dự kiến |
|---|---|---|
| 1 Gió Lạc | Đêm 2/3 sinh ở sim_tick 1200, 2400… tối đa 2; idle/chase/flee/removed; chase khi mang >=5 và XZ <=15; cướp min(3,carried) tại <=1,2 m chỉ một lần; pulse đúng trạng thái thả lại đồ; không gây mất máu | Scenario chase/cướp/flee/pulse/drop, so snapshot/event và TTL |
| 2 Bùa Gió | Nhặt C1/C2 kích hoạt 600 tick, chạy 7,2; dash 14 m/s 12 tick, không hồi chiêu khi có bùa nhưng cần nhấn lại; hồi bùa 2700 tick | Scenario nhặt, hết hạn, dash giữ nút/nhấn lại, hồi bùa |
| 3 Chuỗi đêm | Menu → giới thiệu → chơi → kết quả → đêm kế; thua chơi lại cùng đêm; thắng đêm 3 hiện Bình Minh; tổng điểm chỉ cộng đêm đã thắng | Chơi thử 3 đêm và kiểm tra tổng điểm không cộng lượt thua/chơi lại |
| 4 Pause | Esc/P và input pause false→true dừng gameplay; tick tăng, sim_tick và mọi bộ đếm đứng; có tiếp tục/chơi lại/cài đặt/menu | Scenario pause/resume qua input + test web |
| 5 Cài đặt | Âm lượng và độ nhạy chuột có tác dụng, khôi phục sau mở lại | Chỉnh, tải lại, kiểm tra localStorage và tác động thực tế |
| 6 Âm thanh | Nhạc nền và đủ hiệu ứng nhặt/thắp/pulse/hit/nhảy/dash/thắng/thua/spawn/10 giây cuối; tôn trọng âm lượng | Nghe trực tiếp, checklist từng sự kiện |
| 7 HUD | Đúng vị trí, đồng hồ đỏ nhấp nháy <=30s; 10 ô, cooldown, nhắc nạp và mũi tên đèn gần nhất ngoài màn hình | Ảnh ở mốc thời gian/tài nguyên/cooldown và đèn ngoài camera |
| 8 Màu/ánh sáng | RGB cấu hình đúng bảng chuẩn; ambient = 0,15+0,55*lit/count | Đối chiếu palette và ảnh 0/n,n/n; cần chơi thử |

## Thay đổi đã triển khai so với Phase 1

- Đổi điểm nhặt sang điểm khi nạp (+10/đom đóm nạp), pulse +5/con/lần.
- Tách tick đầu ra và sim_tick; dùng thứ tự 12 bước bắt buộc trong ticket.
- Thay bản đồ tự chọn bằng dữ liệu 3 đêm; thêm địa hình, rơi, pad, gió và tháp.
- Đổi tuning chuẩn từ bảng đầy đủ; contract 1.1, --night 1/2/3, trường snapshot/scenario và event mới.
- Đổi trạng thái shade sang spawning/wander/chase/recoil/stunned.
- Test Phase 1 thay số mong đợi theo chuẩn mới, ghi rõ lý do thay; giữ tag phase-1 nguyên vẹn.

## Cổng kiểm chứng trước tag phase-2

- Mỗi tính năng mới có scenario headless thật, output và kết quả mong đợi.
- Regression toàn bộ kiểm chứng còn hiệu lực, chạy 2 lần kiểm tra tất định kể cả pause.
- Headless tối đa 21600 tick trong <=30 giây, lưu thời gian và cấu hình máy.
- Web trung bình >=30 FPS ở 1280x720, lưu số đo; không dùng test headless thay phép đo FPS.
- Người học chơi thử 3 đêm; lưu ảnh và trạng thái chưa đạt trung thực.
- Cập nhật AGENTS.md/harness và nhật ký AI; chỉ tag phase-2 khi đủ bằng chứng.

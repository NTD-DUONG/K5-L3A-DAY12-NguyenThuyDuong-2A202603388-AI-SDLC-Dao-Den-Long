# Minh chứng Phase 3 — Đèn cạn dầu

Ngày tổng hợp: 21/11/2026. Test Contract: v1.2.

## Nguồn và phạm vi

Minh chứng gồm báo cáo tự động đã lưu trong repo, hai ảnh Phase 3 người học gửi trong hội thoại và xác nhận chơi thử: “tôi thấy ok hết r”. Phần chơi trực tiếp dưới đây là kết quả do người học xác nhận; AI chưa tự điều khiển trình duyệt. Các thông số chính xác được đối chiếu bằng test/mã, không suy ra từ lời xác nhận chung hoặc ảnh tĩnh.

## 1. Thay đổi thiết kế

Đèn được mở rộng từ lit/deposited thành mô hình có nhiên liệu, lịch sử đã thắp và số lần thắp lại. Dầu lưu dưới dạng số nguyên theo đơn vị 1/60 để tránh sai số tích lũy. Điều kiện thắng chuyển từ thắp đủ đèn ngay lập tức sang giữ đủ số đèn sáng tại tick bình minh.

- [Quyết định thiết kế ADR-003](../../decisions/ADR-003-lantern-fuel.md).
- [Changelog và lý do cập nhật test cũ](../../../CHANGELOG.md).
- [Yêu cầu Phase 3 đã lưu](../../requirements/phase-3.md).

## 2. Kiểm chứng tự động

Đã chạy:

```sh
npm run check
npm run proof:phase3
```

Kết quả: **55/55 test đạt, không skip**; **9 scenario** chạy hai lần với cùng seed và đầu vào cho output giống hệt từng byte. Báo cáo: [tests-report.txt](tests-report.txt), [summary.json](summary.json).

| Yêu cầu | Cách kiểm chứng và kết quả | Bằng chứng |
|---|---|---|
| Nhiên liệu chính xác | Từ100dầu còn1đơn vị nội bộ sau5999bước, tắt đúng bước6000; pause giữ nguyên dầu | Test Phase3; [fuel-out.jsonl](fuel-out.jsonl), [pause-fuel.jsonl](pause-fuel.jsonl) |
| Châm dầu | Kiểm tra ceil phần thiếu, giới hạn100, trừ tài nguyên, điểm+5/mote và không tăng successful_lights | [refuel.jsonl](refuel.jsonl), test refuel/chọn đèn |
| Thắp lại | Đèn từng sáng cần5, nhận nạp từng phần, fuel trở lại100, relight:true, tăng relit_count và sức chứa | [relight-capacity.jsonl](relight-capacity.jsonl) |
| Hút dầu | Nhiều shade drain cộng dồn cùng hao tự nhiên; fuel_drain mỗi60sim_tick; pause dừng hút | [stacked-drain.jsonl](stacked-drain.jsonl), [pause-fuel.jsonl](pause-fuel.jsonl) |
| Vùng an toàn | Đúng30 còn bảo vệ, dưới30 không bảo vệ; châm lên>=30 đẩy shade và ngăn hit trong bước thoát | Test ngưỡng/refuel trong tests/phase3.test.mjs |
| Pulse vào drain | Mục tiêu đang drain nhận tổng15điểm, mục tiêu thường/đang choáng nhận5; vẫn choáng/đẩy theo luật còn hiệu lực | [pulse-drain.jsonl](pulse-drain.jsonl) |
| Bình minh | Không thắng sớm; cuối giờ cần3/5,4/6,5/7; hết máu ưu tiên thua; cạn dầu và tương tác ở tick cuối được xét trước kết quả | [dawn-survived.jsonl](dawn-survived.jsonl), [dawn-out.jsonl](dawn-out.jsonl), [last-tick-relight.jsonl](last-tick-relight.jsonl) |
| Sức chứa | Bắt đầu10, tăng2 mỗi lần thắp thành công, tối đa20; đèn đặt sẵn/refuel không tăng; reset mỗi Đêm | Test capacity và scenario relight-capacity |
| Điểm mới | Nạp/refuel+5, thắp đầu+100, thắp lại+40, pulse+5/+15, thưởng cuối theo floor(fuel)/đèn/máu; bỏ thưởng thời gian | Test điểm, output các scenario |
| Regression | Giữ kiểm tra di chuyển, input, dash, charm, drifter, rơi/hồi sinh, bản đồ, spawn, gió và định dạng; thay kỳ vọng cũ có ghi lý do | tests/core.test.mjs, tests/phase2.test.mjs, CHANGELOG.md |

## 3. Ảnh Phase 3 người học cung cấp

Hai ảnh mới được xem trực tiếp trong hội thoại, chưa có đường dẫn file gốc để sao chép vào repo. Bảng dưới mô tả ảnh, không đặt liên kết tới file chưa tồn tại.

| Ảnh | Quan sát được | Kết luận trong phạm vi ảnh |
|---|---|---|
| P3-A — Trước khi thắp đèn | Đêm1, đồng hồ03:36,3ngọn lửa,0/5đèn·cần3,điểm0,đang mang4/10 | HUD thể hiện ngưỡng thắng3/5 và sức chứa đầu10; nhặt đom đóm không cộng điểm |
| P3-B — Sau lần thắp đầu | Đồng hồ03:02,1/5đèn·cần3,điểm150,đang mang0/12; đèn sáng có thanh dầu và viền vùng an toàn | Sức chứa10→12; điểm thắp đầu khớp10×5+100=150; thanh dầu có hiển thị |

Ảnh tĩnh không tự chứng minh nhấp nháy1Hz, toàn bộ quá trình hút/châm dầu, cài đặt còn lưu sau tải lại hoặc kết quả tại bình minh.

## 4. Xác nhận chơi thử của người học

Sau khi xem checklist cần kiểm tra, người học xác nhận chung rằng các chức năng đều ổn. Ghi nhận **đạt theo xác nhận người học**, không diễn giải thành phép đo độc lập:

- Thanh dầu, đèn yếu/tắt và thắp lại hoạt động.
- Châm dầu và thay đổi sức chứa hoạt động.
- Luật giữ sáng tới bình minh hoạt động.
- Bóng Mực hút dầu và phản ứng với pulse/châm dầu hoạt động.
- Tùy chọn bảng màu dễ phân biệt hoạt động.

Các giá trị1Hz,20%,RGB và thời gian lưu/khôi phục không được đo riêng trong xác nhận này. Mã renderer dùng sim_tick%60<30 cho chu kỳ1Hz; đèn tắt scaleY0,64 so với0,8 lúc sáng; màu dễ phân biệt dùng #00B3FF cho mắt/viền, CSS cảnh báo trắng kèm⚠; checkbox được lưu cùng settings bằng localStorage. Đây là đối chiếu mã, không phải phép đo pixel hoặc xác nhận riêng sau khi tải lại.

## 5. Hiệu năng và giới hạn

Benchmark headless đã lưu đủ14400/16200/18000bước theo thời lượng mới240/270/300giây, tất cả dưới30giây, có thông tin máy trong summary.json. Benchmark này không phải FPS bản web; chưa có số đo FPS Phase3.

- Chưa lưu hai file ảnh gốc mới vào repo; cần bổ sung nếu muốn bộ minh chứng GitHub có thể xem độc lập hoàn toàn.
- Chưa có ảnh/video riêng của màn bình minh, màu dễ phân biệt hoặc đèn cạn/thắp lại.
- Chưa xác nhận độc lập toàn bộ thao tác lưu cài đặt qua tải lại hoặc đo chính xác màu/nhấp nháy trên màn hình.
- Không khẳng định đã đạt toàn bộ test ẩn. Tag phase-3 đã tồn tại cho mốc triển khai trước lần bổ sung minh chứng này; không viết lại tag cũ để thay lịch sử.

## 6. Đánh giá

Phần logic Phase3 có kiểm chứng tự động đạt trong các tình huống đã chạy. Hai ảnh hỗ trợ trạng thái trước/sau thắp đầu, thanh dầu, sức chứa và điểm mới; người học đã xác nhận các chức năng nhìn chung hoạt động. Các giới hạn về file ảnh, phép đo và kiểm chứng độc lập được giữ công khai ở trên.

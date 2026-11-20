# Minh chứng Phase 3 — Contract v1.2

Trạng thái:55/55test đạt,9scenario tất định; đã xem2ảnhPhase3 trong hội thoại và người học xác nhận các chức năng đều ổn ngày21/11/2026. AI chưa tự chơi trên trình duyệt. Xem [minh chứng tổng hợp](minh-chung.md); không kết luận đạt test ẩn.

## Kiểm tra lại theo yêu cầu chốt Phase 3

- Đã chạy lại npm run check:55/55 đạt, không skip; báo cáo đã cập nhật.
- Đã chạy lại npm run proof:phase3:9scenario cùng đầu vào có output giống hệt và cả3đêm hoàn tất dưới30giây.
- Đã thử kết nối trình duyệt bằng công cụ computer-use: lỗi browser access host unavailable. Không thể tự chơi, chụp ảnh hoặc xác nhận hình ảnh/blink/màu trong lần này.
- Rà soát mã renderer: có thanh dầu hướng camera, nhấp nháy theo sim_tick%60<30, đèn tắt scaleY0,64 so với0,8 lúc sáng (giảm20%), có vết rách và checkbox màu được lưu trong localStorage. Đây là kiểm tra mã, không phải bằng chứng đã thấy trên trình duyệt.
- Mốc phase-3 ghi nhận bản triển khai với kiểm chứng tự động; các ô web bên dưới còn chờ, không coi việc gắn tag là chứng minh đã đạt chúng.

## Tự động đã chạy

- [x] Contract v1.2 và tuning chuẩn; snapshot/scenario mở rộng.
- [x] Đèn hao chính xác, cạn ở tick6000 từ100dầu; pause dừng dầu.
- [x] Refuel ceil/cap/chọn đèn/cạnh nút, relight5 và bonus40, capacity tăng2 tối đa20.
- [x] Fuel đúng30 giữ vùng; dưới30 bỏ vùng; refuel phục hồi và đẩy shade.
- [x] Wander chọn đèn yếu, drain cộng dồn và event60sim_tick, chase không đổi đèn, pulse bonus15.
- [x] Không thắng sớm, ngưỡng3/5–4/6–5/7, cạn dầu ở tick cuối, hồi đèn ở tick cuối, no_flames ưu tiên, điểm floor(fuel).
- [x] Regression còn hiệu lực chạy không skip; thay đổi test có lý do trong CHANGELOG.md.
- [x] ADR tại docs/decisions/ADR-003-lantern-fuel.md.
- [x] Output thật và cấu hình/thời gian tại summary.json, tests-report.txt. Dầu/event tại các file JSONL tương ứng.

Chạy lại:

```sh
npm run check
npm run proof:phase3
```

| Nội dung | Output |
|---|---|
| Dầu cạn và tắt | fuel-out.jsonl |
| Châm dầu | refuel.jsonl |
| Thắp lại và sức chứa | relight-capacity.jsonl |
| Nhiều shade hút | stacked-drain.jsonl |
| Pulse mục tiêu drain | pulse-drain.jsonl |
| Bình minh đủ đèn | dawn-survived.jsonl |
| Tick cuối hụt đèn | dawn-out.jsonl |
| Tick cuối thắp lại | last-tick-relight.jsonl |
| Pause giữ dầu | pause-fuel.jsonl |

## Web — kết quả người học báo cáo

Các dấu đạt bên dưới dựa trên xác nhận chung “tôi thấy ok hết r”; không phải phép đo độc lập các giá trị1Hz,20%,RGB hoặc xác nhận riêng việc khôi phục cài đặt sau tải lại. Hai ảnh trong hội thoại chỉ cho thấy HUD trước/sau thắp đầu và thanh dầu. Xem chi tiết trong minh-chung.md.

- [x] Thanh dầu và phản hồi đèn yếu hoạt động — người học xác nhận; chu kỳ1Hz đối chiếu mã, chưa đo riêng.
- [x] Đèn tắt và thắp lại hoạt động — người học xác nhận; chi phí5 kiểm tra tự động, xẹp20%/vết rách đối chiếu mã.
- [x] Châm dầu/sức chứa hoạt động — người học xác nhận; ảnh cho thấy0/12 và150điểm sau thắp đầu, refuel/giới hạn có test.
- [x] Luật bình minh hoạt động — người học xác nhận; điều kiện đủ60%/không thắng sớm có test, chưa có ảnh kết thúc.
- [x] Shade hút dầu và phản ứng pulse/châm hoạt động — người học xác nhận; ngưỡng chính xác có test.
- [x] Bảng màu dễ phân biệt hoạt động — người học xác nhận chung; RGB và localStorage đối chiếu mã.
- [ ] Xác nhận riêng cài đặt còn giữ sau tải lại và lưu ảnh chế độ dễ phân biệt.
- [ ] Chụp ảnh/video bản mới, gồm màn bình minh/điểm và cài đặt.
- [ ] Đo lại FPS nếu cần so hiệu năng sau đổi renderer; chưa có số đo Phase3.

Các ảnh Phase2 chỉ chứng minh bản cũ, không dùng để ghi đạt luật dầu mới.

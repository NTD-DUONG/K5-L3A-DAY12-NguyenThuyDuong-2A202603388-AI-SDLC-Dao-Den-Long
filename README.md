# Đảo Đèn Lồng — Phase 3: Đèn cạn dầu

Bản web3D gồm3đêm, contract v1.2. Đã triển khai luật dầu và kiểm chứng tự động; chờ chơi thử giao diện sau thay luật trước khi chốt phase-3. Tag phase-1 giữ nguyên; minh chứng Phase2 là kết quả lịch sử, không chứng minh luật dầu mới.

## Cài và chạy

Cần Node.js >=20, npm và trình duyệt desktop WebGL 2:

```sh
npm ci
npm run dev
```

Mở http://127.0.0.1:5173. Nếu server Phase 1 còn chạy, Ctrl+C rồi khởi động lại server và tải lại trang.

## Điều khiển

WASD di chuyển theo camera, Space nhảy, Shift lướt, E nạp đèn, Q tỏa sáng. Mũi tên trái/phải hoặc kéo chuột để xoay camera. Esc/P tạm dừng. Cài đặt cho phép chỉnh âm lượng/độ nhạy chuột và lưu bằng localStorage.

Menu → giới thiệu Đêm → chơi → kết quả → Đêm kế tiếp. Thua chơi lại chính Đêm đó. Thắng Đêm 3 hiện Bình Minh. Tổng điểm chỉ cộng các Đêm đã thắng.

## Luật chuẩn

Sức chứa bắt đầu10, tăng2 mỗi lần thắp thành công (cả thắp lại), tối đa20. Thắp đầu cần10, thắp lại cần5. Đèn có100dầu, hao1/giây; mỗi đom đóm châm10dầu. Dưới30dầu mất safe và shade có thể hút5/giây/con. Đêm1/2/3 dài240/270/300s; cần3/5,4/6,5/7đèn sáng tại bình minh, còn sống. Không thắng sớm khi đủ đèn. Các luật di chuyển/dash/charm còn như Ticket-02.

Điểm: nạp/refuel+5 mỗi đom đóm; thắp đầu+100, thắp lại+40; pulse+5 mỗi shade hoặc tổng+15 nếu đang drain. Khi thắng: mỗi đèn sáng+50+floor(fuel), mỗi lửa+50; không thưởng thời gian. [Ticket-03](docs/requirements/phase-3.md), [ADR](docs/decisions/ADR-003-lantern-fuel.md), [changelog](CHANGELOG.md).

Cài đặt có “Bảng màu dễ phân biệt” được lưu: mắt/viền shade xanh, UI nguy hiểm trắng kèm⚠. Đèn tắt xẹp20% và rách; thanh dầu/đèn dưới30 nhấp nháy1Hz.

## Kiểm chứng

```sh
npm run check
npm run proof:phase3
```

check chạy regression và test tính năng mới; proof:phase3 tạo JSONL9scenario, so hai lần chạy và đo3đêm. Xem [bằng chứng](docs/proof/phase-3/checklist.md). Muốn tái lập v1.1 dùng commit561be77; không chạy script Phase2 trên v1.2.

## Headless

```sh
node src/headless/cli.mjs --seed 123 --night 2 --ticks 1200 --out output.jsonl
```

--night nhận1/2/3. Thêm --scenario file.json --inputs file.json --snapshot-every 10 khi cần. CLI không dùng DOM/GPU. Lỗi JSON/schema trả2, lỗi CLI/I/O trả1, thành công trả0. Pause vẫn tăng tick nhưng dừng sim_tick. Trường snapshot motes.ttl_s là null với đom đóm thường (không hết hạn), là số giây với đom đóm rơi.

## Đo FPS

Vào Cài đặt, bấm **Đo FPS 1280×720 trong 30 giây**. Game bắt đầu lại Đêm đang chọn, buffer vẽ đặt1280×720, không pause/chuyển tab trong phép đo. File phase-2-fps.json tự tải về; lưu vào docs/proof/phase-2. Chỉ đánh dấu đạt nếu average_fps >=30. Chưa có số đo trình duyệt được xác nhận.

## Thiết kế và ghi chép

src/core dùng chung giữa web/headless; terrain và night-maps mô tả đảo, cầu, tầng/dốc/bục nhảy. Renderer/audio/settings không tác động output headless. Màu chuẩn tại src/web/palette.mjs; ambient=0,15+0,55*lit/count.

Xem AGENTS.md, docs/notes/phase-2-ai-log.md, CREDITS.md. GUIDE.md, CHECKPOINTS.md, RULES.md, RUBRIC.md, SUBMISSION.md là hướng dẫn gốc. Video và Release v1.0.0 hoàn thiện ở Phase4.

## Sáng tạo của tôi

Nhạc nền và hiệu ứng được tạo bằng Web Audio; nhân vật và bối cảnh dựng từ hình học. Không thêm thực thể làm đổi headless ngoài yêu cầu.

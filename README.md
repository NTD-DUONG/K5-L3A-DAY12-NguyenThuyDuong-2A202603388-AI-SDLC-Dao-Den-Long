# Đảo Đèn Lồng — Phase 2

Bản web 3D gồm 3 đêm, contract headless v1.1. Đã kiểm chứng tự động và lưu output thật; đang chờ chơi thử bản web, nghe âm thanh và đo FPS trước khi chốt tag phase-2. Phase 1 giữ nguyên tại tag phase-1.

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

Chạy6m/s, sức chứa10, mỗi đèn cần10. Lướt14m/s trong0,2s, hồi1,5s. Pulse tốn3, bán kính3D5m, hồi3s. Máu3, bất tử1,5s sau hit. Đêm1/2/3 dài300/330/360s. Chi tiết: [số liệu chuẩn](docs/requirements/phase-2-standard.md), [spec và thay đổi](docs/notes/phase-2-spec.md), game.contract.json.

Điểm: nhặt không cộng điểm; nạp +10 mỗi đom đóm, thắp +100, mỗi Bóng Mực trúng pulse +5 kể cả đang choáng. Thắng cộng floor(giây còn lại)*2 +50*máu còn lại.

## Kiểm chứng

```sh
npm run check
npm run proof:phase2
```

check chạy regression và test tính năng mới. proof:phase2 tạo JSONL cho 8 scenario, so hai lần chạy, đo cả3đêm. Xem [bằng chứng và checklist](docs/proof/phase-2/checklist.md).

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

# Đảo Đèn Lồng — Phase 1

Trạng thái: bản web 3D và CLI headless Phase 1. Người học đã chơi thử, xác nhận chức năng chính và chơi lại sau thắng/thua; có 4 ảnh bằng chứng trong docs/proof/phase-1. Video và Release v1.0.0 sẽ hoàn thiện ở Phase 4.

## Chạy game web

Cần Node.js >=20 và npm. Trong thư mục repo:

```sh
npm install
npm run dev
```

Mở http://127.0.0.1:5173, bấm **Bắt đầu đêm 1**. Cần trình duyệt desktop có WebGL 2 và bàn phím. Cài Three.js từ npm; game không phụ thuộc CDN khi chạy. Nếu server cũ đang mở, nhấn Ctrl+C rồi chạy lại npm run dev.

## Kiểm chứng

```sh
npm run check
```

Lệnh trên kiểm tra cấu trúc và chạy test gameplay/CLI, gồm hồi quy vùng an toàn chồng nhau. Bằng chứng: [báo cáo](docs/proof/phase-1/headless-report.txt), [checklist](docs/proof/phase-1/checklist.md), [chơi thử và ảnh](docs/proof/phase-1/web-manual-checklist.md). Chưa xác nhận cài sạch trên macOS; CI Ubuntu kiểm tra headless khi push.

## Headless

```sh
npm run headless -- --seed 1 --night 1 --ticks 60 --out output.jsonl
```

Chạy được không cần GPU. Có thể thêm --scenario, --inputs và --snapshot-every (mặc định 10). Lỗi định dạng JSON/schema trả mã 2; lỗi lệnh/I/O trả mã 1; chạy thành công trả mã 0. Tọa độ JSONL làm tròn 3 chữ số, không làm tròn trạng thái mô phỏng.

## Thiết kế

src/core dùng chung giữa web và headless, bước cố định 60 Hz. Renderer Three.js chỉ hiển thị trạng thái lõi. Cây, mây và hiệu ứng trang trí không tham gia mô phỏng. Không phụ thuộc GPU ở headless.

## Điều khiển

WASD: di chuyển theo camera; Space: nhảy; E: nạp đèn; Q: tỏa sáng (tốn 3 ánh sáng). Giữ phím mũi tên trái/phải hoặc kéo chuột trên màn chơi để xoay camera. Esc tạm dừng/tiếp tục. Chuyển cửa sổ tự tạm dừng. Bấm Chơi lại sau thắng/thua để đặt lại toàn bộ màn.

Nhặt đom đóm vàng bằng cách đến gần. Đến chân đèn chưa sáng và nhấn E để nạp; mỗi đèn cần 10. Viền vàng quanh đèn sáng là vùng an toàn. Bản đồ góc phải hiển thị Mây màu trắng, đèn vàng và Bóng Mực tím.

## Luật và điểm

Xem docs/notes/phase-1-assumptions.md và game.contract.json. CLI và web đều nạp tuning từ contract. Điểm: nhặt 10, thắp đèn 100, mỗi Bóng Mực bị pulse làm choáng 20; thắng cộng floor(giây còn lại)*2 + máu còn lại*50.

## Tài liệu lab

GUIDE.md, CHECKPOINTS.md, SUBMISSION.md, RULES.md, RUBRIC.md được giữ nguyên. Đề Phase 1: docs/requirements/phase-1.txt. Nhật ký AI: docs/notes/ai-log.md.

## Sáng tạo của tôi

Chưa bổ sung; ưu tiên lõi và Test Contract.

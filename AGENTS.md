# Đảo Đèn Lồng

- Đọc docs/requirements/phase-1.txt và docs/notes/phase-1-assumptions.md trước khi sửa logic.
- Cài đặt: npm install. Web: npm run dev. Kiểm chứng: npm run check.
- CLI: npm run headless -- --seed 1 --night 1 --ticks 60 --out output.jsonl.
- src/core không phụ thuộc DOM, Three.js hoặc thời gian thực; web và CLI dùng chung lõi.
- Mô phỏng cố định 60 bước/giây; snapshot 0 trước input; input k tạo trạng thái k+1.
- Khoảng cách tính trên XZ với biên <=; chuẩn hóa di chuyển chéo.
- Nút kích hoạt ở cạnh false sang true. Random phải có seed; không dùng Math.random trong lõi.
- Không sửa tay bằng chứng hoặc ghi đạt khi chưa chạy. Không kết thúc công việc với check đang lỗi.
- Cập nhật contract cùng tuning. File scenario/input sai định dạng phải trả mã 2.
- Khi đổi luật, cập nhật giả định và kiểm chứng liên quan, ghi lý do.
- Web dùng Three.js cài local và lõi createGame; khởi động lại npm run dev sau khi sửa server. Không dùng CDN cho dependency.
- Sau thay đổi renderer, chạy node --check src/web/main.mjs và kiểm tra trực tiếp theo docs/proof/phase-1/web-manual-checklist.md. HTTP 200 không chứng minh game hiển thị/chơi đúng.

# Đảo Đèn Lồng

## Phase 3 — luật hiện tại

- Đọc docs/requirements/phase-3.md, CHANGELOG.md và docs/decisions/ADR-003-lantern-fuel.md. Ticket-03 thay các luật v1.1 được chỉ rõ.
- Dầu lưu nguyên đơn vị1/60; bước2 trừ hao/drain và tắt ngay. Chỉ làm tròn khi xuất. Pause dừng dầu.
- Không thắng sớm/all_lit; tại bình minh còn sống và đủ ceil(0,6*n) đèn mới thắng dawn_survived; no_flames ưu tiên.
- Capacity dẫn xuất từ successfulLights; scenario/refuel không làm tăng. Safe chỉ fuel>=30; drain có pulse bonus15 tổng.
- npm run proof:phase3 lưu minh chứng thật, không ghi đè output Phase1–2. Màu dễ phân biệt chỉ ảnh hưởng renderer/CSS/localStorage.

## Phase 2 đang triển khai

- Đọc docs/requirements/phase-2.txt và docs/notes/phase-2-spec.md; ticket mới thay luật cũ khi quy định rõ.
- Bảng chuẩn và RGB đã được người học bổ sung; xem docs/requirements/phase-2-standard.md và src/web/palette.mjs. Tuning v1.1 thay toàn bộ số tự chọn ở Phase 1.
- src/core/night-maps.mjs và terrain.mjs dùng chung cho lõi/web; không coi test dữ liệu là bằng chứng chơi trực tiếp đủ 3 đêm.
- Test bản đồ: node --test tests/night-maps.test.mjs. Phase 2 phải tách tick/sim_tick, dừng bộ đếm khi pause và theo đúng thứ tự 12 bước.
- Giữ nguyên tag phase-1. Test cũ đổi theo số chuẩn phải ghi lý do; mỗi tính năng mới có scenario headless và bằng chứng.
- Chỉ khai đạt hiệu năng khi đo thật: headless 21600 tick <=30 giây; web 1280x720 trung bình >=30 FPS.
- npm run proof:phase2 tạo output JSONL, so hai lần chạy và benchmark; không chỉnh tay output. Checklist web tại docs/proof/phase-2/checklist.md.

## Nền Phase 1

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

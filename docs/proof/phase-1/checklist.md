# Kiểm chứng Phase 1

Đã chạy 14 test tự động cho lõi và CLI, đạt 14/14, bao gồm hồi quy vùng an toàn chồng nhau. Người học đã chơi thử bản 3D, xác nhận các chức năng chính và cung cấp 4 ảnh. Chưa kiểm chứng cài sạch trên macOS/Linux. “Đạt các test hiện có” chỉ áp dụng cho những tình huống đã chạy, không bảo đảm đạt toàn bộ test ẩn.

Bằng chứng tự động: [mã test](../../../tests/core.test.mjs), [báo cáo](headless-report.txt), [output thắng](win.jsonl). Bằng chứng chơi trực tiếp: [checklist và ảnh](web-manual-checklist.md). Phát hiện còn tồn tại: [báo cáo rà soát](review.md).

| Yêu cầu | Cách kiểm chứng | Kết quả |
|---|---|---|
| Tick 0, đủ N bước, event k+1 | Test đứng yên 60 bước, CLI 0/60 bước, event nhặt ở tick 1 và output thắng | Đạt các test hiện có; xem mã test, báo cáo và win.jsonl |
| Di chuyển/camera/đường chéo | So tọa độ sau 60 bước với phép tính độc lập; yaw 90° | Đạt các test hiện có |
| Input giữ trạng thái/cạnh nút | Giữ move, jump, interact, pulse qua nhiều bước; nhả và nhấn lại | Đạt các test hiện có |
| Nhặt, sức chứa, biên bán kính | Đom đóm tại 1,5 m và 1,501 m; mang sẵn 19; khoảng cách XZ không phụ thuộc Y | Đạt các test hiện có; kiểm tra ngoài biên riêng khi túi chưa đầy chưa được tách thành test độc lập |
| Nạp đèn, thắng 5 đèn, điểm | Nạp từng phần, giữ nút, nạp đèn cuối; đối chiếu điểm 848; ảnh thắng web | Đạt các test hiện có và người học xác nhận |
| Pulse, choáng, đẩy, hồi chiêu | Bóng Mực tại 5 m và 5,001 m; chi phí, đẩy, thời hạn choáng, giữ nút, chặn hồi chiêu và thiếu tài nguyên | Đạt các test hiện có; chưa có test riêng xác nhận tái kích hoạt đúng tick hết hồi chiêu |
| Sát thương, miễn thương, thua | Hai Bóng Mực chạm liên tiếp; trúng tại tick 1, 121, 241 rồi thua | Đạt các test hiện có; có ảnh thua do hết máu |
| Vùng an toàn | Test một đèn sáng và hồi quy scenario nhiều vùng chồng nhau qua 180 bước | Đã sửa lỗi; đạt các test hiện có — xem review.md |
| Hết giờ | Scenario còn 2/60 giây, dừng tại bước 2 với reason dawn | Đạt test headless; chưa xác nhận riêng trên web |
| Scenario không sinh điểm/event | Snapshot 0 điểm 0 khi có đèn sáng sẵn; win.jsonl không có event khởi tạo | Đạt các tình huống đã kiểm tra |
| JSON sai trả mã 2 | CLI nhận JSON hỏng, tick trùng và scenario sai schema | Đạt các test hiện có |
| Tất định và ID | So toàn bộ byte output hai lần CLI cùng seed trong 60 bước | Đạt tình huống đã kiểm tra, bao gồm ID trong output; chưa phủ mọi tổ hợp scenario/input |
| Tọa độ làm tròn 3 chữ số | Rà soát hàm snapshot và tọa độ trong win.jsonl | Có trong mã/output; chưa có test độc lập bao phủ mọi loại thực thể |
| Game 3D/HUD/nhảy/chơi lại | Người học chơi thật, xác nhận chức năng và chơi lại sau thắng/thua; 4 ảnh | Đạt theo xác nhận người học và phạm vi ảnh; xem web-manual-checklist.md |
| Clone sạch macOS/Linux | Chạy theo README trên môi trường sạch | Chưa kiểm chứng; CI Ubuntu chưa có kết quả |

Lưu từng input, scenario, output và kết quả mong đợi. Bằng chứng phải khớp commit/tag.

## Bằng chứng headless đã chạy

- headless-report.txt: 14/14 test đạt, kiểm tra tick/thời gian, di chuyển/yaw/giữ input, nhảy, biên nhặt và sức chứa, nạp từng phần/cạnh nút, thắng/điểm, pulse, sát thương/miễn thương, vùng an toàn đơn/chồng nhau, dawn, schema và CLI.
- Kiểm tra tất định so sánh toàn bộ byte output của hai lần chạy CLI cùng seed. Kiểm tra mã 2 cho JSON lỗi, tick trùng và scenario sai schema.
- win.jsonl: output thật từ tests/scenarios/win.json và tests/inputs/interact.json. Snapshot 0 điểm 0; tick 1 nạp 10, thắp đèn cuối, thắng 848 điểm; end có ticks 1 mặc dù yêu cầu tối đa 60.
- Lệnh tái lập: node src/headless/cli.mjs --seed 1 --night 1 --scenario tests/scenarios/win.json --inputs tests/inputs/interact.json --ticks 60 --snapshot-every 1 --out docs/proof/phase-1/win.jsonl
- Môi trường tự động đã chạy: Windows, Node.js 24.14.0. Bản web đã được người học chơi thử và gửi ảnh; AI chưa trực tiếp điều khiển trình duyệt. Chưa chạy test ẩn của giảng viên; không suy ra đạt toàn bộ contract từ các test hiện có.
- CI Ubuntu được cấu hình để chạy sau push. Kết quả Linux cần xác nhận trên GitHub Actions; không coi cấu hình CI là bằng chứng đã chạy thành công.

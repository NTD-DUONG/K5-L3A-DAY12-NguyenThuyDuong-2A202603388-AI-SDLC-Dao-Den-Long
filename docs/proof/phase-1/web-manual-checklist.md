# Kiểm tra bản web 3D

Trạng thái: người học đã xác nhận trực tiếp 6 nhóm chức năng bên dưới tại http://127.0.0.1:5173 và cung cấp ảnh chụp màn hình. AI đã xem ảnh người học gửi, chưa tự điều khiển/chơi trên trình duyệt. Chưa có video. Các kiểm tra chi tiết chưa được xác nhận vẫn để trống.

## Ảnh người học cung cấp

Ngày nhận: 20/11/2026. File được sao chép nguyên bản, không chỉnh sửa.

| Ảnh | Quan sát được | Giới hạn |
|---|---|---|
| [Đang chơi](web-playing.png) | HUD 3 ngọn lửa, 20/20 ánh sáng, 4/5 đèn, 03:08, điểm 1000; có lời nhắc nạp L1 | Không chứng minh toàn bộ quá trình chơi |
| [Tạm dừng](web-paused.png) | Có hộp tạm dừng, nút Tiếp tục và Chơi lại từ đầu | Ảnh tĩnh không chứng minh thời gian dừng |
| [Thắng](web-won.png) | Thông báo cả 5 đèn đã thắp, điểm cuối 1622, nút Chơi lại | Không tự chứng minh nút chơi lại hoạt động |
| [Thua](web-lost.png) | Thông báo ba ngọn lửa đã tắt, điểm 0, nút Chơi lại | Không tự chứng minh nút chơi lại hoạt động |

- [x] Màn thắng khi đủ 5 đèn và điểm cuối có ảnh xác nhận.
- [x] Màn thua do hết máu có ảnh xác nhận đã lưu vào repo.
- [x] Màn đang chơi và tạm dừng đã được lưu vào repo.
- [x] Bổ sung file ảnh thua vào repo.
- [x] Người học xác nhận đã chơi thử: chơi lại hoạt động sau cả thắng và thua, đặt lại toàn bộ màn. Nguồn: xác nhận trực tiếp trong hội thoại, không suy ra từ ảnh tĩnh.

## Người học đã xác nhận

- [x] WASD, nhảy và xoay camera hoạt động đúng.
- [x] Nhặt đom đóm, mang tối đa 20.
- [x] Nhấn E nạp đèn; đủ 10 thì đèn sáng.
- [x] Nhấn Q tốn 3 ánh sáng và đẩy/choáng Bóng Mực.
- [x] Bóng Mực chạm làm mất máu; vùng đèn sáng bảo vệ người chơi.
- [x] Esc tạm dừng; chơi lại đặt lại toàn bộ màn.

## Kiểm tra kỹ thuật và chi tiết bổ sung

Kiểm tra kỹ thuật đã chạy: node --check cho main.mjs và serve.mjs; 13/13 kiểm tra lõi/CLI đạt sau tích hợp; GET /, /main.mjs, /style.css, /core.mjs, /game.contract.json, /three.module.js và /three.core.js trả 200 với MIME phù hợp. Server kiểm tra chạy tại cổng 5174 để tránh server cũ của người học. Chưa kiểm chứng trình duyệt vì browser access host unavailable.

- [ ] npm install; npm run dev; mở URL và thấy đảo, nhân vật, HUD, không có lỗi console.
- [ ] Bấm Bắt đầu; W đi lên màn hình, D sang phải; xoay camera bằng kéo chuột và phím mũi tên.
- [ ] Space nhảy rồi chạm đất; giữ Space không tự nhảy liên tục.
- [ ] Gom đom đóm; ánh sáng tăng đến tối đa 20, điểm tăng.
- [ ] Đến đèn; nhấn E nạp một lần; thắp đủ 10 thấy đèn sáng, viền an toàn và đảo sáng hơn.
- [ ] Q tiêu 3 ánh sáng, có vòng sáng, Bóng Mực trong bán kính bị choáng và đẩy.
- [ ] Bóng Mực chạm làm mất máu, có phản hồi; đèn sáng bảo vệ trong vùng vàng.
- [ ] Esc tạm dừng/tiếp tục; chuyển tab tự dừng; thời gian không nhảy vọt khi trở lại.
- [x] Hết máu hiện thua; bấm Chơi lại đặt lại toàn bộ màn (ảnh thua và xác nhận người học). Hết giờ được kiểm tra bằng test headless, chưa xác nhận riêng trên web.
- [x] Thắp đủ 5 đèn hiện thắng và điểm cuối; chơi lại được (ảnh thắng và xác nhận người học).
- [ ] Chụp ảnh các trạng thái trên, lưu tại docs/proof/phase-1/; ghi tên file vào checklist.

Giới hạn: hỗ trợ desktop/bàn phím; chưa có điều khiển cảm ứng.

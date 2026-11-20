# Giả định Phase 1

Trạng thái: đã triển khai lõi/headless và bản web 3D theo các luật dưới đây; người học đã chơi thử. PRD/Test Contract có ưu tiên cao hơn giả định.

Vùng an toàn chồng nhau: đẩy lần lượt khỏi các đèn; nếu vẫn kẹt sau 10 lượt, chuyển Bóng Mực về phía +X ngoài toàn bộ vùng đèn (thêm 0,002 m để tránh sai số). Quy tắc này áp dụng giống nhau cho web và headless.

Tuning nằm tại game.contract.json và được CLI truyền trực tiếp vào lõi.

- Đảo tròn bán kính 35 m; chặn người chơi ở mép, không phạt rơi.
- Di chuyển 6 m/s; nhảy vận tốc đầu 7 m/s, trọng lực 20 m/s². Tương tác tính XZ kể cả khi nhảy.
- Mang tối đa 20 đom đóm. Nhặt tự động trong 1,5 m, mỗi đom đóm cho 1 ánh sáng.
- 5 đèn, mỗi đèn cần 10 ánh sáng. Một lần nhấn tương tác chuyển min(đang mang, còn thiếu) vào đèn gần nhất trong 2 m; hòa khoảng cách thì chọn ID nhỏ nhất.
- Máu 3; mỗi lần trúng đòn mất 1; miễn thương 2 giây; không rơi đom đóm.
- Tỏa sáng tốn 3 ánh sáng, bán kính 5 m, choáng 2 giây, đẩy 3 m, hồi chiêu 1 giây. Không đủ tài nguyên thì không phát pulse.
- Bóng Mực tốc độ 2 m/s, gây sát thương trong 0,8 m. Vùng an toàn của đèn sáng bán kính 4 m.
- Đêm kéo dài 300 giây; hết giờ thua với reason dawn.
- Điểm: mỗi đom đóm 10, mỗi đèn 100, mỗi Bóng Mực bị pulse làm choáng 20. Khi thắng cộng floor(thời gian còn lại)*2 + máu còn lại*50, chỉ một lần.
- Thứ tự dự kiến mỗi bước: input/di chuyển, nhặt, tương tác, pulse, Bóng Mực/va chạm, cập nhật thời gian, xét kết thúc. Ưu tiên no_flames, rồi all_lit, rồi dawn nếu đồng thời.
- Scenario không tạo điểm hoặc event. Không tạo thêm thực thể sáng tạo trong headless.
- Sinh ngẫu nhiên ban đầu 100 đom đóm, 3 Bóng Mực trong vành bán kính 5–32 m. Mỗi 120 tick thêm 1 đom đóm nếu còn dưới 100; mỗi 600 tick thêm 1 Bóng Mực nếu dưới 8. Các cờ random false tắt sinh tương ứng, kể cả ban đầu; danh sách scenario thay danh sách ban đầu.
- Snapshot 0 giữ vị trí scenario nguyên vẹn. Bóng Mực trong vùng an toàn được đẩy ra biên ở bước gameplay; Bóng Mực bị choáng vẫn bị vùng đèn đẩy ra.
- Hồi chiêu và miễn thương dùng số tick nguyên. Choáng ở tick k kéo dài đến trước tick k+120; ở tick k+120 Bóng Mực hoạt động lại.
- Scenario ngoài bán kính đảo được giữ khi đứng yên để dùng trong kiểm thử; di chuyển chủ động chặn tại mép 35 m.
- Random dùng bộ sinh LCG 32 bit có seed; ID không trùng với ID Bóng Mực được scenario cung cấp.

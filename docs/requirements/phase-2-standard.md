# Phần bổ sung Ticket-02 — chuẩn đã nhận từ người học

Nguồn: nội dung người học gửi trong hội thoại ngày 20/11/2026, sau bản ticket đầu tiên. Bảng dưới chuẩn hóa cách trình bày; ticket gốc giữ ở phase-2.txt.

| Nhóm | Chuẩn |
|---|---|
| Chạy | 6 m/s, tăng tốc/dừng <=0,1s; điều khiển trên không đầy đủ |
| Nhảy | Vận tốc 7, trọng lực -20 m/s²; chỉ khi chạm đất |
| Lướt | 14 m/s, 12 tick, hồi chiêu 90 tick từ đầu; hướng di chuyển hoặc hướng mặt khi đứng yên; giữ độ cao khi lướt trên không; không bất tử |
| Đom đóm | Sức chứa 10; nhặt XZ <=1m và lệch cao <=1,5m; 20 ban đầu ở điểm khác nhau, cap30, thêm một mỗi 240 tick tại điểm trống |
| Đèn | Chi phí10, bán kính2; nạp từng phần, chọn gần nhất rồi ID nhỏ nhất |
| Vùng an toàn | Bán kính6; Bóng Mực ngoài không vào, con đang trong khi vừa thắp thoát trong <=30 tick, không gây hit khi thoát |
| Pulse | Chi phí3, radius5, cooldown180tick; tâm chân Mây+0,8; đo3D tới tâm shade; choáng120tick; đẩy4m trong15tick đầu, bị vật cản chặn; pulse làm mới |
| Shade | Tốc độ4m/s, Đêm3 là4,5; detect12, forget18; hit XZ<=1 và lệch cao<=1,5; tối đa1hit/tick; recoil2m/60tick |
| Sinh shade | 2 tại tick300; sau đó mỗi lần1; Đêm1 khoảng480tick, Đêm2 420, Đêm3 360; điểm cách Mây>=15m, hết điểm bỏ lượt |
| Trúng hit | Mất1lửa, rơi floor(carried/2) trong vành1,5–2,5m, TTL480tick, nhặt từ tick sau; bất tử90tick |
| Rơi | Y<-10, mất1lửa bỏ qua bất tử, mất toàn bộ đồ; chờ60tick không tương tác rồi về xuất phát, vận tốc0, bất tử90; hết máu thua ngay |
| Máu/thời gian | 3lửa mỗi đêm; 300/330/360giây |
| Ưu tiên kết thúc | no_flames > all_lit (dù đúng tick hết giờ) > dawn |
| Điểm | +10 mỗi đom đóm nạp, +100 đèn, +5 mỗi shade trúng pulse kể cả đang choáng; thắng cộng floor(time)*2+flames*50; tổng chỉ cộng đêm đã thắng |

Thứ tự: input/pause → bộ đếm → di chuyển/rơi → nhặt → nạp → vùng an toàn → pulse → AI → drifter cướp rồi shade hit theo ID → spawn → kết thúc → snapshot. Pause vẫn tăng tick, không tăng sim_tick.

## Bảng màu

Trời #0E1430; sương #1B2350; cỏ #2F5D50; cát #C9B48A; gỗ #6B4A2F; biển mây #12384A; đèn sáng #FFB347; lõi #FFE9B0; đèn tắt #5B5F6E; đom đóm lõi #FFF6C2/quầng #FFE58A; shade thân #120A1A/viền #7A3CFF/choáng #3A3450; áo #E8E2D0; khăn/bùa #C8102E; viền vàng/điểm #F2C14E; drifter #8FA3B8; nguy hiểm #FF5A5F; chữ #F5F1E6. Sai số tối đa10% mỗi kênh; ánh sáng môi trường0,15+0,55*lit/count.

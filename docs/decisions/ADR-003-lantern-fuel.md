# ADR-003: Đèn có nhiên liệu và thắng tại bình minh

Ngày: 20/11/2026. Trạng thái: đã triển khai theo Ticket-03.

## Bối cảnh

Đèn v1.1 chỉ có lit/deposited và sáng vĩnh viễn; tất cả đèn sáng là thắng ngay. Ticket-03 thay cả vòng đời đèn lẫn điều kiện kết thúc. Giữ mô hình cũ sẽ khiến game kết thúc trước khi người chơi phải giữ dầu.

## Quyết định

Mỗi đèn lưu fuelUnits theo đơn vị nguyên 1/60, ever_lit và relit_count bên cạnh lit/deposited. Dầu 100 tương ứng 6000 đơn vị; mỗi bước gameplay trừ 1 đơn vị tự hao và thêm 5 đơn vị cho mỗi Bóng Mực đang drain hợp lệ. Pause không thay đổi dầu. Chỉ xuất fuel đã làm tròn một chữ số, không dùng số đã làm tròn để xét ngưỡng hoặc tính điểm.

Tại bước 2, cộng dồn drain của các con đang drain ở đầu bước (đúng mục tiêu, trong 2 m, đèn yếu), trừ dầu và phát lantern_out ngay khi cạn. Mục tiêu bị hủy/châm thêm hoặc Mây đến gần được cập nhật ở bước AI sau tương tác. fuel_drain phát ở sim_tick chia hết cho 60, đóng dấu tick đầu ra hiện tại; pause không làm lịch hút chạy tiếp.

Tương tác ở bước 5 xét mọi đèn nhận được tài nguyên, chọn gần nhất rồi ID. Đèn sáng nhận ceil(phần thiếu/10) với giới hạn tài nguyên, đèn tắt nhận theo chi phí 10 hoặc 5 nếu ever_lit. Khi vừa thắp đặt lại 6000 đơn vị; thắp lại tăng relit_count. successfulLights chỉ tăng bởi hành động thắp thành công, không tăng khi dựng scenario hoặc refuel. Sức chứa dẫn xuất từ số này, tối đa 20, không lưu một bản tuning thứ hai.

Đèn bảo vệ khi lit và fuelUnits >=1800. Đẩy ngay Bóng Mực khỏi vùng phục hồi là trong giới hạn tối đa 30 tick; con bị đẩy không gây hit trong bước đó. Giữ cơ chế thoát ngoài hợp vùng để xử lý đèn chồng nhau.

Không xét all_lit nữa. Sau mọi cập nhật, no_flames luôn ưu tiên; nếu hết giờ thì xét ceil(0,6*n) đèn đang sáng và cộng thưởng dầu/máu chỉ khi thắng. Sự kiện thắng dùng dawn_survived.

## Hệ quả và cách kiểm chứng

- Bản đồ, dash, charm, drifter, pause, vật lý giữ nguyên nếu không bị Ticket-03 thay.
- Test thắng sớm và điểm/thời gian cũ phải đổi, không skip.
- Test ngưỡng dùng giá trị nội bộ: đúng 30 sau bước hao vẫn bảo vệ; dưới 30 không bảo vệ dù snapshot có thể làm tròn thành 30,0.
- Đèn vừa đầy ở đầu tick có thể thiếu 1/60 dầu sau bước 2 và nhận 1 đom đóm ở bước 5 theo ceil; “đèn đầy không nhận” được xét tại lúc tương tác, đúng thứ tự ticket.
- Scenario lit:true mặc định dầu 100, ever_lit:true; scenario không phát sự kiện hoặc cộng điểm khi dựng.
- Chế độ dễ phân biệt chỉ ảnh hưởng renderer/CSS/localStorage; không thay đổi output headless.

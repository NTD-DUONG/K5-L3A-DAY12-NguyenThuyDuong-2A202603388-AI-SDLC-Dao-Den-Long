# Ticket-03 — Đèn cạn dầu

Nguồn: yêu cầu người học dán trong hội thoại ngày 20/11/2026. Bản ghi yêu cầu triển khai, đọc cùng Ticket-02 cho các luật không thay thế.

- Contract v1.2; tag nộp phase-3.
- Fuel_max100, hao1/giây, fuel_per_mote10, relight_cost5, win_ratio0,6, drain5/giây/con, low_fuel_threshold30, capacity_max20.
- Thắp đầu hoặc thắp lại đặt fuel100. Đèn cạn tắt, deposited0, ever_lit vẫn true, event lantern_out. Đèn từng sáng chỉ cần5, đèn mới cần10. Đèn tắt fuel0.
- Tương tác xét đèn tắt hoặc đèn sáng chưa đầy; gần nhất rồi ID. Refuel dùng min(carried,ceil((100-fuel)/10)), chặn tối đa100; amount0 không chọn/không event/không điểm.
- Dầu tính chính xác theo tick 1/60; snapshot fuel làm tròn một chữ số. Đèn sáng có thanh dầu; fuel<30 đèn/bar nhấp nháy1Hz.
- Chỉ wander chọn đèn yếu gần nhất, hòa ID; không có đèn yếu thì đi đèn tắt. Chase không đổi mục tiêu.
- XZ<=2 tới đèn yếu thì drain đứng yên. Drain nhiều con cộng dồn với hao tự nhiên. Từ drain: chase nếu Mây<=6; stunned khi pulse; wander nếu đèn tắt, fuel>=30 hoặc cách đèn>2. Hết choáng về wander.
- Vùng an toàn chỉ có ở fuel>=30. Phục hồi tới>=30 đẩy các shade trong6m ra mép trong<=30tick, không gây hit khi thoát.
- Thời lượng240/270/300giây. Không thắng sớm; cuối tick bình minh cần còn sống và lit>=ceil(0,6*n). No_flames luôn ưu tiên. Thắng reason dawn_survived, thua dawn/no_flames.
- Theo thứ tự Ticket-02, bước2 thêm hao+drain và tắt ngay khi cạn; xét kết thúc sau mọi cập nhật kể cả tick cuối.
- Capacity=min(20,10+2*successful_lights); mọi lần thắp thành công đều tính, scenario không tính, reset đầu đêm.
- Điểm: +5 mỗi mote nạp/refuel; +100 thắp đầu, +40 thắp lại; tổng+5 pulse mỗi shade, tổng+15 nếu ngay trước đang drain; thắng mỗi đèn sáng +50+floor(fuel), mỗi lửa+50. Bỏ thưởng thời gian. Tổng/đêm chơi lại như Ticket-02.
- Chế độ dễ phân biệt lưu trong cài đặt: viền/mắt shade #00B3FF thay #7A3CFF, UI nguy hiểm trắng kèm⚠; đèn tắt xẹp20%/rách, đèn yếu nhấp nháy.
- Snapshot đèn thêm fuel,ever_lit,relit_count; player.capacity; shade drain. Scenario đèn lit/fuel/ever_lit, lit:true thiếu fuel mặc định100; player.successful_lights; shade.target_lantern_id.
- Event mới refuel{lantern_id,amount,fuel}, lantern_out{lantern_id}, fuel_drain{lantern_id,shade_id,fuel} mỗi60tick; lantern_lit thêm relight:boolean.
- DoD: bằng chứng thật, ADR, changelog breaking changes, cập nhật test cũ bị thay kèm lý do; các yêu cầu Phase1–2 còn hiệu lực phải giữ.

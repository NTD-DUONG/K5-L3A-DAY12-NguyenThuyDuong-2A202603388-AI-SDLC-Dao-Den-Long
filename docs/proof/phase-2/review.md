# Rà soát Phase2 theo ảnh người học — 20/11/2026

Kết luận: chưa đủ bằng chứng kết luận đạt toàn bộ Phase2; có lỗi HUD nhìn thấy trong ảnh. Chỉ lưu ảnh và ghi nhận rà soát trong lần này, chưa sửa code hoặc push/tag.

## Cần xử lý trước khi chốt

1. Đồng hồ bị chồng vào điểm ở trên phải thay vì trên giữa: src/web/phase2.css dòng5 đặt position:fixed cho con của .stats, trong khi .stats có backdrop-filter tại style.css. Cần đưa đồng hồ ra ngoài khối này hoặc đổi bố cục, kiểm tra ở1280×720.
2. Nhãn mũi tên quay cùng mũi tên trong main.mjs nên chữ L5/23m nghiêng, che gần nhân vật. Cần xoay riêng biểu tượng và giữ nhãn ngang.
3. Chưa có bằng chứng web Đêm2/3, cầu/pad/dốc/tháp, GióLạc/BùaGió, kết thúc BìnhMinh và cộng tổng qua3đêm. Ảnh thắng chỉ chứng minh màn kết quả Đêm1.
4. Chưa có fileFPS chứng minh trung bình>=30 ở1280×720.
5. Chưa xác nhận âm thanh đủ sự kiện, lưu/khôi phục cài đặt và hành vi các nút pause. Ảnh chỉ chứng minh giao diện các nút hiện diện.
6. Chưa có tagphase-2; chưa xác nhận kết quảCI/Linux trong lần rà soát này.

## Đã có bằng chứng

- Chạy lại npm run check:36test đạt,0lỗi.
- 8scenario trong báo cáo đã so output2lần giống hệt.
- Benchmark đã lưu: Đêm1 170,17ms/18000tick; Đêm2 221,63ms/19800tick; Đêm3 369,72ms/21600tick, có thông tin máy. Đây là headless, không phảiFPSweb.
- 3ảnh người học đã được sao chép nguyên bản vào thư mục này.

Màu cấu hình có bảng chuẩn; chưa đo pixel từ ảnh để kết luận mọi thành phần đạt sai số10%. Testxanh không bảo đảm đạt mọi testẩn hoặc toàn bộ luồngweb.

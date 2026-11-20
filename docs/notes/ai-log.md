# Nhật ký AI

## Chốt Phase 1

- Người học yêu cầu rà soát và push nếu hoàn tất. Đã sửa lỗi vùng an toàn chồng nhau được tìm thấy khi review, bổ sung test hồi quy và chạy lại đạt 14/14.
- Người học đã chơi thử chức năng chính và chơi lại sau cả thắng/thua; 4 ảnh gốc nằm trong docs/proof/phase-1.
- Hạn chế công khai: chưa có số đo token/chi phí thực tế; chưa kiểm chứng macOS/Linux; CI Ubuntu sẽ chạy khi push. Không tuyên bố hoàn hảo hoặc đã đạt test ẩn.
- Harness cần giữ: test hồi quy vùng chồng nhau giúp phát hiện lỗi mà test một đèn không thấy. Đã sửa bằng điều kiện bảo đảm thoát ngoài mọi vùng thay vì chỉ tăng số lần lặp.
- Các mục “chưa làm” trong các đoạn nhật ký dưới đây phản ánh thời điểm lịch sử, không phải trạng thái cuối.

## Chuẩn bị Phase 1
- Công cụ: Codex.
- Yêu cầu của người học: đọc đề, hướng dẫn từng bước, tạo khung theo đề xuất.
- Đã làm: tạo tài liệu, contract mục tiêu, khung web/CLI và lệnh kiểm tra khung.
- Token/chi phí: chưa có số đo; bổ sung ước tính từ công cụ, không bịa số.
- Lỗi AI đã phát hiện: URL repo suy đoán không khớp tên thực tế; đã sửa theo URL người học cung cấp.
- Tiết kiệm: dùng chung lõi, chia bước nhỏ, kiểm chứng contract trước đồ họa.
- Chưa làm: logic gameplay, renderer 3D, kiểm chứng hành vi, bằng chứng ảnh/video.

## Triển khai lõi và headless

- Đã triển khai: mô phỏng 60 Hz, chuyển động/jump, pickup/deposit/pulse, Bóng Mực, miễn thương, vùng an toàn, điểm/thắng/thua; scenario và input, seed/ID, output JSONL và mã lỗi.
- Tuning CLI đọc trực tiếp game.contract.json, không sao chép các giá trị sang một cấu hình riêng.
- Kiểm chứng thật: npm run check đạt 13/13; lưu report và scenario thắng trong docs/proof/phase-1.
- Khó khăn môi trường: sandbox chặn tạo tiến trình Node con (spawn EPERM); bộ test đã được chạy ngoài giới hạn đó qua công cụ cho phép và đạt.
- Harness: npm run check trả lỗi khi test lỗi; thêm workflow Ubuntu cho push/PR. Workflow chưa được xác nhận chạy trên GitHub.
- Chưa làm: renderer 3D, kiểm chứng thị giác, thử trên macOS/Linux, review độc lập, tag/push. Không gắn tag phase-1 vì chưa có game chơi được.
- Token/chi phí: chưa có số đo từ công cụ.

## Bản web 3D

- Cài Three.js 0.180.0 và lưu package-lock.json; npm audit khi cài báo 0 lỗ hổng.
- Renderer dùng createGame và tuning từ contract, cập nhật gameplay bằng accumulator 60 Hz. Không đổi src/core trong bước này.
- Dựng đảo, Mây với nón lá/đèn nhỏ, cây/mây, đom đóm, Bóng Mực, 5 đèn, hiệu ứng pulse và phản hồi trúng đòn. Thêm HUD, bản đồ, tạm dừng khi mất focus và chơi lại.
- Phím W ánh xạ move Z âm, D ánh xạ X dương để phù hợp camera đặt phía Z dương. Công thức camera yaw của lõi và headless giữ nguyên.
- Kiểm chứng: node --check cho renderer/server đạt; npm run check đạt 13/13; HTTP 200 cho trang, renderer, CSS, core, contract và hai module Three.js.
- Giới hạn: browser access host unavailable, chưa quan sát được WebGL hoặc chơi thử. Không ghi đạt các mục kiểm tra thị giác. Người học dùng docs/proof/phase-1/web-manual-checklist.md để chơi thử và lưu bằng chứng.

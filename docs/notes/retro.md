# Retro — Đảo Đèn Lồng

## Cách làm và kết quả

Người học điều phối Codex, đọc ticket, chốt giả định và chơi thử. Lõi mô phỏng thuần chạy60Hz được chia sẻ giữa web/headless; scenario và JSONL giúp kiểm tra luật trước khi nối hình ảnh. Phase3 thay luật thắng/dầu đã được ghi bằng ADR và changelog thay vì giữ test cũ rồi tắt chúng.

Các kết quả thực tế nằm trong docs/proof; Phase4 có61test và soak10đêm. Benchmark GPU/video chưa có kết quả được xác nhận nên không ghi đạt.

## Điều hiệu quả

- Cùng một lõi cho GUI/CLI tránh lệch tuning.
- Test ngưỡng, tick đầu/cuối và deterministic output bắt lỗi mà ảnh không thể chứng minh.
- Xác nhận người học và ảnh được ghi nguồn riêng, không gọi đó là AI đã tự chơi.
- Harness có npm run check, CI, script tạo minh chứng; không dùng test luôn xanh hoặc output sửa tay.

## Lỗi AI và sửa quy trình

- Đã suy đoán sai URL repo; sửa theo URL người học đưa và thông báo chuyển repo từ GitHub.
- Bảng checklist từng bị để “chưa làm” dù test đã chạy; đã đổi sang liên kết bằng chứng cụ thể.
- Test một đèn bỏ sót vùng an toàn chồng nhau; thêm scenario lỗi và cơ chế thoát hợp vùng.
- Ticket02 thiếu bảng chuẩn/RGB trong lần dán đầu; hỏi bổ sung thay vì bịa số.
- Browser access host unavailable làm không tự quan sát/đo FPS được; giữ giới hạn công khai, không thay benchmark GPU bằng tốc độheadless.

## Token/chi phí

Không có số liệu usage/billing từ công cụ trong phiên này; chưa thể nêu con số đáng tin cậy. Không tự tạo ước tính. Đã tiết kiệm bằng đọc file mục tiêu, chia phần logic/UI, dùng scenario nhỏ và không chạy lại test không liên quan khi chỉ sửa tài liệu.

## Nếu làm lại

Chốt ngay manifest yêu cầu→test→bằng chứng; thêm tình huống biên giữa các thực thể từ đầu; chuẩn bị đường kiểm tra trình duyệt/GPU và quay video trước giờ lab; commit nhỏ hơn và tạo tag từngphase đúng thời điểm. Không thể khẳng định các tag hiện tại đúng hạn vì chưa có giờ bắt đầu lab/ngoại lệ của Coach.

# Rà soát Phase 1 — 20/11/2026

Kết luận ở lần rà soát ban đầu: gameplay chính có bằng chứng và người học xác nhận; còn các mục bên dưới. Xem cập nhật chốt Phase 1 ở cuối tài liệu.

## Phát hiện cần xử lý

1. Lỗi vùng an toàn chồng nhau: src/core/index.mjs, hàm repel chỉ lặp 10 lần. Đẩy Bóng Mực ra khỏi một đèn có thể đưa nó vào vùng đèn khác; khi hết vòng lặp không có bảo đảm nằm ngoài toàn bộ vùng an toàn. Scenario được đổi vị trí đèn theo contract nên đây là trường hợp hợp lệ.
2. Chưa có tag phase-1. git status cho thấy mã, contract, test, harness và ảnh vẫn chưa được commit. Hiện chưa có commit để đối chiếu bằng chứng hoặc nộp phase.
3. README và docs/proof/phase-1/checklist.md còn ghi chưa kiểm chứng/chưa làm dù đã có test và xác nhận người học. Cần đồng bộ trạng thái và liên kết ảnh; không đánh dấu các trường hợp chưa thực sự kiểm tra.
4. Chưa thử cài sạch và chạy trên macOS/Linux. CI Ubuntu đã cấu hình nhưng chưa có bằng chứng chạy thành công.
5. Nhật ký chưa có ước tính token/chi phí; cần bổ sung từ dữ liệu thực tế. Không tự tạo con số.

## Tái hiện lỗi vùng an toàn

Dùng tuning hiện tại (safe_radius 4), seed 1, scenario sau, rồi gọi step một lần không có input:

```json
{
  "random_motes": false,
  "random_shades": false,
  "motes": [],
  "lanterns": [
    {"id":"L1","lit":true,"pos":[-1.259292053519579,0,-2.6205626930518138]},
    {"id":"L2","lit":true,"pos":[2.869516699954529,0,1.7858326439658183]},
    {"id":"L3","lit":true,"pos":[-2.564488286163848,0,2.1603732852353823]},
    {"id":"L4","lit":true,"pos":[0.547797403893402,0,-2.3425370508172474]}
  ],
  "shades": [{"pos":[0,0,0]}]
}
```

Kết quả thực tế: shade.pos = [1.1663601966665444, 0, 1.6093460637746668], cách L2 khoảng 1.712276 m, nhỏ hơn safe_radius 4 m. Mong đợi: Bóng Mực ở ngoài mọi vùng an toàn.

## Đã xác nhận

- npm run check chạy lại trong lần rà soát này: 13/13 đạt. Bộ test hiện tại chưa phủ lỗi vùng an toàn chồng nhau nói trên.
- Có game web 3D, 5 đèn, điều khiển/camera/nhảy, nhặt/nạp/pulse, Bóng Mực, HUD, điểm, thắng/thua và chơi lại theo mã, ảnh và xác nhận của người học.
- Có contract JSON, CLI 60 Hz, scenario/input, JSONL snapshot/event/end, test định dạng và kiểm tra tất định.
- Có 4 ảnh nguyên bản trong repo và output scenario thắng.
- Có AGENTS.md, script kiểm chứng, CI, giả định, nhật ký và CREDITS.

## Chưa phải thiếu của riêng Phase 1

Release v1.0.0 và video dưới 5 phút là bàn giao cuối Phase 4. LICENSE chưa có và cần bổ sung cho bộ bàn giao chung. Tên remote hiện khác mẫu SUBMISSION.md (còn LAB, thiếu Dao-Den-Long), nên chỉnh trước khi nộp cuối.

Không sửa mã gameplay, commit, push hoặc gắn tag trong lần rà soát này.

## Cập nhật chốt Phase 1

- Theo yêu cầu người học, đã sửa lỗi vùng an toàn chồng nhau: có bước thoát về phía +X ngoài toàn bộ đèn nếu phép đẩy tuần tự chưa giải quyết hết giao nhau.
- Thêm test hồi quy dùng đúng scenario lỗi, kiểm tra qua 180 bước. Bộ kiểm chứng mới đạt 14/14; headless-report.txt là output chạy thật.
- README và bảng kiểm chứng đã cập nhật theo xác nhận chơi thử và ảnh người học cung cấp.
- Mã và bằng chứng được chuẩn bị commit/tag phase-1 theo yêu cầu người học. Giới hạn còn lại: chưa chạy trên macOS/Linux, token/chi phí chưa có số đo, không khẳng định đã đạt test ẩn hoặc đúng hạn do chưa có giờ bắt đầu lab.

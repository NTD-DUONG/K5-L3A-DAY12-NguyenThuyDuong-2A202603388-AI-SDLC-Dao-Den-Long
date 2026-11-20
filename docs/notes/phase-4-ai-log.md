# Nhật ký AI Phase 4

- Theo Ticket04, thêm scene benchmark có đúng200shade wander,100mote và3đèn, camera chuẩn/warmup/metrics. Tách options.benchmark khỏi scenario để không ảnh hưởng gameplay chấm.
- Thêm soakCLI một tiến trình, seed7+i, xác suất input theo ticket, RSS thật; đã chạy10đêm0crash, tăng khoảng11,7%.
- Leaderboard dùng NodeAPI và JSON trên đĩa; exportCLI đọc cùng file. Test phát hiện cần tiêm thời gian trong unit test để kiểm tra tie-break, đã sửa hàm nội bộ mà không cho client tự đặt achieved_at.
- Thêm đổiphím/báotrùng/khôiphục, giảmchuyểnđộng/chữlớn, chỉbáo hìnhảnh, quaydemo dùng MediaRecorder và quyền chia sẻ do người dùng chọn.
- Shade dùng InstancedMesh cho cả game/bench, không giảm hiệu ứng riêng chỉ để sốbench đẹp. Reset dispose bộ đệm instancing.
- 61test đạt; source không chứa dữ liệu leaderboard. LICENSE/MIT và CREDITS cập nhật, có Dockerfile và script đóng ZIP.
- Chưa có benchmarkGPU/video: browser access host unavailable. Không ghi đạt hoặc tạo số FPS. Chưa có Docker để build thật.
- Token/chi phí: chưa có số liệu công cụ. Release nên giữ draft cho tới khi có các bằng chứng còn thiếu.

- C?p nh?t: benchmark GPU th?t ?? ??t avg179,37/p1low73,46/load1614,44ms; l?u c? hai l?n ?o tr??c. T?t background throttling cho ti?n tr?nh Chromium ri?ng. Soak10 ??m ??t, kh?ng s?a k?t qu? lost.

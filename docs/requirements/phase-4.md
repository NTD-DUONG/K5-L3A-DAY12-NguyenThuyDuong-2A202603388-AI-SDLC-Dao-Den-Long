# Ticket-04 — Bình minh: phát hành v1.0.0

Nguồn: yêu cầu người học dán trong hội thoại. Contract1.3; tagphase-4 và GitHubReleasev1.0.0.

## Benchmark

bench_cmd --seed42 --duration30 --outbench.json. Cửa sổ1280×720, khôngfullscreen; vsync tắt nếu engine cho phép, nếu không phải giải thích. Đêm1,200shade wander rải đều theo seed,100mote, L1–L3 sáng100dầu. Tắt spawn/hit/pickup/fuel/end; shade vẫnwander. Mây đứng0,0,0; camera tâm0 bán kính30,Y15, xuất phát30,15,0, quay ngược chiều kim đồng hồ,15giây/vòng. Warmup3giây, đo duration giây, xuất rồi thoát0.

Output contract_version1.3,avg_fps,p1_low_fps,frame_ms_p95,frames,load_ms,peak_mem_mb,vsync_off,renderer,os. avg=1000*N/sum(dt);1%low dùng ceil(0,01*N) framechậmnhất; p95 của dt; load từ tiến trình tới frame đầu; RSSpeak/null nếuwebkhôngđođược. Ngưỡng máy chấm:avg>=60,p1low>=30,load<=10000ms.

## Soak

soak_cmd --seed7 --nights10 --outsoak.json; một tiến trình, Đêm1→2→3xoay; seed7+i. Mỗi30tick chọn hướng, từngtick jump5%,dash3%,pulse2%,interact10%. RSS sau tải Đêm đầu và sau reset Đêm cuối. Output nights,crashes,results,mem_start_mb,mem_end_mb,duration_s. Đạt khi0crash và cuối<=1,2*đầu.

## Bảng điểm

Sau BìnhMinh thắngĐêm3 hoặc thua bất kỳĐêm, nhập tên3–12ký tự[A-Za-z0-9_]. Lưu name,score=tổngđêmđãthắng,nights_won0–3,achieved_atISOcómúigiờ,seed. Top10điểmgiảm, bằngđiểmthìđạttrước. Lưuđĩa còn sau mởlại; cómànmenu. run_cmd --export-leaderboard out.json xuất entriesđúngthứtự.

## Accessibility

Đổi mọi phím4hướng/jump/dash/interact/pulse/pause, báotrùng, khôiphụcmặcđịnh,lưu. Chỉbáohình:shadexuấthiệnvàmũitênmép,giósắp,10giâycuối,fuel<30. Giảmchuyểnđộng tắtrung/chớpmànhình. UI>=18px ở1280×720, tùychọn×1,25.

## Đóng gói

Clone sạch,cài/chạy<=3lệnh; README mô tả/ảnh/system/install/điềukhiển/test/headless. Giữ yêu cầu bàn giao chung:LICENSE,CREDITS,nhật ký/retro,bằngchứngthật,Release cóbảnchạyđược,videomp4<5phútlinkđầuREADME. KhôngdùngbenchheadlessđểgiảFPSvàkhôngtựsửaoutput.

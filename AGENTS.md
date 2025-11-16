---
applyTo: '**'
---

# Quy tắc tuân thủ

## Làm
- Tuân thủ code clean nhưng không comment trực tiếp vào code.
- Chỉ comment trước các function phức tạp, nêu rõ input/output.
- Code càng ngắn gọn, đơn giản, dễ hiểu càng tốt.
- Một file tối đa 150 dòng; nếu vượt quá, refactor tách logic ra.
- Tuân thủ nguyên tắc SOLID.
- Luôn gửi bản kế hoạch ngắn gọn gồm thiết kế và các bước thực hiện (pipeline). Chỉ thực hiện khi được duyệt.

## Không làm
- Không tự ý tạo file hướng dẫn, .md, hoặc chỉnh sửa README.md.
- Tuyệt đối không comment vào code.
- Không viết hoặc chạy test khi không được yêu cầu.

## Cấu trúc mẫu

Backend: domain/controller/, domain/service/ (tất cả service file), domain/service/impl/ (implement của service file), domain/dto/, domain/mapper/ (sử dụng thư viện MapStruct).

Frontend: sử dụng pages router của NuxtJS.

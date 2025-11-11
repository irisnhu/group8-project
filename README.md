# group8-project
 Group Project – Node.js + React + MongoDB

 Mô tả dự án

Dự án là một ứng dụng web đơn giản cho phép quản lý người dùng (User Management).
Các chức năng chính bao gồm:
              - Thêm người dùng mới (Create)
              - Xem danh sách người dùng (Read)
              - Chỉnh sửa thông tin người dùng (Update)
              - Xóa người dùng (Delete)

Ứng dụng được xây dựng theo mô hình **MERN Stack** (MongoDB – Express – React – Node.js), giúp sinh viên thực hành làm việc nhóm, quản lý mã nguồn bằng **GitHub**, và triển khai REST API cơ bản.

⚙️ Công nghệ sử dụng

Thành phần                Công nghệ chính              Mô tả                                        
Backend**                 Node.js, Express             Xây dựng REST API (GET, POST, PUT, DELETE)   
Frontend**                React, Axios                 Hiển thị và tương tác với dữ liệu người dùng 
Database**                MongoDB Atlas, Mongoose      Lưu trữ dữ liệu người dùng trên cloud        
Công cụ hỗ trợ**          Git, VS Code, Postman        Quản lý mã nguồn, lập trình, kiểm thử API    



 Hướng dẫn chạy dự án

 1. Clone repository
bash

git clone https://github.com/NLinh2004/group8-project.git
cd group8-project


 2. Chạy Backend
bash

cd backend
npm install
npm start


Mặc định chạy tại: `http://localhost:5000`

 3. Chạy Frontend
bash

cd frontend
npm install
npm start


Mặc định chạy tại: `http://localhost:3000` (hoặc port khác do React chọn)

 4. Kết nối MongoDB

* Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* Tạo cluster, database: **groupDB**, collection: **users**
* Cập nhật biến môi trường trong file `.env`:


MONGO_URI=mongodb+srv://an_user:123456An@cluster0.opyvjmu.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0

PORT=3000


 Đóng góp từng thành viên

Thành viên                  Vai trò                          Nhiệm vụ chính                                                                                                               
Phan Thới An                Database (MongoDB)               - Tạo cluster MongoDB Atlas<br>- Xây dựng model `User.js` với Mongoose<br>- Kết nối backend với database                     
Tăng Thị Nhựt Linh          Backend (Node.js + Express)      - Cấu trúc backend<br>- Tạo và xử lý API (GET, POST, PUT, DELETE)<br>- Kiểm thử API bằng Postman                             
Huỳnh Đặng Nhu Cương        Frontend (React)                 - Xây dựng giao diện `UserList` và `AddUser`<br>- Fetch API (một API tích hợp sẵn trong JavaScript) để thực hiện các yêu cầu HTTP (GET, POST, PUT, DELETE) tới backend<br>-



 Kết quả & Demo

API hoạt động đầy đủ (CRUD).
Frontend kết nối trực tiếp với MongoDB qua backend.
Tất cả branch (frontend, backend, database) đã merge vào `main`.
Dự án chạy ổn định và hiển thị dữ liệu thực từ MongoDB.



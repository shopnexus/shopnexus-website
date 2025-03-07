// import React from "react";
// import Button  from "./ui/Button"
// import Input  from "./ui/Input"

export default function InforFooter(){
    return (
      <footer className="w-full mt-10 bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Về chúng tôi</h2>
            <p className="text-sm opacity-80">
              Trang web được tạo ra để buôn bán giày dép các loại, chuyên cung cấp giày dép uy tín, chất lượng. Với tinh thần làm việc hăng hái,
              tận tụy với khách hàng, chúng tôi cam kết mang đến những trải nghiệm quý giá nhất đến với khách hàng.
                <p> Khi cần bạn hãy liên hệ theo số sau:
                </p>
                <p>+ 84 1234567899</p>
                <p>+ Hoặc liên hệ các trang mạng xã hội của chúng tôi.
                  đâsdasdas
                </p>
            </p>
          </div>
  
          {/* Cột 2 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Liên hệ</h2>
            <ul className="space-y-2 text-sm opacity-80">
              <li>📍 Địa chỉ: 97 Man Thiện, Phường Hiệp Phú, Tp.Thủ Đức</li>
              <li>📞 Điện thoại: 01234567899</li>
              <li>📧 Email: abcxyz@gmail.com</li>
            </ul>
          </div>
  
          {/* Cột 3 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Theo dõi chúng tôi</h2>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" className="hover:text-blue-400 transition">
                🌐 Facebook
              </a>
              <a href="https://x.com/?logout=1741281663688" target="_blank" className="hover:text-blue-400 transition">
                🐦 Twitter
              </a>
              <a href="https://www.instagram.com/" target="_blank" className="hover:text-blue-400 transition">
                📸 Instagram
              </a>
            </div>
          </div>
        </div>
  
        {/* Dòng bản quyền */}
        <div className="mt-10 text-center text-sm opacity-70">
          © {new Date().getFullYear()} Bản quyền thuộc về nhóm 11 
        </div>
        
      </footer>
    );
  };
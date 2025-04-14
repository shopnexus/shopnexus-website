export default function InforFooter() {
  return (
    <footer className="w-full mt-10 bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">About Us</h2>
          <p className="text-sm opacity-80 mb-2">
            Our website is created for selling various types of shoes, specializing in providing reliable and quality footwear.
            With a dedicated and customer-focused working spirit, we are committed to bringing the most valuable experiences to our customers.
          </p>
          <div className="text-sm opacity-80 space-y-1">
            <p>When needed, please contact us at:</p>
            <p>+ 84 1234567899</p>
            <p>+ Or contact us through our social media channels.</p>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <ul className="space-y-2 text-sm opacity-80">
            <li>📍 Address: 97 Man Thien, Hiep Phu Ward, Thu Duc City</li>
            <li>📞 Phone: 01234567899</li>
            <li>📧 Email: abcxyz@gmail.com</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" className="hover:text-blue-400 transition">
              🌐 Facebook
            </a>
            <a href="https://x.com" target="_blank" className="hover:text-blue-400 transition">
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
}

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Game Hub. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">
            Chính sách bảo mật
          </a>
          <a href="#" className="hover:text-slate-900 transition-colors">
            Điều khoản dịch vụ
          </a>
        </div>
      </div>
    </footer>
  );
}

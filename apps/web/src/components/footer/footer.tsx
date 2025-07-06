import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-sm text-gray-700 mt-10">
      <div className="max-w-7xl mx-auto px-42 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Welcome */}
        <div>
          <h3 className="text-base font-semibold mb-2 ">Welcome</h3>
          <div className="grid grid-cols-1 gap-2">
            <p className="text-justify">
              Kami berkomitmen untuk memberikan layanan terbaik dan memastikan
              setiap pelanggan mendapatkan pengalaman berbelanja yang
              menyenangkan.
            </p>
            <p className="text-justify">
              Dukungan dan kepercayaan Anda adalah motivasi kami untuk terus
              berkembang dan menyediakan berbagai pilihan produk berkualitas.
            </p>
          </div>
        </div>

        {/* Connect With Us */}
        <div className="grid grid-rows-[auto_1fr] gap-2">
          <h3 className="text-base font-semibold ">Connect With Us</h3>
          <ul className="space-y-1 ">
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">Facebook</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">
                  Instagram
                </span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">Twitter</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">Whatsapp</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Useful Link */}
        <div className="grid grid-rows-[auto_1fr] gap-2">
          <h3 className="text-base font-semibold ">Useful Link</h3>
          <ul className="space-y-1">
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">
                  Multiple Branches
                </span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">
                  Take Franchise
                </span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">
                  Scheduled Offers
                </span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <span className="hover:underline cursor-pointer">
                  More Links
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Details */}
        <div className="grid grid-rows-[auto_1fr] gap-2">
          <h3 className="text-base font-semibold">Contact Details</h3>
          <div className="space-y-1">
            <p>
              Address: Jalan Raya No. 123,
              <br />
              Indonesia, jakarta, 12345
            </p>
            <p>Contact: +62-8195-8169-283</p>
            <p>
              E-mail: marketsnap@gmail.com
              <br />
              farhanzulkarnaenhrp@gmail.com
            </p>
          </div>
        </div>
      </div>
      <div className="bg-green-700 text-white text-center py-3">
        Copyright | The Market Snap | Developed by FARNAJO
      </div>
    </footer>
  );
}

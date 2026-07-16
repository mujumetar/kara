import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCcw,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Top Features */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <Feature
            icon={<Truck />}
            title="Fast Delivery"
            desc="Quick & safe doorstep delivery"
          />
          <Feature
            icon={<RefreshCcw />}
            title="Easy Returns"
            desc="7 days return policy"
          />
          <Feature
            icon={<ShieldCheck />}
            title="Secure Payments"
            desc="100% protected checkout"
          />
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Kara<span className="text-purple-500">Store</span>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium products with the best prices. Experience smooth shopping,
            secure payments and fast delivery.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {["Home", "Shop", "Cart", "Profile", "Orders"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            {[
              "Help Center",
              "Returns",
              "Shipping",
              "Privacy Policy",
              "Terms & Conditions",
            ].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-purple-400 transition">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              India
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-500" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              support@karastore.com
            </li>
          </ul>

          {/* Socials */}
          <div className="flex gap-4 mt-5">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-purple-600 transition"
              >
                <Icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} KaraStore. All rights reserved.</p>
          <p className="text-center">
            Made with ❤️ for modern shopping
          </p>
        </div>
      </div>
    </footer>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
        {icon}
      </div>
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

import { CgWebsite } from "react-icons/cg";
import { SiGithub, SiGmail, SiInstagram, SiLinkedin, SiWhatsapp } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-200 py-3 sm:py-4">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Lucas Zaranza
        </p>

        <div className="flex gap-6 text-lg">
          <a
            href="https://instagram.com/lucaspzaranza"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram - abre em nova aba"
            className="hover:text-pink-400 transition-colors flex items-center gap-2"
          >
            <SiInstagram size={20} />
            <span className="hidden sm:inline">Instagram</span>
          </a>

          <a
            href="https://www.linkedin.com/in/lucaszaranza/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn - abre em nova aba"
            className="hover:text-blue-400 transition-colors flex items-center gap-2"
          >
            <SiLinkedin size={20} />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          <a
            href="https://api.whatsapp.com/send?phone=5585991753445"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn - abre em nova aba"
            className="hover:text-blue-400 transition-colors flex items-center gap-2"
          >
            <SiWhatsapp size={20} />
            <span className="hidden sm:inline">Whatsapp</span>
          </a>

          <a
            href="mailto:lucaszaranza@gmail.com"
            aria-label="E-mail"
            className="hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <SiGmail size={20} />
            <span className="hidden sm:inline">E-mail</span>
          </a>

          <a
            href="https://lucasz.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website pessoal"
            className="hover:text-green-400 transition-colors flex items-center gap-2"
          >
            <CgWebsite size={20} />
            <span className="hidden sm:inline">Website</span>
          </a>

          <a
            href="https://github.com/lucaspzaranza"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-400 transition-colors flex items-center gap-2"
          >
            <SiGithub size={20} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

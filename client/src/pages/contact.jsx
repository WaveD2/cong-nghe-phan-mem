import { useState } from "react";
import { Facebook, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/toastContext";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    comment: "",
  });
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.comment) {
      return showToast("Vui lòng điền đầy đủ thông tin.", "error");
    }
    showToast("Gửi tin nhắn thành công!", "success");
  };

  return (
    <motion.div
      className="bg-white text-gray-800 p-8 shadow-xl rounded-lg"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      exit={{ opacity: 0, y: -50 }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 mt-[80px]">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif text-gray-900">Liên hệ với tôi</h2>
            <p className="text-gray-600">
              Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ. Tôi luôn sẵn sàng hỗ trợ bạn!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="subject"
                placeholder="Tiêu đề"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              name="comment"
              placeholder="Nội dung"
              value={formData.comment}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Gửi tin nhắn
            </button>
          </form>
        </div>

        <div className="space-y-8 lg:border-l lg:border-gray-200 lg:pl-12 hidden lg:flex flex-col">
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Số điện thoại:</p>
              <p className="text-gray-800 font-medium">0988233528</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email:</p>
              <p className="text-gray-800 font-medium">tungdev64@gmail.com</p>
            </div>
            
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theo dõi tôi</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200">
                <Facebook className="w-5 h-5 text-gray-700" />
              </a>
              <a href="#" className="p-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200">
                <Github className="w-5 h-5 text-gray-700" />
              </a>
              <a href="#" className="p-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200">
                <Linkedin className="w-5 h-5 text-gray-700" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

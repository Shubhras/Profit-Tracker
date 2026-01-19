import { FiPhone, FiMail } from 'react-icons/fi';
import { Form, Input, Button } from 'antd';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

function Contact() {
  const onFinish = (values) => {
    console.log('Contact Form Data 👉', values);
  };

  return (
    <>
      <Navbar />

      {/* Contact Section */}
      <section className="w-full bg-white py-20 lg:py-10 px-[3%]">
        <div className="w-full grid grid-cols-2 lg:grid-cols-1 gap-16 items-start">
          {/* LEFT PANEL */}
          <div className="relative rounded-3xl bg-green-50 p-10 overflow-hidden">
            <h2 className="text-3xl font-bold text-green-600 mb-4">Contact Us</h2>

            <p className="text-gray-600 mb-10 text-lg">
              Please write to us in the form to <br /> reach out to us
            </p>

            {/* Decorative Circles */}
            <div className="absolute right-[-160px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-green-200/40" />
            <div className="absolute right-[-140px] top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-green-300/40" />
            <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-green-400/40" />
            <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-green-500/40" />
            <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-green-600/40" />

            {/* Contact Info */}
            <div className="mt-16 space-y-5">
              <div className="flex items-center gap-4 text-gray-800">
                <FiPhone className="text-xl text-green-600" />
                <div>
                  <p className="font-semibold">Sales</p>
                  <p className="text-sm">+91-93421-48885</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-800">
                <FiMail className="text-xl text-green-600" />
                <p className="text-sm">sales@profit-tracker.in</p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM (AntD) */}
          <Form layout="vertical" onFinish={onFinish} className="space-y-1">
            {/* Name */}
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input
                placeholder="Enter your name"
                className="border-0 border-b border-gray-300 rounded-none focus:shadow-none"
              />
            </Form.Item>

            {/* Company & Designation */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
              <Form.Item
                label="Company"
                name="company"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input
                  placeholder="Enter your company"
                  className="border-0 border-b border-gray-300 rounded-none focus:shadow-none"
                />
              </Form.Item>

              <Form.Item label="Designation" name="designation">
                <Input
                  placeholder="Enter your designation"
                  className="border-0 border-b border-gray-300 rounded-none focus:shadow-none"
                />
              </Form.Item>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input
                  placeholder="Enter your email"
                  className="border-0 border-b border-gray-300 rounded-none focus:shadow-none"
                />
              </Form.Item>

              <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please enter phone number' }]}>
                <Input
                  placeholder="Enter your phone"
                  className="border-0 border-b border-gray-300 rounded-none focus:shadow-none"
                />
              </Form.Item>
            </div>

            {/* Message */}
            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: 'Please enter your message' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter your message"
                className="border-0 border-b border-gray-300 rounded-none focus:shadow-none resize-none"
              />
            </Form.Item>

            {/* Submit */}
            <Form.Item>
              <Button
                htmlType="submit"
                className="w-full h-14 text-lg font-semibold
               bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] text-white border-0"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;

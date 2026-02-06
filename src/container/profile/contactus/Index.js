import React from 'react';
import { Form, Input, Button, Row, Col, Card, Typography, message } from 'antd';
import { motion } from 'framer-motion';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import ScrollToTopButton from '../home/components/ScrollToTopButton';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const contactInfo = [
  {
    icon: <PhoneOutlined />,
    title: 'Sales',
    details: ['+91-93421-48885'],
    color: 'emerald',
  },
  {
    icon: <MailOutlined />,
    title: 'Email',
    details: ['sales@profit-tracker.in', 'support@profit-tracker.in'],
    color: 'blue',
  },
  {
    icon: <EnvironmentOutlined />,
    title: 'Location',
    details: ['Bangalore, India'],
    color: 'purple',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Working Hours',
    details: ['Mon - Fri: 9AM - 6PM IST'],
    color: 'amber',
  },
];

function Contact() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Contact Form Data 👉', values);
    message.success('Thank you! We will get back to you soon.');
    form.resetFields();
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16 bg-gradient-to-b from-emerald-50/50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6"
          >
            📬 Get In Touch
          </motion.span>
          <Title level={1} className="text-4xl min-md:text-5xl font-extrabold !text-gray-900 !mb-4">
            We&apos;d Love to{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Hear From You
            </span>
          </Title>
          <Paragraph className=" text-lg min-md:text-xl text-gray-500">
            Have questions about our product? Need a demo? Our team is ready to help you succeed.
          </Paragraph>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-white py-16 min-lg:py-10 px-[3%] max-w-7xl mx-auto">
        <Row gutter={[48, 48]}>
          {/* LEFT PANEL - Contact Info */}
          <Col xs={24} lg={10}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card
                className="h-full border-0 rounded-3xl overflow-hidden relative bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_50%,#0d9488_100%)]"
                bodyStyle={{ padding: 0 }}
              >
                <div className="rounded-3xl min-h-[500px] relative">
                  {/* Decorative Circles */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
                    <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-white/15" />
                    <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-white/20" />
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full border border-white/25" />
                  </div>

                  <div className="relative z-10">
                    <Title level={2} className="!text-white !text-3xl !font-bold !mb-2">
                      Contact Information
                    </Title>
                    <Text className="text-white/80 text-base block mb-10">
                      Fill up the form and our team will get back to you within 24 hours.
                    </Text>

                    {/* Contact Items */}
                    <div className="space-y-8">
                      {contactInfo.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                          className="flex items-start gap-4"
                        >
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl">
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-lg">{item.title}</div>
                            {item.details.map((detail, i) => (
                              <div key={i} className="text-white/80 text-sm">
                                {detail}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* RIGHT PANEL - Form */}
          <Col xs={24} lg={14}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 rounded-3xl shadow-xl" bodyStyle={{ padding: '40px' }}>
                <Title level={3} className="!text-gray-900 !font-bold !mb-8">
                  Send us a message
                </Title>

                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                  <Row gutter={24}>
                    {/* Name */}
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Name</span>}
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input
                          placeholder="Enter your name"
                          size="large"
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                        />
                      </Form.Item>
                    </Col>

                    {/* Company */}
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Company</span>}
                        name="company"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input
                          placeholder="Enter your company"
                          size="large"
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    {/* Email */}
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Email</span>}
                        name="email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Enter a valid email' },
                        ]}
                      >
                        <Input
                          placeholder="Enter your email"
                          size="large"
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                        />
                      </Form.Item>
                    </Col>

                    {/* Phone */}
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Phone</span>}
                        name="phone"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                      >
                        <Input
                          placeholder="Enter your phone"
                          size="large"
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Designation */}
                  <Form.Item label={<span className="font-medium text-gray-700">Designation</span>} name="designation">
                    <Input
                      placeholder="Enter your designation"
                      size="large"
                      className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                    />
                  </Form.Item>

                  {/* Message */}
                  <Form.Item
                    label={<span className="font-medium text-gray-700">Message</span>}
                    name="message"
                    rules={[{ required: true, message: 'Please enter your message' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Tell us how we can help..."
                      className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500 resize-none"
                    />
                  </Form.Item>

                  {/* Submit */}
                  <Form.Item className="mb-0 mt-6">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<SendOutlined />}
                        className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30"
                      >
                        Send Message
                      </Button>
                    </motion.div>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </section>

      {/* FAQ CTA */}
      {/* <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 px-[3%] bg-gradient-to-r from-gray-900 to-gray-800"
      >
        <div className="text-center max-w-2xl mx-auto">
          <Title level={3} className="!text-white !font-bold !mb-4">
            Looking for Answers?
          </Title>
          <Paragraph className="text-gray-400 text-lg mb-6">
            Check out our FAQ section or reach out to our support team for quick assistance.
          </Paragraph>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="large" className="h-12 px-6 rounded-xl font-semibold" ghost>
              View FAQs
            </Button>
            <Button
              type="primary"
              size="large"
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0"
            >
              Live Chat Support
            </Button>
          </div>
        </div>
      </motion.section> */}

      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default Contact;

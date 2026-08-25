import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Input, Button, Row, Col, Card, Typography, message } from 'antd';
import { motion } from 'framer-motion';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import ScrollToTopButton from '../../home/components/ScrollToTopButton';
import { getPrivacyPolicy } from '../../../../redux/admin/actionCreator';
import { DataService } from '../../../../config/dataService/dataService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function ContactUs() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { privacypolicyData } = useSelector((state) => state.AdminDashboard);
  const [submitting, setSubmitting] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');

  const canvasRef = useRef(null);

  const policyContent = privacypolicyData?.data?.[0]?.content || '{}';
  const contactData = JSON.parse(policyContent);

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: 'Sales',
      details: [contactData?.phone || '7014719182'],
    },
    {
      icon: <MailOutlined />,
      title: 'Email',
      details: [contactData?.email || 'letstalk@trackmyprofit.com'],
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Location',
      details: [contactData?.location || 'Plot 199, Vijay Nagar, Scheme 54, PU4, Indore, Madhya Pradesh'],
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Working Hours',
      details: [
        typeof contactData?.working_hours === 'string'
          ? contactData.working_hours
          : `${(contactData?.working_hours?.days || ['Monday', 'Friday']).join(', ')} | ${
              contactData?.working_hours?.from || '10:00'
            } - ${contactData?.working_hours?.to || '19:00'}`,
      ],
    },
  ];

  // Helper to draw alphanumeric Captcha on Canvas
  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random noise background lines
    for (let i = 0; i < 5; i += 1) {
      ctx.strokeStyle = `rgba(16, 185, 129, ${Math.random() * 0.4 + 0.1})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw random dots
    for (let i = 0; i < 30; i += 1) {
      ctx.fillStyle = `rgba(13, 148, 136, ${Math.random() * 0.5 + 0.2})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Captcha text characters with distortion & gradient colors
    const colors = ['#059669', '#0d9488', '#0284c7', '#7c3aed', '#047857'];
    for (let i = 0; i < code.length; i += 1) {
      ctx.font = `bold ${Math.floor(Math.random() * 4 + 22)}px monospace`;
      ctx.fillStyle = colors[i % colors.length];

      ctx.save();
      const x = 20 + i * 26;
      const y = 30 + Math.random() * 4 - 2;
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    dispatch(getPrivacyPolicy('contact_us'));
  }, [dispatch]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const onFinish = async (values) => {
    const userCaptcha = values.captcha?.trim().toUpperCase();
    if (userCaptcha !== captchaCode) {
      message.error('Invalid Captcha code! Please try again.');
      generateCaptcha();
      form.setFieldsValue({ captcha: '' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        company: values.company?.trim() || '',
        email: values.email.trim(),
        phone: values.phone.trim(),
        designation: values.designation?.trim() || '',
        message: values.message.trim(),
      };

      const response = await DataService.post('/user/contact-us/', payload);

      if (response?.data?.status) {
        message.success('Thank you! Your message has been sent successfully. We will get back to you within 24 hours.');
        form.resetFields();
        generateCaptcha();
      } else {
        message.error(response?.data?.message || 'Failed to submit message.');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong while sending your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      {/* Hero Section */}
      <section className="px-[3%] pt-24 min-lg:pt-32 bg-gradient-to-b from-emerald-50/50 to-white overflow-hidden">
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
          <Col xs={24} lg={10}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card
                className="h-full border-0 rounded-3xl overflow-hidden relative bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_50%,#0d9488_100%)] p-6"
                bodyStyle={{ padding: 0 }}
              >
                <div className="rounded-3xl min-h-[500px] relative">
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
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl shrink-0">
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

          <Col xs={24} lg={14}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 rounded-3xl shadow-xl p-6" bodyStyle={{ padding: 0 }}>
                <Title level={3} className="!text-gray-900 !font-bold !mb-8">
                  Send us a message
                </Title>

                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                  <Row gutter={24}>
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

                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Phone</span>}
                        name="phone"
                        rules={[
                          { required: true, message: 'Please enter phone number' },
                          {
                            pattern: /^\+?[0-9\s-]{7,15}$/,
                            message: 'Please enter a valid phone number (7 to 15 digits)',
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your phone (e.g. +91 9876543210)"
                          size="large"
                          maxLength={16}
                          onKeyPress={(e) => {
                            if (!/[0-9+\s-]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label={<span className="font-medium text-gray-700">Designation</span>} name="designation">
                    <Input
                      placeholder="Enter your designation"
                      size="large"
                      className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
                    />
                  </Form.Item>

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

                  {/* Dynamic CAPTCHA Section */}
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-6">
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <SafetyCertificateOutlined className="text-emerald-600 text-sm" /> Security Verification (CAPTCHA)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-inner flex items-center justify-center px-2 py-1">
                        <canvas
                          ref={canvasRef}
                          width={130}
                          height={40}
                          className="block cursor-pointer"
                          onClick={generateCaptcha}
                          title="Click to refresh Captcha"
                        />
                      </div>

                      <Button
                        type="default"
                        shape="circle"
                        icon={<ReloadOutlined className="text-emerald-600" />}
                        onClick={generateCaptcha}
                        title="Refresh Captcha"
                        className="border-emerald-200 hover:border-emerald-400 hover:text-emerald-600"
                      />

                      <Form.Item
                        name="captcha"
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Please enter security captcha' }]}
                      >
                        <Input
                          placeholder="Enter 4-character code"
                          size="large"
                          maxLength={4}
                          className="rounded-xl border-gray-200 hover:border-emerald-400 focus:border-emerald-500 uppercase tracking-widest font-mono text-center text-base"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item className="mb-0">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={submitting}
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

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

export default ContactUs;

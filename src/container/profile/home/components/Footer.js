import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Row, Col, Typography, Divider } from 'antd';
import { PhoneOutlined, MailOutlined, HeartFilled } from '@ant-design/icons';
import { HiOutlineChartBar } from 'react-icons/hi2';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const footerLinks = {
  products: [
    { label: 'Features', to: '/about' },
    { label: 'Integrations', to: '/integrations' },
    { label: 'Pricing', to: '/pricing' },
    // { label: 'Changelog', to: '#' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    // { label: 'Careers', to: '#' },
    { label: 'Contact Us', to: '/contact' },
    // { label: 'Blog', to: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    // { label: 'Refund Policy', to: '#' },
  ],
};
const socialLinks = [
  {
    icon: <PhoneOutlined />,
    label: 'Phone',
    href: 'tel:+919876543210', // replace with your number
    newTab: true,
  },
  {
    icon: <MailOutlined />,
    label: 'Email',
    href: 'mailto:hello@trackmyprofit.com',
    newTab: true,
  },
];

function FooterLink({ to, children }) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ x: 5 }}
        className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm py-1.5 cursor-pointer"
      >
        {children}
      </motion.div>
    </Link>
  );
}

FooterLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function SocialIcon({ icon, href }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="w-10 h-10 bg-white/10 hover:bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg cursor-pointer transition-colors duration-300 backdrop-blur-sm border border-white/10 hover:border-emerald-500"
    >
      {icon}
    </motion.a>
  );
}

SocialIcon.propTypes = {
  icon: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #070a0d 50%, #0a0f14 100%)',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="px-[3%] pt-16 pb-8 relative z-10 max-w-7xl mx-auto">
        <Row gutter={[48, 48]}>
          {/* Brand Column */}
          <Col xs={24} lg={8}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <HiOutlineChartBar className="text-white text-xl" />
                </div>
                <span>TrackMyProfit</span>
              </Link>

              <Text className="block text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Finance copilot for eCommerce and retail brands — delivering SKU-level profit intelligence, payment
                recovery, and inventory forecasting.
              </Text>

              {/* Social Icons */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <SocialIcon key={index} icon={social.icon} href={social.href} newTab={social.newTab} />
                ))}
              </div>
            </motion.div>
          </Col>

          {/* Links Columns */}
          <Col xs={24} lg={16}>
            <Row gutter={[32, 32]}>
              {/* Products */}
              <Col xs={12} sm={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Title level={5} className="!text-white !mb-4 !text-sm !font-semibold uppercase tracking-wider">
                    Products
                  </Title>
                  {footerLinks.products.map((link, index) => (
                    <FooterLink key={index} to={link.to}>
                      {link.label}
                    </FooterLink>
                  ))}
                </motion.div>
              </Col>

              {/* Company */}
              <Col xs={12} sm={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Title level={5} className="!text-white !mb-4 !text-sm !font-semibold uppercase tracking-wider">
                    Company
                  </Title>
                  {footerLinks.company.map((link, index) => (
                    <FooterLink key={index} to={link.to}>
                      {link.label}
                    </FooterLink>
                  ))}
                </motion.div>
              </Col>

              {/* Legal */}
              <Col xs={12} sm={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Title level={5} className="!text-white !mb-4 !text-sm !font-semibold uppercase tracking-wider">
                    Legal
                  </Title>
                  {footerLinks.legal.map((link, index) => (
                    <FooterLink key={index} to={link.to}>
                      {link.label}
                    </FooterLink>
                  ))}
                </motion.div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Newsletter Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm"
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <Title level={4} className="!text-white !mb-1">
                Stay Updated
              </Title>
              <Text className="text-gray-400 text-sm">Get the latest updates on finance tools.</Text>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex flex-col min-md:flex-row gap-3 mt-4 min-md:mt-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="h-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl font-semibold"
                >
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </motion.div> */}

        {/* Divider */}
        <Divider className="!border-white/10 !my-8" />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-between items-center gap-4"
        >
          <Text className="text-gray-500 text-sm">© 2026 TrackMyProfit.in. All rights reserved.</Text>
          <Text className="text-gray-500 text-sm flex items-center gap-1">
            Made with <HeartFilled className="text-red-500" /> in India
          </Text>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;

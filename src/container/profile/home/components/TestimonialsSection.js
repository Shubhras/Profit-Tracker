import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    quote:
      "TrackMyProfit saved us 20+ hours every week on reconciliation alone. The AI insights helped us identify a 15% margin leak we didn't even know existed!",
    author: 'Rahul Sharma',
    role: 'Founder & CEO',
    company: 'BoldCare',
    rating: 5,
    image: 'https://i.pravatar.cc/100?img=12',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    quote:
      "We scaled from ₹1Lakh to ₹10Lakh ARR without adding a single finance person. TrackMyProfit's automation is truly game-changing for D2C brands.",
    author: 'Priya Mehta',
    role: 'COO',
    company: 'AboutSpace',
    rating: 5,
    image: 'https://i.pravatar.cc/100?img=45',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    quote:
      'The real-time dashboard gives us confidence in our numbers. We make critical decisions faster and more accurately than ever before. Best investment we made!',
    author: 'Amit Patel',
    role: 'Finance Head',
    company: 'TechRetail Co.',
    rating: 5,
    image: 'https://i.pravatar.cc/100?img=33',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

function Testimonials() {
  return (
    <section className="relative bg-gray-50 overflow-hidden px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98108_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-50 border border-emerald-100 backdrop-blur-sm">
            <FaStar className="text-emerald-500" />
            <span className="text-emerald-600 text-sm font-bold">TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              Finance Teams
            </span>
            <br />
            Across India
          </h2>
          <p className=" text-lg min-md:text-xl text-gray-500 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our customers have to say.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-3xl p-8 border border-gray-100 group-hover:border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-500">
                {/* Gradient Glow on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Quote Icon */}
                <div className="relative z-10 mb-6">
                  <FaQuoteLeft className="text-4xl text-emerald-100 group-hover:text-emerald-200 transition-colors duration-300" />
                </div>

                {/* Quote */}
                <div className="relative z-10 mb-8">
                  <p className="text-gray-600 leading-relaxed text-lg italic">&quot;{testimonial.quote}&quot;</p>
                </div>

                {/* Rating */}
                <div className="relative z-10 flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>

                {/* Author Info */}
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} p-0.5`}>
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-lg mb-0">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm mb-0">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-12"
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '98%', label: 'Customer Satisfaction' },
            { value: '50+', label: 'Happy Users' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
                {stat.value}
              </p>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;

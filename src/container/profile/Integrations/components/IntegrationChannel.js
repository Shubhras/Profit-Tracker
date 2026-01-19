import React from 'react';

const marketplaces = [
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    name: 'Flipkart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Flipkart_logo.svg',
  },
  {
    name: 'Myntra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Myntra_logo.png',
  },
  {
    name: 'Meesho',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Meesho_Logo_Full.png',
  },
  {
    name: 'Ajio',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Ajio-Logo.svg',
  },
  {
    name: 'Nykaa',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Nykaa_Logo.png',
  },
  {
    name: 'Snapdeal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Snapdeal_Logo.svg',
  },
  {
    name: 'Tata Cliq',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Tata_CLiQ_Logo.svg',
  },
  {
    name: 'JioMart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/JioMart_logo.png',
  },
  {
    name: 'Pepperfry',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Pepperfry_logo.png',
  },
  {
    name: 'FirstCry',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/FirstCry_Logo.png',
  },
  {
    name: 'Shopify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
  },
  {
    name: 'WooCommerce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/WooCommerce_logo.svg',
  },
];

export default function IntegrationChannel() {
  return (
    <section className="w-full bg-white pb-10">
      <div className="px-[5%]">
        <div className="grid md:grid-cols-1 grid-cols-[200px_1fr] gap-10">
          {/* LEFT PANEL */}
          <div className="flex items-center md:justify-center justify-start">
            <div className="w-full px-5 py-4 rounded-2xl border border-gray-200 flex items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-0">Marketplace</h2>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative pl-8">
            {/* Vertical Divider */}
            <span className="md:hidden block absolute left-0 top-0 h-full w-px bg-gray-200" />

            {/* Logos Grid */}
            <div className="grid grid-cols-8 xl:grid-cols-8 md:grid-cols-4 lg:grid-cols-5 sm:grid-cols-3  gap-10">
              {marketplaces.map((item) => (
                <div key={item.name} className="group flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-xl border border-gray-200 bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md p-1">
                    <img src={item.logo} alt={item.name} className="max-h-10 object-contain" />
                  </div>
                  <p className="text-base font-medium text-gray-700 uppercase">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

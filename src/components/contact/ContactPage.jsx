import React from 'react';
import { useTranslation } from 'react-i18next';
import siteContent from '../../data/site-content.json';

export const ContactPage = () => {
  const { t } = useTranslation();
  const { contact } = siteContent;

  return (
    <div className="container mx-auto px-4 py-8">
      {contact?.header && (
        <>
          <h1 className="text-3xl font-bo ld mb-4">{t(contact.header.title)}</h1>
          <p className="text-lg mb-8">{t(contact.header.subtitle)}</p>
        </>
      )}

      {/* Display contact information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contact?.infoCards?.phone && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{t(contact.infoCards.phone.title)}</h2>
            <ul>
              {contact.infoCards.phone.numbers.map((number, index) => (
                <li key={index} className="text-gray-700">
                  {number}
                </li>
              ))}
            </ul>
            <p className="text-gray-600">{contact.infoCards.phone.hours}</p>
          </div>
        )}
        {contact?.infoCards?.email && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{t(contact.infoCards.email.title)}</h2>
            <ul>
              {contact.infoCards.email.addresses.map((address, index) => (
                <li key={index} className="text-gray-700">
                  <a href={`mailto:${address}`}>{address}</a>
                </li>
              ))}
            </ul>
            <p className="text-gray-600">{contact.infoCards.email.support}</p>
          </div>
        )}
        {contact?.infoCards?.address && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{t(contact.infoCards.address.title)}</h2>
            <address className="text-gray-700">
              {contact.infoCards.address.street},<br />
              {contact.infoCards.address.city}, {contact.infoCards.address.state} {contact.infoCards.address.zip}
            </address>
          </div>
        )}
        {contact?.infoCards?.hours && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{t(contact.infoCards.hours.title)}</h2>
            <p className="text-gray-700">{contact.infoCards.hours.weekday}</p>
            <p className="text-gray-700">{contact.infoCards.hours.weekend}</p>
            <p className="text-gray-600">{contact.infoCards.hours.note}</p>
          </div>
        )}
      </div>

      {/* Contact Form */}
      {contact?.form && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4">{contact.form.title}</h2>
          <p className="text-gray-600">{contact.form.description}</p>
          {/* Implement the form here */}
          {/* ... (Form implementation using appropriate libraries) */}
        </div>
      )}
    </div>
  );
};

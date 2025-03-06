import React from 'react';
import PropTypes from 'prop-types';

export function JsonViewer({ data, title }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-serif mb-4">{title}</h2>
      <pre className="bg-gray-50 p-6 rounded-lg overflow-auto max-h-[600px] text-sm font-mono">
        <code className="text-gray-800">
          {JSON.stringify(data, null, 2)}
        </code>
      </pre>
    </div>
  );
}

JsonViewer.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
};

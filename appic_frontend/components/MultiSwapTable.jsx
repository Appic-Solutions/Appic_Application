'use client';

import { formatSignificantNumber } from '@/helper/number_formatter';

// Utility function to pick specified properties from an array of objects
const pickPropertiesFromArray = (array, properties) => {
  return array.map((item) => {
    return properties.reduce((acc, prop) => {
      if (item.hasOwnProperty(prop)) {
        acc[prop] = item[prop];
      }
      return acc;
    }, {});
  });
};

const SELECTED_PROPERTIES = ['id', 'logo', 'name', 'price', 'value', 'percentage', 'newValue', 'newPercentage'];

const MultiSwapTable = ({ swapTokens = [], onUpdate }) => {
  console.log('sss', swapTokens);
  const swapTokensWithSelectedProperties = pickPropertiesFromArray(swapTokens, SELECTED_PROPERTIES);

  // Extract the headers from the keys of the first object in the data array
  const headers = swapTokensWithSelectedProperties.length > 0 ? Object.keys(swapTokensWithSelectedProperties[0]) : [];

  const getProperJSXForCell = (row, header) => {
    switch (header) {
      case 'logo':
        return <img src={row[header]} style={{ borderRadius: '100%' }} alt="token logo" />;
      case 'name':
        return row[header];
      case 'newPercentage':
        return (
          <div className="new-percentage">
            <input type="number" min={0} value={row[header]} onChange={(e) => onUpdate(row.id, e.target.value)} /> %
          </div>
        );
      default:
        return formatSignificantNumber(row[header]);
    }
  };

  return (
    <div className="multi-swap-table-container">
      <table className="multi-swap-table">
        <thead>
          <tr>{headers.map((header) => (header === 'id' ? null : <th key={header}>{header.charAt(0).toUpperCase() + header.slice(1)}</th>))}</tr>
        </thead>
        <tbody>
          {swapTokensWithSelectedProperties.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => {
                if (header === 'id') return null;
                return <td key={header}>{getProperJSXForCell(row, header)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MultiSwapTable;


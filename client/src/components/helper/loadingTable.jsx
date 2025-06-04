const LoadingTable = () => {
  return (
    <div className="w-full overflow-x-auto animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left text-sm font-medium text-gray-600"
              >
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="bg-white">
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadingTable;

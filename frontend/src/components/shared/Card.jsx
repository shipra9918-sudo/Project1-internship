const Card = ({ children, className = '', hoverable = false, onClick }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

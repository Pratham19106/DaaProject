import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PDFExportButton from './PDFExportButton';
import HotelCard from './HotelCard';
import AttractionCard from './AttractionCard';
import HorizontalCardScroll from './HorizontalCardScroll';

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isError ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <Bot className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
      )}

      <div className={`flex-1 ${isBot ? 'text-left' : 'text-right'}`}>
        <div
          className={`inline-block px-4 py-3 rounded-lg max-w-xs lg:max-w-md ${
            isBot
              ? isError
                ? 'bg-red-50 text-red-900 rounded-bl-none border border-red-200'
                : 'bg-sky-50 text-gray-900 rounded-bl-none border border-sky-200'
              : 'bg-sky-600 text-white rounded-br-none'
          }`}
        >
          {isBot ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm max-w-none"
              components={{
                h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2 text-sky-900" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2 text-sky-800" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1 text-sky-700" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-sm leading-relaxed text-gray-800" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-gray-800" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-gray-800" {...props} />,
                li: ({node, ...props}) => <li className="ml-2 text-sm text-gray-800" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-sky-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-sky-800" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                  ) : (
                    <code className="block bg-sky-100 text-sky-900 p-3 rounded my-2 text-xs font-mono overflow-x-auto border border-sky-200" {...props} />
                  ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-sky-500 pl-3 italic my-2 text-sm text-sky-800 bg-sky-50 py-2 px-3 rounded" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-sky-600 underline hover:text-sky-700" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                hr: ({node, ...props}) => <hr className="my-3 border-sky-200" {...props} />,
                table: ({node, ...props}) => <table className="border-collapse border border-sky-300 text-sm my-2" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-sky-200" {...props} />,
                th: ({node, ...props}) => <th className="border border-sky-300 px-2 py-1 text-left font-bold text-sky-900" {...props} />,
                td: ({node, ...props}) => <td className="border border-sky-300 px-2 py-1 text-gray-800" {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}
          
          {/* PDF Export Button */}
          {isBot && <PDFExportButton message={message} />}
        </div>

        {/* Hotel Cards */}
        {isBot && message.data?.hotels && message.data.hotels.length > 0 && (
          <div className="mt-4 w-full">
            <HorizontalCardScroll items={message.data.hotels} type="hotel" />
          </div>
        )}

        {/* Attraction Cards */}
        {isBot && message.data?.attractions && message.data.attractions.length > 0 && (
          <div className="mt-4 w-full">
            <HorizontalCardScroll items={message.data.attractions} type="attraction" />
          </div>
        )}

        <span className={`text-xs mt-1 block ${isBot ? 'text-gray-600' : 'text-blue-100'}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}

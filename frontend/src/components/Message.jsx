import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HotelCard from './HotelCard';
import AttractionCard from './AttractionCard';
import HorizontalCardScroll from './HorizontalCardScroll';
import PDFExportButton from './PDFExportButton';

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : isError
            ? 'bg-red-500 text-white'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-5 py-4 rounded-lg max-w-[85%] ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : isError
              ? 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-base">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-base dark:prose-invert max-w-none"
              components={{
                // Headings
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-3" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-2" {...props} />,
                
                // Paragraphs
                p: ({node, ...props}) => <p className="mb-3 last:mb-0 text-base leading-relaxed" {...props} />,
                
                // Lists
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-2 text-base" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-2 text-base" {...props} />,
                li: ({node, ...props}) => <li className="ml-2 leading-relaxed" {...props} />,
                
                // Strong/Bold
                strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                
                // Emphasis/Italic
                em: ({node, ...props}) => <em className="italic text-lg" {...props} />,
                
                // Code
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-muted px-2 py-1 rounded text-lg font-mono" {...props} />
                  ) : (
                    <code className="block bg-muted p-4 rounded my-3 text-lg font-mono overflow-x-auto" {...props} />
                  ),
                
                // Blockquote
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-2" {...props} />
                ),
                
                // Links
                a: ({node, ...props}) => (
                  <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                
                // Horizontal Rule
                hr: ({node, ...props}) => <hr className="my-4 border-muted" {...props} />,
                
                // Tables
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full border-collapse border border-muted" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => (
                  <th className="border border-muted px-3 py-2 bg-muted font-bold text-left" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="border border-muted px-3 py-2" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          
          {/* Render Attraction Cards - Horizontal Scroll */}
          {message.data?.attractions && message.data.attractions.length > 0 && (
            <HorizontalCardScroll items={message.data.attractions} type="attraction" />
          )}

          {/* Render Hotel Cards - Horizontal Scroll */}
          {message.data?.hotels && message.data.hotels.length > 0 && (
            <HorizontalCardScroll items={message.data.hotels} type="hotel" />
          )}
          
          {message.functionCalls > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/20 text-sm opacity-70 font-medium">
              🔧 {message.functionCalls} tool{message.functionCalls > 1 ? 's' : ''} used
            </div>
          )}

          {/* PDF Export Button */}
          <PDFExportButton message={message} />
        </div>

        <div className="text-sm text-muted-foreground mt-2 px-1 font-medium">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
}

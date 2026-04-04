import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { chatbotAPI } from '../services/api';

const ChatbotPage = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await chatbotAPI.getHistory();
        setMessages(response.data.data.messages || []);
      } catch (error) {
        console.error('Failed to load chatbot history', error);
      }
    };
    loadHistory();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const userQuestion = question.trim();
    if (!userQuestion || loading) return;

    setLoading(true);
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);

    try {
      const response = await chatbotAPI.ask(userQuestion);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.answer }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Unable to answer right now. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onClearHistory = async () => {
    try {
      await chatbotAPI.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assistant</h1>
                <p className="text-sm text-gray-600">Ask about orders, delivery, billing, and onboarding</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="h-[500px] overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet. Ask your first question.</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[80%] px-4 py-3 rounded-xl ${
                    message.role === 'user'
                      ? 'ml-auto bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
          </div>

          <form onSubmit={onSubmit} className="p-5 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!canAsk}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
